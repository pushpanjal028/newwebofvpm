import dns from 'dns';
dns.setServers(['8.8.8.8']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({isAdmin: false}).sort({createdAt: -1}).limit(5);
  console.log(users.map(u => ({
    name: u.name,
    paymentStatus: u.paymentStatus,
    ref: u.paymentReferenceId,
    email: u.email,
    phone: u.phone,
    screenshot: u.paymentScreenshot
  })));
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
