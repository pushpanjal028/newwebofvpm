import { useEffect, useState } from "react";
import { Loader2, Play, Youtube, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Tilt from "../../components/ui/Tilt";

const FALLBACK_NEWS = [
  {
    id: "fallback-1",
    title: "Vishwapatrakar Mahasangh delegation meets with district authorities to discuss safety measures for local journalists.",
    thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=600",
    url: "https://www.youtube.com",
    date: "July 12, 2026",
    type: "National Bulletin"
  },
  {
    id: "fallback-2",
    title: "VPMH holds nationwide press freedom rally advocating for journalists' rights and protections.",
    thumbnail: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=600",
    url: "https://www.youtube.com",
    date: "June 28, 2026",
    type: "Press Conference"
  },
  {
    id: "fallback-3",
    title: "Press conference on the safety framework and support network for rural media correspondents.",
    thumbnail: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&q=80&w=600",
    url: "https://www.youtube.com",
    date: "June 15, 2026",
    type: "Assembly Notice"
  },
  {
    id: "fallback-4",
    title: "Annual journalism awards ceremony celebrating outstanding reporting in investigation and public service.",
    thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600",
    url: "https://www.youtube.com",
    date: "May 20, 2026",
    type: "Official Award"
  }
];

export default function News() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "AIzaSyB6Y1I4Er3OwxcPptHjgdfiR1kbojfS_9U";
  const CHANNEL_ID = "UCRqJl-zz5ms9ChNewecmrjw";
  const API_URL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&type=video&order=date&maxResults=12`;

  useEffect(() => {
    if (!API_KEY) {
      console.warn("⚠️ YouTube API Key missing. Rendering news fallback dataset.");
      setVideos(FALLBACK_NEWS);
      setUsingFallback(true);
      setLoading(false);
      return;
    }

    fetch(API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error("API call failed");
        }
        return res.json();
      })
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const formattedVideos = data.items.map((item: any) => ({
            id: item.id?.videoId || item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            url: `https://www.youtube.com/watch?v=${item.id?.videoId || item.id}`,
            date: new Date(item.snippet.publishedAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            type: "Official Broadcast"
          }));
          setVideos(formattedVideos);
        } else {
          throw new Error("No items returned");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching YouTube videos, loading fallbacks:", err);
        setVideos(FALLBACK_NEWS);
        setUsingFallback(true);
        setLoading(false);
      });
  }, [API_URL, API_KEY]);

  return (
    <div className="py-24 bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-3d-bg opacity-15 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-650 mb-1">
            <Youtube className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Latest Bulletins
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Stay updated with official bulletins, reports, and live media briefings direct from our official broadcasting channels.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded-full" />
        </motion.div>

        {usingFallback && (
          <div className="max-w-md mx-auto p-3.5 bg-amber-55/10 border border-amber-250 text-amber-850 rounded-2xl text-[11px] flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
            <span>YouTube synchronization is offline. Showing cached press reports and national bulletins.</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="h-12 w-12 text-amber-600 animate-spin mx-auto" />
            <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">Syncing broadcasting channels...</p>
          </div>
        ) : videos.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {videos.map((video) => (
              <Tilt key={video.id}>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white hover:shadow-xl hover:border-amber-400 transition-all h-full flex flex-col min-h-[260px]"
                >
                  <div className="relative aspect-video overflow-hidden shadow-inner bg-slate-100">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                      <div className="p-3 bg-red-600 rounded-full text-white shadow-lg shadow-red-600/35 transform scale-90 group-hover:scale-100 transition-all">
                        <Play className="h-4 w-4 fill-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <h2 className="text-xs md:text-sm font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-3 leading-snug">
                      {video.title}
                    </h2>
                    <div className="flex justify-between items-center mt-4 pt-2 border-t text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      <span>{video.type}</span>
                      <span>{video.date}</span>
                    </div>
                  </div>
                </a>
              </Tilt>
            ))}
          </motion.div>
        ) : (
          <div className="text-center max-w-lg mx-auto">
            <div className="bg-white border rounded-3xl p-12 space-y-4 shadow-sm">
              <Youtube className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-850">No Bulletins Found</h3>
              <p className="text-slate-500 text-xs leading-normal">
                We couldn't fetch live reports from the channel API. Please verify the network connection or retry later.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
