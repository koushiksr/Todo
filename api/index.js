import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { sendDailyReminderEmail, sendInstantReminderEmail, sendOTPEmail } from '../server/utils/mailer.js';
import connectDB from '../server/db.js';
import User from '../server/models/User.js';
import OTP from '../server/models/OTP.js';
import Todo from '../server/models/Todo.js';
import auth from '../server/middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/request-otp', async (req, res) => {
  try {
    await connectDB();
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    // Generate 6 digit code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Save new OTP
    const otp = new OTP({ email, code: otpCode });
    await otp.save();

    // Send email
    await sendOTPEmail(email, otpCode);

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    await connectDB();
    const { email, code, name } = req.body; // name is optional, used if creating new user

    if (!email || !code) return res.status(400).json({ message: 'Email and code are required.' });

    const validOtp = await OTP.findOne({ email, code });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    // Delete the used OTP
    await OTP.deleteOne({ _id: validOtp._id });

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user if they don't exist
      user = new User({ 
        email, 
        name: name || email.split('@')[0], 
        password: Math.random().toString(36).slice(-8) // Dummy password since it's required by schema but we don't use it
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        customCategories: user.customCategories, 
        emailNotifications: user.emailNotifications, 
        pushNotifications: user.pushNotifications 
      }
    });
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
