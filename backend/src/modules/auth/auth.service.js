import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import OTP from "../../models/OTP.js";
import transporter from "../../config/mailer.js";

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
  files
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

  let photoPath = "";
  let documentProofPath = "";

  if (files) {
    if (files.photo && files.photo[0]) {
      photoPath = `/uploads/${files.photo[0].filename}`;
    }
    if (files.documentProof && files.documentProof[0]) {
      documentProofPath = `/uploads/${files.documentProof[0].filename}`;
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
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const updateProfileService = async (userId, { name, phone, organization, state, city, designation }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.name = name || user.name;
  user.phone = phone || user.phone;
  user.organization = organization !== undefined ? organization : user.organization;
  user.state = state || user.state;
  user.city = city || user.city;
  user.designation = designation || user.designation;

  await user.save();

  return {
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
