// import { Link, useLocation } from 'react-router-dom';
// import { Menu, X } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import Logo from '../assests/logo perfect.png';
// import bg from '../assests/bg .jpg';

// // ✅ Declare Google's global object for TypeScript
// declare global {
//   interface Window {
//     googleTranslateElementInit: () => void;
//     google: any;
//   }
// }

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const location = useLocation();

//   const navLinks = [
//     { path: '/', label: 'Home' },
//     { path: '/about', label: 'About' },
//     { path: '/gallery', label: 'Gallery' },
//     { path: '/registration', label: 'Registration' },
//     { path: '/members', label: 'Members' },
//   ];

//   const isActive = (path: string) => location.pathname === path;

//   // 🌍 Google Translate Setup (fixed)
//   useEffect(() => {
//     // Load script only once
//     if (!document.querySelector('script[src*="translate.google.com"]')) {
//       const script = document.createElement('script');
//       script.src =
//         '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
//       document.body.appendChild(script);
//     }

//     // Define init function once
//     if (!window.googleTranslateElementInit) {
//       window.googleTranslateElementInit = () => {
//         const element = document.getElementById('google_translate_element');
//         if (element) element.innerHTML = ''; // Clear duplicates

//         if (window.google && window.google.translate) {
//           new window.google.translate.TranslateElement(
//             {
//               pageLanguage: 'en',
//               includedLanguages:
//                 'en,hi,fr,es,de,it,zh-CN,ja,ru,ar,ko,pt,tr,ta,ml,te,bn,pa,gu,mr,ur,vi',
//               layout:
//                 window.google.translate.TranslateElement.InlineLayout.SIMPLE,
//             },
//             'google_translate_element'
//           );
//         }
//       };
//     }
//   }, []);

//   return (
//     <nav className="bg-white shadow-lg sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16 items-center">
//           {/* 📰 Logo */}
//           <Link to="/" className="flex items-center space-x-2">
//             <img src={Logo} alt="VPM Logo" className="h-12 md:h-16 w-auto" />
//             <span className="text-xl font-bold text-gray-900">
//               Vishwa Patrakar Mahasangh
//             </span>
//           </Link>

//           {/* 💻 Desktop Menu */}
//           <div className="hidden md:flex items-center space-x-6">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.path}
//                 to={link.path}
//                 className={`${
//                   isActive(link.path)
//                     ? 'text-blue-600 border-b-2 border-blue-600'
//                     : 'text-gray-700 hover:text-blue-600'
//                 } px-3 py-2 text-sm font-medium transition-colors`}
//               >
//                 {link.label}
//               </Link>
//             ))}

//             {/* 🌍 Google Translate */}
//             <div id="google_translate_element" className="ml-4"></div>
//           </div>

//           {/* 📱 Mobile Menu Button */}
//           <div className="md:hidden flex items-center">
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="text-gray-700 hover:text-blue-600"
//             >
//               {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* 📱 Mobile Dropdown */}
//       {isOpen && (
//         <div className="md:hidden bg-white border-t">
//           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.path}
//                 to={link.path}
//                 onClick={() => setIsOpen(false)}
//                 className={`${
//                   isActive(link.path)
//                     ? 'bg-blue-50 text-blue-600'
//                     : 'text-gray-700 hover:bg-gray-50'
//                 } block px-3 py-2 rounded-md text-base font-medium`}
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }


import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/registration', label: 'Registration' },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.src =
        '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    }

    if (!window.googleTranslateElementInit) {
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
    }
  }, []);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* 📰 Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={Logo} alt="VPM Logo" className="h-12 md:h-16 w-auto" />
            <span className="text-xl font-bold text-gray-900">
              Vishwa Patrakar Mahasangh

              <span className="hidden md:block text-xs text-gray-600">
                (Global organization of journalists)
              </span>

            </span>
          </Link>

          {/* 💻 Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 relative">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${isActive(link.path)
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                  } px-3 py-2 text-sm font-medium transition-colors`}
              >
                {link.label}
              </Link>
            ))}

            {/* 👥 Members Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium ${location.pathname.includes('/members') ||
                    location.pathname.includes('/news')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                  }`}
              >
                <span>Members</span>
                <ChevronDown
                  className={`h-4 w-4 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                  <Link
                    to="/members"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    Member List
                  </Link>
                  <Link
                    to="/news"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    News
                  </Link>
                </div>
              )}
            </div>

            {/* 🌍 Google Translate */}
            <div id="google_translate_element" className="ml-4"></div>
          </div>

          {/* 📱 Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 📱 Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`${isActive(link.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                  } block px-3 py-2 rounded-md text-base font-medium`}
              >
                {link.label}
              </Link>
            ))}

            {/* 📱 Members Dropdown in Mobile */}
            <details className="px-3 py-2">
              <summary className="text-gray-700 font-medium cursor-pointer">
                Members
              </summary>
              <div className="ml-4 mt-1 space-y-1">
                <Link
                  to="/members"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 hover:text-blue-600"
                >
                  Presedent
                </Link>
                <Link
                  to="/news"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 hover:text-blue-600"
                >
                  News
                </Link>
              </div>
            </details>
          </div>
        </div>
      )}
    </nav>
  );
}
