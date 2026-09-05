import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, CheckCircle2, XCircle, Clock, Search, LogOut,
  SlidersHorizontal, Edit3, Trash2, Check, X, ShieldAlert, Eye, FileText, ChevronLeft, ChevronRight,
  Image as ImageIcon, Plus, Upload, Loader2, IndianRupee
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdminStats, getAdminMembers, getAdminAuditLogs,
  updateMemberDetails, deleteMember, verifyPayment, verifyMembership,
  getUploadUrl, clearAuth,
  getPublicGalleryPhotos, createGalleryPhoto, deleteGalleryPhoto,
  getPresignedUploadUrl, uploadFileToS3,
  getAdminCashbacks, updateCashbackStatus, fetchSecureDocumentUrl,
  resetMemberPassword, forceEmailVerification, updateAccountStatus,
  getAdmins, createAdmin, updateAdminRole, deleteAdmin
} from "../../api";

import ProtectedImage from "../../components/common/ProtectedImage";

export default function AdminDashboard() {
  const navigate = useNavigate();


  // Authentication check
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("vpm_token");
    const user = localStorage.getItem("vpm_user");
    if (!token || !user) {
      navigate("/admin-login");
      return;
    }
    try {
      const parsed = JSON.parse(user);
      if (!parsed.isAdmin) {
        navigate("/admin-login");
      }
      setCurrentAdmin(parsed);
    } catch {
      navigate("/admin-login");
    }
  }, [navigate]);

  // Tabs: "members", "logs", "gallery", "cashbacks", or "admins"
  const [activeTab, setActiveTab] = useState<"members" | "logs" | "gallery" | "cashbacks" | "admins">("members");

  // Stats
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    pendingPayments: 0,
    pendingApprovals: 0,
    approvedMembers: 0,
    rejectedMembers: 0,
  });

  // Members list & Pagination
  const [members, setMembers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");

  // Audit Logs & Pagination
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);

  // Cashbacks
  const [cashbacks, setCashbacks] = useState<any[]>([]);
  const [cashbacksLoading, setCashbacksLoading] = useState(false);

  // Photo Gallery Management State
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryCategory, setGalleryCategory] = useState("Events");
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryUploadLoading, setGalleryUploadLoading] = useState(false);

  // Admin Management State
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("admin");

  const fetchAdmins = async () => {
    setAdminLoading(true);
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (err: any) {
      console.error("Error fetching admins:", err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await createAdmin({ email: newAdminEmail, name: newAdminName, password: newAdminPassword, role: newAdminRole });
      setSuccess("Administrator created successfully.");
      setNewAdminEmail("");
      setNewAdminName("");
      setNewAdminPassword("");
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || "Failed to create admin.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAdminRole = async (id: string, role: string) => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await updateAdminRole(id, role);
      setSuccess("Admin role updated.");
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || "Failed to update admin role.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this administrator?")) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await deleteAdmin(id);
      setSuccess("Administrator removed.");
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || "Failed to remove admin.");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchGalleryPhotos = async () => {
    setGalleryLoading(true);
    try {
      const data = await getPublicGalleryPhotos();
      setGalleryPhotos(data);
    } catch (err: any) {
      console.error("Error fetching gallery photos:", err);
    } finally {
      setGalleryLoading(false);
    }
  };

  const fetchCashbacks = async () => {
    setCashbacksLoading(true);
    try {
      const data = await getAdminCashbacks();
      setCashbacks(data);
    } catch (err: any) {
      console.error("Error fetching cashbacks:", err);
    } finally {
      setCashbacksLoading(false);
    }
  };

  const handleGalleryUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle || !galleryFile) {
      setError("Please provide a photo title and select an image file.");
      return;
    }

    setGalleryUploadLoading(true);
    setError("");
    setSuccess("");
    try {
      const presigned = await getPresignedUploadUrl(galleryFile.name, galleryFile.type);
      await uploadFileToS3(presigned.uploadUrl, galleryFile);
      await createGalleryPhoto({
        title: galleryTitle,
        imageUrl: presigned.key,
        category: galleryCategory,
      });

      setSuccess("Gallery photo uploaded successfully.");
      setGalleryTitle("");
      setGalleryFile(null);
      fetchGalleryPhotos();
    } catch (err: any) {
      setError(err.message || "Failed to upload gallery photo.");
    } finally {
      setGalleryUploadLoading(false);
    }
  };

  const handleDeleteGalleryPhotoItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this photo from the gallery?")) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await deleteGalleryPhoto(id);
      setSuccess("Photo deleted from gallery successfully.");
      fetchGalleryPhotos();
    } catch (err: any) {
      setError(err.message || "Failed to delete photo from gallery.");
    } finally {
      setActionLoading(false);
    }
  };


  // States for modals
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Detail Inspector Modal
  const [inspectingMember, setInspectingMember] = useState<any | null>(null);
  
  // Image/Document Viewer Modal
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);
  const [viewingFileIsPdf, setViewingFileIsPdf] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  // Rejection Modals/Inputs State
  const [rejectionReason, setRejectionReason] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [showRejectPaymentModal, setShowRejectPaymentModal] = useState(false);
  const [showRejectMembershipModal, setShowRejectMembershipModal] = useState(false);

  const handleViewSecureDocument = async (fileKey: string) => {
    setPreviewLoading(true);
    setPreviewError("");
    setViewingFileUrl(null);
    setViewingFileIsPdf(fileKey.toLowerCase().endsWith(".pdf"));
    try {
      const url = await fetchSecureDocumentUrl(fileKey);
      setViewingFileUrl(url);
    } catch (err: any) {
      setPreviewError(err.message || "Unable to load document.");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Edit Modal
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    organization: "",
    state: "",
    city: "",
    designation: "",
    photo: "",
    documentProof: "",
  });
  const [editPhotoLoading, setEditPhotoLoading] = useState(false);
  const [editDocLoading, setEditDocLoading] = useState(false);

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditPhotoLoading(true);
      try {
        const presigned = await getPresignedUploadUrl(file.name, file.type);
        await uploadFileToS3(presigned.uploadUrl, file);
        setEditFormData({ ...editFormData, photo: presigned.key });
        setSuccess("Photo uploaded and staged for save.");
      } catch (err: any) {
        setError(err.message || "Failed to upload photo");
      } finally {
        setEditPhotoLoading(false);
      }
    }
  };

  const handleEditDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditDocLoading(true);
      try {
        const presigned = await getPresignedUploadUrl(file.name, file.type);
        await uploadFileToS3(presigned.uploadUrl, file);
        setEditFormData({ ...editFormData, documentProof: presigned.key });
        setSuccess("Document uploaded and staged for save.");
      } catch (err: any) {
        setError(err.message || "Failed to upload document");
      } finally {
        setEditDocLoading(false);
      }
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
    }
  };

  // Fetch Members
  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminMembers({
        page,
        limit: 8,
        search,
        paymentStatus: paymentFilter,
        approvalStatus: approvalFilter,
      });
      setMembers(data.members);
      setTotalPages(data.totalPages);
      setTotalMembers(data.total);
    } catch (err: any) {
      console.error("Error fetching members:", err);
      setError(err.message || "Failed to load directory.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    try {
      const data = await getAdminAuditLogs(logPage, 10);
      setAuditLogs(data.logs);
      setLogTotalPages(data.totalPages);
    } catch (err: any) {
      console.error("Error fetching audit logs:", err);
    }
  };

  // Trigger loading data
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "members") {
      fetchMembers();
    } else if (activeTab === "logs") {
      fetchAuditLogs();
    } else if (activeTab === "gallery") {
      fetchGalleryPhotos();
    } else if (activeTab === "cashbacks") {
      fetchCashbacks();
    } else if (activeTab === "admins") {
      fetchAdmins();
    }
  }, [activeTab, page, logPage, paymentFilter, approvalFilter]);


  // Handle Search Trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  // Logout handler
  const handleLogout = () => {
    clearAuth();
    navigate("/admin-login");
  };

  // Verify Payment Status Action
  const handleVerifyPayment = async (id: string, status: "paid" | "rejected") => {
    if (status === "rejected" && !rejectionReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await verifyPayment(id, status, status === "rejected" ? rejectionReason : undefined, paymentNotes);
      setSuccess(`Payment marked as ${status.toUpperCase()} successfully.`);
      fetchStats();
      fetchMembers();
      setShowRejectPaymentModal(false);
      setRejectionReason("");
      setPaymentNotes("");
      if (inspectingMember && inspectingMember._id === id) {
        setInspectingMember({ ...inspectingMember, paymentStatus: status, paymentRejectionReason: status === "rejected" ? rejectionReason : undefined, paymentNotes });
      }
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Verify Membership Approval Action
  const handleVerifyMembership = async (id: string, status: "approved" | "rejected") => {
    if (status === "rejected" && !rejectionReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await verifyMembership(id, status, status === "rejected" ? rejectionReason : undefined);
      setSuccess(`Membership marked as ${status.toUpperCase()} successfully.`);
      fetchStats();
      fetchMembers();
      setShowRejectMembershipModal(false);
      setRejectionReason("");
      if (inspectingMember && inspectingMember._id === id) {
        setInspectingMember({ ...inspectingMember, approvalStatus: status, membershipRejectionReason: status === "rejected" ? rejectionReason : undefined });
      }
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Edit member submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await updateMemberDetails(editingMember._id, editFormData);
      setSuccess("Member details updated successfully.");
      setEditingMember(null);
      fetchMembers();
    } catch (err: any) {
      setError(err.message || "Failed to update member.");
    } finally {
      setActionLoading(false);
    }
  };

  // Edit open
  const openEditModal = (member: any) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name,
      phone: member.phone || "",
      organization: member.organization || "",
      state: member.state || "",
      city: member.city || "",
      designation: member.designation || "",
      photo: member.photo || "",
      documentProof: member.documentProof || "",
    });
  };

  const handleUpdateCashback = async (id: string, status: string) => {
    if (!window.confirm(`Are you sure you want to change cashback status to ${status}?`)) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await updateCashbackStatus(id, status);
      setSuccess(`Cashback marked as ${status} successfully.`);
      fetchCashbacks();
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Member Action
  const handleDeleteMember = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to permanently delete this application? This action cannot be undone.")) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await deleteMember(id);
      setSuccess("Application deleted permanently.");
      fetchStats();
      fetchMembers();
    } catch (err: any) {
      setError(err.message || "Failed to delete application.");
    } finally {
      setActionLoading(false);
    }
  };

  // Account Control Actions
  const handleResetPassword = async (id: string) => {
    if (!window.confirm("Are you sure you want to reset this member's password? An email will be sent.")) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await resetMemberPassword(id);
      setSuccess("Password reset successfully. Email sent to member.");
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceEmailVerification = async (id: string) => {
    if (!window.confirm("Are you sure you want to force email verification?")) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await forceEmailVerification(id);
      setSuccess("Email verification reset successfully.");
      if (inspectingMember && inspectingMember._id === id) {
        setInspectingMember({ ...inspectingMember, isEmailVerified: false });
      }
      fetchMembers();
    } catch (err: any) {
      setError(err.message || "Failed to reset email verification.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAccountStatus = async (id: string, status: string) => {
    if (!window.confirm(`Are you sure you want to mark this account as ${status}?`)) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await updateAccountStatus(id, status);
      setSuccess(`Account status updated to ${status}.`);
      if (inspectingMember && inspectingMember._id === id) {
        setInspectingMember({ ...inspectingMember, accountStatus: status });
      }
      fetchMembers();
    } catch (err: any) {
      setError(err.message || "Failed to update account status.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="py-24 bg-slate-50 min-h-screen text-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Upper Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-7 w-7 text-amber-500" />
              Administrative Assembly
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify credentials, manage manual bank transactions, and monitor member audit records.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-650 bg-red-50 hover:bg-red-100 hover:text-red-750 transition-all rounded-xl"
          >
            <LogOut className="h-4 w-4" />
            Logout Session
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Registrations", value: stats.totalRegistrations, icon: Users, color: "text-blue-500 bg-blue-50" },
            { label: "Pending Payments", value: stats.pendingPayments, icon: Clock, color: "text-amber-600 bg-amber-50" },
            { label: "Pending Approvals", value: stats.pendingApprovals, icon: SlidersHorizontal, color: "text-purple-650 bg-purple-50" },
            { label: "Approved Members", value: stats.approvedMembers, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
            { label: "Rejected Applications", value: stats.rejectedMembers, icon: XCircle, color: "text-red-600 bg-red-50" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white border rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                <div className={`p-2 rounded-xl ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-3">{item.value}</h2>
            </div>
          ))}
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-6 py-2.5 text-xs font-black tracking-wider uppercase border-b-2 transition-all ${
              activeTab === "members" ? "border-amber-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Registry Directory ({totalMembers})
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-6 py-2.5 text-xs font-black tracking-wider uppercase border-b-2 transition-all ${
              activeTab === "logs" ? "border-amber-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Admin Audit Logs
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-6 py-2.5 text-xs font-black tracking-wider uppercase border-b-2 transition-all ${
              activeTab === "gallery" ? "border-amber-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Photo Gallery ({galleryPhotos.length})
          </button>
          <button
            onClick={() => setActiveTab("cashbacks")}
            className={`px-6 py-2.5 text-xs font-black tracking-wider uppercase border-b-2 transition-all ${
              activeTab === "cashbacks" ? "border-amber-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Referral Cashbacks
          </button>
          {currentAdmin?.isAdmin && (
            <button
              onClick={() => setActiveTab("admins")}
              className={`px-6 py-2.5 text-xs font-black tracking-wider uppercase border-b-2 transition-all ${
                activeTab === "admins" ? "border-amber-500 text-slate-900 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Admin Management
            </button>
          )}
        </div>

        {/* Dynamic Alerts */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex items-center justify-between"
            >
              <span>{success}</span>
              <button onClick={() => setSuccess("")} className="font-bold hover:scale-105">✕</button>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center justify-between"
            >
              <span>{error}</span>
              <button onClick={() => setError("")} className="font-bold hover:scale-105">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active tab content */}
        {activeTab === "members" && (
          <div className="space-y-6">
            
            {/* Search & Filter Controls */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-white border p-4 rounded-2xl shadow-sm items-center">
              <div className="sm:col-span-6 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, organization, state, city, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-slate-800"
                />
              </div>

              {/* Payment Filter */}
              <div className="sm:col-span-2">
                <select
                  value={paymentFilter}
                  onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                  className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-700"
                >
                  <option value="">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="verification_pending">Verifying</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Approval Filter */}
              <div className="sm:col-span-2">
                <select
                  value={approvalFilter}
                  onChange={(e) => { setApprovalFilter(e.target.value); setPage(1); }}
                  className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-700"
                >
                  <option value="">All Approvals</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Search className="h-3.5 w-3.5" />
                  Filter Registry
                </button>
              </div>
            </form>

            {/* Members Directory Table */}
            <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="py-4 px-6">Member Profile</th>
                      <th className="py-4 px-4">State/City</th>
                      <th className="py-4 px-4">Contact Info</th>
                      <th className="py-4 px-4">Payment</th>
                      <th className="py-4 px-4">Approval</th>
                      <th className="py-4 px-4 text-center">Inspect</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-24 text-center text-xs text-slate-400 font-bold">
                          Syncing register logs...
                        </td>
                      </tr>
                    ) : members.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-24 text-center text-xs text-slate-400 leading-relaxed font-bold">
                          No matching applications found in the records.
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => (
                        <tr key={member._id} className="border-b last:border-0 hover:bg-slate-50/30 text-xs">
                          {/* Profile */}
                          <td className="py-4 px-6 flex items-center gap-3 min-w-[200px]">
                            <div className="h-9 w-9 bg-slate-200 rounded-full overflow-hidden flex-shrink-0 border">
                              {member.photo ? (
                                <ProtectedImage
                                  fileKey={member.photo}
                                  alt={member.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="h-full w-full flex items-center justify-center font-bold text-slate-500 bg-gradient-to-tr from-amber-100 to-amber-200">
                                  {member.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 truncate">{member.name}</h4>
                              <p className="text-[10px] text-slate-500 truncate">{member.designation} • {member.organization || "Independent"}</p>
                            </div>
                          </td>

                          {/* State/City */}
                          <td className="py-4 px-4 text-slate-650 min-w-[120px]">
                            {member.city}, {member.state}
                          </td>

                          {/* Contact Info */}
                          <td className="py-4 px-4 text-slate-650">
                            <div>{member.phone}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{member.email}</div>
                          </td>

                          {/* Payment */}
                          <td className="py-4 px-4">
                            {member.paymentStatus === "paid" && (
                              <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                <CheckCircle2 className="h-3 w-3" /> Paid
                              </span>
                            )}
                            {member.paymentStatus === "verification_pending" && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2 py-0.5 text-[10px] font-bold animate-pulse">
                                <Clock className="h-3 w-3" /> Verifying
                              </span>
                            )}
                            {member.paymentStatus === "pending" && (
                              <span className="inline-flex items-center gap-1 bg-slate-100 border text-slate-600 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                <Clock className="h-3 w-3" /> Pending
                              </span>
                            )}
                            {member.paymentStatus === "rejected" && (
                              <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-650 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                <XCircle className="h-3 w-3" /> Rejected
                              </span>
                            )}
                          </td>

                          {/* Approval */}
                          <td className="py-4 px-4">
                            {member.approvalStatus === "approved" && (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 bg-green-55/10 border border-green-200 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                  <Check className="h-3 w-3" /> Approved
                                </span>
                                {member.membershipId && (
                                  <p className="text-[9px] font-bold text-amber-600 font-mono">{member.membershipId}</p>
                                )}
                              </div>
                            )}
                            {member.approvalStatus === "pending" && (
                              <span className="inline-flex items-center gap-1 bg-slate-100 border text-slate-600 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                <Clock className="h-3 w-3" /> Pending
                              </span>
                            )}
                            {member.approvalStatus === "rejected" && (
                              <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-650 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                <X className="h-3 w-3" /> Rejected
                              </span>
                            )}
                          </td>

                          {/* Inspect Detail */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => setInspectingMember(member)}
                              className="p-1.5 bg-slate-50 hover:bg-amber-50 border hover:border-amber-300 text-slate-600 hover:text-amber-700 rounded-lg transition-colors inline-flex"
                              title="Inspect documents & payment details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right min-w-[130px]">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(member)}
                                className="p-1.5 bg-slate-50 hover:bg-blue-50 border hover:border-blue-200 text-slate-650 hover:text-blue-700 rounded-lg transition-colors"
                                title="Edit Member Profile"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(member._id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-600 hover:text-red-750 transition-colors rounded-lg"
                                title="Delete application"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-slate-50/50 border-t py-4 px-6 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Page {page} of {totalPages} ({totalMembers} entries)
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-1.5 bg-white border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-1.5 bg-white border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          /* AUDIT LOGS TAB */
          <div className="space-y-6">
            <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="py-4 px-6">Administrator</th>
                      <th className="py-4 px-4">Action Event</th>
                      <th className="py-4 px-4">Target User</th>
                      <th className="py-4 px-4">Log Detail Parameters</th>
                      <th className="py-4 px-6 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-xs text-slate-400 font-bold">
                          No administrative changes found in database records.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log._id} className="border-b last:border-0 hover:bg-slate-50/30 text-xs">
                          <td className="py-4 px-6 font-bold text-slate-900 font-mono">
                            {log.adminEmail}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                              log.action.includes("APPROVED") ? "bg-green-50 border border-green-200 text-green-700" :
                              log.action.includes("REJECTED") ? "bg-red-50 border border-red-200 text-red-650" :
                              "bg-blue-50 border border-blue-200 text-blue-700"
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {log.targetUserId ? (
                              <div>
                                <span className="font-bold text-slate-800">{log.targetUserId.name}</span>
                                <p className="text-[10px] text-slate-450 font-mono mt-0.5">{log.targetUserId.email}</p>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </td>
                          <td className="py-4 px-4 max-w-[280px]">
                            <p className="truncate text-slate-500 font-mono text-[10px]" title={JSON.stringify(log.details)}>
                              {JSON.stringify(log.details)}
                            </p>
                          </td>
                          <td className="py-4 px-6 text-right text-slate-500 text-[10px] font-bold font-mono">
                            {new Date(log.createdAt).toLocaleString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Log Pagination */}
              {logTotalPages > 1 && (
                <div className="bg-slate-50/50 border-t py-4 px-6 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Page {logPage} of {logTotalPages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setLogPage((p) => Math.max(p - 1, 1))}
                      disabled={logPage === 1}
                      className="p-1.5 bg-white border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setLogPage((p) => Math.min(p + 1, logTotalPages))}
                      disabled={logPage === logTotalPages}
                      className="p-1.5 bg-white border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "cashbacks" && (
          /* CASHBACKS TAB */
          <div className="space-y-6">
            <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="py-4 px-6">Coordinator Info</th>
                      <th className="py-4 px-4">Referrals & Amount</th>
                      <th className="py-4 px-4">Status & Action</th>
                      <th className="py-4 px-4">Eligibility Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashbacksLoading ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-xs text-slate-400 font-bold">
                          Loading cashbacks...
                        </td>
                      </tr>
                    ) : cashbacks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-xs text-slate-400 font-bold">
                          No cashback records found.
                        </td>
                      </tr>
                    ) : (
                      cashbacks.map((cb) => (
                        <tr key={cb._id} className="border-b last:border-0 hover:bg-slate-50/30 text-xs">
                          <td className="py-4 px-6">
                            {cb.coordinatorId ? (
                              <div>
                                <span className="font-bold text-slate-800 text-sm">{cb.coordinatorId.name}</span>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{cb.coordinatorId.coordinatorCode}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{cb.coordinatorId.phone}</div>
                              </div>
                            ) : (
                              <span className="text-red-500 italic">Coordinator Deleted</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">
                              {cb.referralCount} / {cb.threshold} Referrals
                            </span>
                            <div className="mt-2 font-black text-green-700 text-sm flex items-center gap-1">
                              <IndianRupee className="h-3.5 w-3.5" /> {cb.amount}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-2 items-start">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                cb.status === "eligible" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                                cb.status === "processing" ? "bg-blue-50 text-blue-600 border border-blue-200 animate-pulse" :
                                cb.status === "paid" ? "bg-green-50 text-green-600 border border-green-200" :
                                "bg-red-50 text-red-600 border border-red-200"
                              }`}>
                                {cb.status}
                              </span>
                              
                              <div className="flex gap-1 mt-1">
                                {cb.status === "eligible" && (
                                  <>
                                    <button onClick={() => handleUpdateCashback(cb._id, "processing")} className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded font-bold transition">Process</button>
                                    <button onClick={() => handleUpdateCashback(cb._id, "rejected")} className="text-[10px] bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-600 px-2 py-1 rounded font-bold transition">Reject</button>
                                  </>
                                )}
                                {cb.status === "processing" && (
                                  <>
                                    <button onClick={() => handleUpdateCashback(cb._id, "paid")} className="text-[10px] bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-bold transition">Mark Paid</button>
                                    <button onClick={() => handleUpdateCashback(cb._id, "rejected")} className="text-[10px] bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-600 px-2 py-1 rounded font-bold transition">Reject</button>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-500 font-mono text-[10px]">
                            {new Date(cb.eligibleAt).toLocaleString("en-IN")}
                            {cb.processedAt && (
                              <div className="mt-1 text-green-600">Processed: {new Date(cb.processedAt).toLocaleString("en-IN")}</div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "admins" && (
          <div className="space-y-6">
            <form onSubmit={handleCreateAdmin} className="bg-white border rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 border-b pb-3 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" /> Create New Administrator
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input required type="text" placeholder="Admin Name" value={newAdminName} onChange={e => setNewAdminName(e.target.value)} className="bg-slate-50 border rounded-xl py-2 px-3 text-xs" />
                <input required type="email" placeholder="Email Address" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} className="bg-slate-50 border rounded-xl py-2 px-3 text-xs" />
                <input required type="password" placeholder="Temporary Password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} className="bg-slate-50 border rounded-xl py-2 px-3 text-xs" />
                <select value={newAdminRole} onChange={e => setNewAdminRole(e.target.value)} className="bg-slate-50 border rounded-xl py-2 px-3 text-xs font-bold">
                  <option value="admin">Admin</option>
                  <option value="verification_admin">Verification Admin</option>
                  <option value="content_admin">Content Admin</option>
                  <option value="support_admin">Support Admin</option>
                  <option value="read_only_admin">Read-Only Admin</option>
                </select>
              </div>
              <button disabled={actionLoading} type="submit" className="bg-slate-900 text-white text-xs font-bold px-6 py-2 rounded-xl">Create Admin</button>
            </form>

            <div className="bg-white border rounded-3xl p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-[10px] text-slate-500 uppercase tracking-widest">
                    <th className="py-3">Name / Email</th>
                    <th className="py-3">Role</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin._id} className="border-b last:border-0 text-xs">
                      <td className="py-3"><div className="font-bold">{admin.name}</div><div className="text-[10px] text-slate-500">{admin.email}</div></td>
                      <td className="py-3">
                        <select value={admin.adminRole} onChange={(e) => handleUpdateAdminRole(admin._id, e.target.value)} className="bg-slate-50 border rounded py-1 px-2 text-xs font-bold">
                          <option value="admin">Admin</option>
                          <option value="verification_admin">Verification Admin</option>
                          <option value="content_admin">Content Admin</option>
                          <option value="support_admin">Support Admin</option>
                          <option value="read_only_admin">Read-Only Admin</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        {admin.email !== currentAdmin.email && (
                          <button onClick={() => handleDeleteAdmin(admin._id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded text-xs font-bold">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PHOTO GALLERY MANAGEMENT */}
        {activeTab === "gallery" && (
          <div className="space-y-8">
            {/* Upload Form */}
            <form onSubmit={handleGalleryUploadSubmit} className="bg-white border rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 border-b pb-3 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-amber-500" /> Upload New Gallery Photo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Photo Title / Caption *
                  </label>
                  <input
                    type="text"
                    required
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    placeholder="e.g. State Executive Committee Meeting in Prayagraj"
                    className="w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Category
                  </label>
                  <select
                    value={galleryCategory}
                    onChange={(e) => setGalleryCategory(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 font-bold"
                  >
                    <option value="Events">Events & Conferences</option>
                    <option value="Assemblies">Assemblies & Rallies</option>
                    <option value="Awards">Awards & Recognitions</option>
                    <option value="Training">Training & Workshops</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Select Image File (JPG / PNG / WebP) *
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border">
                    <Upload className="h-4 w-4 text-amber-600" />
                    {galleryFile ? galleryFile.name : "Choose Image File"}
                    <input
                      type="file"
                      accept="image/*"
                      required
                      className="hidden"
                      onChange={(e) => e.target.files && setGalleryFile(e.target.files[0])}
                    />
                  </label>
                  {galleryFile && (
                    <span className="text-xs font-bold text-green-600">
                      ✓ Ready to upload ({ (galleryFile.size / (1024 * 1024)).toFixed(2) } MB)
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={galleryUploadLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow disabled:opacity-50 flex items-center gap-2"
              >
                {galleryUploadLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                    <span>Uploading Photo...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 text-amber-400" />
                    <span>Upload to Public Gallery</span>
                  </>
                )}
              </button>
            </form>

            {/* Gallery Photos Grid */}
            <div className="bg-white border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-base font-black text-slate-900">
                  Current Public Gallery Photos ({galleryPhotos.length})
                </h3>
                <button
                  onClick={fetchGalleryPhotos}
                  className="text-xs text-amber-600 font-bold hover:underline"
                >
                  Refresh Gallery
                </button>
              </div>

              {galleryLoading ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loading gallery photos...</p>
                </div>
              ) : galleryPhotos.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs font-bold">
                  No photos uploaded to database yet. Use the form above to upload event photos.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {galleryPhotos.map((photo) => (
                    <div key={photo._id} className="border rounded-2xl overflow-hidden bg-slate-50 flex flex-col justify-between group shadow-sm">
                      <div className="relative aspect-[4/3] bg-slate-200 overflow-hidden">
                        <img
                          src={getUploadUrl(photo.imageUrl)}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={() => handleViewSecureDocument(photo.imageUrl)}
                          className="absolute top-2 right-2 p-1.5 bg-slate-950/80 hover:bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="View image"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="p-3 space-y-2 flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {photo.category || "Events"}
                          </span>
                          <p className="text-xs font-bold text-slate-800 mt-1.5 leading-snug line-clamp-2" title={photo.title}>
                            {photo.title}
                          </p>
                        </div>

                        <div className="pt-2 border-t flex justify-between items-center text-[10px] text-slate-400 font-bold">
                          <span>{new Date(photo.createdAt).toLocaleDateString("en-IN")}</span>
                          <button
                            onClick={() => handleDeleteGalleryPhotoItem(photo._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                            title="Delete photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


        {/* MODAL: DETAIL INSPECTOR */}
        {inspectingMember && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl w-full max-w-2xl border overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-600" />
              
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">Application Inspection</h3>
                <button
                  onClick={() => setInspectingMember(null)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Basic profile info */}
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="h-16 w-16 bg-slate-200 rounded-full overflow-hidden flex-shrink-0 border">
                    {inspectingMember.photo ? (
                      <ProtectedImage
                        fileKey={inspectingMember.photo}
                        alt={inspectingMember.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="h-full w-full flex items-center justify-center font-bold text-slate-500 bg-amber-50">
                        N/A
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-lg">{inspectingMember.name}</h4>
                    <p className="text-xs text-slate-550">{inspectingMember.designation} • {inspectingMember.organization || "Independent"}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{inspectingMember.email} | {inspectingMember.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo & Document inspect */}
                  <div className="border rounded-2xl p-4 space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Document Proofs</h5>
                    <div className="flex gap-2 flex-wrap">
                      {inspectingMember.photo && (
                        <button
                          onClick={() => handleViewSecureDocument(inspectingMember.photo)}
                          className="flex items-center gap-1 bg-slate-50 border p-2 rounded-xl text-xs hover:border-amber-300 font-bold transition-all text-slate-700"
                        >
                          <Eye className="h-3.5 w-3.5" /> Profile Photo
                        </button>
                      )}
                      {inspectingMember.documentProof && (
                        <button
                          onClick={() => handleViewSecureDocument(inspectingMember.documentProof)}
                          className="flex items-center gap-1 bg-slate-50 border p-2 rounded-xl text-xs hover:border-amber-300 font-bold transition-all text-slate-700"
                        >
                          <FileText className="h-3.5 w-3.5" /> Aadhar Front
                        </button>
                      )}
                      {inspectingMember.documentProofBack && (
                        <button
                          onClick={() => handleViewSecureDocument(inspectingMember.documentProofBack)}
                          className="flex items-center gap-1 bg-slate-50 border p-2 rounded-xl text-xs hover:border-amber-300 font-bold transition-all text-slate-700"
                        >
                          <FileText className="h-3.5 w-3.5" /> Aadhar Back
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment Details inspect */}
                  <div className="border rounded-2xl p-4 space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transaction Metadata</h5>
                    {inspectingMember.paymentReferenceId ? (
                      <div className="space-y-2">
                        <p className="text-xs">
                          Reference ID: <strong className="font-mono text-amber-700 font-bold">{inspectingMember.paymentReferenceId}</strong>
                        </p>
                        <button
                          onClick={() => handleViewSecureDocument(inspectingMember.paymentScreenshot)}
                          className="flex items-center gap-1 bg-slate-50 border p-2 rounded-xl text-xs hover:border-amber-300 font-bold transition-all text-slate-700"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Payment Screenshot
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-450 italic">No manual transaction uploaded yet.</p>
                    )}
                  </div>
                </div>

                {/* Verification Control Buttons */}
                <div className="border-t pt-6 space-y-4">
                  {/* Step 1: Payment Verification */}
                  <div className="bg-slate-50 border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h5 className="text-xs font-black uppercase text-slate-700 tracking-wide">Step 1: UPI Fee Check</h5>
                      <p className="text-[10px] text-slate-500">Compare uploaded transaction details against bank logs.</p>
                    </div>
                    {inspectingMember.paymentStatus !== "paid" ? (
                      <div className="flex gap-1.5 self-end">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleVerifyPayment(inspectingMember._id, "paid")}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve Fee
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => setShowRejectPaymentModal(true)}
                          className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-650 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all border border-red-200"
                        >
                          <X className="h-3.5 w-3.5" /> Reject Fee
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                        ✓ Fee Verified Paid
                      </span>
                    )}
                  </div>

                  {/* Step 2: Credentials Verification */}
                  <div className="bg-slate-50 border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h5 className="text-xs font-black uppercase text-slate-700 tracking-wide">Step 2: Credential Verification</h5>
                      <p className="text-[10px] text-slate-500">Approve membership and auto-generate credentials ID card.</p>
                    </div>
                    {inspectingMember.approvalStatus !== "approved" ? (
                      <div className="flex gap-1.5 self-end">
                        <button
                          disabled={actionLoading || inspectingMember.paymentStatus !== "paid"}
                          onClick={() => handleVerifyMembership(inspectingMember._id, "approved")}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
                          title={inspectingMember.paymentStatus !== "paid" ? "Verify fee status first" : ""}
                        >
                          <Check className="h-3.5 w-3.5" /> Approve Application
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => setShowRejectMembershipModal(true)}
                          className="flex items-center gap-1 bg-red-55/10 hover:bg-red-100 text-red-600 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all border border-red-200"
                        >
                          <X className="h-3.5 w-3.5" /> Reject Application
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-green-700 bg-green-55/10 border border-green-200 px-3 py-1.5 rounded-xl">
                        ✓ Membership Approved ({inspectingMember.membershipId})
                      </span>
                    )}
                  </div>
                  {/* Step 3: Account Controls (Super Admin Only) */}
                  {currentAdmin?.isAdmin && (
                    <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h5 className="text-xs font-black uppercase text-red-700 tracking-wide">Step 3: Account Controls</h5>
                        <p className="text-[10px] text-red-600/80">Danger zone: Reset password, force verify email, block account.</p>
                      </div>
                      <div className="flex gap-1.5 self-end flex-wrap justify-end">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleResetPassword(inspectingMember._id)}
                          className="flex items-center gap-1 bg-white hover:bg-red-50 text-red-650 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all border border-red-200"
                        >
                          Reset Password
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleForceEmailVerification(inspectingMember._id)}
                          className="flex items-center gap-1 bg-white hover:bg-red-50 text-red-650 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all border border-red-200"
                        >
                          Force Unverify Email
                        </button>
                        {inspectingMember.accountStatus === "active" ? (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateAccountStatus(inspectingMember._id, "blocked")}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all shadow-sm"
                          >
                            Block Member
                          </button>
                        ) : (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateAccountStatus(inspectingMember._id, "active")}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all shadow-sm"
                          >
                            Unblock Member
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: REJECT PAYMENT */}
        {showRejectPaymentModal && inspectingMember && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl w-full max-w-md border overflow-hidden shadow-2xl relative"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-black text-red-600">Reject Payment</h3>
                <button
                  onClick={() => setShowRejectPaymentModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rejection Reason *</label>
                  <textarea
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                    placeholder="Provide a reason for rejection..."
                    rows={3}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Internal Notes (Optional)</label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                    placeholder="Internal notes..."
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button onClick={() => setShowRejectPaymentModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-50 text-xs font-bold transition-all">Cancel</button>
                  <button
                    onClick={() => handleVerifyPayment(inspectingMember._id, "rejected")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: REJECT MEMBERSHIP */}
        {showRejectMembershipModal && inspectingMember && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl w-full max-w-md border overflow-hidden shadow-2xl relative"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-black text-red-600">Reject Application</h3>
                <button
                  onClick={() => setShowRejectMembershipModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rejection Reason *</label>
                  <textarea
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                    placeholder="Provide a reason for rejecting membership..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button onClick={() => setShowRejectMembershipModal(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-50 text-xs font-bold transition-all">Cancel</button>
                  <button
                    onClick={() => handleVerifyMembership(inspectingMember._id, "rejected")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: EDIT MEMBER PROFILE */}
        {editingMember && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl w-full max-w-md border overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500" />
              
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">Edit Member Details</h3>
                <button
                  onClick={() => setEditingMember(null)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Designation</label>
                  <input
                    type="text"
                    required
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Organization</label>
                  <input
                    type="text"
                    value={editFormData.organization}
                    onChange={(e) => setEditFormData({ ...editFormData, organization: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">State</label>
                    <input
                      type="text"
                      required
                      value={editFormData.state}
                      onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                      className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">City</label>
                    <input
                      type="text"
                      required
                      value={editFormData.city}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      className="w-full bg-slate-50 border rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Update Profile Photo</label>
                    <div className="flex flex-col gap-2">
                      {editFormData.photo && (
                        <div className="flex items-center gap-2 p-2 bg-slate-50 border rounded-lg">
                          <span className="text-[10px] truncate max-w-[120px] text-slate-600">Existing/Staged Photo</span>
                          <button type="button" onClick={() => handleViewSecureDocument(editFormData.photo)} className="ml-auto text-blue-500 hover:text-blue-700">
                            <Eye className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <label className={`flex items-center justify-center gap-2 px-3 py-2 border border-dashed rounded-xl text-xs cursor-pointer transition-colors ${editPhotoLoading ? 'bg-slate-100 border-slate-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-300'}`}>
                        {editPhotoLoading ? <Loader2 className="h-3 w-3 animate-spin text-slate-500" /> : <Upload className="h-3 w-3 text-slate-500" />}
                        <span className="text-slate-600 font-medium">{editPhotoLoading ? "Uploading..." : "Upload New Photo"}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleEditPhotoUpload} disabled={editPhotoLoading} />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Update Document (Front)</label>
                    <div className="flex flex-col gap-2">
                      {editFormData.documentProof && (
                        <div className="flex items-center gap-2 p-2 bg-slate-50 border rounded-lg">
                          <span className="text-[10px] truncate max-w-[120px] text-slate-600">Existing/Staged Doc</span>
                          <button type="button" onClick={() => handleViewSecureDocument(editFormData.documentProof)} className="ml-auto text-blue-500 hover:text-blue-700">
                            <Eye className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <label className={`flex items-center justify-center gap-2 px-3 py-2 border border-dashed rounded-xl text-xs cursor-pointer transition-colors ${editDocLoading ? 'bg-slate-100 border-slate-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-300'}`}>
                        {editDocLoading ? <Loader2 className="h-3 w-3 animate-spin text-slate-500" /> : <Upload className="h-3 w-3 text-slate-500" />}
                        <span className="text-slate-600 font-medium">{editDocLoading ? "Uploading..." : "Upload New Doc"}</span>
                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleEditDocUpload} disabled={editDocLoading} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 border rounded-xl hover:bg-slate-50 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    {actionLoading ? "Saving..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL: IMAGE/DOCUMENT VIEWER */}
        {(viewingFileUrl || previewLoading || previewError) && (
          <div
            className="fixed inset-0 bg-[#030712]/95 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-4"
            onClick={() => {
              setViewingFileUrl(null);
              setPreviewLoading(false);
              setPreviewError("");
            }}
          >
            <div className="relative max-w-3xl min-w-[300px] max-h-[85vh] overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              
              {previewLoading && (
                <div className="flex flex-col items-center justify-center text-white/80 gap-3 py-16 px-8">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                  <p className="font-bold tracking-wide">Loading document...</p>
                </div>
              )}

              {previewError && (
                <div className="flex flex-col items-center justify-center text-red-400 gap-3 py-16 px-8">
                  <XCircle className="w-10 h-10" />
                  <p className="font-bold tracking-wide">{previewError}</p>
                </div>
              )}

              {viewingFileUrl && viewingFileIsPdf && (
                <div className="flex flex-col items-center gap-6 py-16 px-12 bg-slate-900/50 rounded-xl border border-white/5 w-full">
                  <FileText className="w-16 h-16 text-amber-400" />
                  <div className="text-center">
                    <h3 className="text-white font-bold text-lg tracking-wide">PDF Document</h3>
                    <p className="text-white/60 text-sm mt-1">This document has been securely authenticated.</p>
                  </div>
                  <a
                    href={viewingFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> View / Download PDF
                  </a>
                </div>
              )}

              {viewingFileUrl && !viewingFileIsPdf && (
                <img
                  src={viewingFileUrl}
                  alt="Secure Document Preview"
                  className="max-w-full max-h-[80vh] object-contain rounded-xl"
                />
              )}

              <button
                onClick={() => {
                  setViewingFileUrl(null);
                  setPreviewLoading(false);
                  setPreviewError("");
                }}
                className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-white rounded-full transition-colors z-10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-white/60 font-bold text-xs mt-4 tracking-widest select-none">
              CLICK ANYWHERE OUTSIDE TO CLOSE
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
