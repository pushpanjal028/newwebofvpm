import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Mail, Home, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

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
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-500 to-emerald-400" />

          <div className="inline-flex p-4 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-6">
            <CheckCircle className="h-16 w-16" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-wide">
            Registration Successful!
          </h1>
          <p className="text-slate-400 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
            Thank you for joining Vishwa Patrakar Mahasangh. Your verification has been initiated.
          </p>

          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-6 mb-8 text-left space-y-3">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-amber-400 mr-3 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white mb-1">
                  Confirmation Details
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  An administrative notification with registration steps has been shared. Please verify your messages/emails for updates.
                </p>
              </div>
            </div>
            {sessionId && (
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-white/5 pt-3 mt-3">
                Transaction Token: {sessionId}
              </p>
            )}
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold text-white text-sm mb-3 uppercase tracking-wider text-amber-400">What's Next?</h3>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-start">
                <span className="text-amber-400 mr-2">•</span>
                <span>Check email/SMS for official administrative verification details</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-400 mr-2">•</span>
                <span>Access member support channels and directory resources</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-400 mr-2">•</span>
                <span>Engage with state executives and join national forums</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Link>
            <Link
              to="/members"
              className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white border border-white/10 px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02]"
            >
              <Users className="h-4 w-4 mr-2" />
              View Members
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
