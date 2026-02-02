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
        <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h2 className="text-3xl font-bold text-center mb-6">Contact Us</h2>

                <form ref={formRef} onSubmit={sendEmail} className="space-y-4">
                    <input
                        type="text"
                        name="from_name"
                        placeholder="Your Name"
                        required
                        className="w-full border px-4 py-2 rounded"
                    />

                    <input
                        type="email"
                        name="from_email"
                        placeholder="Your Email"
                        required
                        className="w-full border px-4 py-2 rounded"
                    />

                    <textarea
                        name="message"
                        placeholder="Your Message"
                        rows={4}
                        required
                        className="w-full border px-4 py-2 rounded"
                    ></textarea>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>

                    {success && (
                        <p className="text-center text-green-600 text-sm">{success}</p>
                    )}
                </form>
            </div>
        </section>
    );
}
