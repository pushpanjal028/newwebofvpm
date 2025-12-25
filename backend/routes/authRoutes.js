// // -------------------new with adding mail-----------------
// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// import User from "../models/userModel.js";

// dotenv.config(); // load .env

// // ✅ define router FIRST
// const router = express.Router();

// // 🔎 debug env once at startup
// console.log("🔎 DEBUG ENV VALUES:");
// console.log("SMTP_HOST:", process.env.SMTP_HOST);
// console.log("SMTP_PORT:", process.env.SMTP_PORT);
// console.log("SMTP_USER:", process.env.SMTP_USER);
// console.log(
//   "SMTP_PASS length:",
//   process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0
// );

// // ✅ Email transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT) || 587,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// // ✅ Register
// router.post("/register", async (req, res) => {
//   try {
//     console.log("📩 Register request:", req.body);

//     const { name, email, password, phone, organization } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       organization,
//     });

//     await newUser.save();

//     // ✅ Send email to user
//     try {
//       await transporter.sendMail({
//         from: process.env.FROM_EMAIL,
//         to: email,
//         subject: "Welcome to Vishwa Patrakar Mahasangh (VPMH)",
//         text: `Dear ${name},

// Thank you for registering with Vishwa Patrakar Mahasangh (VPMH).

// We have received your details:
// Name: ${name}
// Email: ${email}
// Phone: ${phone || "Not provided"}
// Organization: ${organization || "Not provided"}

// We will review your information and contact you if any further details are required.

// Regards,
// VPMH Team
// vpmh.org`,
//       });

//       // (optional) notify admin
//       if (process.env.ADMIN_EMAIL) {
//         await transporter.sendMail({
//           from: process.env.FROM_EMAIL,
//           to: process.env.ADMIN_EMAIL,
//           subject: "New VPMH registration",
//           text: `New user registered:

// Name: ${name}
// Email: ${email}
// Phone: ${phone || "Not provided"}
// Organization: ${organization || "Not provided"}
// `,
//         });
//       }
//     } catch (mailErr) {
//       console.error("❌ Email send error:", mailErr);
//       // don’t block registration if email fails
//     }

//     res.json({ message: "User registered successfully" });
//   } catch (err) {
//     console.error("❌ Register error:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // ✅ Login
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ message: "Login successful", token });
//   } catch (err) {
//     console.error("❌ Login error:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // ✅ IMPORTANT
// export default router;
// import Razorpay from "razorpay";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// router.post("/create-order", async (req, res) => {
//   const options = {
//     amount: 99 * 100,
//     currency: "INR",
//     receipt: "vpmh_" + Date.now(),
//   };

//   const order = await razorpay.orders.create(options);
//   res.json(order);
// });



// // verify payment
// import crypto from "crypto";

// router.post("/verify-payment", async (req, res) => {
//   const { orderId, paymentId, signature, userId } = req.body;

//   const body = orderId + "|" + paymentId;
//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_SECRET)
//     .update(body)
//     .digest("hex");

//   if (expectedSignature !== signature) {
//     return res.status(400).json({ message: "Payment verification failed" });
//   }

//   await User.findByIdAndUpdate(userId, {
//     paymentStatus: "paid",
//     paymentId,
//     orderId,
//   });

//   res.json({ message: "Payment successful" });
// });

// // succesfull
// await transporter.sendMail({
//   to: user.email,
//   subject: "VPMH Membership Payment Successful",
//   text: `
// Dear ${user.name},

// We have successfully received your membership fee of ₹99.

// Payment ID: ${paymentId}
// Status: Paid

// Welcome to Vishwa Patrakar Mahasangh.

// Regards,
// VPMH Team
// `,
// });


import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config(); // load .env

// ✅ define router FIRST
const router = express.Router();

// 🔎 debug env once at startup
console.log("🔎 DEBUG ENV VALUES:");
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log(
  "SMTP_PASS length:",
  process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0
);

// ✅ Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Register
router.post("/register", async (req, res) => {
  try {
    console.log("📩 Register request:", req.body);

    const { name, email, password, phone, organization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      organization,
    });

    await newUser.save();

    // ✅ Send email to user
    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: "Welcome to Vishwa Patrakar Mahasangh (VPMH)",
        text: `Dear ${name},

Thank you for registering with Vishwa Patrakar Mahasangh (VPMH).

We have received your details:
Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Organization: ${organization || "Not provided"}

We will review your information and contact you if any further details are required.

Regards,
VPMH Team
vpmh.org`,
      });

      // (optional) notify admin
      if (process.env.ADMIN_EMAIL) {
        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: process.env.ADMIN_EMAIL,
          subject: "New VPMH registration",
          text: `New user registered:

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Organization: ${organization || "Not provided"}
`,
        });
      }
    } catch (mailErr) {
      console.error("❌ Email send error:", mailErr);
      // don’t block registration if email fails
    }

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ IMPORTANT
export default router;