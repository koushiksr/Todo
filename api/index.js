import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import connectDB from '../server/db.js';
import User from '../server/models/User.js';
import Todo from '../server/models/Todo.js';
import auth from '../server/middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Not all fields have been entered.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const newUser = new User({ email, password, name });
    const savedUser = await newUser.save();

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role, customCategories: savedUser.customCategories }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Not all fields have been entered.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, customCategories: user.customCategories }
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
