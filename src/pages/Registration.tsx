// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { registerUser } from "../api";
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';


// interface FormData {
//   fullName: string;
//   email: string;
//   phone: string;
//   organization: string;
// }

// export default function Registration() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState<FormData>({
//     fullName: '',
//     email: '',
//     phone: '',
//     organization: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//   //   try {
//   //     const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register-member`;

//   //     const response = await fetch(apiUrl, {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //         'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
//   //       },
//   //       body: JSON.stringify(formData),
//   //     });

//   //     const data = await response.json();

//   //     if (!response.ok) {
//   //       throw new Error(data.error || 'Registration failed');
//   //     }

//   //     navigate(`/payment?memberId=${data.memberId}`);
//   //   } catch (err) {
//   //     setError(err instanceof Error ? err.message : 'An error occurred');
//   //     setLoading(false);
//   //   }
//   // };
//   const data = await registerUser({
//   name: formData.fullName,
//   email: formData.email,
//   password: 'default123', // jab tak aap password field add nahi karte
// });


//   return (
//     <div className="py-16 bg-gray-50">
//       <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white rounded-lg shadow-md p-8">
//           <h1 className="text-3xl font-bold mb-6 text-center">Member Registration</h1>
//           <p className="text-gray-600 text-center mb-8">
//             Join Vishwa Patrakar Mahasangh and become part of a global journalist community
//           </p>

//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Full Name *
//               </label>
//               <input
//                 type="text"
//                 name="fullName"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter your full name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address *
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="your.email@example.com"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Phone Number *
//               </label>
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="+91 1234567890"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Organization (Optional)
//               </label>
//               <input
//                 type="text"
//                 name="organization"
//                 value={formData.organization}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Your organization name"
//               />
//             </div>

//             <div className="bg-blue-50 p-4 rounded-lg">
//               <p className="text-sm text-gray-700">
//                 <strong>Membership Fee:</strong> ₹500 per year
//               </p>
//               <p className="text-xs text-gray-600 mt-1">
//                 You will be redirected to payment page after registration
//               </p>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//             >
//               {loading ? 'Processing...' : 'Proceed to Payment'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }


// new code ..........................................
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { registerUser } from "../api";

// interface FormData {
//   fullName: string;
//   email: string;
//   phone: string;
//   organization: string;
// }

// export default function Registration() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState<FormData>({
//     fullName: '',
//     email: '',
//     phone: '',
//     organization: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     // try {
//     //   const data = await registerUser({
//     //     name: formData.fullName,
//     //     email: formData.email,
//     //     password: 'default123',
//     //   });

//     //   // navigate(`/payment?memberId=${data.memberId}`);
//     //   alert("Registration successful!");
//     //   setLoading(false);
//     // } catch (err) {
//     //   setError(err instanceof Error ? err.message : 'An error occurred');
//     //   setLoading(false);
//     // }

//     try {
//   const response = await fetch("http://localhost:5000/api/auth/register", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       name: formData.fullName,
//       email: formData.email,
//       phone: formData.phone,
//       organization: formData.organization,
//       password: "default123",
//     }),
//   });

//   const data = await response.json();

//   if (response.ok) {
//     alert("✅ Registration successful!");
//     console.log("User saved:", data);
//     setFormData({ fullName: "", email: "", phone: "", organization: "" });
//   } else {
//     setError(data.message || "Registration failed");
//   }
// } catch (err) {
//   console.error("❌ Error:", err);
//   setError("Server not reachable");
// } finally {
//   setLoading(false);
// }

//   };

//   return (
//     <div className="py-16 bg-gray-50">
//       <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white rounded-lg shadow-md p-8">
//           <h1 className="text-3xl font-bold mb-6 text-center">Member Registration</h1>
//           <p className="text-gray-600 text-center mb-8">
//             Join Vishwa Patrakar Mahasangh and become part of a global journalist community
//           </p>

//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Full Name *
//               </label>
//               <input
//                 type="text"
//                 name="fullName"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter your full name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address *
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="your.email@example.com"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Phone Number *
//               </label>
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="+91 1234567890"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Organization (Optional)
//               </label>
//               <input
//                 type="text"
//                 name="organization"
//                 value={formData.organization}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Your organization name"
//               />
//             </div>
// {/* 
//             <div className="bg-blue-50 p-4 rounded-lg">
//               <p className="text-sm text-gray-700">
//                 <strong>Membership Fee:</strong> ₹500 per year
//               </p>
//               <p className="text-xs text-gray-600 mt-1">
//                 You will be redirected to payment page after registration
//               </p>
//             </div> */}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//             >
//               {/* {loading ? 'Processing...' : 'Proceed to Payment'} */}
//               {loading ? 'Processing...' : 'Register Now'}

//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";

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
          password: "default123",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Registration successful!");
        console.log("User saved:", data);
        setFormData({ fullName: "", email: "", phone: "", organization: "" });
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Member Registration
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Join Vishwa Patrakar Mahasangh and become part of a global journalist community
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91 1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization (Optional)
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your organization name"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : "Register Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
