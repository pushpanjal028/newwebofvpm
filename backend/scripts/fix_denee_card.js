import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

// Hardcode DNS servers to avoid ECONNREFUSED
dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, "../.env") });

import User from "../src/models/User.js";
import MemberCard from "../src/models/MemberCard.js";
import { generateCardPDF } from "../src/modules/member/cardGenerator.service.js";
import { uploadBufferToS3 } from "../src/utils/s3.js";

const fixDeneeCard = async () => {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    const cardNumber = "vpmh-2026-1029"; // Denee's lowercase membership ID

    // 1. Find Denee's User record
    const user = await User.findOne({ membershipId: { $regex: new RegExp(`^${cardNumber}$`, "i") } });
    if (!user) {
      console.log(`User with ID ${cardNumber} not found.`);
      process.exit(1);
    }
    console.log(`Found User: ${user.name} (${user._id})`);

    // 2. Find any conflicting MemberCard records
    const conflictingCards = await MemberCard.find({ cardNumber: cardNumber });
    console.log(`Found ${conflictingCards.length} conflicting MemberCards with cardNumber ${cardNumber}.`);

    // Delete conflicting cards that do not belong to this user (or just delete all to regenerate cleanly)
    for (const card of conflictingCards) {
      if (card.userId.toString() !== user._id.toString()) {
        console.log(`Deleting orphan MemberCard: ${card._id} (belongs to ${card.userId}, not Denee)`);
        await MemberCard.findByIdAndDelete(card._id);
      } else {
        console.log(`Deleting existing MemberCard for Denee to regenerate freshly.`);
        await MemberCard.findByIdAndDelete(card._id);
      }
    }

    // 3. Generate Card
    console.log(`Generating PDF for ${user.name}...`);
    const pdfBuffer = await generateCardPDF({
      membershipId: user.membershipId,
      name: user.name,
      designation: user.designation,
      organization: user.organization,
      state: user.state,
      city: user.city,
      localPhotoPath: user.photo,
      issueDate: user.issueDate,
      expiryDate: user.expiryDate,
    });

    // 4. Upload to S3
    console.log(`Uploading to S3...`);
    const pdfFilename = `member_card_${user.membershipId}_${Date.now()}.pdf`;
    await uploadBufferToS3(pdfFilename, pdfBuffer, "application/pdf");
    const pdfUrl = pdfFilename;

    // 5. Create new MemberCard
    console.log(`Creating new MemberCard...`);
    const newCard = new MemberCard({
      userId: user._id,
      cardNumber: user.membershipId.toLowerCase(),
      validFrom: user.issueDate || new Date(),
      validUntil: user.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      pdfUrl: pdfUrl,
    });
    await newCard.save();

    console.log(`Successfully fixed and generated card for ${user.name}.`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

fixDeneeCard();
