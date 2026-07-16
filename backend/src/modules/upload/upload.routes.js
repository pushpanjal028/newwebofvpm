import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { generatePresignedPutUrl, generatePresignedGetUrl } from "../../utils/s3.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootUploadsDir = path.join(__dirname, "../../../uploads");

// Generate PUT Presigned URL for client-side uploads
router.post("/presigned-url", async (req, res) => {
  try {
    const { filename, fileType } = req.body;

    if (!filename || !fileType) {
      return res.status(400).json({ message: "Filename and fileType are required." });
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext).replace(/[^a-zA-Z0-9]/g, "_");
    
    // Create S3 Key (stored in MongoDB)
    const key = `uploads/${basename}-${uniqueSuffix}${ext}`;

    const uploadUrl = await generatePresignedPutUrl(key, fileType);

    res.json({ uploadUrl, key });
  } catch (err) {
    console.error("❌ Generate PUT URL error:", err);
    res.status(500).json({ message: "Failed to generate upload URL." });
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
