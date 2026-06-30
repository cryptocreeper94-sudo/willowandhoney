import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower2, ShieldCheck, Camera, Sparkles, CalendarDays, Compass, Plus } from 'lucide-react';
import { BottomSheetBooking } from './components/BottomSheetBooking';

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    '/hero_mobile.png?v=1',
    '/hero_2.png',
    '/hero_3.png'
  ];

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

  // Ken Burns Slideshow Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 8000); // Change image every 8 seconds
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const openBooking = (service: any) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  // Group services by category
  const categories = Array.from(new Set(services.map(s => s.category)));

  return (
    <div className="bg-wh-dark text-white min-h-screen pb-32 selection:bg-wh-pink selection:text-white relative overflow-x-hidden no-scrollbar">
      
      {/* PERSISTENT HERO HEADER (Always visible across all tabs) */}
      <div className="relative w-full h-[60vh] md:h-[70vh] bg-black flex flex-col items-center justify-end overflow-hidden rounded-b-[40px] shadow-2xl z-20 pb-12">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentSlide}
            src={heroImages[currentSlide]} 
            alt="Hero Slideshow"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            initial={{ scale: 1.0, opacity: 0 }}
            animate={{ scale: 1.15, opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ 
              opacity: { duration: 2 },
              scale: { duration: 15, ease: 'linear' }
            }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-wh-dark via-wh-dark/30 to-black/20 pointer-events-none" />
        
        <div className="relative z-10 text-center px-6 mt-auto">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-playfair italic mb-4 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
          >
            Willow & Honey
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/90 font-outfit uppercase tracking-[0.3em] text-xs md:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold"
          >
            Luxury In-Home & Studio Esthetics
          </motion.p>
        </div>
      </div>

      <div className="relative z-10 -mt-10">
        {/* TABBED CONTENT AREA */}
        <AnimatePresence mode="wait">
          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full pt-16"
            >
              {/* Meet Ariel */}
              <div className="max-w-5xl mx-auto px-6 mb-24">
                <div className="flex flex-col md:flex-row items-center gap-12 bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 backdrop-blur-sm">
                  <div className="w-full md:w-1/3 flex justify-center">
                    <img 
                      src="/ariel_bio.png" 
                      alt="Ariel" 
                      className="rounded-[30px] w-full max-w-[300px] object-cover shadow-2xl border border-white/10"
                    />
                  </div>
                  <div className="w-full md:w-2/3 text-center md:text-left">
                    <Sparkles className="w-8 h-8 text-wh-pink mb-6 opacity-80 mx-auto md:mx-0" />
                    <h2 className="text-4xl font-playfair italic mb-6">Meet Ariel</h2>
                    <p className="text-white/80 font-outfit leading-relaxed text-lg font-light">
                      Hi, my name is Ariel! I'm a passionate esthetician finishing training at Georgia Career Institute with a passion for healthy, radiant skin. I specialize in skin barrier health and facial sculpting, creating personalized treatments that enhance your natural beauty. My goal is to help you build confidence through healthy skin while providing a relaxing, results-driven experience. I can't wait to be a part of your skincare journey!
                    </p>
                  </div>
                </div>
                
                {/* Hours & Availability */}
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 mb-20 backdrop-blur-sm">
                  <h3 className="text-2xl font-playfair italic mb-8 text-wh-pink">Availability & Hours</h3>
                  <div className="grid grid-cols-2 gap-y-4 max-w-md mx-auto text-base font-outfit">
                    <div className="text-right text-white/70">Weekends</div>
                    <div className="text-left font-bold text-white pl-4">9:00 AM - 12:00 PM</div>
                    
                    <div className="text-right text-white/70">Mobile Travel</div>
                    <div className="text-left font-bold text-white pl-4">2 Hour Min. Slot</div>
                  </div>
                  <p className="mt-8 text-sm font-outfit text-white/50 italic max-w-md mx-auto">
                    Note: Facial and body treatments require 90-minute blocks to allow for client downtime and optimal relaxation. Waxing, tinting, and lifting require 30-minute blocks.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'book' && (
            <motion.div
              key="book"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full pt-16 px-6"
            >
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-playfair italic mb-4">Treatment Menu</h2>
                  <p className="text-white/50 font-outfit uppercase tracking-[0.2em] text-sm">Select a service to schedule an appointment</p>
                </div>

                {categories.map(category => (
                  <div key={category as string} className="mb-20">
                    <h3 className="text-wh-pink font-outfit uppercase tracking-[0.2em] text-lg mb-8 flex items-center gap-6">
                      <span className="shrink-0">{category as string}</span>
                      <div className="h-px bg-gradient-to-r from-wh-pink/50 to-transparent flex-1" />
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {services.filter(s => s.category === category).map(service => (
                        <button
                          key={service.id}
                          onClick={() => openBooking(service)}
                          className="text-left group relative overflow-hidden rounded-[32px] bg-black border border-white/10 hover:border-wh-pink/50 transition-all shadow-2xl h-[320px] flex flex-col justify-end"
                        >
                          {/* Photorealistic Background Image */}
                          {service.imageUrl ? (
                            <img 
                              src={service.imageUrl} 
                              alt={service.name}
                              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-wh-dark to-black" />
                          )}
                          
                          {/* Gradient Overlay for Text Readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

                          <div className="relative z-10 p-8 flex flex-col h-full justify-end">
                            <div className="mb-auto flex justify-end">
                              {service.isMobileEligible && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-wh-pink/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                  Mobile Travel Available
                                </span>
                              )}
                            </div>
                            
                            <div>
                              <h4 className="text-2xl font-playfair italic text-white mb-3 group-hover:text-wh-pink transition-colors drop-shadow-md">{service.name}</h4>
                              
                              {service.description && (
                                <p className="text-white/70 text-sm font-outfit mb-4 line-clamp-2">{service.description}</p>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-white/90 font-outfit font-medium">
                                  <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">${service.price}</span>
                                  <span className="text-white/50 text-sm">{service.durationMinutes} mins</span>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                                  <Plus className="w-6 h-6" />
                                </div>
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

          {activeTab === 'connect' && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full flex items-center justify-center pt-16 px-6"
            >
              <div className="bg-white/5 border border-white/10 p-12 rounded-[40px] text-center max-w-2xl w-full backdrop-blur-xl">
                <Flower2 className="w-16 h-16 text-wh-pink mx-auto mb-8 animate-spin-slow" style={{ animationDuration: '10s' }} />
                <h2 className="text-4xl font-playfair italic mb-6">Get in Touch</h2>
                <p className="text-white/70 font-outfit mb-12 text-lg font-light leading-relaxed">
                  Follow my journey, view past client transformations, and DM me for any specific skincare questions or custom service inquiries.
                </p>
                
                <a 
                  href="https://instagram.com/willowandhoney.esthetics"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-5 rounded-full hover:opacity-90 transition-opacity shadow-[0_0_40px_rgba(236,72,153,0.3)] uppercase tracking-widest text-sm"
                >
                  <Camera className="w-5 h-5" /> Follow @willowandhoney.esthetics
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="w-full pb-40 pt-32 px-6 border-t border-white/5 relative z-10 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 relative z-10 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 
              onClick={handleAdminTrigger}
              className="text-3xl font-playfair italic text-white flex items-center gap-3 cursor-pointer select-none"
            >
              Willow & Honey <Flower2 className="w-6 h-6 text-wh-pink animate-spin-slow" style={{ animationDuration: '8s' }} />
            </h3>
            <p className="text-sm font-outfit text-white/50 tracking-wider">
              &copy; {new Date().getFullYear()} Willow & Honey. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-2 text-white/50 text-[10px] font-inter tracking-[0.2em] uppercase">
              <ShieldCheck className="w-4 h-4 text-white/30" />
              Powered by
            </div>
            <p className="text-sm font-inter text-white/80 tracking-widest font-bold">
              DARKWAVE TRUST LAYER
            </p>
            <p className="text-[10px] font-outfit text-white/30 tracking-widest">
              &copy; {new Date().getFullYear()} DarkWave Studio LLC
            </p>
          </div>
        </div>
      </footer>

      {/* FLOATING BOTTOM COCKPIT DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-6 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-3xl border border-white/20 rounded-full p-2 flex justify-between items-center shadow-[0_30px_60px_rgba(0,0,0,0.8)] pointer-events-auto">
          
          <button 
            onClick={() => setActiveTab('explore')}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-full transition-all ${activeTab === 'explore' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/80'}`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Explore</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('book')}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-full transition-all ${activeTab === 'book' ? 'bg-wh-pink text-white shadow-[0_0_25px_rgba(255,42,117,0.4)]' : 'text-white/40 hover:text-white/80'}`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Book</span>
          </button>

          <button 
            onClick={() => setActiveTab('connect')}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-full transition-all ${activeTab === 'connect' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/80'}`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Connect</span>
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
