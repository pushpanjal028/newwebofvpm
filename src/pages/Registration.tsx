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
      // 👉 IMPORTANT: Local backend URL
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
          password: "default123", // temporary password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Registration successful!");
        console.log("User saved:", data);

        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          organization: "",
        });
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

            <div className="mt-8 border border-gray-300 rounded-lg p-5 bg-gray-50">
  <h3 className="text-lg font-semibold mb-2">
    Membership Fee & Verification
  </h3>

  <p className="text-gray-700 mb-3">
    Membership Fee: <strong>₹100 (One Time)</strong>
  </p>

  <p className="text-sm text-gray-600 mb-3">
    After submitting the registration form, your details will be verified by
    by the organization. Payment instructions will be shared after verification.
  </p>

  <p className="text-sm font-medium text-gray-800">
    📞 For assistance: +91-639328185
  </p>

  <p className="text-xs text-gray-500 mt-2">
    Membership will be valid only after verification and fee confirmation.
  </p>
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



// import { useState } from "react";

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

// interface FormDataType {
//   fullName: string;
//   email: string;
//   phone: string;
//   organization: string;
//   photo: File | null;
// }

// export default function Registration() {
//   const [formData, setFormData] = useState<FormDataType>({
//     fullName: "",
//     email: "",
//     phone: "",
//     organization: "",
//     photo: null,
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // 🔹 Text input handler
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // 🔹 Image handler
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setFormData({ ...formData, photo: e.target.files[0] });
//     }
//   };

//   // 🔹 Submit + Payment
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       // 1️⃣ Create Razorpay order
//       const orderRes = await fetch("https://vpmh.org/api/auth/create-order", {
//         method: "POST",
//       });
//       const order = await orderRes.json();

//       if (!order.id) {
//         setError("Failed to initiate payment");
//         setLoading(false);
//         return;
//       }

//       // 2️⃣ Open Razorpay checkout
//       const options = {
//         key: "TEST10935919579713a804dc5a4014e691953901", // 🔴 replace with your Razorpay key
//         amount: order.amount,
//         currency: "INR",
//         name: "VPMH Membership",
//         description: "Membership Fee ₹99",
//         order_id: order.id,
//         handler: async function (response: any) {
//           try {
//             // 3️⃣ Send data to backend
//             const data = new FormData();
//             data.append("name", formData.fullName);
//             data.append("email", formData.email);
//             data.append("phone", formData.phone);
//             data.append("organization", formData.organization);
//             data.append("password", formData.phone); // simple default password

//             if (formData.photo) {
//               data.append("photo", formData.photo);
//             }

//             data.append("orderId", response.razorpay_order_id);
//             data.append("paymentId", response.razorpay_payment_id);
//             data.append("signature", response.razorpay_signature);

//             const verifyRes = await fetch(
//               "https://vpmh.org/api/auth/verify-payment",
//               {
//                 method: "POST",
//                 body: data,
//               }
//             );

//             const result = await verifyRes.json();

//             if (verifyRes.ok) {
//               alert("✅ Payment successful! Membership registered.");
//               setFormData({
//                 fullName: "",
//                 email: "",
//                 phone: "",
//                 organization: "",
//                 photo: null,
//               });
//             } else {
//               setError(result.message || "Payment verification failed");
//             }
//           } catch {
//             setError("Payment verification error");
//           }
//         },
//         theme: { color: "#2563eb" },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       setError("Server error. Try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="py-16 bg-gray-50">
//       <div className="max-w-2xl mx-auto px-4">
//         <div className="bg-white rounded-xl shadow-md p-8">
//           <h1 className="text-3xl font-bold text-center mb-4">
//             Member Registration
//           </h1>
//           <p className="text-center text-gray-600 mb-8">
//             Join Vishwa Patrakar Mahasangh – Membership Fee ₹99
//           </p>

//           {error && (
//             <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <input
//               type="text"
//               name="fullName"
//               placeholder="Full Name"
//               required
//               value={formData.fullName}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border rounded"
//             />

//             <input
//               type="email"
//               name="email"
//               placeholder="Email Address"
//               required
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border rounded"
//             />

//             <input
//               type="tel"
//               name="phone"
//               placeholder="Phone Number"
//               required
//               value={formData.phone}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border rounded"
//             />

//             <input
//               type="text"
//               name="organization"
//               placeholder="Organization (optional)"
//               value={formData.organization}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border rounded"
//             />

//             <div>
//               <label className="block mb-1 text-sm font-medium">
//                 Profile Photo *
//               </label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 required
//                 onChange={handleImageChange}
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
//             >
//               {loading ? "Processing..." : "Pay ₹99 & Register"}
//             </button>
//             <p className="text-sm text-center text-gray-500 mt-2">
//   Pay securely using UPI (Google Pay, PhonePe, Paytm) or Card
// </p>

//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
