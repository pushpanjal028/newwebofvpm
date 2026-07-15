import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitContact } from "../api";

export default function Contact() {
  const [formData, setFormData] = useState({
    from_name: "",
    from_email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.from_name || !formData.from_email || !formData.message) {
      setError("Please fill in all fields before sending.");
      return;
    }

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await submitContact(formData);
      setSuccess("Your inquiry message has been submitted to the admin team. Thank you!");
      setFormData({
        from_name: "",
        from_email: "",
        message: "",
      });
    } catch (err: any) {
      console.error("❌ Contact submit error:", err);
      setError(err.message || "Failed to submit message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[90vh] grid md:grid-cols-2 bg-slate-50 dark:bg-[#030712] text-slate-700 dark:text-slate-300 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 grid-3d-bg opacity-10 pointer-events-none" />

      {/* LEFT SIDE: Info */}
      <div className="flex flex-col justify-center px-8 md:px-16 py-20 bg-slate-100/30 dark:bg-slate-950/40 relative z-10 border-r border-slate-200 dark:border-white/5 space-y-8 transition-colors duration-300">
        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-wide"
          >
            Get in Touch
          </motion.h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-md">
            Have any inquiries, collaboration propositions, or security report alerts? Direct your queries to our administrative panel.
          </p>
        </div>

        {/* Contact Info Pills */}
        <div className="space-y-4 max-w-sm">
          {[
            { icon: Mail, label: "Official Email", val: "info.vpm2006@gmail.com" },
            { icon: Phone, label: "Helpline Phone", val: "+91 6393287185" },
            { icon: MapPin, label: "Jurisdiction", val: "Delhi, India (Global)" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-4 p-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100/50 transition-colors shadow-sm"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{item.label}</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{item.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="space-y-3 pt-4">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Press Channels</p>
          <div className="flex gap-4 font-semibold text-sm">
            <a
              href="https://x.com/VMahasangh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-amber-500 hover:underline transition-all"
            >
              Twitter
            </a>
            <a
              href="https://www.facebook.com/vishwapatrakar.mahasangh.2025"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-amber-500 hover:underline transition-all"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/vishwapatrakarmahasangh/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-amber-500 hover:underline transition-all"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Form */}
      <div className="flex items-center justify-center px-6 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl backdrop-blur-md relative overflow-hidden transition-colors duration-300"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-600" />

          <h3 className="text-2xl font-black mb-6 text-center text-slate-900 tracking-wide">
            Send Message
          </h3>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-750 text-xs flex items-center space-x-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-650" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-850 text-xs flex items-center space-x-2"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <input
                type="text"
                name="from_name"
                placeholder="Your Name"
                value={formData.from_name}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <input
                type="email"
                name="from_email"
                placeholder="Your Email"
                value={formData.from_email}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] disabled:opacity-50 hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <span>{loading ? "Sending Message..." : "Send Message"}</span>
              {!loading && <Send className="h-4 w-4" />}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
