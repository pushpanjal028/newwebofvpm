import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, AlertTriangle, Loader2, Award, Calendar, MapPin, Building, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { getPublicVerification, getUploadUrl } from "../api";
import Logo from "../assets/logo perfect.png";

interface VerifyDetails {
  name: string;
  photo?: string;
  organization?: string;
  state: string;
  city: string;
  designation: string;
  membershipId: string;
  approvalStatus: string;
  issueDate?: string;
  expiryDate?: string;
}

export default function Verify() {
  const { membershipId } = useParams<{ membershipId: string }>();
  const [member, setMember] = useState<VerifyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const performLookup = async () => {
      if (!membershipId) return;
      setLoading(true);
      setError("");
      try {
        const data = await getPublicVerification(membershipId);
        setMember(data);
      } catch (err: any) {
        console.error("❌ Verification lookup error:", err);
        setError(err.message || "Invalid Membership ID or unapproved correspondent account.");
      } finally {
        setLoading(false);
      }
    };
    performLookup();
  }, [membershipId]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExpired = member?.expiryDate ? new Date(member.expiryDate) < new Date() : false;

  return (
    <div className="py-24 bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 grid-3d-bg opacity-15 pointer-events-none" />

      <div className="max-w-xl w-full mx-auto px-4 relative z-10">
        {loading ? (
          <div className="glassmorphism-card rounded-3xl p-12 text-center space-y-4 bg-white shadow-xl">
            <Loader2 className="h-10 w-10 text-amber-600 animate-spin mx-auto" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Performing Registry Verification...</p>
          </div>
        ) : error || !member ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glassmorphism-card rounded-3xl p-8 text-center space-y-6 bg-white border border-red-200 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500" />
            
            <div className="inline-flex p-4 rounded-full bg-red-50 border border-red-200 text-red-500 mb-2">
              <AlertTriangle className="h-12 w-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">Verification Lookup Failed</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                No active verified member was found matching the credentials ID: <span className="font-mono font-bold text-slate-850 bg-slate-100 px-1.5 py-0.5 rounded">{membershipId}</span>.
              </p>
              <p className="text-xs text-slate-400">
                Ensure the code is correct or reach the registry help desk if you believe this is an error.
              </p>
            </div>

            <div className="border-t pt-4">
              <Link
                to="/"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Go to Homepage
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-3xl p-8 bg-white border border-slate-200 shadow-2xl relative overflow-hidden text-center space-y-6"
          >
            {/* Dynamic Status bar top */}
            <div className={`absolute top-0 left-0 right-0 h-[4px] ${isExpired ? "bg-red-500" : "bg-green-600"}`} />

            {/* Header logo banner */}
            <div className="flex justify-center items-center gap-2 border-b pb-4">
              <img src={Logo} alt="VPM Logo" className="h-10 w-10 object-contain rounded-full border bg-white p-0.5" />
              <div className="text-left">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider leading-none">Vishwa Patrakar</h3>
                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mt-0.5">Mahasangh</h4>
              </div>
            </div>

            {/* Status indicators */}
            <div className="space-y-2">
              {isExpired ? (
                <>
                  <div className="inline-flex p-3 rounded-full bg-red-50 border border-red-200 text-red-500 animate-pulse">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-black text-red-650 uppercase tracking-wide">Credentials Expired</h2>
                </>
              ) : (
                <>
                  <div className="inline-flex p-3 rounded-full bg-green-50 border border-green-200 text-green-600 animate-bounce">
                    <Award className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-black text-green-700 uppercase tracking-wide flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-5 w-5 text-green-600" /> Active Verified Correspondent
                  </h2>
                </>
              )}
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                Registry ID: {member.membershipId}
              </p>
            </div>

            {/* Credentials details panel */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-slate-50 border rounded-2xl p-6 text-left">
              <div className="sm:col-span-4 flex justify-center">
                <div className="h-24 w-24 rounded-2xl overflow-hidden border shadow-sm">
                  {member.photo ? (
                    <img
                      src={getUploadUrl(member.photo)}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-slate-400 bg-slate-100">
                      Photo
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-8 space-y-3">
                <div>
                  <span className="text-[8px] text-slate-450 uppercase tracking-widest font-bold">Full Name</span>
                  <p className="text-base font-extrabold text-slate-900 leading-none mt-0.5">{member.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t pt-2 mt-1">
                  <div>
                    <span className="text-[8px] text-slate-450 uppercase tracking-widest font-bold flex items-center gap-0.5">
                      <Briefcase className="h-2.5 w-2.5 text-slate-400" /> Designation
                    </span>
                    <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{member.designation}</p>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-450 uppercase tracking-widest font-bold flex items-center gap-0.5">
                      <Building className="h-2.5 w-2.5 text-slate-400" /> Organization
                    </span>
                    <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{member.organization || "Independent"}</p>
                  </div>
                </div>

                <div className="border-t pt-2 mt-1">
                  <span className="text-[8px] text-slate-450 uppercase tracking-widest font-bold flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5 text-slate-400" /> State / City
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{member.city}, {member.state}</p>
                </div>
              </div>
            </div>

            {/* Validity details */}
            <div className="grid grid-cols-2 gap-4 text-xs border-t pt-4">
              <div>
                <span className="text-[8px] text-slate-450 uppercase tracking-widest font-bold flex items-center justify-center gap-0.5">
                  <Calendar className="h-3 w-3 text-slate-400" /> Issue Date
                </span>
                <p className="font-bold text-slate-800 mt-1">{formatDate(member.issueDate)}</p>
              </div>
              <div>
                <span className="text-[8px] text-slate-450 uppercase tracking-widest font-bold flex items-center justify-center gap-0.5">
                  <Calendar className="h-3 w-3 text-slate-400" /> Expiry Date
                </span>
                <p className="font-bold text-slate-800 mt-1">{formatDate(member.expiryDate)}</p>
              </div>
            </div>

            <div className="text-[10px] text-slate-450 leading-relaxed max-w-sm mx-auto border-t pt-4">
              This certification confirms that the individual listed is registered in the official registry of Vishwa Patrakar Mahasangh and holds active press credentials.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
