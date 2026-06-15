import { Link } from 'react-router-dom';
import { XCircle, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Cancel() {
  return (
    <div className="py-20 bg-[#030712] min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 grid-3d-bg opacity-15 pointer-events-none" />
      
      <div className="max-w-2xl w-full mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glassmorphism-card rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 to-rose-400" />

          <div className="inline-flex p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
            <XCircle className="h-16 w-16" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-wide">
            Registration Cancelled
          </h1>
          <p className="text-slate-400 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
            Your verification or registration process was suspended. No changes have been applied to your membership status.
          </p>

          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-6 mb-8 text-left space-y-3">
            <h3 className="font-bold text-white text-sm mb-1 uppercase tracking-wider text-amber-400">What Happened?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The transaction session was closed, or there was a system interruption. Your data remains unverified and inactive.
            </p>
            <p className="text-xs text-slate-300 border-t border-white/5 pt-3 mt-3">
              If this was an error, please reach our helpline team at:{" "}
              <a href="mailto:info.vpm2006@gmail.com" className="text-amber-400 hover:underline">
                info.vpm2006@gmail.com
              </a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/registration"
              className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Try Again
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white border border-white/10 px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02]"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
