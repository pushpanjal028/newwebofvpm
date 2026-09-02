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
  memberCard?: {
    pdfUrl: string;
  };
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
              <a
                href={member.memberCard && member.memberCard.pdfUrl ? getUploadUrl(member.memberCard.pdfUrl) : "#"}
                download={`VPMH_MemberCard_${member.membershipId}.pdf`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md"
              >
                <Download className="h-4 w-4" /> Official PDF
              </a>
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
            <div className="w-full max-w-[400px] h-[600px] bg-white border-2 border-slate-350 rounded-3xl shadow-2xl overflow-hidden relative">
              {member.memberCard && member.memberCard.pdfUrl ? (
                <iframe
                  src={getUploadUrl(member.memberCard.pdfUrl)}
                  className="w-full h-full border-none"
                  title="Official Member I-Card"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-50">
                  <AlertCircle className="h-10 w-10 text-slate-400 animate-pulse" />
                  <h4 className="font-extrabold text-slate-800 text-sm">PDF Card Not Found</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    The official I-Card PDF is either still generating or not available yet.
                  </p>
                </div>
              )}
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

