import React, { useState } from "react";
import { Heart, Target, Eye, ChevronDown, Calendar, ShieldCheck, Landmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Tilt from "../components/Tilt";

export default function About() {
  const [openCard, setOpenCard] = useState<string | null>(null);

  const toggleCard = (card: string) => {
    setOpenCard(openCard === card ? null : card);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="py-20 bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 grid-3d-bg opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Heading Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20 space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 dark:from-white dark:via-slate-200 dark:to-amber-400 bg-clip-text text-transparent text-glow-gold">
            About Us
          </h1>
          <p className="text-amber-600 dark:text-amber-400/80 font-bold uppercase tracking-widest text-sm">
            World Federation of Journalists – Vishwa Patrkar Mahasangh
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded-full shadow-md" />
        </motion.div>

        {/* Core Profile Box */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto glassmorphism-card rounded-3xl p-8 md:p-12 mb-20 relative overflow-hidden group border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-500 to-blue-500" />
          
          <div className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed space-y-6 text-left">
            <p>
              <strong className="text-slate-900 dark:text-white">Vishwapatrkar Mahasangh</strong> was founded with a complete and unwavering commitment to organize, regulate, discipline, unite, educate, and train the information sector of India—recognized as the <strong className="text-amber-600 dark:text-amber-400">Fourth Pillar of Democracy</strong>—along with all information professionals and the entire media ecosystem.
            </p>

            <p>
              The Mahasangh is dedicated to the <strong className="text-slate-900 dark:text-white">welfare of journalists</strong>, their health and economic empowerment, the protection of journalists’ fundamental rights, the freedom of the press, and the physical safety, dignity, and social justice of journalists in every respect.
            </p>

            <p>
              Established in <strong className="text-slate-900 dark:text-white">2006</strong> on the sacred land of <strong className="text-amber-600 dark:text-amber-400">Tirthraj Prayagraj (India)</strong>—the world-renowned confluence of the holy rivers Ganga, Yamuna, and Saraswati. From this spiritually significant birthplace, the organization emerged with a global vision. The working jurisdiction of the Vishwapatrkar Mahasangh extends across the entire world.
            </p>

            <p>
              The Vishwapatrkar Mahasangh stands as the powerful voice of information professionals of all nations. The federation is registered under the Indian Constitution and the Trust Act and may be referred to as the <strong className="text-slate-900 dark:text-white">“Vishwapatrkar Mahasangh Trust of India.”</strong>
            </p>

            {/* Divider */}
            <hr className="my-8 border-slate-200 dark:border-white/10" />

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                Key Committees & Forums
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm font-medium text-slate-700 dark:text-slate-300 pt-2">
                {[
                  "Central Executive Assembly",
                  "State Executive Assemblies",
                  "Senior Journalists Forum",
                  "Awarded & Disciplinary Cell",
                  "Youth Journalists Front",
                  "Women Journalists Front",
                  "National Urdu Media Org",
                  "International Media Org",
                  "Legal Advisory Committee",
                  "Senior Citizens Advisory",
                  "Civil Rights Forum",
                  "International Press Club"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 hover:bg-slate-100/50 dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Goal, Mission, Values Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          {/* Goal */}
          <Tilt>
            <motion.div 
              variants={itemVariants}
              className="glassmorphism-card p-8 rounded-2xl h-full flex flex-col justify-between group border border-slate-200 dark:border-white/10"
            >
              <div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform">
                  <Eye className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Our Goal</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  To create a world where journalism thrives as an independent, secure, and respected pillar of democracy, truth, and social justice.
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => toggleCard("vision")}
                  className="flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 gap-1 transition-colors"
                >
                  {openCard === "vision" ? "Hide Details" : "Learn More"}
                  <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${openCard === "vision" ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {openCard === "vision" && (
                    <motion.p 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-slate-500 dark:text-slate-400 text-xs mt-3 leading-relaxed border-t border-slate-200 dark:border-white/5 pt-3 overflow-hidden"
                    >
                      Building an injustice-free society by empowering ground correspondents, enabling legal frameworks, and holding institutions accountable globally.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </Tilt>

          {/* Mission */}
          <Tilt>
            <motion.div 
              variants={itemVariants}
              className="glassmorphism-card p-8 rounded-2xl h-full flex flex-col justify-between group border border-slate-200 dark:border-white/10"
            >
              <div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-6 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Our Mission</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Uniting journalists worldwide into a single inclusive federation to safeguard their security, fundamental rights, and welfare.
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => toggleCard("mission")}
                  className="flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 gap-1 transition-colors"
                >
                  {openCard === "mission" ? "Hide Details" : "Learn More"}
                  <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${openCard === "mission" ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {openCard === "mission" && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-slate-505 dark:text-slate-400 text-xs mt-3 space-y-2 border-t border-slate-200 dark:border-white/5 pt-3 overflow-hidden"
                    >
                      <p>• Provide global credentials and official status.</p>
                      <p>• Struggle for legal defense, insurance support, and family aid plans.</p>
                      <p>• Establish research centers, libraries, and welfare institutes.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </Tilt>

          {/* Values */}
          <Tilt>
            <motion.div 
              variants={itemVariants}
              className="glassmorphism-card p-8 rounded-2xl h-full flex flex-col justify-between group border border-slate-200 dark:border-white/10"
            >
              <div>
                <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="h-6 w-6 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Our Values</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Upholding raw truth, legal transparency, absolute press independence, mutual solidarity, and unyielding social accountability.
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => toggleCard("values")}
                  className="flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 gap-1 transition-colors"
                >
                  {openCard === "values" ? "Hide Details" : "Learn More"}
                  <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${openCard === "values" ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {openCard === "values" && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-slate-505 dark:text-slate-400 text-xs mt-3 space-y-2 border-t border-slate-200 dark:border-white/5 pt-3 overflow-hidden"
                    >
                      <p>• <strong>Truth:</strong> Journalism without corporate or political sway.</p>
                      <p>• <strong>Safety:</strong> Protecting ground correspondents in risk zones.</p>
                      <p>• <strong>Solidarity:</strong> Standing united across countries.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </Tilt>
        </motion.div>

        {/* Our Story Timeline */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glassmorphism-card rounded-3xl p-8 md:p-12 mb-20 border border-slate-200 dark:border-white/10"
        >
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Our Story
          </h2>
          <div className="space-y-6 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
            <p>
              Vishwapatrkar Mahasangh was founded with a deep understanding that journalism is the foundation of democracy and that journalists across the world often work under risk, pressure, and injustice while serving society with truth.
            </p>
            <p>
              Across countries and cultures, journalists—whether from print, electronic, or digital media—have faced challenges such as lack of security, recognition, legal protection, and unity. Vishwapatrkar Mahasangh was established to bring all journalists onto a single global platform, giving them identity, strength, and a collective voice.
            </p>
            <p>
              The Mahasangh began by organizing journalists worldwide, enrolling them into the federation and providing official identification and recognition. It expanded to include media owners, editors, publishers, printers, photographers, writers, and media representatives, strengthening the federation and making it a truly inclusive organization.
            </p>
            <p>
              A core pillar of the Mahasangh is the safety and welfare of journalists. The federation actively struggles for journalist security, legal support, insurance, education for families, and dignified living conditions. Whenever journalists face oppression, injustice, or human rights violations, Vishwapatrkar Mahasangh stands with them—offering legal assistance, advocacy, and support in High Courts and the Supreme Court.
            </p>
          </div>
        </motion.div>

        {/* Core Services Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white flex items-center justify-center gap-3">
            <ShieldCheck className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            What We Offer
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Advanced Media Training", desc: "Workshops and certifications covering modern investigative practices, cybersecurity, and digital reporting tools." },
              { title: "Global Network Forums", desc: "Connect with foreign editors, press councils, publishers, and legal experts on global scales." },
              { title: "Legal & Advocacy Cell", desc: "Comprehensive legal representation in local and supreme courts against editorial suppression." },
              { title: "Trust Resource Library", desc: "Access to verified press archives, safety protocols, investigative research, and standard style guides." }
            ].map((srv, idx) => (
              <div key={idx} className="glassmorphism-card rounded-2xl p-6 border-l-4 border-amber-500 border border-slate-200 dark:border-white/5 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{srv.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
