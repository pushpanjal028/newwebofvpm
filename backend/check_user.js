import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function checkUser() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  
  // Use dynamic import for models because they use ESM
  const User = (await import('./src/models/User.js')).default;
  const MemberCard = (await import('./src/models/MemberCard.js')).default;

  const users = await User.find({ name: { $regex: /munni/i } });
  
  if (users.length === 0) {
    console.log("No user named Munni found");
  }

  for (const user of users) {
    console.log(`User: ${user.name} | ID: ${user._id} | Approval: ${user.approvalStatus}`);
    
    const card = await MemberCard.findOne({ userId: user._id });
    if (card) {
      console.log(`- Card found! URL: ${card.pdfUrl}`);
    } else {
      console.log(`- No MemberCard found for this user`);
    }
  }

  mongoose.disconnect();
}

checkUser().catch(console.error);
