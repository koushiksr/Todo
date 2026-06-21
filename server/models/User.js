import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: false },
  name: { type: String, default: 'User' },
  dp: { type: String, default: null }, // Base64 or URL
  dob: { type: Date, default: null },
  role: { type: String, default: 'user' },
  customCategories: [{ type: String }],
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
