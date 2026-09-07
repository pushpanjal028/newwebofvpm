import dns from 'dns';
dns.setServers(['8.8.8.8']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.updateOne({ phone: '7773008411' }, { $set: { paymentStatus: 'pending' }, $unset: { paymentReferenceId: '', paymentScreenshot: '' } });
  console.log('Reverted');
  process.exit(0);
});
