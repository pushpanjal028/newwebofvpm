import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../assests/logo perfect.png';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/registration', label: 'Registration' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Force Light Mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      const element = document.getElementById('google_translate_element');
      if (element) element.innerHTML = '';
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages:
              'en,hi,fr,es,de,it,zh-CN,ja,ru,ar,ko,pt,tr,ta,ml,te,bn,pa,gu,mr,ur,vi',
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
      }
    };

    if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    } else {
      if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement('script');
        script.src =
          'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);
      }
    }
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-slate-200/80 ${
        scrolled 
          ? 'shadow-md py-2' 
          : 'shadow-sm py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" id="navbar-logo-link" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full group-hover:bg-blue-500/35 transition-colors"></div>
              <img 
                src={Logo} 
                alt="VPM Logo" 
                className="relative h-10 md:h-14 w-auto object-contain rounded-full border border-slate-200/50 bg-white p-0.5" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base md:text-xl font-bold tracking-wider">
                Vishwa Patrakar <span className="text-amber-600">Mahasangh</span>
              </span>
              <span className="hidden md:block text-[10px] uppercase tracking-widest text-slate-500 font-semibold group-hover:text-amber-500/80 transition-colors">
                (Global organization of journalists)
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`desktop-nav-link relative px-4 py-2 text-sm font-semibold tracking-wide transition-all rounded-lg ${
                  isActive(link.path)
                    ? 'text-amber-600 bg-slate-900/5 border border-slate-200/80 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-900/5'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div 
                    layoutId="activeNavBorder"
                    className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_8px_#f59e0b]"
                  />
                )}
              </Link>
            ))}

            {/* Members Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                className={`desktop-nav-link flex items-center space-x-1 px-4 py-2 text-sm font-semibold tracking-wide rounded-lg transition-all ${
                  location.pathname.includes('/members') || location.pathname.includes('/news')
                    ? 'text-amber-600 bg-slate-900/5 border border-slate-200/80 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-900/5'
                }`}
              >
                <span>Members</span>
                <ChevronDown
                  className={`h-4 w-4 transform transition-transform duration-300 ${
                    isDropdownOpen ? 'rotate-180 text-amber-500' : 'text-slate-400'
                  }`}
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
                  >
                    <div className="py-1.5">
                      <Link
                        to="/members"
                        className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-900/5 transition-all"
                      >
                        Member List
                      </Link>
                      <Link
                        to="/news"
                        className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-900/5 transition-all"
                      >
                        Latest News
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Google Translate Wrapper */}
            <div className="google-translate-wrapper flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 shadow-inner">
              <Globe className="h-4 w-4 text-amber-500 animate-pulse" />
              <div id="google_translate_element"></div>
            </div>

          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">

            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5 shadow-inner scale-90">
              <div id="google_translate_element"></div>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="mobile-menu-btn text-slate-600 hover:text-amber-500 hover:bg-slate-900/5 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-3 pt-2 pb-5 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold tracking-wide transition-all ${
                    isActive(link.path)
                      ? 'bg-amber-500/10 text-amber-600 border-l-4 border-amber-500'
                      : 'text-slate-600 hover:bg-slate-900/5 hover:text-slate-950'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Members Section in Mobile */}
              <div className="border-t border-slate-200 mt-2 pt-2">
                <p className="px-4 py-2 text-xs uppercase tracking-widest text-slate-400 font-bold">Members Area</p>
                <Link
                  to="/members"
                  onClick={() => setIsOpen(false)}
                  className="block px-6 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-900/5 hover:text-slate-950"
                >
                  Member List
                </Link>
                <Link
                  to="/news"
                  onClick={() => setIsOpen(false)}
                  className="block px-6 py-2.5 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-900/5 hover:text-slate-950"
                >
                  News & Channel
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
