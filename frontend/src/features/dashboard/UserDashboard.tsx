import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, ShieldCheck, Clock, AlertCircle, Printer, FileText,
  MapPin, Key, Edit, LogOut, CheckCircle, Eye, EyeOff, Loader2, X, Download, Trash2, Upload, Briefcase, Users, Copy, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  getCurrentMemberProfile,
  updateMemberProfile,
  changeMemberPassword,
  deleteMemberProfile,
  getUploadUrl,
  clearAuth,
  getPresignedUploadUrl,
  uploadFileToS3,
  fetchSecureDocumentUrl
} from "../../api";
import { getCoordinatorDashboard } from "../../api/member.api";
import Logo from "../../assets/logo perfect.png";
import ProtectedImage from "../../components/common/ProtectedImage";

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
  documentProofBack?: string;
  paymentStatus: string;
  approvalStatus: string;
  membershipId?: string;
  issueDate?: string;
  expiryDate?: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cardDownloading, setCardDownloading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tabs: "overview", "settings", "coordinator"
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "coordinator">("overview");

  // Coordinator Data
  const [coordinatorData, setCoordinatorData] = useState<any>(null);
  const [coordinatorLoading, setCoordinatorLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Edit fields
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    organization: "",
    state: "",
    city: "",
    designation: "",
  });

  // Photo & Document upload state
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [newDocBackFile, setNewDocBackFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Password fields
  const [passForm, setPassForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);


  // Modal file view & Delete modal
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);
  const [securePdfUrl, setSecurePdfUrl] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleViewSecureFile = async (key: string) => {
    try {
      const signedUrl = await fetchSecureDocumentUrl(key);
      setViewingFileUrl(signedUrl);
    } catch (err) {
      console.error("Failed to load secure document", err);
    }
  };

  const fetchProfileData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCurrentMemberProfile();
      setProfile(data);
      localStorage.setItem("vpm_user", JSON.stringify(data));
      setEditForm({
        name: data.name || "",
        phone: data.phone || "",
        organization: data.organization || "",
        state: data.state || "",
        city: data.city || "",
        designation: data.designation || "",
      });
      
      // Also fetch coordinator data
      fetchCoordinatorData();
    } catch (err: any) {
      console.error("❌ Profile fetch error:", err);
      setError(err.message || "Session expired or failed to load profile.");
      if (err.message?.toLowerCase().includes("denied") || err.message?.toLowerCase().includes("token")) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinatorData = async () => {
    setCoordinatorLoading(true);
    try {
      const data = await getCoordinatorDashboard();
      setCoordinatorData(data);
    } catch (err) {
      console.error("Failed to load coordinator dashboard", err);
    } finally {
      setCoordinatorLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (profile?.memberCard?.pdfUrl) {
      fetchSecureDocumentUrl(profile.memberCard.pdfUrl)
        .then(setSecurePdfUrl)
        .catch(console.error);
    }
  }, [profile?.memberCard?.pdfUrl]);

  const handleCopyCode = () => {
    if (coordinatorData?.coordinatorCode) {
      navigator.clipboard.writeText(coordinatorData.coordinatorCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocFile(e.target.files[0]);
    }
  };

  const handleDocBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocBackFile(e.target.files[0]);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      let photoKey = profile?.photo;
      let docKey = profile?.documentProof;
      let docBackKey = profile?.documentProofBack;

      // Upload photo if new file selected
      if (newPhotoFile) {
        const photoPresigned = await getPresignedUploadUrl(newPhotoFile.name, newPhotoFile.type);
        await uploadFileToS3(photoPresigned.uploadUrl, newPhotoFile);
        photoKey = photoPresigned.key;
      }

      // Upload document proof front if new file selected
      if (newDocFile) {
        const docPresigned = await getPresignedUploadUrl(newDocFile.name, newDocFile.type);
        await uploadFileToS3(docPresigned.uploadUrl, newDocFile);
        docKey = docPresigned.key;
      }

      // Upload document proof back if new file selected
      if (newDocBackFile) {
        const docBackPresigned = await getPresignedUploadUrl(newDocBackFile.name, newDocBackFile.type);
        await uploadFileToS3(docBackPresigned.uploadUrl, newDocBackFile);
        docBackKey = docBackPresigned.key;
      }

      const res = await updateMemberProfile({
        ...editForm,
        photo: photoKey,
        documentProof: docKey,
        documentProofBack: docBackKey,
      });

      setProfile((prev) => (prev ? { ...prev, ...res.user } : null));
      localStorage.setItem("vpm_user", JSON.stringify(res.user));
      setSuccess("Profile details and documents updated successfully.");
      setNewPhotoFile(null);
      setNewDocFile(null);
      setNewDocBackFile(null);
      setPhotoPreview(null);
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

  const handleDeleteProfile = async () => {
    setDeleteLoading(true);
    setError("");
    try {
      await deleteMemberProfile();
      clearAuth();
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Failed to delete user profile account.");
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setCardDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imageUri = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `${profile?.membershipId || "VPM_Member"}_ID_Card.png`;
      link.href = imageUri;
      link.click();
    } catch (err) {
      console.error("❌ Card download failed:", err);
      alert("Could not generate image file. Please use the Print / Save PDF button.");
    } finally {
      setCardDownloading(false);
    }
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
                  Manage your credential profile, update credentials, and download official ID cards.
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
                  onClick={() => setActiveTab("coordinator")}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border rounded-xl hover:bg-amber-50 bg-white transition-all shadow-sm text-amber-700 border-amber-200"
                >
                  <Briefcase className="h-4 w-4" />
                  Referral Dashboard
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
                        <ProtectedImage
                          fileKey={profile.photo}
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
                            onClick={() => handleViewSecureFile(profile.photo!)}
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
                              <p className="text-xs font-bold text-slate-800 truncate">Aadhar Front Side</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID/Doc File</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewSecureFile(profile.documentProof!)}
                            className="p-1.5 bg-white hover:bg-amber-50 border hover:border-amber-300 text-slate-600 hover:text-amber-700 rounded-xl transition-all shadow-sm flex"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {profile.documentProofBack && (
                        <div className="border rounded-2xl p-4 flex justify-between items-center bg-slate-50/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-5 w-5 text-slate-450 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">Aadhar Back Side</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID/Doc File</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewSecureFile(profile.documentProofBack!)}
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
                        <div className="flex items-center gap-2">
                          <a
                            href={securePdfUrl || "#"}
                            download={`VPMH_MemberCard_${profile.membershipId}.pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-md"
                          >
                            <Download className="h-3.5 w-3.5 text-slate-900" />
                            Official PDF
                          </a>
                        </div>
                      </div>

                      {/* Printable ID Card */}
                      <div className="w-full max-w-[380px] h-[600px] bg-white border-2 border-slate-350 rounded-3xl shadow-2xl overflow-hidden relative">
                        {securePdfUrl ? (
                          <iframe
                            src={securePdfUrl}
                            className="w-full h-full border-none"
                            title="Official Member I-Card"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-50">
                            <Clock className="h-10 w-10 text-slate-400 animate-pulse" />
                            <h4 className="font-extrabold text-slate-800 text-sm">PDF Generation Pending</h4>
                            <p className="text-[11px] text-slate-500 leading-normal">
                              Your official I-Card is being generated. Please check back shortly.
                            </p>
                          </div>
                        )}
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
            ) : activeTab === "coordinator" ? (
              /* TAB: COORDINATOR DASHBOARD */
              <div className="space-y-8 print:hidden">
                {coordinatorLoading ? (
                  <div className="py-12 text-center space-y-4">
                    <Loader2 className="h-8 w-8 text-amber-600 animate-spin mx-auto" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loading Coordinator Data...</p>
                  </div>
                ) : coordinatorData ? (
                  <>
                    <div className="bg-white border rounded-3xl p-6 md:p-8 shadow-sm">
                      <h2 className="text-xl font-black text-slate-900 border-b pb-4 flex items-center gap-2 mb-6">
                        <Briefcase className="h-6 w-6 text-amber-500" /> My Coordinator Dashboard
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Code Display */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Your Coordinator Code</h4>
                          <div className="bg-slate-50 border-2 border-dashed border-amber-200 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                            <div className="absolute inset-0 bg-amber-50/50 pointer-events-none" />
                            <span className="font-mono text-3xl font-black text-amber-600 tracking-widest relative z-10">
                              {coordinatorData.coordinatorCode}
                            </span>
                            <div className="flex gap-2 relative z-10 w-full mt-2">
                              <button
                                onClick={handleCopyCode}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 transition-all shadow-sm"
                              >
                                {copiedCode ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                {copiedCode ? "Copied!" : "Copy Code"}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 text-center relative z-10 pt-2">
                              Share this code with new members during their registration.
                            </p>
                          </div>
                        </div>

                        {/* Progress Stats */}
                        <div className="space-y-4 flex flex-col">
                          <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center justify-between">
                            <span>Referral Progress</span>
                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                              {coordinatorData.eligibleReferrals} / {coordinatorData.threshold} eligible referrals
                            </span>
                          </h4>
                          
                          <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-5 flex-1">
                            {/* Progress bar */}
                            <div className="space-y-2">
                              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${coordinatorData.progress}%` }}
                                  transition={{ duration: 1, delay: 0.2 }}
                                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                                />
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium">
                                Add <strong className="text-slate-800">{Math.max(0, coordinatorData.threshold - coordinatorData.eligibleReferrals)} more</strong> eligible members to become eligible for ₹{coordinatorData.cashbackAmount} cashback.
                              </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-slate-50 border rounded-xl p-3 text-center">
                                <span className="block text-2xl font-black text-slate-800">{coordinatorData.totalReferrals}</span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total</span>
                              </div>
                              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                                <span className="block text-2xl font-black text-amber-700">{coordinatorData.pendingReferrals}</span>
                                <span className="text-[9px] font-bold text-amber-600/80 uppercase tracking-widest mt-1">Pending</span>
                              </div>
                              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                                <span className="block text-2xl font-black text-green-700">{coordinatorData.eligibleReferrals}</span>
                                <span className="text-[9px] font-bold text-green-600/80 uppercase tracking-widest mt-1">Eligible</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* History Table */}
                    <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
                      <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <Users className="h-4.5 w-4.5 text-slate-500" /> Referral History
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b">
                              <th className="p-4 pl-6">Member Name</th>
                              <th className="p-4">Date Registered</th>
                              <th className="p-4 pr-6">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-xs text-slate-700">
                            {coordinatorData.history && coordinatorData.history.length > 0 ? (
                              coordinatorData.history.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-4 pl-6 font-bold">{item.memberName}</td>
                                  <td className="p-4">{formatDate(item.date)}</td>
                                  <td className="p-4 pr-6">
                                    {item.status === "eligible" ? (
                                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Eligible</span>
                                    ) : (
                                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Pending</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="p-8 text-center text-slate-400 text-xs font-medium">
                                  You haven't referred any members yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-red-500 font-medium">
                    Failed to load coordinator dashboard.
                  </div>
                )}
              </div>
            ) : (
              /* TAB: EDIT SETTINGS (hidden on print) */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start print:hidden">
                
                {/* EDIT PROFILE DETAILS & DOCUMENTS */}
                <form onSubmit={handleEditSubmit} className="md:col-span-7 bg-white border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 border-b pb-3 mb-2 flex items-center gap-1.5">
                    <User className="h-5 w-5 text-amber-500" /> Update Member Information & Documents
                  </h3>
                  
                  {/* Text Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 font-medium"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 font-medium"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Designation</label>
                      <input
                        type="text"
                        required
                        value={editForm.designation}
                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 font-medium"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Organization</label>
                      <input
                        type="text"
                        value={editForm.organization}
                        onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 font-medium"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">State</label>
                      <input
                        type="text"
                        required
                        value={editForm.state}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 font-medium"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">City</label>
                      <input
                        type="text"
                        required
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* Document & Photo Uploaders */}
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Update Profile Attachments</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Photo Upload */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profile Photo</label>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl border bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {photoPreview ? (
                              <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                            ) : profile.photo ? (
                              <img src={getUploadUrl(profile.photo)} alt="Current" className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-6 w-6 text-slate-400" />
                            )}
                          </div>
                          <label className="cursor-pointer inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border">
                            <Upload className="h-3.5 w-3.5" />
                            {newPhotoFile ? newPhotoFile.name.slice(0, 12) + "..." : "Change Photo"}
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                          </label>
                        </div>
                      </div>

                      {/* Aadhar Document Proof Upload - Front */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aadhar Front Side</label>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border">
                            <Upload className="h-3.5 w-3.5" />
                            {newDocFile ? newDocFile.name.slice(0, 15) + "..." : "Update Front"}
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleDocChange} />
                          </label>
                          {profile.documentProof && !newDocFile && (
                            <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                              <CheckCircle className="h-3 w-3" /> Uploaded
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Aadhar Document Proof Upload - Back */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aadhar Back Side</label>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border">
                            <Upload className="h-3.5 w-3.5" />
                            {newDocBackFile ? newDocBackFile.name.slice(0, 15) + "..." : "Update Back"}
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleDocBackChange} />
                          </label>
                          {profile.documentProofBack && !newDocBackFile && (
                            <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                              <CheckCircle className="h-3 w-3" /> Uploaded
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow shadow-slate-950/20 block disabled:opacity-50"
                  >
                    {actionLoading ? "Saving Changes..." : "Save Profile & Attachments"}
                  </button>
                </form>

                {/* RIGHT COLUMN: CHANGE PASSWORD & DELETE ACCOUNT */}
                <div className="md:col-span-5 space-y-6">
                  {/* CHANGE PASSWORD */}
                  <form onSubmit={handlePasswordSubmit} className="bg-white border rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 border-b pb-3 mb-2 flex items-center gap-1.5">
                      <Key className="h-5 w-5 text-amber-500" /> Change Password
                    </h3>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Password</label>
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        value={passForm.oldPassword}
                        onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                        className="w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                        >
                          {showPass ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {showPass ? "Hide" : "Show"}
                        </button>
                      </div>
                      <input
                        type={showPass ? "text" : "password"}
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
                        type={showPass ? "text" : "password"}
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
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow disabled:opacity-50"
                    >
                      {actionLoading ? "Updating Password..." : "Update Password"}
                    </button>
                  </form>

                  {/* DELETE ACCOUNT / PROFILE (CRUD DELETE OPERATION) */}
                  <div className="bg-red-50/60 border border-red-200 rounded-3xl p-6 space-y-3">
                    <h4 className="text-sm font-black text-red-900 flex items-center gap-1.5">
                      <Trash2 className="h-4 w-4 text-red-600" /> Delete Profile & Account
                    </h4>
                    <p className="text-xs text-red-700/80 leading-relaxed">
                      Permanently delete your user credentials and membership application profile from the registry.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* 💳 Print CSS Injections */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 15mm;
                }
                body {
                  background: #ffffff !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body * {
                  visibility: hidden !important;
                }
                #vpm-id-card-print-target, #vpm-id-card-print-target * {
                  visibility: visible !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                #vpm-id-card-print-target {
                  position: relative !important;
                  left: auto !important;
                  top: auto !important;
                  transform: none !important;
                  margin: 40px auto !important;
                  border: 2px solid #cbd5e1 !important;
                  box-shadow: none !important;
                  background-color: #ffffff !important;
                  page-break-inside: avoid;
                }
                nav, footer, button, .print\\:hidden, header {
                  display: none !important;
                }
              }
            ` }} />
            
          </div>
        ) : null}

        {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-[#030712]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 border text-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">Delete Account Confirmation</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete your member profile and membership application? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProfile}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Profile"}
                </button>
              </div>
            </div>
          </div>
        )}

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

