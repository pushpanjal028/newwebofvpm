import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Globe, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUploadUrl } from "../../api";
import Logo from "../../assets/logo perfect.png";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const checkLoginStatus = () => {
    const token = localStorage.getItem("vpm_token");
    const user = localStorage.getItem("vpm_user");
    if (token && user) {
      try {
        setIsLoggedIn(true);
        setUserProfile(JSON.parse(user));
      } catch {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    
    // Setup listener to respond to other login changes dynamically
    const handleStorageChange = () => {
      checkLoginStatus();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [location.pathname]);

  // Force Light Mode
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      const element = document.getElementById("google_translate_element");
      if (element) element.innerHTML = "";
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages:
              "en,hi,fr,es,de,it,zh-CN,ja,ru,ar,ko,pt,tr,ta,ml,te,bn,pa,gu,mr,ur,vi",
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      }
    };

    if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    } else {
      if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement("script");
        script.src =
          "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vpm_token");
    localStorage.removeItem("vpm_user");
    setIsLoggedIn(false);
    setUserProfile(null);
    setIsDropdownOpen(false);
    navigate("/");
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/gallery", label: "Gallery" },
    { path: "/registration", label: "Registration" },
    { path: "/members", label: "Members" },
    { path: "/news", label: "News" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-slate-200/80 ${
        scrolled ? "shadow-md py-1" : "shadow-sm py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to="/"
            id="navbar-logo-link"
            className="flex items-center space-x-2 sm:space-x-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full group-hover:bg-blue-500/35 transition-colors"></div>
              <img
                src={Logo}
                alt="VPM Logo"
                className="relative h-10 md:h-12 w-auto object-contain rounded-full border border-slate-200/50 bg-white p-0.5"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm md:text-lg font-bold tracking-wider leading-tight">
                Vishwa Patrakar <span className="text-amber-600">Mahasangh</span>
              </span>
              <span className="hidden md:block text-[9px] uppercase tracking-widest text-slate-500 font-semibold group-hover:text-amber-500/80 transition-colors leading-none mt-0.5">
                (Global organization of journalists)
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-2.5 py-1.5 text-xs font-bold tracking-wide transition-all rounded-lg ${
                  isActive(link.path)
                    ? "text-amber-600 bg-slate-900/5 border border-slate-200/80 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                    : "text-slate-655 hover:text-slate-950 hover:bg-slate-900/5"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Profile Dropdown or Login */}
            {isLoggedIn && userProfile ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full border hover:border-amber-400 bg-slate-50 hover:bg-white transition-all focus:outline-none"
                >
                  <div className="h-7 w-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden">
                    {userProfile.photo ? (
                      <img src={getUploadUrl(userProfile.photo)} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      userProfile.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-500 mr-1" />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      {/* Click outside overlay */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b bg-slate-50/50">
                          <p className="text-xs font-bold text-slate-900 truncate">{userProfile.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono truncate">{userProfile.email}</p>
                        </div>
                        <div className="py-1">
                          {userProfile.isAdmin ? (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                            >
                              Admin Dashboard
                            </Link>
                          ) : (
                            <Link
                              to="/dashboard"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                            >
                              My Dashboard
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full text-left flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-650 hover:bg-red-50 hover:text-red-750"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className={`px-3 py-1.5 text-xs font-bold tracking-wide transition-all rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 ml-2 shadow-[0_2px_8px_rgba(245,158,11,0.2)]`}
              >
                Sign In
              </Link>
            )}

            {/* Google Translate Wrapper */}
            <div className="google-translate-wrapper flex items-center space-x-1.5 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5 shadow-inner scale-90 ml-1">
              <Globe className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <div id="google_translate_element"></div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-1.5">
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
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-200 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-3 pt-2 pb-5 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                    isActive(link.path)
                      ? "bg-amber-500/10 text-amber-600 border-l-4 border-amber-500"
                      : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-950"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isLoggedIn && userProfile ? (
                <div className="border-t border-slate-200 mt-2 pt-2 space-y-1">
                  <p className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Connected: {userProfile.name}
                  </p>
                  {userProfile.isAdmin ? (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-900/5"
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-900/5"
                    >
                      My Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold text-red-650 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-bold bg-amber-500 text-slate-950 text-center tracking-wide`}
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
