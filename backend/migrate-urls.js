import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;
const BUCKET = process.env.AWS_BUCKET_NAME || "vpmh-uploads-media";
const REGION = process.env.AWS_REGION || "ap-south-1";

// Helper to convert key to full URL
function getS3Url(key) {
  if (!key) return key;
  if (key.startsWith('http')) return key;
  
  let s3Key = key.trim();
  if (s3Key.startsWith('/')) s3Key = s3Key.substring(1);
  
  if (!s3Key.toLowerCase().startsWith('uploads/') && !s3Key.toLowerCase().startsWith('temp/')) {
    s3Key = `uploads/${s3Key}`;
  }
  
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${s3Key}`;
}

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    const db = mongoose.connection.db;

    // 1. Migrate Users
    console.log("\nMigrating Users...");
    const users = await db.collection('users').find({}).toArray();
    let userUpdates = 0;
    for (const user of users) {
      const updates = {};
      
      if (user.photo && !user.photo.startsWith('http')) {
        updates.photo = getS3Url(user.photo);
      }
      if (user.documentProof && !user.documentProof.startsWith('http')) {
        updates.documentProof = getS3Url(user.documentProof);
      }
      if (user.paymentScreenshot && !user.paymentScreenshot.startsWith('http')) {
        updates.paymentScreenshot = getS3Url(user.paymentScreenshot);
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('users').updateOne({ _id: user._id }, { $set: updates });
        userUpdates++;
      }
    }
    console.log(`Updated ${userUpdates} Users.`);

    // 2. Migrate Gallery
    console.log("\nMigrating Gallery...");
    const galleryItems = await db.collection('galleries').find({}).toArray();
    let galleryUpdates = 0;
    for (const item of galleryItems) {
      if (item.imageUrl && !item.imageUrl.startsWith('http')) {
        await db.collection('galleries').updateOne(
          { _id: item._id },
          { $set: { imageUrl: getS3Url(item.imageUrl) } }
        );
        galleryUpdates++;
      }
    }
    console.log(`Updated ${galleryUpdates} Gallery photos.`);

    // 3. Migrate MemberCards (if they exist in a separate collection)
    console.log("\nMigrating MemberCards...");
    const cards = await db.collection('membercards').find({}).toArray();
    let cardUpdates = 0;
    for (const card of cards) {
      if (card.pdfUrl && !card.pdfUrl.startsWith('http')) {
        await db.collection('membercards').updateOne(
          { _id: card._id },
          { $set: { pdfUrl: getS3Url(card.pdfUrl) } }
        );
        cardUpdates++;
      }
    }
    console.log(`Updated ${cardUpdates} MemberCards.`);

    console.log("\nMigration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
