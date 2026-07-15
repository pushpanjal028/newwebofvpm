import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, User, Mail, Phone, Building, Map, Key, Image, FileText, Briefcase, ArrowRight, ShieldCheck, AlertCircle, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser, sendOtp } from "../api";

export default function Registration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    state: "",
    city: "",
    designation: "",
    password: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [documentProof, setDocumentProof] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // OTP Resend Countdown
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentProof(e.target.files[0]);
    }
  };

  // Step 1: Initiate registration and request OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !documentProof) {
      setError("Please upload both your Profile Photo and ID/Document Proof.");
      return;
    }

    setIsSendingOtp(true);
    setError("");

    try {
      await sendOtp(formData.email);
      setShowOtpModal(true);
      setOtpCooldown(60);
    } catch (err: any) {
      console.error("❌ Send OTP error:", err);
      setError(err.message || "Failed to send email verification code. Please check your email.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Confirm OTP and submit full registration details
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("name", formData.fullName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("organization", formData.organization);
      data.append("state", formData.state);
      data.append("city", formData.city);
      data.append("designation", formData.designation);
      data.append("password", formData.password);
      data.append("photo", photo!);
      data.append("documentProof", documentProof!);
      data.append("otp", otp);

      await registerUser(data);
      setSuccess(true);
      setShowOtpModal(false);
      
      // Auto-redirect to payment page with email prepopulated after 3 seconds
      setTimeout(() => {
        navigate(`/payment?email=${encodeURIComponent(formData.email)}`);
      }, 3000);

    } catch (err: any) {
      console.error("❌ Registration error:", err);
      setError(err.message || "Registration failed. Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;
    setIsSendingOtp(true);
    setError("");
    try {
      await sendOtp(formData.email);
      setOtpCooldown(60);
      setOtp("");
    } catch (err: any) {
      console.error("❌ Resend OTP error:", err);
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <div className="py-24 bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 grid-3d-bg opacity-15 pointer-events-none" />

      <div className="max-w-3xl w-full mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glassmorphism-card rounded-3xl p-8 border border-slate-200 shadow-2xl relative overflow-hidden bg-white/95"
        >
          {/* Glowing Top Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-600" />

          {/* Header */}
          <div className="flex items-center space-x-3 mb-8 border-b pb-4">
            <div className="p-3 bg-slate-900 text-amber-500 rounded-2xl shadow-md">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-wide">
                Journalist Registration
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Join the organization as an authorized press correspondent.
              </p>
            </div>
          </div>

          <AnimatePresence>
            {error && !showOtpModal && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-805 text-xs flex items-center space-x-2"
              >
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-600" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex items-center space-x-2"
              >
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-600" />
                <span>🎉 Registration successful! Redirecting to transaction page...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                    placeholder="E.g., Rajesh Kumar"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Phone Number *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                    placeholder="E.g., +919999999999"
                  />
                </div>
              </div>

              {/* Organization */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Organization / Press Agency
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                    <Building className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                    placeholder="E.g., National News Agency"
                  />
                </div>
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Designation / Role *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                    <Briefcase className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                    placeholder="E.g., Correspondent, Photojournalist"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Password *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                    <Key className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  State *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                    <Map className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                    placeholder="Enter state"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  City *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                    <Map className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                    placeholder="Enter city"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Profile Photo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Profile Photo (JPG/PNG, Max 5MB) *
                </label>
                <div className="border-2 border-dashed border-slate-250 rounded-2xl p-4 text-center hover:border-amber-500 transition-all bg-slate-50/50">
                  <Image className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handlePhotoChange}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                  {photo && (
                    <p className="text-[10px] text-green-600 font-bold mt-2 truncate">
                      ✓ Selected: {photo.name}
                    </p>
                  )}
                </div>
              </div>

              {/* ID Document Proof */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ID/Document Proof (JPG/PNG/PDF, Max 5MB) *
                </label>
                <div className="border-2 border-dashed border-slate-250 rounded-2xl p-4 text-center hover:border-amber-500 transition-all bg-slate-50/50">
                  <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    required
                    onChange={handleDocChange}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                  {documentProof && (
                    <p className="text-[10px] text-green-600 font-bold mt-2 truncate">
                      ✓ Selected: {documentProof.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="border border-slate-200 bg-slate-100/40 rounded-2xl p-5 space-y-2">
              <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Membership validation terms
              </h3>
              <div className="text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
                <p>
                  • Fee Standard: <strong>₹100 (One-Time Registration Fee)</strong>.
                </p>
                <p>
                  • Documents submitted undergo manual verification by the administrative committee. The validation window spans 24-48 hours.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success || isSendingOtp}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-3.5 rounded-xl font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Requesting OTP Code...</span>
                </>
              ) : (
                <>
                  <span>Submit Registration</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* MODAL: EMAIL OTP VERIFICATION */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md border overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-600" />
              
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                  <Mail className="h-5 w-5 text-amber-500" /> Email Verification
                </h3>
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleVerifyAndRegister} className="p-6 space-y-4">
                <p className="text-xs text-slate-550 leading-relaxed text-center">
                  We've sent a 6-digit email verification code to: <strong className="text-slate-800 font-bold">{formData.email}</strong>. Please enter the code below to complete your registration.
                </p>

                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-750 text-xs flex items-center space-x-2">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-650" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5 text-center">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verification Code (OTP)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-40 mx-auto text-center font-mono font-black text-xl bg-slate-50 border rounded-xl py-2.5 tracking-[6px] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900"
                    placeholder="000000"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white py-3 rounded-xl font-bold text-xs tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify & Complete Registration</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpCooldown > 0 || isSendingOtp}
                    className="w-full border py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all text-slate-655 disabled:opacity-50"
                  >
                    {isSendingOtp ? "Sending..." : otpCooldown > 0 ? `Resend Code in ${otpCooldown}s` : "Resend Verification Code"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
