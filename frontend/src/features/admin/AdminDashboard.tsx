import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, CheckCircle2, XCircle, Clock, Search, LogOut,
  SlidersHorizontal, Edit3, Trash2, Check, X, ShieldAlert, Eye, FileText, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdminStats, getAdminMembers, getAdminAuditLogs,
  updateMemberDetails, deleteMember, verifyPayment, verifyMembership,
  getUploadUrl, clearAuth
} from "../../api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Authentication check
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
    } catch {
      navigate("/admin-login");
    }
  }, [navigate]);

  // Tabs: "members" or "logs"
  const [activeTab, setActiveTab] = useState<"members" | "logs">("members");

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

  // States for modals
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Detail Inspector Modal
  const [inspectingMember, setInspectingMember] = useState<any | null>(null);
  
  // Image Viewer Modal
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);

  // Edit Modal
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    organization: "",
    state: "",
    city: "",
    designation: "",
  });

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
    } else {
      fetchAuditLogs();
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
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await verifyPayment(id, status);
      setSuccess(`Payment marked as ${status.toUpperCase()} successfully.`);
      fetchStats();
      fetchMembers();
      if (inspectingMember && inspectingMember._id === id) {
        setInspectingMember(null);
      }
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Verify Membership Approval Action
  const handleVerifyMembership = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await verifyMembership(id, status);
      setSuccess(`Membership marked as ${status.toUpperCase()} successfully.`);
      fetchStats();
      fetchMembers();
      if (inspectingMember && inspectingMember._id === id) {
        setInspectingMember(null);
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
    });
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
        {activeTab === "members" ? (
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
                                <img
                                  src={getUploadUrl(member.photo)}
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
        ) : (
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
                      <img
                        src={getUploadUrl(inspectingMember.photo)}
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
                          onClick={() => setViewingFileUrl(getUploadUrl(inspectingMember.photo))}
                          className="flex items-center gap-1 bg-slate-50 border p-2 rounded-xl text-xs hover:border-amber-300 font-bold transition-all text-slate-700"
                        >
                          <Eye className="h-3.5 w-3.5" /> Profile Photo
                        </button>
                      )}
                      {inspectingMember.documentProof && (
                        <button
                          onClick={() => setViewingFileUrl(getUploadUrl(inspectingMember.documentProof))}
                          className="flex items-center gap-1 bg-slate-50 border p-2 rounded-xl text-xs hover:border-amber-300 font-bold transition-all text-slate-700"
                        >
                          <FileText className="h-3.5 w-3.5" /> ID Doc Proof
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
                          onClick={() => setViewingFileUrl(getUploadUrl(inspectingMember.paymentScreenshot))}
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
                          onClick={() => handleVerifyPayment(inspectingMember._id, "rejected")}
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
                          onClick={() => handleVerifyMembership(inspectingMember._id, "rejected")}
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

        {/* MODAL: IMAGE VIEWER */}
        {viewingFileUrl && (
          <div
            className="fixed inset-0 bg-[#030712]/95 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-4"
            onClick={() => setViewingFileUrl(null)}
          >
            <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {viewingFileUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={viewingFileUrl}
                  title="Document Proof"
                  className="w-[80vw] h-[80vh] border-0"
                />
              ) : (
                <img
                  src={viewingFileUrl}
                  alt="Proof inspect"
                  className="max-w-full max-h-[80vh] object-contain rounded-xl"
                />
              )}
              <button
                onClick={() => setViewingFileUrl(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-white rounded-full transition-colors"
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
