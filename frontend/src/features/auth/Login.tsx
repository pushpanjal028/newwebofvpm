import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Key, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser } from "../../api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("vpm_token");
    const user = localStorage.getItem("vpm_user");
    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.isAdmin) {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } catch {
        localStorage.clear();
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await loginUser({ email, password });
      
      // Dispatch a storage event to update the Navbar dynamically
      window.dispatchEvent(new Event("storage"));

      if (data.user?.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("❌ Authentication error:", err);
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-24 bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 grid-3d-bg opacity-15 pointer-events-none" />

      <div className="max-w-md w-full mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glassmorphism-card rounded-3xl p-8 border border-slate-200 shadow-2xl relative overflow-hidden bg-white/95"
        >
          {/* Glowing Top Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-600" />

          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex p-3 rounded-full bg-slate-900/5 border border-slate-200 text-slate-700 mb-1">
              <Lock className="h-6 w-6 text-amber-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-wide">
              VPMH Sign In
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Access your journalist dashboard or administrator panel.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-750 text-xs flex items-center space-x-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-655" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-505 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs"
                  placeholder="name@organization.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-505 transition-colors">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-3 rounded-xl font-bold text-xs tracking-wider transition-all disabled:opacity-50 hover:scale-[1.01] flex items-center justify-center gap-1.5 shadow-md mt-6"
            >
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1 mt-6 text-[10px] text-slate-400 border-t pt-4">
            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
            <span>Vishwa Patrakar Mahasangh Secure Sign In</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
