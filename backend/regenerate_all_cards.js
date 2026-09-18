import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './src/models/User.js';
import MemberCard from './src/models/MemberCard.js';
import { generateCardPDF } from './src/modules/member/cardGenerator.service.js';
import { uploadBufferToS3 } from './src/utils/s3.js';
import dns from 'node:dns/promises';

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  // Ignore DNS config failures
}

async function regenerateAllCards() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vpmh_db');
    console.log("Connected to database.");

    const users = await User.find({
      approvalStatus: "approved",
      membershipId: { $exists: true, $ne: null },
      issueDate: { $exists: true, $ne: null },
      expiryDate: { $exists: true, $ne: null }
    });

    console.log(`Found ${users.length} approved users. Regenerating cards...`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      console.log(`Generating card for user: ${user.name} (${user.email}) - ${user.membershipId}`);
      try {
        let memberCard = await MemberCard.findOne({ userId: user._id });
        
        const pdfBuffer = await generateCardPDF({
          membershipId: user.membershipId,
          name: user.name,
          designation: user.designation,
          organization: user.organization,
          city: user.city,
          state: user.state,
          phone: user.phone,
          photoUrl: user.photo ? (user.photo.startsWith('http') ? user.photo : `${process.env.API_URL || 'http://localhost:5000'}/api/uploads/view/${user.photo}`) : null,
          localPhotoPath: user.photo,
          validFromStr: user.issueDate.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
          validUntilStr: user.expiryDate.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
        });
        
        let pdfUrl = `uploads/member_card_${user.membershipId}_${Date.now()}.pdf`;
        
        if (process.env.AWS_BUCKET_NAME) {
          await uploadBufferToS3(pdfUrl, pdfBuffer, "application/pdf");
        } else {
          const localPath = path.join(__dirname, "uploads", path.basename(pdfUrl));
          const dirPath = path.dirname(localPath);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          fs.writeFileSync(localPath, pdfBuffer);
        }

        if (!memberCard) {
          memberCard = new MemberCard({
            userId: user._id,
            cardNumber: user.membershipId,
            validFrom: user.issueDate,
            validUntil: user.expiryDate,
            pdfUrl: pdfUrl,
          });
        } else {
          memberCard.pdfUrl = pdfUrl;
        }
        await memberCard.save();
        console.log(`Successfully generated and saved card for ${user.email}`);
        successCount++;
      } catch (err) {
        console.error(`Error regenerating card for user ${user.email}:`, err);
        errorCount++;
      }
    }

    console.log(`Regeneration complete. Success: ${successCount}, Errors: ${errorCount}`);
  } catch (err) {
    console.error("Critical script error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

regenerateAllCards();
