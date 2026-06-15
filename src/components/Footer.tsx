import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-slate-950/90 text-slate-600 dark:text-slate-300 mt-auto border-t border-slate-200/80 dark:border-white/10 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Organization Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent tracking-wide text-glow-gold">
              Vishwa Patrakar Mahasangh
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Empowering journalists, editors, and media professionals worldwide. Upholding democracy, truth, and press safety since 2006.
            </p>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white tracking-wide border-b border-slate-200 dark:border-white/10 pb-2">
              Contact Us
            </h4>
            <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-3 group">
                <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">info.vpm2006@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <Phone className="h-4 w-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">+91 6393287185</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white tracking-wide border-b border-slate-200 dark:border-white/10 pb-2">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-500 dark:text-slate-400">
              <a href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</a>
              <a href="/about" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">About Us</a>
              <a href="/gallery" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Gallery</a>
              <a href="/registration" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Register</a>
              <a href="/members" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Members</a>
              <a href="/news" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">News</a>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex space-x-6">
            <a
              href="https://www.facebook.com/vishwapatrakar.mahasangh.2025"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:scale-110 transition-all p-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5"
            >
              <FaFacebook size={20} />
            </a>

            <a
              href="https://www.instagram.com/vishwapatrakarmahasangh/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-pink-500 hover:scale-110 transition-all p-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5"
            >
              <FaInstagram size={20} />
            </a>

            <a
              href="https://x.com/VMahasangh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-sky-400 hover:scale-110 transition-all p-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5"
            >
              <FaTwitter size={20} />
            </a>
          </div>

          {/* Footer Bottom */}
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center sm:text-right">
            &copy; {new Date().getFullYear()} Vishwa Patrakar Mahasangh. All rights reserved. Registered Trust.
          </p>
        </div>
      </div>
    </footer>
  );
}
