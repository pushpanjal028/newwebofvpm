import express from "express";
import Gallery from "../../models/Gallery.js";
import auth from "../../middlewares/auth.js";

const router = express.Router();

// Middleware to enforce Admin role
const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Administrator privileges required." });
  }
  next();
};

// GET /api/gallery - Public: Fetch all gallery photos
router.get("/", async (req, res) => {
  try {
    const photos = await Gallery.find().sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) {
    console.error("❌ Fetch gallery photos error:", err);
    res.status(500).json({ message: "Failed to fetch gallery photos." });
  }
});

// POST /api/gallery - Admin: Create/Upload new gallery photo
router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const { title, imageUrl, category } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ message: "Photo title and image are required." });
    }

    const newPhoto = new Gallery({
      title,
      imageUrl,
      category: category || "Events",
      uploadedBy: req.user._id,
    });

    await newPhoto.save();
    res.status(201).json({ message: "Gallery photo uploaded successfully.", photo: newPhoto });
  } catch (err) {
    console.error("❌ Add gallery photo error:", err);
    res.status(500).json({ message: err.message || "Failed to upload gallery photo." });
  }
});

// DELETE /api/gallery/:id - Admin: Delete gallery photo
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const photo = await Gallery.findByIdAndDelete(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Gallery photo not found or already deleted." });
    }
    res.json({ message: "Gallery photo deleted successfully." });
  } catch (err) {
    console.error("❌ Delete gallery photo error:", err);
    res.status(500).json({ message: "Failed to delete gallery photo." });
  }
});

export default router;
