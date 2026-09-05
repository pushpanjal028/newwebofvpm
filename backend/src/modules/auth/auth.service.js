import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../../models/User.js";
import OTP from "../../models/OTP.js";
import Referral from "../../models/Referral.js";
import RegistrationAttempt from "../../models/RegistrationAttempt.js";
import transporter from "../../config/mailer.js";
import MemberCard from "../../models/MemberCard.js";

export const sendOtpService = async (email) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("A member is already registered with this email.");
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

  return { message: "Verification OTP code sent to your email successfully." };
};



export const registerUserService = async ({
  name,
  email,
  password,
  phone,
  organization,
  state,
  city,
  designation,
  otp,
  photo,
  documentProof,
  documentProofBack
}) => {
  if (!name || !email || !password || !phone || !state || !city || !designation || !otp) {
    throw new Error("All required fields and OTP verification code must be provided.");
  }

  // Check OTP validity
  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    throw new Error("Invalid or expired email verification code (OTP).");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("User already exists with this email.");
  }

  // OTP verified successfully, clean it up
  await OTP.deleteMany({ email });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    phone,
    organization: organization || "",
    state,
    city,
    designation,
    photo: photo || "",
    documentProof: documentProof || "",
    documentProofBack: documentProofBack || "",
    paymentStatus: "pending",
    approvalStatus: "pending",
  });

  await newUser.save();

  // Send Welcome Email
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

  return { message: "User registered successfully." };
};

export const loginUserService = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
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
  };
};

export const submitContactFormService = async ({ from_name, from_email, message }) => {
  if (!from_name || !from_email || !message) {
    throw new Error("All fields are required");
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

  return { message: "Message sent successfully!" };
};

export const getCurrentProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password").lean();
  if (!user) {
    throw new Error("User not found");
  }
  
  // Fetch MemberCard if it exists
  const memberCard = await MemberCard.findOne({ userId });
  if (memberCard) {
    user.memberCard = memberCard;
  }
  
  return user;
};

export const updateProfileService = async (userId, { name, phone, organization, state, city, designation, photo, documentProof, documentProofBack }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (organization !== undefined) user.organization = organization;
  if (state !== undefined) user.state = state;
  if (city !== undefined) user.city = city;
  if (designation !== undefined) user.designation = designation;
  if (photo !== undefined) user.photo = photo;
  if (documentProof !== undefined) user.documentProof = documentProof;
  if (documentProofBack !== undefined) user.documentProofBack = documentProofBack;

  await user.save();

  return {
    message: "Profile updated successfully",
    user: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone,
      organization: user.organization,
      state: user.state,
      city: user.city,
      designation: user.designation,
      photo: user.photo,
      documentProof: user.documentProof,
      documentProofBack: user.documentProofBack,
      paymentStatus: user.paymentStatus,
      approvalStatus: user.approvalStatus,
      membershipId: user.membershipId,
      issueDate: user.issueDate,
      expiryDate: user.expiryDate,
    }
  };
};

export const changePasswordService = async (userId, oldPassword, newPassword) => {
  if (!oldPassword || !newPassword) {
    throw new Error("Old password and new password are required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Incorrect old password");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: "Password updated successfully" };
};

export const deleteProfileService = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new Error("User profile not found or already deleted");
  }
  return { message: "User account and profile deleted successfully" };
};

export const forgotPasswordSendOtpService = async (email) => {
  if (!email) {
    throw new Error("Email address is required.");
  }

  const existing = await User.findOne({ email });
  if (!existing) {
    throw new Error("No registered member account found with this email address.");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.deleteMany({ email });

  const otpRecord = new OTP({ email, otp });
  await otpRecord.save();

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Password Reset Verification Code - Vishwa Patrakar Mahasangh`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Vishwa Patrakar Mahasangh</h2>
          <p style="color: #f59e0b; margin: 5px 0 0 0; font-size: 11px; font-weight: bold; letter-spacing: 2px;">PASSWORD RECOVERY SERVICE</p>
        </div>
        
        <div style="color: #334155; line-height: 1.6; font-size: 14px;">
          <p>Hello ${existing.name},</p>
          <p>We received a request to reset the password for your Vishwa Patrakar Mahasangh account. Please enter the following 6-digit OTP code to complete password recovery:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-family: monospace; font-size: 32px; font-weight: 900; color: #b45309; background-color: #fef3c7; border: 1px dashed #f59e0b; padding: 12px 30px; letter-spacing: 6px; border-radius: 8px;">${otp}</span>
          </div>
          
          <p style="color: #ef4444; font-size: 12px; font-weight: bold;">⚠️ Note: This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>

        <div style="text-align: center; border-top: 1px solid #e2e8f0; margin-top: 35px; padding-top: 15px; font-size: 11px; color: #94a3b8;">
          <p>&copy; ${new Date().getFullYear()} Vishwa Patrakar Mahasangh. All Rights Reserved.</p>
        </div>
      </div>
    `
  });

  return { message: "Password reset verification code sent to your email." };
};

