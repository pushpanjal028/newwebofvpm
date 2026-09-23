import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns/promises';

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkMissingCards() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.connection.db.collection('users');
  const MemberCard = mongoose.connection.db.collection('membercards');
  const users = await User.find({ approvalStatus: 'approved', membershipId: { $exists: true } }).toArray();
  console.log('Approved users:', users.length);
  for (const u of users) {
    const card = await MemberCard.findOne({ userId: u._id });
    if (!card) {
      console.log('Missing card for:', u.name, u.email, u.membershipId);
    }
  }
  process.exit(0);
}
checkMissingCards();
