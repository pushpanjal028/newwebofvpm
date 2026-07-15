import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import User from "../models/userModel.js";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";
import OTP from "../models/otpModel.js";

dotenv.config();

const router = express.Router();

// Rate limiters for security
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many registrations from this IP, please try again after 15 minutes." },
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 OTP requests per 5 minutes
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

// Nodemailer SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ SEND OTP CODE ROUTE
router.post("/send-otp", otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Check if user email is already registered
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "A member is already registered with this email." });
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Save new OTP
    const otpRecord = new OTP({ email, otp });
    await otpRecord.save();

    // Send email with premium HTML layout
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Verify Your Email - Vishwa Patrakar Mahasangh`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Vishwa Patrakar Mahasangh</h2>
            <p style="color: #f59e0b; margin: 5px 0 0 0; font-size: 11px; font-weight: bold; letter-spacing: 2px;">GLOBAL JOURNALIST ASSOCIATION</p>
          </div>
          
          <div style="color: #334155; line-height: 1.6; font-size: 14px;">
            <p>Hello,</p>
            <p>Thank you for starting the registration process with Vishwa Patrakar Mahasangh. To verify your email address, please enter the following 6-digit verification code (OTP) in the registration form:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; font-family: monospace; font-size: 32px; font-weight: 900; color: #b45309; background-color: #fef3c7; border: 1px dashed #f59e0b; padding: 12px 30px; letter-spacing: 6px; border-radius: 8px;">${otp}</span>
            </div>
            
            <p style="color: #ef4444; font-size: 12px; font-weight: bold;">⚠️ Note: This OTP is confidential and will expire in 10 minutes.</p>
            <p>If you did not initiate this registration, please ignore this email.</p>
          </div>

          <div style="text-align: center; border-top: 1px solid #e2e8f0; margin-top: 35px; padding-top: 15px; font-size: 11px; color: #94a3b8;">
            <p>This is an automated security verification email. Please do not reply directly.</p>
            <p>&copy; ${new Date().getFullYear()} Vishwa Patrakar Mahasangh. All Rights Reserved.</p>
          </div>
        </div>
      `
    });

    res.json({ message: "Verification OTP code sent to your email successfully." });
  } catch (err) {
    console.error("❌ Send OTP error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ REGISTER ROUTE
router.post(
  "/register",
  registerLimiter,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "documentProof", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, email, password, phone, organization, state, city, designation, otp } = req.body;

      if (!name || !email || !password || !phone || !state || !city || !designation || !otp) {
        return res.status(400).json({ message: "All required fields and OTP verification code must be provided." });
      }

      // Check OTP validity
      const otpRecord = await OTP.findOne({ email, otp });
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired email verification code (OTP)." });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "User already exists with this email." });
      }

      // OTP verified successfully, clean it up
      await OTP.deleteMany({ email });

      const hashedPassword = await bcrypt.hash(password, 10);

      let photoPath = "";
      let documentProofPath = "";

      if (req.files) {
        if (req.files.photo && req.files.photo[0]) {
          photoPath = `/uploads/${req.files.photo[0].filename}`;
        }
        if (req.files.documentProof && req.files.documentProof[0]) {
          documentProofPath = `/uploads/${req.files.documentProof[0].filename}`;
        }
      }

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        organization: organization || "",
        state,
        city,
        designation,
        photo: photoPath,
        documentProof: documentProofPath,
        paymentStatus: "pending",
        approvalStatus: "pending",
      });

      await newUser.save();

      // Send Email to User
      try {
        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: email,
          subject: "Welcome to Vishwa Patrakar Mahasangh (VPMH)",
          text: `Dear ${name},

Thank you for registering with Vishwa Patrakar Mahasangh (VPMH).

We have received your application:
Name: ${name}
Designation: ${designation}
State/City: ${state}, ${city}

Please log in and submit your registration fee using the UPI payment link to activate your membership.

Regards,
VPMH Team`,
        });

        // Notify Admin
        if (process.env.ADMIN_EMAIL) {
          await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: process.env.ADMIN_EMAIL,
            subject: "New VPMH Member Registration",
            text: `A new member has registered:
Name: ${name}
Email: ${email}
Phone: ${phone}
Organization: ${organization || "N/A"}
`,
          });
        }
      } catch (mailErr) {
        console.error("❌ Email send error during registration:", mailErr);
      }

      res.json({ message: "User registered successfully." });
    } catch (err) {
      console.error("❌ Register error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ✅ LOGIN ROUTE
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        membershipId: user.membershipId,
        paymentStatus: user.paymentStatus,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ MANUAL PAYMENT SUBMISSION ROUTE
router.post(
  "/payment/submit",
  upload.single("paymentScreenshot"),
  async (req, res) => {
    try {
      const { emailOrPhone, transactionId } = req.body;

      if (!emailOrPhone || !transactionId) {
        return res.status(400).json({ message: "Email or Phone and Transaction/Reference ID are required." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Payment screenshot is required." });
      }

      // Check duplicate transaction ID
      const duplicateTxn = await User.findOne({ paymentReferenceId: transactionId });
      if (duplicateTxn) {
        return res.status(400).json({ message: "This Transaction ID has already been submitted." });
      }

      // Find member
      const user = await User.findOne({
        $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      });

      if (!user) {
        return res.status(404).json({ message: "No registered member found with this Email or Phone." });
      }

      user.paymentReferenceId = transactionId;
      user.paymentScreenshot = `/uploads/${req.file.filename}`;
      user.paymentStatus = "verification_pending";

      await user.save();

      res.json({ message: "Payment receipt submitted successfully. Verification pending." });
    } catch (err) {
      console.error("❌ Payment submit error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ✅ CONTACT FORM ROUTE
router.post("/contact", contactLimiter, async (req, res) => {
  try {
    const { from_name, from_email, message } = req.body;

    if (!from_name || !from_email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      replyTo: from_email,
      subject: `New Contact Submission from ${from_name}`,
      text: `You have received a new contact submission:
Name: ${from_name}
Email: ${from_email}
Message:
${message}`,
    });

    res.json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("❌ Contact form submit error:", err);
    res.status(500).json({ message: "Failed to send email. Please try again later." });
  }
});

// ✅ GET CURRENT MEMBER PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Fetch profile error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE MEMBER PROFILE
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone, organization, state, city, designation } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.organization = organization !== undefined ? organization : user.organization;
    user.state = state || user.state;
    user.city = city || user.city;
    user.designation = designation || user.designation;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        phone: user.phone,
        organization: user.organization,
        state: user.state,
        city: user.city,
        designation: user.designation,
      }
    });
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ CHANGE PASSWORD
router.post("/change-password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Password update error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;