export const resetPasswordWithOtpService = async (email, otp, newPassword) => {
  if (!email || !otp || !newPassword) {
    throw new Error("Email, verification OTP code, and new password are required.");
  }

  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    throw new Error("Invalid or expired password reset verification code (OTP).");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User account not found.");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await OTP.deleteMany({ email });

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Password Reset Successful - Vishwa Patrakar Mahasangh",
      text: `Hello ${user.name},\n\nYour Vishwa Patrakar Mahasangh account password has been successfully reset.\n\nIf you did not perform this change, please contact support immediately.\n\nRegards,\nVPMH Team`
    });
  } catch (mErr) {
    console.error("❌ Password reset confirmation email error:", mErr);
  }

  return { message: "Password reset successfully. You can now log in with your new password." };
};

export const sendVerificationEmailService = async (user) => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  user.emailVerificationTokenHash = tokenHash;
  // Expire in 24 hours
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: "Verify Your Email - Vishwa Patrakar Mahasangh",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Hello ${user.name},</p>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verifyUrl}" style="display:inline-block; padding:10px 20px; background:#f59e0b; color:#fff; text-decoration:none; border-radius:5px;">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        </div>
      `
    });
  } catch (err) {
    console.error("❌ Email sending failed, but user was created.", err);
    // Do not throw here, user is already created, they can request resend
  }
};

export const registerPhase3Service = async ({
  name, email, password, phone, organization, state, city, designation, photo, documentProof, documentProofBack, coordinatorCode, attemptId
}) => {
  if (!name || !email || !password || !phone) {
    throw new Error("Name, email, password, and phone are required.");
  }

  if (!photo) {
    throw new Error("Profile photo is required.");
  }

  if (!documentProof) {
    throw new Error("ID/Document proof front side is required.");
  }

  if (!documentProofBack) {
    throw new Error("ID/Document proof back side is required.");
  }

  if (!attemptId) {
    throw new Error("Registration attempt ID is required for security verification.");
  }

  const attempt = await RegistrationAttempt.findOne({ attemptId });
  if (!attempt) {
    throw new Error("Registration attempt expired or invalid.");
  }

  const isValidPhoto = attempt.keys.some(k => photo.endsWith(k));
  const isValidDocument = attempt.keys.some(k => documentProof.endsWith(k));
  const isValidDocumentBack = attempt.keys.some(k => documentProofBack.endsWith(k));

  if (!isValidPhoto || !isValidDocument || !isValidDocumentBack) {
    throw new Error("Uploaded documents are invalid or do not belong to this registration session.");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("User already exists with this email.");
  }

  let referredByUserId = null;
  let validCoordinatorCodeUsed = null;

  if (coordinatorCode) {
    const coordinator = await User.findOne({ coordinatorCode });
    if (!coordinator) {
      throw new Error("Invalid Coordinator Code.");
    }
    referredByUserId = coordinator._id;
    validCoordinatorCodeUsed = coordinatorCode;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newCoordinatorCode = "VPMH-" + crypto.randomBytes(3).toString("hex").toUpperCase();

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    phone,
    organization: organization || "",
    state: state || "",
    city: city || "",
    designation: designation || "",
    photo: photo || "",
    documentProof: documentProof || "",
    documentProofBack: documentProofBack || "",
    coordinatorCode: newCoordinatorCode,
    referredBy: referredByUserId,
    isEmailVerified: false,
    paymentStatus: "pending",
    approvalStatus: "pending",
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await newUser.save({ session });

    if (referredByUserId) {
      const referral = new Referral({
        coordinatorId: referredByUserId,
        referredUserId: newUser._id,
        coordinatorCodeUsed: validCoordinatorCodeUsed,
        status: "pending",
        paymentStatus: "pending"
      });
      await referral.save({ session });
    }

    await session.commitTransaction();

    // If there was an attemptId, delete it so it is no longer considered temporary
    if (attemptId) {
      await RegistrationAttempt.deleteOne({ attemptId }, { session });
    }
  } catch (err) {
    await session.abortTransaction();
    console.error("❌ Registration transaction aborted due to error:", err);
    throw err; // Propagate the error so the user isn't falsely told it succeeded
  } finally {
    session.endSession();
  }

  await sendVerificationEmailService(newUser);

  return { message: "Account created successfully. We've sent a verification link to your email." };
};

export const verifyEmailTokenService = async (token) => {
  if (!token) throw new Error("Invalid token.");

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error("Verification link is invalid or has expired.");
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return { message: "Email verified successfully." };
};

export const resendVerificationEmailService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found.");
  }
  if (user.isEmailVerified) {
    throw new Error("Email is already verified.");
  }

  await sendVerificationEmailService(user);
  return { message: "Verification link resent successfully." };
};

