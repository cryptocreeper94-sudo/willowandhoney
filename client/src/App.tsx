import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower2, ShieldCheck, Camera, Sparkles, CalendarDays, Compass, Plus } from 'lucide-react';
import { BottomSheetBooking } from './components/BottomSheetBooking';

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Easter egg state
  const lastClickTime = useRef(0);
  const clickCount = useRef(0);

  const handleAdminTrigger = () => {
    const now = Date.now();
    if (now - lastClickTime.current > 1000) {
      clickCount.current = 1;
    } else {
      clickCount.current += 1;
      if (clickCount.current >= 3) {
        window.location.href = '/admin';
      }
    }
    lastClickTime.current = now;
  };

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error("Could not load services", err));
  }, []);

  const openBooking = (service: any) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  // Group services by category
  const categories = Array.from(new Set(services.map(s => s.category)));

  return (
    <div className="bg-wh-dark text-white min-h-screen pb-32 selection:bg-wh-pink selection:text-white relative overflow-hidden no-scrollbar">
      
      {/* EXPLORE VIEW */}
      <AnimatePresence mode="wait">
        {activeTab === 'explore' && (
          <motion.div
            key="explore"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {/* Massive Ambient Hero */}
            <div className="relative h-[80vh] w-full bg-black flex items-center justify-center overflow-hidden rounded-b-[40px] shadow-2xl">
              <motion.img 
                src="/hero_mobile.png?v=1" 
                alt="Ariel"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wh-dark via-wh-dark/20 to-transparent" />
              
              <div className="relative z-10 text-center px-6">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-6xl md:text-8xl font-playfair italic mb-4 drop-shadow-2xl"
                >
                  Willow & Honey
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/80 font-outfit uppercase tracking-[0.3em] text-sm md:text-base drop-shadow-lg"
                >
                  Luxury In-Home & Studio Esthetics
                </motion.p>
                <motion.button 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => setActiveTab('book')}
                  className="mt-12 bg-white text-black font-bold py-4 px-10 rounded-full hover:bg-wh-pink hover:text-white transition-all uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,42,117,0.5)]"
                >
                  View Services
                </motion.button>
              </div>
            </div>

            {/* Meet Ariel */}
            <div className="max-w-4xl mx-auto px-6 py-20 text-center">
              <Sparkles className="w-8 h-8 text-wh-pink mx-auto mb-6 opacity-50" />
              <h2 className="text-3xl font-playfair italic mb-6">Meet Ariel</h2>
              <p className="text-white/60 font-outfit leading-relaxed max-w-2xl mx-auto text-lg font-light">
                Hi, I'm Ariel. I specialize in bringing high-end, luxury esthetic treatments directly to your home. Whether you need a deep lymphatic drainage massage or a signature anti-aging facial, my goal is to provide a serene, transformative experience without you ever having to leave your sanctuary.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOOK VIEW (Service Menu) */}
      <AnimatePresence mode="wait">
        {activeTab === 'book' && (
          <motion.div
            key="book"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full px-6 pt-12"
          >
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-playfair italic mb-4">Treatment Menu</h2>
                <p className="text-white/50 font-outfit uppercase tracking-widest text-xs">Select a service to book</p>
              </div>

              {categories.map(category => (
                <div key={category as string} className="mb-12">
                  <h3 className="text-wh-pink font-outfit uppercase tracking-[0.2em] text-sm mb-6 flex items-center gap-4">
                    {category as string}
                    <div className="h-px bg-white/10 flex-1" />
                  </h3>
                  
                  {/* Horizontal Scroll Carousel */}
                  <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar snap-x snap-mandatory">
                    {services.filter(s => s.category === category).map(service => (
                      <button
                        key={service.id}
                        onClick={() => openBooking(service)}
                        className="snap-start flex-none w-[280px] text-left group"
                      >
                        <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] h-[200px] flex flex-col justify-between group-hover:bg-white/10 group-hover:border-wh-pink/50 transition-all shadow-lg relative overflow-hidden">
                          <div className="relative z-10">
                            <h4 className="text-xl font-playfair italic text-white mb-2">{service.name}</h4>
                            <div className="flex items-center gap-2 text-white/50 text-xs font-outfit">
                              <span>${service.price}</span>
                              <span>&bull;</span>
                              <span>{service.durationMinutes} mins</span>
                            </div>
                          </div>
                          
                          <div className="relative z-10 flex justify-between items-end">
                            {service.isMobileEligible ? (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-wh-pink bg-wh-pink/10 px-3 py-1.5 rounded-full border border-wh-pink/20">
                                Mobile OK
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 bg-white/5 px-3 py-1.5 rounded-full">
                                Studio Only
                              </span>
                            )}
                            
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Plus className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONNECT VIEW */}
      <AnimatePresence mode="wait">
        {activeTab === 'connect' && (
          <motion.div
            key="connect"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex items-center justify-center min-h-[80vh] px-6"
          >
            <div className="bg-white/5 border border-white/10 p-8 md:p-16 rounded-[40px] text-center max-w-xl w-full backdrop-blur-xl">
              <Flower2 className="w-12 h-12 text-wh-pink mx-auto mb-8 animate-spin-slow" style={{ animationDuration: '10s' }} />
              <h2 className="text-4xl font-playfair italic mb-4">Connect</h2>
              <p className="text-white/60 font-outfit mb-12 font-light">Follow my journey, view past client transformations, and DM me for any specific skincare questions.</p>
              
              <a 
                href="https://instagram.com/willowandhoney.esthetics"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-5 rounded-full hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(236,72,153,0.3)] uppercase tracking-widest text-sm"
              >
                <Camera className="w-5 h-5" /> Follow @willowandhoney.esthetics
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER (With Easter Egg) */}
      <footer className="w-full pb-40 pt-20 px-6 border-t border-white/5 relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start gap-2">
            <h3 
              onClick={handleAdminTrigger}
              className="text-2xl font-playfair italic text-white flex items-center gap-3 cursor-pointer select-none"
            >
              Willow & Honey <Flower2 className="w-5 h-5 text-wh-pink animate-spin-slow" style={{ animationDuration: '8s' }} />
            </h3>
            <p className="text-xs font-outfit text-white/40 tracking-wider">
              &copy; {new Date().getFullYear()} Willow & Honey. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-2 text-white/50 text-[10px] font-inter tracking-[0.2em] uppercase">
              <ShieldCheck className="w-3 h-3 text-white/30" />
              Powered by
            </div>
            <p className="text-xs font-inter text-white/80 tracking-widest font-bold">
              DARKWAVE TRUST LAYER
            </p>
            <p className="text-[9px] font-outfit text-white/30 tracking-widest">
              &copy; {new Date().getFullYear()} DarkWave Studio LLC
            </p>
          </div>
        </div>
      </footer>

      {/* FLOATING BOTTOM COCKPIT DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-6 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
          
          <button 
            onClick={() => setActiveTab('explore')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-full transition-all ${activeTab === 'explore' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Explore</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('book')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-full transition-all ${activeTab === 'book' ? 'bg-wh-pink text-white shadow-[0_0_20px_rgba(255,42,117,0.3)]' : 'text-white/40 hover:text-white/80'}`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Book</span>
          </button>

          <button 
            onClick={() => setActiveTab('connect')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-full transition-all ${activeTab === 'connect' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Connect</span>
          </button>

        </div>
      </div>

      {/* BOTTOM SHEET BOOKING OVERLAY */}
      <BottomSheetBooking 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        service={selectedService} 
      />

    </div>
  );
}
