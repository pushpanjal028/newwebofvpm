import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { generatePresignedPutUrl, generatePresignedGetUrl, deleteS3Object } from "../../utils/s3.js";
import RegistrationAttempt from "../../models/RegistrationAttempt.js";
import PaymentAttempt from "../../models/PaymentAttempt.js";
import User from "../../models/User.js";
import auth from "../../middlewares/auth.js";

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

// Initialize secure payment attempt
router.post("/init-payment", async (req, res) => {
  try {
    const paymentAttemptId = crypto.randomUUID();
    const attempt = new PaymentAttempt({ paymentAttemptId });
    await attempt.save();
    res.json({ paymentAttemptId });
  } catch (err) {
    console.error("❌ Init payment error:", err);
    res.status(500).json({ message: "Failed to initialize payment." });
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
    } else if (req.body.paymentAttemptId) {
      const { paymentAttemptId } = req.body;
      const attempt = await PaymentAttempt.findOne({ paymentAttemptId });
      if (!attempt) {
        return res.status(400).json({ message: "Invalid or expired payment attempt." });
      }
      key = `temp/payment/${paymentAttemptId}/${basename}-${uniqueSuffix}${ext}`;
      attempt.keys.push(key);
      await attempt.save();
    } else {
      key = `uploads/${basename}-${uniqueSuffix}${ext}`;
    }

    const uploadUrl = await generatePresignedPutUrl(key, fileType);
    
    const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";
    const REGION = process.env.AWS_REGION || "us-east-1";
    const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

    res.json({ uploadUrl, key, publicUrl });
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
      const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";
      const REGION = process.env.AWS_REGION || "us-east-1";
      const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
      
      const userRef = await User.findOne({ $or: [{ photo: publicUrl }, { documentProof: publicUrl }] });
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

// Secure S3 Cleanup for failed payment attempts
router.post("/cleanup-payment", async (req, res) => {
  try {
    const { paymentAttemptId } = req.body;
    if (!paymentAttemptId) {
      return res.status(400).json({ message: "paymentAttemptId is required." });
    }

    const attempt = await PaymentAttempt.findOne({ paymentAttemptId });
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found or already cleaned up." });
    }

    let deletedCount = 0;
    for (const key of attempt.keys) {
      // Safety check: ensure key belongs to the attempt namespace
      if (!key.startsWith(`temp/payment/${paymentAttemptId}/`)) {
        continue;
      }

      // Safety check: ensure no active user is referencing this file
      const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";
      const REGION = process.env.AWS_REGION || "us-east-1";
      const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;

      const userRef = await User.findOne({ paymentScreenshot: publicUrl });
      if (userRef) {
        console.warn(`⚠️ Warning: Key ${key} is referenced by an active payment. Skipping deletion.`);
        continue;
      }

      try {
        await deleteS3Object(key);
        deletedCount++;
      } catch (s3Err) {
        console.error(`❌ Failed to delete S3 object ${key}:`, s3Err);
      }
    }

    await PaymentAttempt.deleteOne({ _id: attempt._id });

    res.json({ message: "Cleanup successful.", deletedCount });
  } catch (err) {
    console.error("❌ Cleanup payment error:", err);
    res.status(500).json({ message: "Failed to cleanup payment attempt." });
  }
});

// Secure API to generate short-lived signed URLs for private documents
router.get("/document-url", auth, async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) {
      return res.status(400).json({ message: "Document key is required." });
    }

    // Only allow signed URLs for temp namespace (private documents)
    if (!key.startsWith("temp/")) {
      return res.status(400).json({ message: "Invalid document namespace." });
    }

    // Verify ownership or admin access
    const owner = await User.findOne({ 
      $or: [{ photo: key }, { documentProof: key }, { paymentScreenshot: key }] 
    });

    if (!req.user.isAdmin) {
      if (!owner || owner._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Forbidden: You do not have access to this document." });
      }
    } else {
      if (!owner) {
        return res.status(403).json({ message: "Forbidden: Document does not belong to any valid user." });
      }
    }

    // Generate short-lived signed URL (e.g., 5 minutes = 300 seconds)
    const signedUrl = await generatePresignedGetUrl(key, 300);
    res.json({ signedUrl });
  } catch (err) {
    console.error("❌ Generate document URL error:", err);
    res.status(500).json({ message: "Failed to generate document URL." });
  }
});

// Secure GET Temporary URL redirect with local fallback
router.get(/^\/view\/(.+)$/, (req, res, next) => {
  const key = req.params[0];
  if (key && key.includes("temp/")) {
    auth(req, res, async () => {
      try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const owner = await User.findOne({ $or: [{ photo: key }, { documentProof: key }, { paymentScreenshot: key }] });
        
        if (!req.user.isAdmin) {
          if (!owner || owner._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden" });
          }
        }
        
        next();
      } catch (dbErr) {
        return res.status(500).json({ message: "Internal server error" });
      }
    });
  } else {
    next();
  }
}, async (req, res) => {
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
