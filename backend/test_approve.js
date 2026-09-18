import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

import User from './src/models/User.js';
import { verifyMembershipService } from './src/modules/admin/admin.service.js';

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vpmh_db');
  
  const user = await User.findOne({ approvalStatus: { $ne: 'approved' }, paymentStatus: 'paid' });
  if (!user) {
    console.log("No pending user found.");
    process.exit(0);
  }
  
  console.log("Approving user:", user.email);
  
  try {
    const adminUser = { _id: new mongoose.Types.ObjectId() };
    const res = await verifyMembershipService(adminUser, user._id, { status: "approved" });
    console.log("Approval result:", res);
  } catch (err) {
    console.error("Error during approval:", err);
  }
  process.exit(0);
}

test();
