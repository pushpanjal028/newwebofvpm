import { Link } from 'react-router-dom';
import { Users, Award, Globe, ArrowRight, Play, BookOpen, ShieldAlert, X, Youtube, Loader2 } from 'lucide-react';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import chairmanImg from "../assests/leadership/chairman.jpeg";
import trusteeImg from "../assests/leadership/geeta.png";
import meetingImg from "../assests/activity/meeting.jpeg";
import trainingImg from "../assests/activity/training.jpeg";
import pressmeetImg from "../assests/activity/pressmeet.jpeg";
import fieldworkImg from "../assests/activity/fieldwork.jpeg";
import Contact from "../pages/contact";
import OurActivities from "../pages/OurActivity";
import Tilt from "../components/Tilt";
import GlobeCanvas from "../components/GlobeCanvas";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "AIzaSyB6Y1I4Er3OwxcPptHjgdfiR1kbojfS_9U";
    const CHANNEL_ID = "UCRqJl-zz5ms9ChNewecmrjw";
    const API_URL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&type=video&order=date&maxResults=3`;

    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          const formattedVideos = data.items.map((item: any) => ({
            id: item.id?.videoId || item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            url: `https://www.youtube.com/watch?v=${item.id?.videoId || item.id}`,
          }));
          setVideos(formattedVideos);
        }
        setLoadingVideos(false);
      })
      .catch((err) => {
        console.error("Error fetching homepage videos:", err);
        setLoadingVideos(false);
      });
  }, []);

  return (
    <div className="overflow-hidden bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 px-4 md:px-8 border-b border-slate-200/80 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-slate-50/90 to-slate-50 dark:from-[#030712]/60 dark:via-[#030712]/90 dark:to-[#030712]" />

        {/* 3D Isometric Grid Overlay */}
        <div className="absolute inset-0 grid-3d-bg opacity-30" />

        {/* 3D Rotating Globe Background */}
        <GlobeCanvas />

        {/* Floating 3D Geometric Elements */}
        <div 
          className="absolute top-1/4 left-[8%] w-20 h-20 bg-gradient-to-tr from-blue-500/10 to-indigo-500/5 border border-slate-200 dark:border-white/10 rounded-2xl animate-float-slow backdrop-blur-[2px] hidden md:block" 
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(25deg) rotateY(25deg)' }}
        />
        <div 
          className="absolute bottom-1/4 right-[10%] w-28 h-28 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-slate-200 dark:border-white/10 rounded-full animate-float-delayed backdrop-blur-[2px] hidden md:block"
        />
        <div 
          className="absolute top-1/3 right-[15%] w-14 h-14 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/5 border border-slate-200 dark:border-white/10 rotate-12 animate-float-slow backdrop-blur-[2px] hidden md:block"
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-20deg) rotateY(30deg) translateZ(20px)' }}
        />

        <div className="relative max-w-5xl mx-auto text-center z-10 space-y-8 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center space-x-2 bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 backdrop-blur-md shadow-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
            <span>Serving Journalism Worldwide</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white"
          >
            Welcome to <br />
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 dark:from-white dark:via-slate-100 dark:to-amber-400 bg-clip-text text-transparent text-glow-gold">
              Vishwa Patrakar Mahasangh
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg sm:text-2xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto font-medium"
          >
            A prestigious, constitutionally registered global alliance representing and safeguarding the rights of journalists.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <Link
              to="/registration"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:scale-[1.03]"
            >
              Join Our Global Alliance
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900/95 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 px-8 py-3.5 rounded-xl font-bold transition-all hover:scale-[1.03]"
            >
              Explore Mission
            </Link>
          </motion.div>
        </div>

        {/* Dynamic 3D Marquee Ticker */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 border-y border-slate-200 backdrop-blur-md py-3 overflow-hidden select-none">
          <div className="flex w-max animate-marquee space-x-12 whitespace-nowrap text-sm font-semibold tracking-wider text-slate-500">
            <span className="flex items-center space-x-2"><span className="h-2 w-2 rounded-full bg-amber-500"/> <span>Global Membership Open</span></span>
            <span className="flex items-center space-x-2"><span className="h-2 w-2 rounded-full bg-blue-500"/> <span>Advocating Freedom of the Press</span></span>
            <span className="flex items-center space-x-2"><span className="h-2 w-2 rounded-full bg-green-500"/> <span>Safeguarding Journalists Since 2006</span></span>
            <span className="flex items-center space-x-2"><span className="h-2 w-2 rounded-full bg-amber-500"/> <span>National Executive Meet Coming Soon</span></span>
            {/* Duplicate for infinite loop */}
            <span className="flex items-center space-x-2"><span className="h-2 w-2 rounded-full bg-amber-500"/> <span>Global Membership Open</span></span>
            <span className="flex items-center space-x-2"><span className="h-2 w-2 rounded-full bg-blue-500"/> <span>Advocating Freedom of the Press</span></span>
            <span className="flex items-center space-x-2"><span className="h-2 w-2 rounded-full bg-green-500"/> <span>Safeguarding Journalists Since 2006</span></span>
          </div>
        </div>
      </section>

      {/* ================= LEADERSHIP SECTION ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/40 dark:bg-slate-950/40 relative border-b border-slate-200/80 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Organizational Leadership
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              The foundational pillars of Vishwa Patrakar Mahasangh, dedicated to maintaining ethics, safety, and empowerment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Chairman */}
            <Tilt className="w-full">
              <div className="relative overflow-hidden glassmorphism-card rounded-2xl p-8 flex flex-col items-center text-center h-full group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-xl" />
                  <img
                    src={chairmanImg}
                    alt="Mr. Sanjay Kumar Shukla"
                    className="relative w-36 h-36 rounded-xl object-cover border-2 border-slate-200 dark:border-white/10 shadow-xl"
                  />
                </div>

                <h3 className="text-2xl font-extrabold uppercase tracking-wide text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Mr. Sanjay Kumar Shukla
                </h3>
                <p className="text-amber-600 dark:text-amber-400 font-bold text-sm uppercase tracking-widest mt-1">
                  Chairman
                </p>

                <div className="w-20 h-[2px] bg-gradient-to-r from-amber-400 to-amber-500 my-6 shadow-[0_0_8px_#f59e0b]" />

                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Provides strategic vision and representing journalists at national and international summits. Active in advocating legal and constitutional protections.
                </p>
              </div>
            </Tilt>

            {/* Managing Trustee */}
            <Tilt className="w-full">
              <div className="relative overflow-hidden glassmorphism-card rounded-2xl p-8 flex flex-col items-center text-center h-full group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-xl" />
                  <img
                    src={trusteeImg}
                    alt="Mrs. Geeta Shukla"
                    className="relative w-36 h-36 rounded-xl object-cover border-2 border-slate-200 dark:border-white/10 shadow-xl"
                  />
                </div>

                <h3 className="text-2xl font-extrabold uppercase tracking-wide text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Mrs. Geeta Shukla
                </h3>
                <p className="text-amber-600 dark:text-amber-400 font-bold text-sm uppercase tracking-widest mt-1">
                  Managing Trustee
                </p>

                <div className="w-20 h-[2px] bg-gradient-to-r from-amber-400 to-amber-500 my-6 shadow-[0_0_8px_#f59e0b]" />

                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Oversees organizational directives, member support funds, administrative governance, and general welfare actions across India and globally.
                </p>
              </div>
            </Tilt>
          </div>
        </div>
      </section>

      {/* ================= ACTIVITIES SECTION ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-100/10 dark:bg-slate-900/10 border-b border-slate-200/80 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Commitments & Engagements
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              A showcase of key field initiatives, media summits, and community services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { img: meetingImg, title: "Organizational Meetings", desc: "Forums to map media strategies, formulate support panels, and enforce ethical codes." },
              { img: trainingImg, title: "Training Workshops", desc: "Educational drives to train ground correspondents in digital safety and news validation." },
              { img: pressmeetImg, title: "Press Conferences", desc: "Active interactions addressing press freedom constraints and media transparency concerns." },
              { img: fieldworkImg, title: "Ground Activities", desc: "Direct coordinate groups deployed to aid media professionals facing field challenges." }
            ].map((act, index) => (
              <Tilt key={index}>
                <div className="relative group overflow-hidden glassmorphism-card rounded-2xl h-full flex flex-col">
                  <div className="relative overflow-hidden aspect-video">
                    <div className="absolute inset-0 bg-[#030712]/20 dark:bg-[#030712]/40 z-10 group-hover:bg-transparent transition-colors duration-300" />
                    <img
                      src={act.img}
                      alt={act.title}
                      onClick={() => setSelectedImage(act.img)}
                      className="h-full w-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 z-20">
                      <Play className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {act.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {act.desc}
                    </p>
                  </div>
                </div>
              </Tilt>
            ))}
          </div>
        </div>

        {/* Selected Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-slate-900/90 dark:bg-[#030712]/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl">
              <img
                src={selectedImage}
                alt="Enlarged Showcase"
                className="w-full h-full object-contain"
              />
              <button 
                className="absolute top-4 right-4 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-full p-2 border border-slate-200 dark:border-white/10"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Embedded Activities YouTube Section */}
      <OurActivities />

      {/* ================= IMPACT STATISTICS ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/50 dark:bg-slate-950/60 relative border-b border-slate-200/80 dark:border-white/5">
        <div className="absolute inset-0 grid-3d-bg opacity-15" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Global Scale & Impact
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Expanding connections, building safety channels, and providing legal support.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: "5,000+", label: "Journalists Connected", icon: Users },
              { val: "20+", label: "States Covered", icon: Globe },
              { val: "100+", label: "Programs & Assemblies", icon: Award },
              { val: "2006", label: "Year Founded", icon: BookOpen }
            ].map((stat, idx) => (
              <div key={idx} className="glassmorphism-card rounded-2xl p-6 text-center group hover:border-amber-500/30 dark:hover:border-amber-400/30 transition-all">
                <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center border border-amber-500/20 dark:border-amber-400/20 mb-4 group-hover:scale-115 transition-transform">
                  <stat.icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-600 to-amber-500 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent text-glow-gold">
                  {stat.val}
                </p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LATEST UPDATES, ANNOUNCEMENTS & NEWS (SPLIT GRID) ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative border-b border-slate-200/80 dark:border-white/5 bg-slate-100/10 dark:bg-slate-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* LEFT SIDE: Official Announcements */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-2xl md:text-3.5xl font-extrabold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-3">
                Official Updates
              </h2>
              
              <div className="space-y-6">
                {[
                  { title: "Global Membership Applications Open", desc: "Journalists globally representing print, television, digital, or freelance lines can apply for VPM status." },
                  { title: "National Executive Meeting Notification", desc: "Details, agenda, and safety audits will be released soon. Registered active cardholders are requested to stay tuned." },
                  { title: "Empowerment & Press Security Program", desc: "A special trust cell is being launched in New Delhi to offer media professionals immediate legal advisory services." }
                ].map((upd, idx) => (
                  <div key={idx} className="relative overflow-hidden glassmorphism-card rounded-xl p-5 flex items-start space-x-4 border-l-4 border-l-amber-500 group">
                    <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 text-amber-600 dark:text-amber-400">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {upd.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {upd.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE: Latest YouTube Broadcasts */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <h2 className="text-2xl md:text-3.5xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Youtube className="h-6 w-6 text-red-600" />
                  Latest News Broadcasts
                </h2>
                <Link to="/news" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                  View All
                </Link>
              </div>

              {loadingVideos ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="h-8 w-8 text-amber-600 dark:text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Syncing live broadcasts...</p>
                </div>
              ) : videos.length > 0 ? (
                <div className="space-y-4">
                  {videos.map((video) => (
                    <motion.a 
                      key={video.id}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 hover:border-amber-500/35 hover:shadow-md transition-all group"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100 dark:border-transparent">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="p-2 bg-red-600 rounded-full text-white shadow-md">
                            <Play className="h-3.5 w-3.5 fill-white text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-grow space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                          {video.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Official Bulletin</span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center italic">No live broadcasts available at this moment.</p>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="relative py-28 px-4 text-center overflow-hidden border-b border-slate-200/80 dark:border-white/5 bg-gradient-to-r from-blue-900/10 via-indigo-900/15 to-slate-900/10 dark:from-blue-950/20 dark:via-indigo-950/40 dark:to-slate-950/30">
        <div className="absolute inset-0 grid-3d-bg opacity-15" />
        <div className="relative max-w-4xl mx-auto z-10 space-y-6">
          <h2 className="text-3xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 dark:from-white dark:via-slate-100 dark:to-amber-400 bg-clip-text text-transparent">
            Uphold Truth. Speak Fearlessly.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Be part of an established global voice. Shield your rights, connect with media panels, and gain official recognition.
          </p>
          <div className="pt-4">
            <Link
              to="/registration"
              className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-10 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_35px_rgba(245,158,11,0.35)] hover:scale-[1.03]"
            >
              Get Registered Membership
            </Link>
          </div>
        </div>
      </section>

      {/* ================= WHY JOIN US ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/20 dark:bg-slate-950/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-slate-900 dark:text-white mb-16">
            Institutional Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="glassmorphism-card rounded-2xl p-8 space-y-4">
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">Our Core Mission</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                To unite the print, electronics, and digital info sectors under an inclusive federation. Vishwa Patrakar Mahasangh actively works toward maintaining media ethics, supporting journalists facing judicial restrictions, and providing official credentials.
              </p>
            </div>
            <div className="glassmorphism-card rounded-2xl p-8 space-y-4">
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-sans">Member Advantages</h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {[
                  "Official journalist identification credentials.",
                  "Global networking networks with editorial panels.",
                  "Advocacy representation in legal cells and supreme courts.",
                  "Welfare funds covering medical, family support, and training."
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-amber-600 dark:text-amber-400 font-bold mr-2.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <Contact />
    </div>
  );
}
