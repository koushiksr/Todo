import mongoose from 'mongoose';

const magicLinkSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 900 } // Auto-delete after 15 mins
});

export default mongoose.models.MagicLink || mongoose.model('MagicLink', magicLinkSchema);
