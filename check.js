import mongoose from 'mongoose';
import connectDB from './server/db.js';
import User from './server/models/User.js';

await connectDB();
const user = await User.findOne({ email: 'technohmsit@gmail.com' });
console.log(user);
process.exit(0);
