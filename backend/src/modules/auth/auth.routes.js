import express from "express";
import rateLimit from "express-rate-limit";
import {
  sendOtp,
  registerUser,
  loginUser,
  submitContactForm,
  getCurrentProfile,
  updateProfile,
  changePassword,
} from "./auth.controller.js";
import auth from "../../middlewares/auth.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

// Rate limiters
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many registrations from this IP, please try again after 15 minutes." },
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: { message: "Too many verification requests from this IP. Please try again after 5 minutes." }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many login attempts, please try again after 15 minutes." },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: "Too many contact messages sent, please try again after 15 minutes." },
});

// Enpoints
router.post("/send-otp", otpLimiter, sendOtp);
router.post(
  "/register",
  registerLimiter,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "documentProof", maxCount: 1 },
  ]),
  registerUser
);
router.post("/login", loginLimiter, loginUser);
router.post("/contact", contactLimiter, submitContactForm);

// Protected routes
router.get("/me", auth, getCurrentProfile);
router.put("/profile", auth, updateProfile);
router.post("/change-password", auth, changePassword);

export default router;
