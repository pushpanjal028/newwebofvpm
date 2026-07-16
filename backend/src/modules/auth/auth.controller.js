import {
  sendOtpService,
  registerUserService,
  loginUserService,
  submitContactFormService,
  getCurrentProfileService,
  updateProfileService,
  changePasswordService,
} from "./auth.service.js";

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    const result = await sendOtpService(email);
    res.json(result);
  } catch (err) {
    console.error("❌ Send OTP controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, organization, state, city, designation, otp, photo, documentProof } = req.body;
    const result = await registerUserService({
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
    });
    res.json(result);
  } catch (err) {
    console.error("❌ Register controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUserService(email, password);
    res.json(result);
  } catch (err) {
    console.error("❌ Login controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const submitContactForm = async (req, res) => {
  try {
    const { from_name, from_email, message } = req.body;
    const result = await submitContactFormService({ from_name, from_email, message });
    res.json(result);
  } catch (err) {
    console.error("❌ Contact controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getCurrentProfile = async (req, res) => {
  try {
    const result = await getCurrentProfileService(req.user._id);
    res.json(result);
  } catch (err) {
    console.error("❌ Get profile controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, organization, state, city, designation } = req.body;
    const result = await updateProfileService(req.user._id, {
      name,
      phone,
      organization,
      state,
      city,
      designation,
    });
    res.json(result);
  } catch (err) {
    console.error("❌ Profile update controller error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await changePasswordService(req.user._id, oldPassword, newPassword);
    res.json(result);
  } catch (err) {
    console.error("❌ Password change controller error:", err);
    res.status(500).json({ message: err.message });
  }
};
