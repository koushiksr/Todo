import connectDB from './server/db.js';
import User from './server/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  await connectDB();
  const res = await User.updateMany(
    { email: { $regex: /technohmsit/i } },
    { $set: { role: 'admin' } }
  );
  console.log('Modified users:', res.modifiedCount);
  const admins = await User.find({ role: 'admin' });
  console.log('Admins now:', admins.map(u => u.email));
  process.exit(0);
};
run();
