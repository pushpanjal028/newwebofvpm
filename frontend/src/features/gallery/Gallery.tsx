import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, X, ZoomIn, Loader2 } from "lucide-react";
import Tilt from "../../components/ui/Tilt";
import { getPublicGalleryPhotos, getUploadUrl } from "../../api";

import img1 from "../../assets/uppic.jpg";
import img2 from "../../assets/uppic.jpg2.jpg";
import img3 from "../../assets/gujpic.jpg";
import img4 from "../../assets/himpic.jpg";
import img5 from "../../assets/mppic.jpg";
import img6 from "../../assets/bg .jpg";

interface GalleryItem {
  _id?: string;
  url: string;
  title: string;
  category?: string;
}

export default function Gallery() {
  const [selectedImg, setSelectedImg] = useState<{ url: string; title: string } | null>(null);
  const [dbPhotos, setDbPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const defaultImages: GalleryItem[] = [
    { url: img1, title: 'A memorandum was given to the District Magistrate of Prayagraj by the Vishwapatrakar Mahasangh.', category: 'Assemblies' },
    { url: img2, title: 'A memorandum was given to the District Magistrate of Prayagraj by the Vishwapatrakar Mahasangh.', category: 'Assemblies' },
    { url: img3, title: 'Press Freedom Rally', category: 'Assemblies' },
    { url: img4, title: 'Member Networking Event in Himachal pradesh', category: 'Events' },
    { url: img5, title: 'Awards Ceremony in Madhyapradesh', category: 'Awards' },
    { url: img6, title: 'Training Session in Himachal pradesh', category: 'Training' },
  ];

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const data = await getPublicGalleryPhotos();
        if (data && data.length > 0) {
          const mapped = data.map((item: any) => ({
            _id: item._id,
            url: getUploadUrl(item.imageUrl),
            title: item.title,
            category: item.category || "Events",
          }));
          setDbPhotos([...mapped, ...defaultImages]);
        } else {
          setDbPhotos(defaultImages);
        }
      } catch (err) {
        console.error("❌ Failed to load gallery photos:", err);
        setDbPhotos(defaultImages);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);


  const displayImages = dbPhotos.filter(
    (img) => selectedCategory === "All" || img.category === selectedCategory
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
  } as const;

  return (
    <div className="py-20 bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-3d-bg opacity-15 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 text-amber-600 dark:text-amber-400 mb-2">
            <Image className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 dark:from-white dark:via-slate-200 dark:to-amber-400 bg-clip-text text-transparent text-glow-gold">
            Photo Gallery
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Capturing the key assemblies, rallies, and administrative engagements of the Vishwa Patrakar Mahasangh.
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded-full" />
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {["All", "Events", "Assemblies", "Awards", "Training", "General"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-500 shadow-md scale-105"
                  : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-amber-500/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Live Photo Gallery...</p>
          </div>
        ) : displayImages.length === 0 ? (
          <div className="py-24 text-center text-slate-400 font-bold text-sm">
            No photos found in category "{selectedCategory}".
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {displayImages.map((image, index) => (
              <motion.div key={image._id || index} variants={itemVariants}>
                <Tilt>
                  <div 
                    onClick={() => setSelectedImg({ url: image.url, title: image.title })}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 shadow-xl backdrop-blur-sm aspect-[4/3] flex items-center justify-center"
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-6">
                      <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300 space-y-2">
                        {image.category && (
                          <span className="inline-block text-[9px] font-black uppercase text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                            {image.category}
                          </span>
                        )}
                        <p className="text-white font-bold text-sm md:text-base leading-snug line-clamp-2">
                          {image.title}
                        </p>
                        <span className="inline-flex items-center text-xs font-bold text-amber-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ZoomIn className="h-3.5 w-3.5" />
                          Expand Photo
                        </span>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 dark:bg-[#030712]/95 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4"
            onClick={() => setSelectedImg(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[80vh] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl bg-white dark:bg-slate-900/50"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImg.url}
                alt={selectedImg.title}
                className="w-full max-h-[75vh] object-contain"
              />
              <button
                onClick={() => setSelectedImg(null)}
                className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-950/85 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center text-slate-800 dark:text-slate-200 font-semibold max-w-2xl mt-4 leading-relaxed text-sm md:text-base"
            >
              {selectedImg.title}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

