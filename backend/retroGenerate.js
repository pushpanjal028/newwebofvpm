import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import MemberCard from "./src/models/MemberCard.js";
import { generateCardPDF } from "./src/modules/member/cardGenerator.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dns from "node:dns/promises";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  // Ignore DNS config failures
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function checkAndGenerate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const users = await User.find({ approvalStatus: "approved" });
  console.log(`Found ${users.length} approved users.`);

  for (const user of users) {
    const card = await MemberCard.findOne({ userId: user._id });
      try {
        const pdfBuffer = await generateCardPDF({
          membershipId: user.membershipId,
          name: user.name,
          designation: user.designation,
          organization: user.organization,
          city: user.city,
          state: user.state,
          phone: user.phone,
          photoUrl: user.photo ? (user.photo.startsWith('http') ? user.photo : `http://localhost:5000/api/uploads/view/${user.photo}`) : null,
          localPhotoPath: user.photo,
          validFromStr: user.issueDate ? user.issueDate.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "N/A",
          validUntilStr: user.expiryDate ? user.expiryDate.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "N/A",
        });

        const pdfFilename = `member_card_${user.membershipId}_${Date.now()}.pdf`;
        let pdfUrl = `uploads/${pdfFilename}`;
        
        const localPath = path.join(__dirname, "uploads", pdfFilename);
        fs.writeFileSync(localPath, pdfBuffer);

        if (card) {
          card.pdfUrl = pdfUrl;
          await card.save();
        } else {
          const newCard = new MemberCard({
            userId: user._id,
            cardNumber: user.membershipId,
            validFrom: user.issueDate,
            validUntil: user.expiryDate,
            pdfUrl: pdfUrl,
          });
          await newCard.save();
        }
        console.log(`Successfully generated and saved card for ${user.name}`);
      } catch (err) {
        console.error(`Error generating card for ${user.name}:`, err);
      }
  }

  mongoose.disconnect();
}

checkAndGenerate();
