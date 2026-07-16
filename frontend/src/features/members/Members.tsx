import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, ShieldCheck, Loader2, Search, MapPin, Building, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import Tilt from "../../components/ui/Tilt";
import { getPublicMembers, getUploadUrl } from "../../api";

interface Member {
  _id: string;
  name: string;
  photo?: string;
  organization?: string;
  state: string;
  city: string;
  designation: string;
  membershipId: string;
  approvalStatus: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [searchOrg, setSearchOrg] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const fetchMembersList = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPublicMembers();
      setMembers(data);
    } catch (err: any) {
      console.error("❌ Error fetching members:", err);
      setError(err.message || "Failed to fetch directory from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersList();
  }, []);

  // Filtering logic
  const filteredMembers = members.filter((member) => {
    const matchName = member.name.toLowerCase().includes(searchName.toLowerCase());
    const matchOrg = (member.organization || "").toLowerCase().includes(searchOrg.toLowerCase());
    const matchState = (member.state || "").toLowerCase().includes(searchState.toLowerCase());
    const matchCity = (member.city || "").toLowerCase().includes(searchCity.toLowerCase());
    return matchName && matchOrg && matchState && matchCity;
  });

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
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 mb-1 animate-bounce">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Registered Journalists
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Meet the official directory of active, verified press correspondents representing Vishwa Patrakar Mahasangh globally.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded-full" />
        </motion.div>

        {/* Filters Panel */}
        <div className="bg-white border rounded-3xl p-6 shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search by Name */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
            />
          </div>

          {/* Search by Org */}
          <div className="relative">
            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Organization..."
              value={searchOrg}
              onChange={(e) => setSearchOrg(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
            />
          </div>

          {/* Search by State */}
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by State..."
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
            />
          </div>

          {/* Search by City */}
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by City..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
            />
          </div>
        </div>

        {/* Loading / Error states */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="h-12 w-12 text-amber-600 animate-spin mx-auto" />
            <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">Loading verified registry...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-xs">
              <p className="font-bold mb-1">Registry Offline</p>
              <p className="text-slate-500 leading-normal">{error}</p>
            </div>
            <button
              onClick={fetchMembersList}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-transparent px-6 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center max-w-lg mx-auto">
            <div className="bg-white border rounded-3xl p-12 space-y-4 shadow-sm">
              <Users className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-850">No Verified Members Found</h3>
              <p className="text-slate-500 text-xs leading-normal">
                No active correspondents match your filters. Try adjusting your search query.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <span className="inline-flex items-center space-x-1.5 bg-green-50 border border-green-200 rounded-full px-4 py-1 text-xs font-bold text-green-700">
                <ShieldCheck className="h-4 w-4" />
                <span>{filteredMembers.length} Active Verified Press Members</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <Tilt key={member._id}>
                  <div className="bg-white rounded-3xl p-6 flex flex-col justify-between h-full relative overflow-hidden group border border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 min-h-[220px]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />

                    <div className="flex gap-4 items-start">
                      <div className="h-16 w-16 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border shadow-inner">
                        {member.photo ? (
                          <img
                            src={getUploadUrl(member.photo)}
                            alt={member.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="h-full w-full flex items-center justify-center font-bold text-slate-500 bg-amber-50">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                          <ShieldCheck className="h-2.5 w-2.5" /> Verified
                        </span>
                        
                        <h3 className="text-base font-extrabold text-slate-900 truncate leading-snug group-hover:text-amber-600 transition-colors">
                          {member.name}
                        </h3>
                        
                        <p className="text-[11px] font-bold text-slate-700 truncate">
                          {member.designation}
                        </p>
                        
                        {member.organization ? (
                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-400" />
                            {member.organization}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-450 italic truncate">Independent Journalist</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-6 flex justify-between items-center text-xs">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Membership ID</p>
                        <p className="font-mono text-amber-700 font-bold tracking-wider mt-1">{member.membershipId}</p>
                      </div>
                      
                      <Link
                        to={`/id-card/${member.membershipId}`}
                        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold px-3 py-1.5 rounded-xl transition-all text-[10px]"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        ID Card
                      </Link>
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
