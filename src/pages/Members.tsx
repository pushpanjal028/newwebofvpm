import { useState, useEffect } from "react";
import { Users, Info, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Tilt from "../components/Tilt";

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  createdAt: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch("https://vpmh.org/api/members");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch members list");
      }

      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while loading");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 text-amber-600 dark:text-amber-400 mb-2 animate-bounce">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 dark:from-white dark:via-slate-200 dark:to-amber-400 bg-clip-text text-transparent text-glow-gold">
            Registered Members
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto">
            Meet our directory of verified journalists and media professionals representing VPM globally.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded-full" />
        </motion.div>

        {loading ? (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="h-12 w-12 text-amber-600 dark:text-amber-400 animate-spin mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wider">Loading verified registry...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-6 max-w-md mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-600 dark:text-red-400 text-sm">
              <p className="font-bold mb-2">Registry Offline</p>
              <p className="text-xs text-red-600/80 dark:text-red-400/80">{error}</p>
            </div>
            <button
              onClick={fetchMembers}
              className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold border border-slate-200 dark:border-white/10 px-6 py-2.5 rounded-xl transition-all hover:scale-105 shadow-sm"
            >
              Retry Connection
            </button>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center max-w-lg mx-auto">
            <div className="glassmorphism-card rounded-2xl p-12 space-y-4">
              <Users className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">No Registered Members Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                The global registry is currently clear. Be among the first to obtain your Vishwa Patrakar Mahasangh credentials!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <span className="inline-flex items-center space-x-1.5 bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/20 dark:border-amber-400/20 rounded-full px-4 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                <ShieldCheck className="h-4 w-4" />
                <span>{members.length} Active Verified Members</span>
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <Tilt key={member._id}>
                  <div className="glassmorphism-card rounded-2xl p-6 flex items-center space-x-4 h-full relative overflow-hidden group border border-slate-200 dark:border-white/5 hover:border-amber-500/30 dark:hover:border-amber-400/30 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                    
                    <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-full text-slate-950 font-black text-2xl shadow-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {member.name}
                      </h3>
                      {member.organization ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          {member.organization}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">Individual Press Correspondent</p>
                      )}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        Joined {new Date(member.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </Tilt>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
