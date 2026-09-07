import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from "node:dns/promises";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../src/models/User.js';
import MemberCard from '../src/models/MemberCard.js';
import { generateCardPDF } from '../src/modules/member/cardGenerator.service.js';
import { uploadBufferToS3 } from '../src/utils/s3.js';
import fs from 'fs';

async function regenerateAllCards() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database.");

    // Find all users with approvalStatus 'approved'
    const users = await User.find({ approvalStatus: 'approved', membershipId: { $exists: true } });
    console.log(`Found ${users.length} approved users.`);

    for (const user of users) {
      console.log(`\nProcessing user: ${user.name} (${user.membershipId})`);
      
      try {
        let memberCard = await MemberCard.findOne({ userId: user._id });

        const photoUrl = user.photo ? (user.photo.startsWith('http') ? user.photo : `${process.env.API_URL || 'http://localhost:5000'}/api/uploads/view/${user.photo}`) : null;
        
        const validFromStr = user.issueDate ? user.issueDate.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : 'N/A';
        const validUntilStr = user.expiryDate ? user.expiryDate.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : 'N/A';

        console.log("  Generating PDF...");
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
          validFromStr: validFromStr,
          validUntilStr: validUntilStr,
        });

        let pdfUrl = `uploads/member_card_${user.membershipId}_${Date.now()}.pdf`;

        if (process.env.AWS_BUCKET_NAME) {
          console.log("  Uploading to S3...");
          await uploadBufferToS3(pdfUrl, pdfBuffer, "application/pdf");
        } else {
          console.log("  Saving locally...");
          const localPath = path.join(__dirname, "../../uploads", path.basename(pdfUrl));
          fs.writeFileSync(localPath, pdfBuffer);
        }

        if (!memberCard) {
          console.log("  Creating new MemberCard record...");
          memberCard = new MemberCard({
            userId: user._id,
            cardNumber: user.membershipId,
            validFrom: user.issueDate,
            validUntil: user.expiryDate,
            pdfUrl: pdfUrl,
          });
        } else {
          console.log("  Updated existing MemberCard PDF URL.");
          memberCard.pdfUrl = pdfUrl;
        }
        await memberCard.save();
        
      } catch (err) {
        console.error(`❌ Failed to process user ${user.membershipId}:`, err.message);
      }
    }
    
    console.log("\nDone processing all cards.");
  } catch (err) {
    console.error("Script failed:", err);
  } finally {
    mongoose.disconnect();
  }
}

regenerateAllCards();
