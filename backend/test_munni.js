import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function testGenerate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  
  const User = (await import('./src/models/User.js')).default;
  const { generateCardPDF } = await import('./src/modules/member/cardGenerator.service.js');

  const users = await User.find({ name: { $regex: /munni/i } });
  if (users.length === 0) {
    console.log("No user Munni found.");
    process.exit(0);
  }

  const user = users[0];
  console.log(`Testing generation for: ${user.name}`);

  try {
    const pdfBuffer = await generateCardPDF({
      membershipId: user.membershipId || "VPMH-TEST-0000",
      name: user.name,
      designation: user.designation,
      organization: user.organization,
      city: user.city,
      state: user.state,
      phone: user.phone,
      photoUrl: user.photo ? (user.photo.startsWith('http') ? user.photo : `${process.env.API_URL || 'http://localhost:5000'}/api/uploads/view/${user.photo}`) : null,
      localPhotoPath: user.photo,
      validFromStr: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
      validUntilStr: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
    });
    console.log("Success! Generated PDF of size:", pdfBuffer.length);
  } catch (err) {
    console.error("Generation failed:", err);
  }

  mongoose.disconnect();
}

testGenerate().catch(console.error);
