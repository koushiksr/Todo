import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  category: { type: String, default: 'daily' },
  completed: { type: Boolean, default: false },
  reminderTime: { type: String, default: null },
  notified: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.Todo || mongoose.model('Todo', todoSchema);
