import { useRef, useState } from "react";
import emailjs from "emailjs-com";
import { Mail, Phone, MapPin, Send, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    emailjs.sendForm(
      "service_h6ju2so",
      "template_4dcnypu",
      formRef.current!,
      "Le471sUFHf05NAm5U"
    )
    .then(
      () => {
        setSuccess("Your message has been sent successfully!");
        setLoading(false);
        formRef.current?.reset();
      },
      (error) => {
        console.error("EMAILJS ERROR:", error);
        setSuccess("Something went wrong. Please try again directly.");
        setLoading(false);
      }
    );
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
            className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-wide text-glow-gold"
          >
            Get in Touch
          </motion.h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-md">
            Have any inquiries, collaboration propositions, or security report alerts? Direct your queries to our administrative panel.
          </p>
        </div>

        {/* Contact Info Pills */}
        <div className="space-y-4 max-w-sm">
          {[
            { icon: Mail, label: "Official Email", val: "info.vpm2006@gmail.com" },
            { icon: Phone, label: "Helpline Phone", val: "+91 6393287185" },
            { icon: MapPin, label: "Jurisdiction", val: "Delhi, India (Global)" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none">
              <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 text-amber-600 dark:text-amber-400">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{item.label}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{item.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="space-y-3 pt-4">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Press Channels</p>
          <div className="flex gap-4 font-semibold text-sm">
            <a href="https://x.com/VMahasangh" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition-all">Twitter</a>
            <a href="https://www.facebook.com/vishwapatrakar.mahasangh.2025" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition-all">Facebook</a>
            <a href="https://www.instagram.com/vishwapatrakarmahasangh/" target="_blank" rel="noopener noreferrer" className="text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition-all">Instagram</a>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Form */}
      <div className="flex items-center justify-center px-6 py-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-xl dark:shadow-2xl backdrop-blur-md relative overflow-hidden transition-colors duration-300"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-600" />
          
          <h3 className="text-2xl font-extrabold mb-6 text-center text-slate-900 dark:text-white tracking-wide">
            Send Message
          </h3>

          <form ref={formRef} onSubmit={sendEmail} className="space-y-5">
            <div className="space-y-1.5">
              <input
                type="text"
                name="from_name"
                placeholder="Your Name"
                required
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <input
                type="email"
                name="from_email"
                placeholder="Your Email"
                required
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                required
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all text-sm"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] disabled:opacity-50 hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <span>{loading ? "Sending..." : "Send Message"}</span>
              {!loading && <Send className="h-4 w-4" />}
            </button>

            {success && (
              <div className="p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-center text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center justify-center gap-1.5">
                <Info className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
