import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, User, Mail, Phone, Building, Map, Key, Image, FileText, Briefcase, ArrowRight, ShieldCheck, AlertCircle, X, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { registerUserPhase3, initRegistration, cleanupRegistrationAttempt, getPresignedUploadUrl, uploadFileToS3 } from "../../api";

export default function Registration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    designation: "",
    password: "",
    coordinatorCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [photoKey, setPhotoKey] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [documentProofKey, setDocumentProofKey] = useState("");
  const [documentProofName, setDocumentProofName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const draftJSON = localStorage.getItem("vpmh_registration_draft");
      if (draftJSON) {
        const draft = JSON.parse(draftJSON);
        const now = new Date().getTime();
        // 24 hours expiry
        if (now - draft.timestamp < 24 * 60 * 60 * 1000) {
          setFormData((prev) => ({
            ...prev,
            fullName: draft.formData?.fullName || "",
            email: draft.formData?.email || "",
            phone: draft.formData?.phone || "",
            state: draft.formData?.state || "",
            city: draft.formData?.city || "",
            designation: draft.formData?.designation || "",
            coordinatorCode: draft.formData?.coordinatorCode || "",
            // explicitly do NOT restore password
          }));
          if (draft.attemptId) setAttemptId(draft.attemptId);
          if (draft.photoKey) setPhotoKey(draft.photoKey);
          if (draft.photoName) setPhotoName(draft.photoName);
          if (draft.documentProofKey) setDocumentProofKey(draft.documentProofKey);
          if (draft.documentProofName) setDocumentProofName(draft.documentProofName);
        } else {
          localStorage.removeItem("vpmh_registration_draft");
        }
      }
    } catch (err) {
      console.error("Error parsing registration draft", err);
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    const draft = {
      formData: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        designation: formData.designation,
        coordinatorCode: formData.coordinatorCode,
        // No password saved
      },
      attemptId,
      photoKey,
      photoName,
      documentProofKey,
      documentProofName,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem("vpmh_registration_draft", JSON.stringify(draft));
  }, [formData.fullName, formData.email, formData.phone, formData.state, formData.city, formData.designation, formData.coordinatorCode, attemptId, photoKey, photoName, documentProofKey, documentProofName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);
      setError("");
      try {
        let currentAttemptId = attemptId;
        if (!currentAttemptId) {
          const res = await initRegistration();
          currentAttemptId = res.attemptId;
          setAttemptId(res.attemptId);
        }

        const presigned = await getPresignedUploadUrl(file.name, file.type, currentAttemptId);
        await uploadFileToS3(presigned.uploadUrl, file);
        
        setPhotoKey(presigned.key);
        setPhotoName(file.name);
      } catch (err: any) {
        console.error("❌ Profile photo upload error:", err);
        setError("Profile photo upload failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);
      setError("");
      try {
        let currentAttemptId = attemptId;
        if (!currentAttemptId) {
          const res = await initRegistration();
          currentAttemptId = res.attemptId;
          setAttemptId(res.attemptId);
        }

        const presigned = await getPresignedUploadUrl(file.name, file.type, currentAttemptId);
        await uploadFileToS3(presigned.uploadUrl, file);
        
        setDocumentProofKey(presigned.key);
        setDocumentProofName(file.name);
      } catch (err: any) {
        console.error("❌ Document upload error:", err);
        setError("ID/Document proof upload failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Submit full registration details
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoKey && !documentProofKey) {
      setError("Please upload your profile photo and ID/document proof.");
      return;
    }
    if (!photoKey) {
      setError("Please upload your profile photo.");
      return;
    }
    if (!documentProofKey) {
      setError("Please upload your ID/document proof.");
      return;
    }
    if (!attemptId) {
      setError("Registration attempt invalid. Please refresh and try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Post registration data (with S3 keys) to backend as JSON
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        designation: formData.designation,
        password: formData.password,
        photo: photoKey,
        documentProof: documentProofKey,
        coordinatorCode: formData.coordinatorCode || undefined,
        attemptId,
      };

      await registerUserPhase3(payload);
      setSuccess(true);

      // Clear draft on success
      localStorage.removeItem("vpmh_registration_draft");
      
      // Auto-redirect to payment page with email prepopulated after 4 seconds
      setTimeout(() => {
        navigate(`/payment?email=${encodeURIComponent(formData.email)}`);
      }, 4000);

    } catch (err: any) {
      console.error("❌ Registration error:", err);
      setError(err.message || "Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
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
              <h2 className="text-2xl font-black text-slate-900">
                Official Membership Registration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete all required fields below to initiate your membership.
              </p>
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                Your details are saved automatically. You can safely switch apps or refresh the page without losing your progress.
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
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
                className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                  <span className="font-bold">Account created successfully!</span>
                </div>
                <p className="ml-7">We've sent a verification link to your email. You can verify it anytime.</p>
                <p className="ml-7 mt-1 text-slate-500 italic">Redirecting to transaction page to continue your application...</p>
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

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                    <Key className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Designation / Role */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  DESIGNATION / ROLE *
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
                    accept="image/jpeg, image/png"
                    required={!photoKey}
                    onChange={handlePhotoChange}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                  {photoKey && (
                    <p className="text-[10px] text-green-600 font-bold mt-2 truncate">
                      ✓ Profile photo uploaded ({photoName || "saved"})
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
                    accept="image/jpeg, image/png, application/pdf"
                    required={!documentProofKey}
                    onChange={handleDocumentChange}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                  {documentProofKey && (
                    <p className="text-[10px] text-green-600 font-bold mt-2 truncate">
                      ✓ ID/document proof uploaded ({documentProofName || "saved"})
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Coordinator Code (Optional) */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Coordinator / Referral Code (Optional)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                  <Briefcase className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  name="coordinatorCode"
                  value={formData.coordinatorCode}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm uppercase"
                  placeholder="E.g., VPMH-1A2B3C"
                />
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
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-3.5 rounded-xl font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Register Now</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Contact Note */}
            <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-center text-sm text-slate-600">
              Note: Those who can't fill this form, contact us with ur detail on this no. <a href="tel:6393287185" className="font-bold text-amber-600 hover:underline">6393287185</a> or in email- <a href="mailto:info.vpm2006@gail.com" className="font-bold text-amber-600 hover:underline">info.vpm2006@gail.com</a>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
