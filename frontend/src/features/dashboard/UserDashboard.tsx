import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, ShieldCheck, Clock, AlertCircle, Printer, FileText,
  MapPin, Key, Edit, LogOut, CheckCircle, Eye, Loader2, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { getCurrentMemberProfile, updateMemberProfile, changeMemberPassword, getUploadUrl, clearAuth } from "../../api";
import Logo from "../../assets/logo perfect.png";

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  state?: string;
  city?: string;
  designation?: string;
  photo?: string;
  documentProof?: string;
  paymentStatus: string;
  approvalStatus: string;
  membershipId?: string;
  issueDate?: string;
  expiryDate?: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tabs: "overview", "settings"
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");

  // Edit fields
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    organization: "",
    state: "",
    city: "",
    designation: "",
  });

  // Password fields
  const [passForm, setPassForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Modal file view
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);

  const fetchProfileData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCurrentMemberProfile();
      setProfile(data);
      localStorage.setItem("vpm_user", JSON.stringify(data));
      setEditForm({
        name: data.name,
        phone: data.phone || "",
        organization: data.organization || "",
        state: data.state || "",
        city: data.city || "",
        designation: data.designation || "",
      });
    } catch (err: any) {
      console.error("❌ Profile fetch error:", err);
      setError(err.message || "Session expired or failed to load profile.");
      // If unauthorized, logout
      if (err.message?.toLowerCase().includes("denied") || err.message?.toLowerCase().includes("token")) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleLogout = () => {
    clearAuth();
    // Dispatch storage event to update Navbar
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await updateMemberProfile(editForm);
      setProfile((prev) => (prev ? { ...prev, ...res.user } : null));
      setSuccess("Profile details updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile details.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await changeMemberPassword({
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword,
      });
      setSuccess("Password updated successfully.");
      setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const verificationUrl = profile?.membershipId
    ? `${window.location.origin}/verify/${profile.membershipId}`
    : "";

  return (
    <div className="py-24 bg-slate-50 min-h-screen text-slate-800 transition-colors duration-300 print:bg-white print:py-0 print:min-h-0 relative overflow-hidden">
      <div className="absolute inset-0 grid-3d-bg opacity-10 pointer-events-none print:hidden" />

      <div className="max-w-6xl w-full mx-auto px-4 relative z-10 print:px-0">
        {loading ? (
          <div className="py-24 text-center space-y-4 print:hidden">
            <Loader2 className="h-10 w-10 text-amber-600 animate-spin mx-auto" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Syncing member workspace...</p>
          </div>
        ) : error && !profile ? (
          <div className="bg-white border rounded-3xl p-8 text-center max-w-md mx-auto space-y-4 shadow-lg print:hidden">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-850">Failed to load workspace</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
            <button
              onClick={handleLogout}
              className="bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-slate-800"
            >
              Sign In Again
            </button>
          </div>
        ) : profile ? (
          <div className="space-y-8">
            
            {/* Upper header segment (hidden on print) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6 print:hidden">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                  Journalist Dashboard
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your credential profiles, review status codes, and download active ID cards.
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab(activeTab === "overview" ? "settings" : "overview")}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border rounded-xl hover:bg-slate-50 bg-white transition-all shadow-sm"
                >
                  <Edit className="h-4 w-4 text-slate-500" />
                  {activeTab === "overview" ? "Profile Settings" : "View Workspace"}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-650 bg-red-50 hover:bg-red-100 hover:text-red-750 transition-all rounded-xl shadow-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            {/* Dynamic Alerts */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex items-center justify-between print:hidden"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4.5 w-4.5 text-green-600" /> {success}
                  </span>
                  <button onClick={() => setSuccess("")} className="font-bold hover:scale-105">✕</button>
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center justify-between print:hidden"
                >
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-4.5 w-4.5 text-red-600" /> {error}
                  </span>
                  <button onClick={() => setError("")} className="font-bold hover:scale-105">✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Tabs content */}
            {activeTab === "overview" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN: Profile Overview & Uploads (7 columns) */}
                <div className="lg:col-span-7 space-y-6 print:hidden">
                  
                  {/* Overview Profile Card */}
                  <div className="bg-white border rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                    
                    <div className="h-16 w-16 bg-slate-100 rounded-full overflow-hidden flex-shrink-0 border">
                      {profile.photo ? (
                        <img
                          src={getUploadUrl(profile.photo)}
                          alt={profile.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="h-full w-full flex items-center justify-center font-bold text-slate-500 bg-amber-50">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">{profile.name}</h3>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mt-0.5">{profile.designation}</p>
                      <p className="text-xs text-slate-550">{profile.organization || "Independent Journalist"}</p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" /> {profile.city}, {profile.state}
                      </p>
                    </div>
                  </div>

                  {/* Status checks panel */}
                  <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Application Review Status</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Payment */}
                      <div className="border rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">UPI Transaction Status</span>
                          {profile.paymentStatus === "paid" ? (
                            <span className="bg-green-50 border border-green-200 text-green-700 font-bold px-2.5 py-0.5 rounded-full text-[9px] uppercase">Verified Paid</span>
                          ) : profile.paymentStatus === "verification_pending" ? (
                            <span className="bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2.5 py-0.5 rounded-full text-[9px] uppercase animate-pulse">Verifying</span>
                          ) : (
                            <span className="bg-slate-100 border text-slate-600 font-bold px-2.5 py-0.5 rounded-full text-[9px] uppercase">Pending</span>
                          )}
                        </div>
                        {profile.paymentStatus === "pending" && (
                          <div className="pt-2">
                            <p className="text-[10px] text-slate-500 leading-relaxed">Please submit your UPI transaction reference to activate reviews.</p>
                            <Link to="/payment" className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 mt-1.5">
                              Submit Fee details →
                            </Link>
                          </div>
                        )}
                        {profile.paymentStatus === "verification_pending" && (
                          <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                            Your payment screenshot has been uploaded. An administrator will reconcile it within 24-48 hours.
                          </p>
                        )}
                        {profile.paymentStatus === "paid" && (
                          <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                            ✓ Your transaction reference has been verified successfully.
                          </p>
                        )}
                      </div>

                      {/* Approval */}
                      <div className="border rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Board Approval Status</span>
                          {profile.approvalStatus === "approved" ? (
                            <span className="bg-green-55/10 border border-green-200 text-green-700 font-bold px-2.5 py-0.5 rounded-full text-[9px] uppercase">Approved</span>
                          ) : profile.approvalStatus === "rejected" ? (
                            <span className="bg-red-50 border border-red-200 text-red-750 font-bold px-2.5 py-0.5 rounded-full text-[9px] uppercase">Rejected</span>
                          ) : (
                            <span className="bg-slate-100 border text-slate-650 font-bold px-2.5 py-0.5 rounded-full text-[9px] uppercase">Reviewing</span>
                          )}
                        </div>
                        {profile.approvalStatus === "pending" && (
                          <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                            Credential profiles and identification documents are undergoing validation check by our board.
                          </p>
                        )}
                        {profile.approvalStatus === "approved" && (
                          <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                            ✓ Verified Active member. Expiry date: <strong className="text-slate-850 font-bold">{formatDate(profile.expiryDate)}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Uploaded files audit */}
                  <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Submitted Document Proofs</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.photo && (
                        <div className="border rounded-2xl p-4 flex justify-between items-center bg-slate-50/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-5 w-5 text-slate-450 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">Profile Picture</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Image Upload</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setViewingFileUrl(getUploadUrl(profile.photo!))}
                            className="p-1.5 bg-white hover:bg-amber-50 border hover:border-amber-300 text-slate-600 hover:text-amber-700 rounded-xl transition-all shadow-sm flex"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {profile.documentProof && (
                        <div className="border rounded-2xl p-4 flex justify-between items-center bg-slate-50/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-5 w-5 text-slate-450 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">Identity Proof</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID/Doc File</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setViewingFileUrl(getUploadUrl(profile.documentProof!))}
                            className="p-1.5 bg-white hover:bg-amber-50 border hover:border-amber-300 text-slate-600 hover:text-amber-700 rounded-xl transition-all shadow-sm flex"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: ID Card Workspace (5 columns) */}
                <div className="lg:col-span-5 flex flex-col items-center gap-4">
                  {profile.approvalStatus === "approved" && profile.membershipId ? (
                    <div className="flex flex-col items-center gap-4 w-full">
                      {/* Actions toolbar */}
                      <div className="flex justify-between items-center w-full max-w-[380px] print:hidden">
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <ShieldCheck className="h-4.5 w-4.5 text-green-600 fill-green-50" /> Official credentials
                        </span>
                        <button
                          onClick={handlePrint}
                          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md"
                        >
                          <Printer className="h-3.5 w-3.5" /> Print / Download Card
                        </button>
                      </div>

                      {/* Printable ID Card (Uses same card design system) */}
                      <div
                        id="vpm-id-card-print-target"
                        className="w-full max-w-[380px] aspect-[1/1.58] bg-white border-2 border-slate-350 rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between p-6 relative select-none"
                      >
                        <div className="absolute top-0 left-0 right-0 h-[8px] bg-gradient-to-r from-amber-500 via-indigo-600 to-amber-400" />

                        <div className="flex items-center gap-2 border-b pb-4 mt-2">
                          <img src={Logo} alt="VPM Logo" className="h-12 w-12 object-contain bg-white rounded-full p-0.5 border" />
                          <div className="min-w-0">
                            <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider leading-none">Vishwa Patrakar</h3>
                            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mt-1">Mahasangh</h4>
                            <p className="text-[7px] text-slate-500 uppercase tracking-wider mt-1 font-bold">Press Identity Credentials</p>
                          </div>
                        </div>

                        <div className="flex-grow flex flex-col items-center justify-center py-5 space-y-3">
                          <div className="relative">
                            <div className="h-28 w-28 rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-md">
                              {profile.photo ? (
                                <img
                                  src={getUploadUrl(profile.photo)}
                                  alt={profile.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="h-full w-full flex items-center justify-center font-bold text-slate-400 bg-slate-100">
                                  Photo
                                </span>
                              )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-600 text-white rounded-full p-1 border-2 border-white shadow-md">
                              <ShieldCheck className="h-4 w-4 fill-green-600" />
                            </div>
                          </div>

                          <div className="text-center space-y-1 w-full px-2">
                            <h2 className="text-base font-black text-slate-950 uppercase tracking-wide leading-tight truncate">
                              {profile.name}
                            </h2>
                            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-none">
                              {profile.designation}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {profile.organization || "Independent Press Correspondent"}
                            </p>
                            <p className="text-[9px] text-slate-450 uppercase tracking-wider font-bold">
                              {profile.city}, {profile.state}
                            </p>
                          </div>
                        </div>

                        <div className="border-t pt-4 flex justify-between items-center gap-4">
                          <div className="space-y-1.5">
                            <div>
                              <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest leading-none">Credential ID</span>
                              <p className="font-mono text-xs font-black text-slate-900 tracking-wider mt-0.5">{profile.membershipId}</p>
                            </div>
                            <div className="flex gap-4">
                              <div>
                                <span className="text-[7px] text-slate-455 uppercase tracking-wider leading-none">Issue Date</span>
                                <p className="text-[8px] font-bold text-slate-700 mt-0.5">{formatDate(profile.issueDate)}</p>
                              </div>
                              <div>
                                <span className="text-[7px] text-slate-455 uppercase tracking-wider leading-none">Expiry Date</span>
                                <p className="text-[8px] font-bold text-slate-700 mt-0.5">{formatDate(profile.expiryDate)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <QRCodeSVG value={verificationUrl} size={50} level="M" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Default placeholder for card */
                    <div className="w-full max-w-[380px] bg-slate-100 border border-slate-250 border-dashed rounded-3xl p-12 text-center space-y-4 shadow-inner flex flex-col items-center justify-center aspect-[1/1.58] print:hidden">
                      <Clock className="h-10 w-10 text-slate-400 animate-pulse" />
                      <h4 className="font-extrabold text-slate-800 text-sm">Identity Card Pending</h4>
                      <p className="text-[11px] text-slate-500 leading-normal max-w-[220px] mx-auto">
                        Once transaction verification completes and the board approves your credentials, your scannable Press ID Card will generate here.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* TAB: EDIT SETTINGS (hidden on print) */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start print:hidden">
                
                {/* EDIT PROFILE DETAILS */}
                <form onSubmit={handleEditSubmit} className="md:col-span-7 bg-white border rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 border-b pb-3 mb-2 flex items-center gap-1.5">
                    <User className="h-5 w-5 text-amber-500" /> Update Member Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone</label>
                      <input
                        type="text"
                        required
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Designation</label>
                      <input
                        type="text"
                        required
                        value={editForm.designation}
                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Organization</label>
                      <input
                        type="text"
                        value={editForm.organization}
                        onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">State</label>
                      <input
                        type="text"
                        required
                        value={editForm.state}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">City</label>
                      <input
                        type="text"
                        required
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow shadow-slate-950/20 self-start block"
                  >
                    {actionLoading ? "Saving Changes..." : "Save Profile Info"}
                  </button>
                </form>

                {/* CHANGE PASSWORD */}
                <form onSubmit={handlePasswordSubmit} className="md:col-span-5 bg-white border rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 border-b pb-3 mb-2 flex items-center gap-1.5">
                    <Key className="h-5 w-5 text-amber-500" /> Change Password
                  </h3>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passForm.oldPassword}
                      onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                      className="w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                    <input
                      type="password"
                      required
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                      className="w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={passForm.confirmPassword}
                      onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                      className="w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      placeholder="Re-type new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow"
                  >
                    {actionLoading ? "Updating Password..." : "Update Password"}
                  </button>
                </form>

              </div>
            )}

            {/* 💳 Print CSS Injections */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * {
                  visibility: hidden;
                }
                #vpm-id-card-print-target, #vpm-id-card-print-target * {
                  visibility: visible;
                }
                #vpm-id-card-print-target {
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  transform: translate(-50%, -50%) scale(1.15);
                  border: none !important;
                  box-shadow: none !important;
                  background-color: white !important;
                }
                nav, footer, button, .print-btn, header {
                  display: none !important;
                }
              }
            ` }} />
            
          </div>
        ) : null}

        {/* MODAL: DOCUMENT FILE VIEWER */}
        {viewingFileUrl && (
          <div
            className="fixed inset-0 bg-[#030712]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 print:hidden"
            onClick={() => setViewingFileUrl(null)}
          >
            <div
              className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {viewingFileUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={viewingFileUrl}
                  title="Credential proof"
                  className="w-[80vw] h-[80vh] border-0"
                />
              ) : (
                <img
                  src={viewingFileUrl}
                  alt="Credential proof inspect"
                  className="max-w-full max-h-[80vh] object-contain rounded-xl"
                />
              )}
              <button
                onClick={() => setViewingFileUrl(null)}
                className="absolute top-4 right-4 p-2 bg-slate-955/80 hover:bg-slate-900 border border-white/10 text-white rounded-full transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <p className="text-white/60 font-bold text-xs mt-3 select-none">
              Click anywhere outside the container to exit review layout.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
