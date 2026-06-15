import { useEffect, useState } from "react";
import { Loader2, Play, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import Tilt from "../components/Tilt";

export default function News() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "";
  const CHANNEL_ID = "UCRqJl-zz5ms9ChNewecmrjw";
  const API_URL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&type=video&order=date&maxResults=12`;

  useEffect(() => {
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
        } else {
          console.error("No videos found or invalid channel payload:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching YouTube videos:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="py-20 bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-3d-bg opacity-15 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 mb-2">
            <Youtube className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 dark:from-white dark:via-slate-200 dark:to-amber-400 bg-clip-text text-transparent text-glow-gold">
            Latest News
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Stay updated with official bulletins, reports, and live media briefings direct from our official broadcasting channels.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded-full" />
        </motion.div>

        {loading ? (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="h-12 w-12 text-amber-600 dark:text-amber-400 animate-spin mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wider">Syncing broadcasting channels...</p>
          </div>
        ) : videos.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {videos.map((video) => (
              <Tilt key={video.id}>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-xl backdrop-blur-sm h-full flex flex-col hover:border-amber-550 dark:hover:border-amber-400/30 transition-colors"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                      <div className="p-3 bg-red-650 rounded-full text-white shadow-lg shadow-red-600/35 transform scale-90 group-hover:scale-105 transition-transform">
                        <Play className="h-5 w-5 fill-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-3 leading-snug">
                      {video.title}
                    </h2>
                    <span className="inline-flex text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-4">
                      Official Broadcast
                    </span>
                  </div>
                </a>
              </Tilt>
            ))}
          </motion.div>
        ) : (
          <div className="text-center max-w-lg mx-auto">
            <div className="glassmorphism-card rounded-2xl p-12 space-y-4">
              <Youtube className="h-16 w-16 text-slate-500 dark:text-slate-650 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Bulletins Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                We couldn't fetch live reports from the channel API. Please verify the network connection or retry later.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
