import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../server/models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Connected to MongoDB');

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME;

    if (!email || !password) {
      console.error('Please define ADMIN_EMAIL and ADMIN_PASSWORD in .env');
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const admin = new User({
      email,
      password,
      name,
      role: 'admin' // Added role for future admin portal
    });

    await admin.save();
    console.log(`Admin user created successfully! You can now log in with ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
