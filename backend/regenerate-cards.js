import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dns from 'dns';
import User from './src/models/User.js';
import MemberCard from './src/models/MemberCard.js';
import { generateCardPDF } from './src/modules/member/cardGenerator.service.js';
import { uploadBufferToS3 } from './src/utils/s3.js';

dns.setServers(['8.8.8.8']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const approvedUsers = await User.find({ approvalStatus: 'approved' });
    console.log(`Found ${approvedUsers.length} approved users.`);

    for (const user of approvedUsers) {
      if (!user.membershipId) continue;

      const existingCard = await MemberCard.findOne({ userId: user._id });
      if (existingCard) {
        console.log(`User ${user.name} (${user.membershipId}) already has a card.`);
        continue;
      }

      console.log(`Generating card for ${user.name} (${user.membershipId})...`);

      const photoUrl = user.photo ? (user.photo.startsWith('http') ? user.photo : `${process.env.API_URL || 'http://localhost:5000'}/api/uploads/view/${user.photo}`) : null;

      try {
        const pdfBuffer = await generateCardPDF({
          membershipId: user.membershipId,
          name: user.name,
          designation: user.designation,
          organization: user.organization,
          city: user.city,
          state: user.state,
          phone: user.phone,
          photoUrl: photoUrl,
          localPhotoPath: user.photo,
          validFromStr: user.issueDate ? user.issueDate.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : '01/01/2026',
          validUntilStr: user.expiryDate ? user.expiryDate.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : '31/12/2026',
        });

        const pdfFilename = `member_card_${user.membershipId}_${Date.now()}.pdf`;
        let pdfUrl = `uploads/${pdfFilename}`;
        
        if (process.env.AWS_BUCKET_NAME) {
          await uploadBufferToS3(pdfUrl, pdfBuffer, "application/pdf");
        } else {
          const localPath = path.join(__dirname, "uploads", pdfFilename);
          fs.writeFileSync(localPath, pdfBuffer);
        }

        const memberCard = new MemberCard({
          userId: user._id,
          cardNumber: user.membershipId,
          validFrom: user.issueDate || new Date(),
          validUntil: user.expiryDate || new Date(Date.now() + 31536000000),
          pdfUrl: pdfUrl,
        });

        await memberCard.save();
        console.log(`✅ Success for ${user.name}`);
      } catch (err) {
        console.error(`❌ Failed for ${user.name}:`, err.message);
      }
    }

    console.log("Done.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
