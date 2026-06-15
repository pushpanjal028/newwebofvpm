import { useState } from "react";
import { UserPlus, User, Mail, Phone, Building, ShieldCheck, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
}

export default function Registration() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("https://vpmh.org/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          organization: formData.organization,
          password: "default123", // temporary password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          organization: "",
        });
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Server is currently unreachable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 grid-3d-bg opacity-15 pointer-events-none" />
      
      <div className="max-w-2xl w-full mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glassmorphism-card rounded-3xl p-8 md:p-10 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden bg-white dark:bg-slate-900/40"
        >
          {/* Glowing Accents */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400" />
          
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex p-3 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 text-amber-600 dark:text-amber-400 mb-2">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-wide">
              Member Registration
            </h1>
            <p className="text-slate-650 dark:text-slate-400 text-sm md:text-base max-w-md mx-auto">
              Join the Vishwa Patrakar Mahasangh and connect with our global media network.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-650 dark:text-red-400 text-sm flex items-center space-x-2"
              >
                <Info className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-650 dark:text-green-400 text-sm flex items-center space-x-2"
              >
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold text-green-700 dark:text-green-400">✅ Registration Successful!</p>
                  <p className="text-xs text-green-650 dark:text-green-400/80 mt-1">Our administrative assembly will verify your credentials shortly.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Full Name *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-amber-500 dark:group-focus-within:text-amber-400 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-amber-500 dark:group-focus-within:text-amber-400 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all text-sm"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Phone Number *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-amber-500 dark:group-focus-within:text-amber-400 transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all text-sm"
                  placeholder="+91 1234567890"
                />
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Organization / Publication (Optional)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-amber-500 dark:group-focus-within:text-amber-400 transition-colors">
                  <Building className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all text-sm"
                  placeholder="Your organization name"
                />
              </div>
            </div>

            {/* Verification Detail Box */}
            <div className="border border-slate-200 dark:border-white/10 bg-slate-100/40 dark:bg-slate-950/40 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Membership Fee & Verification
              </h3>
              
              <div className="text-xs text-slate-650 dark:text-slate-300 space-y-2 leading-relaxed">
                <p>
                  • Fee Standard: <strong className="text-slate-800 dark:text-white font-semibold">₹100 (One-Time Registration)</strong>
                </p>
                <p>
                  • Registration verification takes 24–48 hours. After validation, details and ID card generation procedures will be communicated to your phone/email.
                </p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  📞 Help Desk Support: +91-6393287185
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              {loading ? "Processing Credentials..." : "Register as Member"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
