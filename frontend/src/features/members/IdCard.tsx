import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Printer, ShieldCheck, AlertCircle, Loader2, ArrowLeft, Calendar, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getPublicVerification, getUploadUrl } from "../../api";
import Logo from "../../assets/logo perfect.png";

interface MemberDetails {
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

export default function IdCard() {
  const navigate = useNavigate();
  const { membershipId } = useParams<{ membershipId: string }>();
  const [member, setMember] = useState<MemberDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authorization: only allow admin or own card owner
    const userStr = localStorage.getItem("vpm_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!user.isAdmin && user.membershipId !== membershipId) {
          navigate("/dashboard");
          return;
        }
      } catch {
        navigate("/login");
        return;
      }
    } else {
      navigate("/login");
      return;
    }

    const fetchMemberCard = async () => {
      if (!membershipId) return;
      setLoading(true);
      setError("");
      try {
        const data = await getPublicVerification(membershipId);
        setMember(data);
      } catch (err: any) {
        console.error("❌ Card fetch error:", err);
        setError(err.message || "Failed to load identity card details. Card may be invalid or pending approval.");
      } finally {
        setLoading(false);
      }
    };
    fetchMemberCard();
  }, [membershipId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
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
      link.download = `${member?.membershipId || "VPM_Member"}_ID_Card.png`;
      link.href = imageUri;
      link.click();
    } catch (err) {
      console.error("❌ Card download failed:", err);
      alert("Could not generate image file. Please use the Print button to save as PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const verificationUrl = `${window.location.origin}/verify/${membershipId}`;

  // Helper date formatting
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="py-24 bg-slate-100 dark:bg-[#030712] min-h-screen text-slate-800 flex items-center justify-center print:bg-white print:py-0 print:min-h-0 relative overflow-hidden">
      {/* Hide grid background in print mode */}
      <div className="absolute inset-0 grid-3d-bg opacity-10 pointer-events-none print:hidden" />

      <div className="max-w-2xl w-full mx-auto px-4 relative z-10 print:px-0">
        
        {/* Navigation Action Back & Actions (hidden on print) */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link
            to="/members"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Registry
          </Link>
          {member && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCard}
                disabled={downloading}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 text-amber-400" />
                )}
                {downloading ? "Generating..." : "Download HD PNG"}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-4 print:hidden">
            <Loader2 className="h-10 w-10 text-amber-600 animate-spin mx-auto" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Compiling Identity Credentials...</p>
          </div>
        ) : error ? (
          <div className="bg-white border rounded-3xl p-8 text-center max-w-md mx-auto space-y-4 print:hidden shadow-lg">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-850">Identity Credentials Rejected</h3>
            <p className="text-xs text-slate-550 leading-relaxed">{error}</p>
            <Link
              to="/members"
              className="inline-flex bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-slate-800"
            >
              Return to Registry
            </Link>
          </div>
        ) : member ? (
          <div className="flex flex-col items-center gap-6">
            
            {/* 💳 High Precision Print Media CSS */}
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
                nav, footer, button, header, .print\\:hidden {
                  display: none !important;
                }
              }
            ` }} />

            {/* ID CARD CONTAINER */}
            <div
              id="vpm-id-card-print-target"
              ref={cardRef}
              className="w-full max-w-[400px] aspect-[1/1.58] bg-white border-2 border-slate-350 rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between p-6 relative select-none"
            >
              {/* Top Banner Gradient Background */}
              <div className="absolute top-0 left-0 right-0 h-[8px] bg-gradient-to-r from-amber-500 via-indigo-600 to-amber-400" />
              
              {/* Header Logo & Title */}
              <div className="flex items-center gap-2 border-b pb-4 mt-2">
                <img
                  src={Logo}
                  alt="VPM Logo"
                  crossOrigin="anonymous"
                  className="h-12 w-12 object-contain bg-white rounded-full p-0.5 border"
                />
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider leading-none">Vishwa Patrakar</h3>
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mt-1">Mahasangh</h4>
                  <p className="text-[7px] text-slate-500 uppercase tracking-wider mt-1 font-bold">Press Identity Credentials</p>
                </div>
              </div>

              {/* Body: Photo & Credentials */}
              <div className="flex-grow flex flex-col items-center justify-center py-3 space-y-3 min-h-0">
                
                {/* Photo container */}
                <div className="relative flex-shrink-0">
                  <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-md">
                    {member.photo ? (
                      <img
                        src={getUploadUrl(member.photo)}
                        alt={member.name}
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-bold text-slate-400 bg-slate-100">
                        Photo
                      </div>
                    )}
                  </div>
                  {/* Verified badge watermark */}
                  <div className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-1 border-2 border-white shadow-md">
                    <ShieldCheck className="h-4 w-4 fill-green-600" />
                  </div>
                </div>

                {/* Member Text Info */}
                <div className="text-center space-y-1 w-full px-2 overflow-visible">
                  <h2 className="text-base font-black text-slate-950 uppercase tracking-wide leading-snug py-0.5">
                    {member.name}
                  </h2>
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider leading-snug py-0.5">
                    {member.designation}
                  </p>
                  {member.organization && (
                    <p className="text-[10px] font-semibold text-slate-600 leading-snug">
                      {member.organization}
                    </p>
                  )}
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold pt-0.5">
                    {member.city}, {member.state}
                  </p>
                </div>
              </div>

              {/* Footer Panel: ID, Expiry & Verification QR */}
              <div className="border-t pt-4 flex justify-between items-center gap-4">
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest leading-none">Credential ID</span>
                    <p className="font-mono text-xs font-black text-slate-900 tracking-wider mt-0.5">{member.membershipId}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-[7px] text-slate-450 uppercase tracking-wider leading-none">Issue Date</span>
                      <p className="text-[8px] font-bold text-slate-700 mt-0.5">{formatDate(member.issueDate)}</p>
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-450 uppercase tracking-wider leading-none">Expiry Date</span>
                      <p className="text-[8px] font-bold text-slate-700 mt-0.5">{formatDate(member.expiryDate)}</p>
                    </div>
                  </div>
                </div>

                {/* QR Code leading to verification */}
                <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <QRCodeSVG value={verificationUrl} size={50} level="M" />
                </div>
              </div>
            </div>

            {/* Print Tips Info */}
            <p className="text-[10px] text-slate-500 text-center max-w-xs leading-relaxed print:hidden">
              <Calendar className="h-3.5 w-3.5 inline mr-1 text-amber-500" />
              Use <strong>"Download HD PNG"</strong> to save directly as image, or <strong>"Print / Save PDF"</strong> for physical printing.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

