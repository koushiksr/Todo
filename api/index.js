import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { sendDailyReminderEmail, sendInstantReminderEmail, sendOTPEmail } from '../server/utils/mailer.js';
import connectDB from '../server/db.js';
import User from '../server/models/User.js';
import OTP from '../server/models/OTP.js';
import Todo from '../server/models/Todo.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import auth from '../server/middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

const generateUserPayload = (user) => ({
  id: user._id, 
  name: user.name, 
  email: user.email, 
  phone: user.phone,
  dob: user.dob,
  dp: user.dp,
  role: user.role, 
  customCategories: user.customCategories || [],
  emailNotifications: user.emailNotifications !== false,
  pushNotifications: user.pushNotifications !== false
});

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not defined in environment variables! Logins will fail.");
}

// Request OTP
app.post('/api/auth/request-otp', async (req, res) => {
  try {
    await connectDB();
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ message: 'Email is required.' });

    const isEmail = identifier.includes('@');
    if (!isEmail) return res.status(400).json({ message: 'Only email login is supported.' });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ identifier });
    await new OTP({ identifier, code: otpCode }).save();

    const sent = await sendOTPEmail(identifier, otpCode);
    if (!sent) {
      return res.status(500).json({ message: 'Email credentials not configured on server. Contact admin.' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    await connectDB();
    const { identifier, code, name } = req.body;
    if (!identifier || !code) return res.status(400).json({ message: 'Identifier and code required' });

    const validOtp = await OTP.findOne({ identifier, code });
    if (!validOtp) return res.status(400).json({ message: 'Invalid or expired code' });

    await OTP.deleteOne({ _id: validOtp._id });

    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { phone: identifier };
    
    let user = await User.findOne(query);
    if (!user) {
      user = new User({ 
        ...query,
        name: name || (isEmail ? identifier.split('@')[0] : identifier)
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '365d' });
    res.json({ token, user: generateUserPayload(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/categories', auth, async (req, res) => {
  try {
    await connectDB();
    const { category } = req.body;
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    const user = await User.findById(req.user);
    if (!user.customCategories.includes(category.trim())) {
      user.customCategories.push(category.trim());
      await user.save();
    }
    res.json(user.customCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/user/profile', auth, async (req, res) => {
  try {
    await connectDB();
    const { name, email, phone, dob, dp } = req.body;
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check email uniqueness if changed
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }

    // Check phone uniqueness if changed
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) return res.status(400).json({ message: 'Phone number already in use' });
      user.phone = phone;
    }

    if (name !== undefined) user.name = name;
    if (dob !== undefined) user.dob = dob;
    if (dp !== undefined) user.dp = dp;

    await user.save();

    res.json({
      ...generateUserPayload(user)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/user/settings', auth, async (req, res) => {
  try {
    await connectDB();
    const { emailNotifications, pushNotifications } = req.body;
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (typeof emailNotifications === 'boolean') {
      user.emailNotifications = emailNotifications;
    }
    if (typeof pushNotifications === 'boolean') {
      user.pushNotifications = pushNotifications;
    }
    await user.save();
    
    res.json({ emailNotifications: user.emailNotifications, pushNotifications: user.pushNotifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/notify-now', auth, async (req, res) => {
  try {
    await connectDB();
    const { taskText } = req.body;
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.emailNotifications) {
      await sendInstantReminderEmail(user.email, user.name, taskText);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cron/daily-check', async (req, res) => {
  // Optional: check Authorization header if triggered externally
  // if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }
  
  try {
    await connectDB();
    const users = await User.find({ emailNotifications: true });
    
    let emailsSent = 0;
    for (const user of users) {
      const missedCount = await Todo.countDocuments({
        userId: user._id,
        category: 'daily',
        completed: false,
        deletedAt: null
      });

      if (missedCount > 0) {
        const sent = await sendDailyReminderEmail(user.email, user.name, missedCount);
        if (sent) emailsSent++;
      }
    }
    
    res.json({ success: true, checkedUsers: users.length, emailsSent });
  } catch (err) {
    console.error('Cron job error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Todo Routes
app.get('/api/todos', auth, async (req, res) => {
  try {
    await connectDB();
    const todos = await Todo.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/todos', auth, async (req, res) => {
  try {
    await connectDB();
    const { text, category, reminderTime } = req.body;
    
    const newTodo = new Todo({
      text,
      category,
      reminderTime,
      userId: req.user
    });
    
    const savedTodo = await newTodo.save();
    res.json(savedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/todos/:id', auth, async (req, res) => {
  try {
    await connectDB();
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const { text, completed, reminderTime, notified, deletedAt, category } = req.body;
    
    if (text !== undefined) todo.text = text;
    if (completed !== undefined) todo.completed = completed;
    if (reminderTime !== undefined) todo.reminderTime = reminderTime;
    if (notified !== undefined) todo.notified = notified;
    if (deletedAt !== undefined) todo.deletedAt = deletedAt;
    if (category !== undefined) todo.category = category;

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/todos/:id', auth, async (req, res) => {
  try {
    await connectDB();
    const deletedTodo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user });
    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json(deletedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/todos/reorder', auth, async (req, res) => {
  try {
    await connectDB();
    const { orderedIds } = req.body;
    const updates = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId: req.user },
        update: { $set: { createdAt: new Date(Date.now() - index * 1000) } } 
      }
    }));
    await Todo.bulkWrite(updates);
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Routes
app.get('/api/admin/users', auth, async (req, res) => {
  try {
    await connectDB();
    const requester = await User.findById(req.user);
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    const todos = await Todo.aggregate([
      { 
        $group: { 
          _id: { userId: "$userId", category: "$category" },
          count: { $sum: 1 }
        } 
      }
    ]);

    const todoCounts = todos.reduce((acc, curr) => {
      const uid = curr._id.userId.toString();
      const cat = curr._id.category || 'unassigned';
      if (!acc[uid]) acc[uid] = { total: 0 };
      acc[uid][cat] = curr.count;
      acc[uid].total += curr.count;
      return acc;
    }, {});

    const usersWithCounts = users.map(u => {
      const counts = todoCounts[u._id.toString()] || { total: 0 };
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        todoCounts: counts
      };
    });

    res.json(usersWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
