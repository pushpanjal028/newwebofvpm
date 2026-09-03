import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CreditCard, Shield, CheckCircle, Info, Upload, AlertCircle, Building, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitPayment, getPresignedUploadUrl, uploadFileToS3, initPayment } from "../../api";
import qrCodeImage from "../../assets/qr code.jpeg";

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [emailOrPhone, setEmailOrPhone] = useState(emailParam);
  const [transactionId, setTransactionId] = useState("");
  const [paymentAttemptId, setPaymentAttemptId] = useState("");
  const [screenshotKey, setScreenshotKey] = useState("");
  const [screenshotName, setScreenshotName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const draftJSON = localStorage.getItem("vpmh_payment_draft");
      if (draftJSON) {
        const draft = JSON.parse(draftJSON);
        const now = new Date().getTime();
        // 24 hours expiry
        if (now - draft.timestamp < 24 * 60 * 60 * 1000) {
          if (draft.emailOrPhone) setEmailOrPhone(draft.emailOrPhone);
          if (draft.transactionId) setTransactionId(draft.transactionId);
          if (draft.paymentAttemptId) setPaymentAttemptId(draft.paymentAttemptId);
          if (draft.screenshotKey) setScreenshotKey(draft.screenshotKey);
          if (draft.screenshotName) setScreenshotName(draft.screenshotName);
        } else {
          localStorage.removeItem("vpmh_payment_draft");
        }
      }
    } catch (err) {
      console.error("Error parsing payment draft", err);
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    const draft = {
      emailOrPhone,
      transactionId,
      paymentAttemptId,
      screenshotKey,
      screenshotName,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem("vpmh_payment_draft", JSON.stringify(draft));
  }, [emailOrPhone, transactionId, paymentAttemptId, screenshotKey, screenshotName]);

  // Sync email parameter if it changes
  useEffect(() => {
    if (emailParam && !emailOrPhone) {
      setEmailOrPhone(emailParam);
    }
  }, [emailParam]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);
      setError("");
      try {
        let currentAttemptId = paymentAttemptId;
        if (!currentAttemptId) {
          const { paymentAttemptId: newAttemptId } = await initPayment();
          currentAttemptId = newAttemptId;
          setPaymentAttemptId(newAttemptId);
        }

        const presigned = await getPresignedUploadUrl(file.name, file.type, undefined, currentAttemptId);
        await uploadFileToS3(presigned.uploadUrl, file);
        
        setScreenshotKey(presigned.key);
        setScreenshotName(file.name);
      } catch (err: any) {
        console.error("❌ File upload error:", err);
        setError("Payment screenshot upload failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotKey) {
      setError("Please select and wait for the screenshot of the payment receipt to upload.");
      return;
    }
    if (!emailOrPhone.trim()) {
      setError("Please enter your registered Email or Phone number.");
      return;
    }
    if (!transactionId.trim()) {
      setError("Please enter the transaction reference ID.");
      return;
    }
    if (!paymentAttemptId) {
      setError("Invalid payment attempt. Please refresh and try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        emailOrPhone,
        transactionId,
        paymentScreenshot: screenshotKey,
        paymentAttemptId,
      };

      await submitPayment(payload);
      setSuccess(true);

      // Clear draft on success
      localStorage.removeItem("vpmh_payment_draft");
      
      setTransactionId("");
      setScreenshotKey("");
      setScreenshotName("");

      setTimeout(() => {
        navigate(`/success?emailOrPhone=${encodeURIComponent(emailOrPhone)}`);
      }, 2500);
    } catch (err: any) {
      console.error("❌ Payment submission error:", err);
      setError(err.message || "Failed to submit payment. Please verify your registered email or phone.");
    } finally {
      setLoading(false);
    }
  };

  // UPI ID for display
  const upiId = "geetashukla486@okicici";

  return (
    <div className="py-24 bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 grid-3d-bg opacity-15 pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto px-4 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* LEFT PANEL: Payment Instructions (7 columns on desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-7 bg-white/95 rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-600" />

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-amber-500" />
                Membership Payment
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Follow instructions below to transfer standard registration fees.
              </p>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0 text-amber-600" />
                Your details are saved automatically. You can safely switch to your UPI app and return here.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold border-b pb-2 mb-2">
                <span className="text-slate-600">Standard Membership Fee</span>
                <span className="text-amber-600 font-extrabold text-lg">₹100.00</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                * This is a one-time registration fee required for the administrative board to issue your official identity credentials.
              </p>
            </div>

            {/* UPI & QR Section */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-amber-50/40 border border-amber-200/50 p-4 rounded-2xl">
              <div className="sm:col-span-4 flex justify-center">
                <div className="p-1 bg-white border rounded-xl shadow-md overflow-hidden">
                  <img src={qrCodeImage} alt="UPI QR Code" className="w-[110px] h-[110px] object-contain rounded-lg" />
                </div>
              </div>
              <div className="sm:col-span-8 space-y-1.5 text-center sm:text-left">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5 justify-center sm:justify-start">
                  <QrCode className="h-4 w-4 text-amber-500" />
                  Scan UPI QR Code
                </h4>
                <p className="text-xs text-slate-600">
                  Scan this code using any UPI app (PhonePe, GooglePay, Paytm, BHIM) to pay standard ₹100 registration fee.
                </p>
                <p className="text-[11px] font-bold text-slate-800">
                  UPI ID: <span className="text-amber-700 font-mono">{upiId}</span>
                </p>
              </div>
            </div>

            {/* Bank details */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Building className="h-4 w-4 text-amber-500" />
                Alternative Bank Transfer
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border p-4 rounded-2xl">
                <div>
                  <p className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Account Name</p>
                  <p className="font-bold text-slate-800">Vishwa Patrakar Mahasangh(GEETA SHUKLA)</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Bank Name</p>
                  <p className="font-bold text-slate-800">Bank of baroda</p>
                </div>
                <div className="col-span-2 border-t pt-2 mt-1">
                  <p className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Account Number</p>
                  <p className="font-black text-amber-700 text-sm font-mono tracking-wider">06740100027014</p>
                </div>
                <div className="col-span-2 border-t pt-2">
                  <p className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">IFSC Code</p>
                  <p className="font-bold text-slate-800 font-mono tracking-wide">BARB0NAINIX</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t pt-4 mt-6 text-slate-500 text-[10px]">
            <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span>Secure offline UPI transaction. Manual verification takes 24–48 hours.</span>
          </div>
        </motion.div>

        {/* RIGHT PANEL: Form Submission (5 columns on desktop) */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-5 bg-white/95 rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-600" />

          <div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Submit Payment Receipt</h3>
            <p className="text-xs text-slate-500 mb-6">
              Provide transaction details to tie the payment to your membership registration.
            </p>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-750 text-xs flex items-center space-x-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-650" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs flex flex-col space-y-1.5"
                >
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle className="h-4.5 w-4.5 text-green-600" />
                    <span className="font-bold">Submission Successful!</span>
                  </div>
                  <p className="text-[10px] text-green-700 leading-normal">
                    We have registered your transaction receipt. The administrative board will verify it against our banking logs within 24-48 hours.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registered Email or Phone */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Registered Email or Phone *
                </label>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  placeholder="Enter registered email/phone"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs"
                />
              </div>

              {/* Transaction ID */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Transaction / Reference ID *
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                  placeholder="e.g. UTR / UPI Ref Number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs"
                />
              </div>

              {/* Screenshot file picker */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Screenshot Receipt (JPG/PNG, Max 5MB) *
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-amber-550 transition-all bg-slate-50/50">
                  <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-[10px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                  {screenshotKey && (
                    <p className="text-[10px] text-green-600 font-bold mt-1.5 truncate">
                      ✓ Screenshot uploaded ({screenshotName || "saved"})
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-3 rounded-xl font-bold text-xs tracking-wider transition-all disabled:opacity-50 hover:scale-[1.01] flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>{loading ? "Submitting details..." : "Submit Verification Request"}</span>
              </button>
            </form>
          </div>

          <div className="border-t pt-4 mt-6">
            <h5 className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-amber-500" />
              Need Assistance?
            </h5>
            <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">
              Contact our national help desk at +91 6393287185 or write to info.vpm2006@gmail.com for offline fee reconciliation.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
