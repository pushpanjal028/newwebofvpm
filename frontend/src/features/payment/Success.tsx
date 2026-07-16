import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Clock, Mail, Home, Users, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { getMemberStatus, getUploadUrl } from "../../api";

interface UserProfile {
  name: string;
  photo?: string;
  organization?: string;
  state: string;
  city: string;
  designation: string;
  paymentStatus: string;
  approvalStatus: string;
  membershipId?: string;
}

export default function Success() {
  const [searchParams] = useSearchParams();
  const emailOrPhone = searchParams.get("emailOrPhone") || "";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState("");

  const fetchStatus = async () => {
    if (!emailOrPhone) return;
    setLoading(true);
    setError("");
    try {
      const data = await getMemberStatus(emailOrPhone);
      setProfile(data);
    } catch (err: any) {
      console.error("❌ Status lookup error:", err);
      setError(err.message || "Failed to resolve your registration profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [emailOrPhone]);

  return (
    <div className="py-24 bg-slate-50 dark:bg-[#030712] min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 grid-3d-bg opacity-15 pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glassmorphism-card rounded-3xl p-8 md:p-10 border border-slate-200 shadow-2xl text-center relative overflow-hidden bg-white/95"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-500 to-emerald-400" />

          {loading ? (
            <div className="py-12 space-y-4">
              <Loader2 className="h-10 w-10 text-amber-500 animate-spin mx-auto" />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Syncing Registration Record...</p>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              
              {/* Profile Header Image and Status */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-amber-500 shadow-md bg-slate-100">
                    {profile.photo ? (
                      <img
                        src={getUploadUrl(profile.photo)}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="h-full w-full flex items-center justify-center font-bold text-slate-400">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border shadow">
                    {profile.approvalStatus === "approved" ? (
                      <ShieldCheck className="h-4.5 w-4.5 text-green-600 fill-green-50" />
                    ) : (
                      <Clock className="h-4.5 w-4.5 text-amber-500 fill-amber-50" />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-900 leading-tight">
                    Thank you, {profile.name}!
                  </h1>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">{profile.designation}</p>
                  <p className="text-xs text-slate-500">{profile.organization || "Independent Journalist"}</p>
                  <p className="text-[10px] text-slate-400">{profile.city}, {profile.state}</p>
                </div>
              </div>

              {/* Status details panel */}
              <div className="bg-slate-50 border rounded-2xl p-6 text-left space-y-4">
                <div className="flex justify-between items-center border-b pb-3 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider">Transaction Fee status</span>
                  {profile.paymentStatus === "paid" ? (
                    <span className="bg-green-50 border border-green-200 text-green-700 font-bold px-3 py-1 rounded-full">
                      ✓ Paid / Verified
                    </span>
                  ) : profile.paymentStatus === "verification_pending" ? (
                    <span className="bg-amber-50 border border-amber-200 text-amber-700 font-bold px-3 py-1 rounded-full animate-pulse">
                      ⏰ Verification Pending
                    </span>
                  ) : (
                    <span className="bg-slate-100 border text-slate-650 font-bold px-3 py-1 rounded-full">
                      Pending Submit
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center border-b pb-3 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider">Membership Credentials</span>
                  {profile.approvalStatus === "approved" ? (
                    <span className="bg-green-55/10 border border-green-200 text-green-700 font-bold px-3 py-1 rounded-full">
                      ✓ Active Approved
                    </span>
                  ) : profile.approvalStatus === "rejected" ? (
                    <span className="bg-red-50 border border-red-200 text-red-750 font-bold px-3 py-1 rounded-full">
                      ✕ Rejected
                    </span>
                  ) : (
                    <span className="bg-slate-100 border text-slate-650 font-bold px-3 py-1 rounded-full">
                      ⏰ Under Verification
                    </span>
                  )}
                </div>

                {profile.approvalStatus === "approved" && profile.membershipId && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">Journalist ID Code</span>
                    <span className="font-mono font-black text-amber-700 tracking-wider">
                      {profile.membershipId}
                    </span>
                  </div>
                )}
              </div>

              {/* Informative message depending on status */}
              <div className="p-4 border rounded-2xl bg-amber-50/20 text-xs leading-relaxed text-slate-600">
                {profile.approvalStatus === "approved" ? (
                  <p>
                    🎉 Your credentials have been authorized by the board! You can now view and download your Digital Identity Card.
                  </p>
                ) : (
                  <p>
                    ⏰ Our administrative council is reviewing your registration documents and payment transaction ref ID. Check back here periodically or scan the list of verified correspondents to find your listing.
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                {profile.approvalStatus === "approved" && profile.membershipId ? (
                  <Link
                    to={`/id-card/${profile.membershipId}`}
                    className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.01] shadow-md text-xs"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    View Digital ID Card
                  </Link>
                ) : (
                  <button
                    onClick={fetchStatus}
                    className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all text-xs"
                  >
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refresh Status
                  </button>
                )}
                <Link
                  to="/"
                  className="inline-flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all text-xs"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Homepage
                </Link>
              </div>

            </div>
          ) : (
            // Default success page if no query params provided
            <div className="space-y-6">
              <div className="inline-flex p-4 rounded-full bg-green-50 border border-green-200 text-green-600 mb-2">
                <CheckCircle className="h-12 w-12" />
              </div>

              <h1 className="text-3xl font-black text-slate-900 tracking-wide">
                Registration Successful!
              </h1>
              <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                Thank you for applying to Vishwa Patrakar Mahasangh. Your verification procedure has been initiated.
              </p>

              <div className="bg-slate-50 border rounded-2xl p-5 text-left space-y-2">
                <h3 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                  <Mail className="h-4 w-4 text-amber-500" />
                  Notification details
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  We have sent a copy of your application details to your email address. Manual registration and bank receipt checks take 24–48 hours.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold transition-all text-xs"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Link>
                <Link
                  to="/members"
                  className="inline-flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all text-xs"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Directory
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
