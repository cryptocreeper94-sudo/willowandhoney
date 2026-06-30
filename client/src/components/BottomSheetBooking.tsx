import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface BottomSheetBookingProps {
  isOpen: boolean;
  onClose: () => void;
  service: any | null;
}

export function BottomSheetBooking({ isOpen, onClose, service }: BottomSheetBookingProps) {
  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [address, setAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleBook = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setIsSuccess(false);
      setSelectedDate(undefined);
      setSelectedTime(null);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={resetAndClose}
          />

          {/* Bottom Sheet */}
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-wh-card border-t border-white/10 rounded-t-[40px] z-50 p-6 md:p-10 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />
            
            <button onClick={resetAndClose} className="absolute top-8 right-8 p-2 bg-white/5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <CheckCircle className="w-20 h-20 text-wh-pink mb-6" />
                </motion.div>
                <h2 className="text-3xl font-playfair text-white mb-4">You're Booked, Gorgeous!</h2>
                <p className="text-white/60 font-outfit max-w-sm mb-8">
                  Ariel has received your appointment request. You'll get a confirmation email shortly.
                </p>
                <button 
                  onClick={resetAndClose}
                  className="w-full max-w-xs bg-white text-black hover:bg-wh-pink hover:text-white font-bold py-4 rounded-full transition-colors uppercase tracking-widest text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-playfair text-white mb-2">{service?.name}</h2>
                  <p className="text-wh-pink font-outfit uppercase tracking-widest text-xs">
                    ${service?.price} • {service?.durationMinutes} mins
                  </p>
                </div>

                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="bg-black/30 rounded-3xl p-6 border border-white/5 flex justify-center">
                      <DayPicker 
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={{ dayOfWeek: [1, 2, 3, 4, 5] }}
                        className="text-white"
                        modifiersClassNames={{
                          selected: 'bg-wh-pink text-white font-bold rounded-full shadow-[0_0_15px_rgba(255,42,117,0.5)]',
                          today: 'text-wh-pink font-bold border border-wh-pink rounded-full'
                        }}
                      />
                    </div>

                    {selectedDate && (
                      <div className="grid grid-cols-3 gap-3">
                        {['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'].map(time => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 rounded-2xl border text-xs font-bold transition-all ${
                              selectedTime === time 
                                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                : 'border-white/10 text-white/50 hover:border-wh-pink hover:text-white'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    )}

                    <button 
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setStep(2)}
                      className="w-full bg-wh-pink hover:bg-white text-white hover:text-black font-bold py-4 rounded-full transition-all disabled:opacity-50 uppercase tracking-widest text-sm shadow-lg mt-8"
                    >
                      Next Step
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    
                    {service?.isMobileEligible && (
                      <label className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors mb-6">
                        <input 
                          type="checkbox" 
                          checked={isMobile} 
                          onChange={(e) => setIsMobile(e.target.checked)} 
                          className="w-5 h-5 rounded border-white/20 text-wh-pink focus:ring-wh-pink bg-black" 
                        />
                        <div className="text-sm">
                          <p className="font-medium text-white">Request Mobile Service</p>
                          <p className="text-white/40 text-xs">Ariel comes to you.</p>
                        </div>
                      </label>
                    )}

                    {isMobile && (
                      <div className="space-y-2 mb-6">
                        <label className="text-xs text-white/60 uppercase tracking-wider">Service Address</label>
                        <input 
                          type="text" 
                          value={address} 
                          onChange={e => setAddress(e.target.value)}
                          placeholder="123 Country Road, Nashville TN"
                          className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm focus:border-wh-pink focus:outline-none focus:ring-1 focus:ring-wh-pink transition-all"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs text-white/60 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={clientInfo.name} 
                        onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm focus:border-wh-pink focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-white/60 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        value={clientInfo.email} 
                        onChange={e => setClientInfo({...clientInfo, email: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm focus:border-wh-pink focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-white/60 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="tel" 
                        value={clientInfo.phone} 
                        onChange={e => setClientInfo({...clientInfo, phone: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm focus:border-wh-pink focus:outline-none transition-all"
                      />
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button 
                        onClick={() => setStep(1)}
                        className="w-1/3 bg-white/10 text-white hover:bg-white/20 font-bold py-4 rounded-full transition-all text-sm uppercase tracking-wider"
                      >
                        Back
                      </button>
                      <button 
                        disabled={isSubmitting || !clientInfo.name || !clientInfo.email || (isMobile && !address)}
                        onClick={handleBook}
                        className="w-2/3 bg-wh-pink hover:bg-white text-white hover:text-black font-bold py-4 rounded-full transition-all disabled:opacity-50 text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(255,42,117,0.3)]"
                      >
                        {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </motion.div>
                )}

              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
