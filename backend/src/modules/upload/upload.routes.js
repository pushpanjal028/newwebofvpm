import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { generatePresignedPutUrl, generatePresignedGetUrl, deleteS3Object } from "../../utils/s3.js";
import RegistrationAttempt from "../../models/RegistrationAttempt.js";
import User from "../../models/User.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootUploadsDir = path.join(__dirname, "../../../uploads");

// Initialize secure registration attempt
router.post("/init-registration", async (req, res) => {
  try {
    const attemptId = crypto.randomUUID();
    const attempt = new RegistrationAttempt({ attemptId });
    await attempt.save();
    res.json({ attemptId });
  } catch (err) {
    console.error("❌ Init registration error:", err);
    res.status(500).json({ message: "Failed to initialize registration." });
  }
});

// Generate PUT Presigned URL for client-side uploads
router.post("/presigned-url", async (req, res) => {
  try {
    const { filename, fileType, attemptId } = req.body;

    if (!filename || !fileType) {
      return res.status(400).json({ message: "Filename and fileType are required." });
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext).replace(/[^a-zA-Z0-9]/g, "_");
    
    // Create S3 Key
    let key;
    if (attemptId) {
      const attempt = await RegistrationAttempt.findOne({ attemptId });
      if (!attempt) {
        return res.status(400).json({ message: "Invalid or expired registration attempt." });
      }
      key = `temp/registration/${attemptId}/${basename}-${uniqueSuffix}${ext}`;
      attempt.keys.push(key);
      await attempt.save();
    } else {
      key = `uploads/${basename}-${uniqueSuffix}${ext}`;
    }

    const uploadUrl = await generatePresignedPutUrl(key, fileType);

    res.json({ uploadUrl, key });
  } catch (err) {
    console.error("❌ Generate PUT URL error:", err);
    res.status(500).json({ message: "Failed to generate upload URL." });
  }
});

// Secure S3 Cleanup for failed registration attempts
router.post("/cleanup", async (req, res) => {
  try {
    const { attemptId } = req.body;
    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required." });
    }

    const attempt = await RegistrationAttempt.findOne({ attemptId });
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found or already cleaned up." });
    }

    let deletedCount = 0;
    for (const key of attempt.keys) {
      // Safety check: ensure key belongs to the attempt namespace
      if (!key.startsWith(`temp/registration/${attemptId}/`)) {
        continue;
      }

      // Safety check: ensure no active user is referencing this file
      const userRef = await User.findOne({ $or: [{ photo: key }, { documentProof: key }] });
      if (userRef) {
        console.warn(`⚠️ Warning: Key ${key} is referenced by an active user. Skipping deletion.`);
        continue;
      }

      try {
        await deleteS3Object(key);
        deletedCount++;
      } catch (s3Err) {
        console.error(`❌ Failed to delete S3 object ${key}:`, s3Err);
      }
    }

    await RegistrationAttempt.deleteOne({ _id: attempt._id });

    res.json({ message: "Cleanup successful.", deletedCount });
  } catch (err) {
    console.error("❌ Cleanup error:", err);
    res.status(500).json({ message: "Failed to cleanup registration attempt." });
  }
});

// Secure GET Temporary URL redirect with local fallback
router.get(/^\/view\/(.+)$/, async (req, res) => {
  try {
    const key = req.params[0];

    if (!key) {
      return res.status(400).json({ message: "S3 object key is required." });
    }

    // Dynamic local fallback: check if file is physically present in root uploads/
    let fileSubpath = key;
    if (key.toLowerCase().startsWith("uploads/")) {
      fileSubpath = key.substring(8);
    }
    const localFilePath = path.join(rootUploadsDir, fileSubpath);
    if (fs.existsSync(localFilePath)) {
      return res.sendFile(localFilePath);
    }

    // Otherwise, generate temporary GET URL and redirect to S3
    const tempGetUrl = await generatePresignedGetUrl(key);
    res.redirect(302, tempGetUrl);
  } catch (err) {
    console.error("❌ View redirect error:", err);
    res.status(404).json({ message: "Image not found or access expired." });
  }
});

export default router;
