import { useRef, useState } from "react";
import emailjs from "emailjs-com";

export default function Contact() {
    const formRef = useRef<HTMLFormElement>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const sendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        emailjs.sendForm(
            "service_h6ju2so",
            "template_4dcnypu",
            formRef.current!,
            "Le471sUFHf05NAm5U"

        )
            .then(
                () => {
                    setSuccess("Message sent successfully!");
                    setLoading(false);
                    formRef.current?.reset();
                },
                (error) => {
                    console.error("EMAILJS ERROR:", error);
                    setSuccess("Something went wrong. Try again.");
                    setLoading(false);
                }
            );

    };

   return (
    <section className="min-h-screen grid md:grid-cols-2 bg-gray-100 text-gray-800">
      
      {/* LEFT SIDE */}
      <div className="flex flex-col justify-center px-10 py-16 bg-gray-200">
        
        <h2 className="text-4xl font-bold mb-4 text-gray-900">
          Get in Touch
        </h2>

        <p className="text-gray-600 mb-8">
          have any questions or want to collaborate? We'd love to hear from you! Fill out the form, and we'll get back to you as soon as possible.
        </p>

        {/* Contact Info */}
        <div className="space-y-4 text-gray-700">
          <p>📧 Email: info.vpm2006@gmail.com</p>
          <p>📞 Phone: +91 6393287185</p>
          <p>📍 Location: India</p>
        </div>

        {/* Social Links */}
        <div className="flex gap-4 mt-8 font-medium">
          <a href="https://x.com/VMahasangh" className="hover:text-gray-900">Twitter</a>
          <a href="https://www.facebook.com/vishwapatrakar.mahasangh.2025" className="hover:text-gray-900">Facebook</a>
          <a href="https://www.instagram.com/vishwapatrakarmahasangh/" className="hover:text-gray-900">Instagram</a>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center px-6 py-12">
        
        <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-lg">
          
          <h3 className="text-2xl font-semibold mb-6 text-center text-gray-900">
            Send a Message
          </h3>

          <form ref={formRef} onSubmit={sendEmail} className="space-y-4">
            
            <input
              type="text"
              name="from_name"
              placeholder="Your Name"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />

            <input
              type="email"
              name="from_email"
              placeholder="Your Email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows={4}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

            {success && (
              <p className="text-center text-sm mt-2 text-green-600">
                {success}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
