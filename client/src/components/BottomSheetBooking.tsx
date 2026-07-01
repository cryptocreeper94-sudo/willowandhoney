import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

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
    if (!service || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    try {
      // Build ISO start and end times from selectedDate + selectedTime string
      const [timePart, ampm] = selectedTime.split(' ');
      const [hStr, mStr] = timePart.split(':');
      let hours = parseInt(hStr, 10);
      const minutes = parseInt(mStr, 10);
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      const startDate = new Date(selectedDate);
      startDate.setHours(hours, minutes, 0, 0);
      const durationMinutes = isMobile
        ? Math.max(service.durationMinutes, 120)
        : service.durationMinutes;
      const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientInfo.name,
          clientEmail: clientInfo.email,
          clientPhone: clientInfo.phone,
          serviceId: service.id,
          isMobile,
          address: isMobile ? address : null,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Booking failed');
      }
      setIsSuccess(true);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Something went wrong. Please try again.');
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

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  // Fetch real availability from server when date changes
  useEffect(() => {
    if (!selectedDate || !service) {
      setAvailableTimes([]);
      return;
    }
    setLoadingSlots(true);
    setSelectedTime(null);
    const dateStr = selectedDate.toISOString().split('T')[0];
    fetch(`/api/availability?date=${dateStr}&serviceId=${service.id}&isMobile=${isMobile}`)
      .then(r => r.json())
      .then(data => setAvailableTimes(data.slots || []))
      .catch(() => setAvailableTimes([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, service, isMobile]);

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
                      <Calendar 
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date.getDay() !== 0 && date.getDay() !== 6} // 0 is Sunday, 6 is Saturday
                        className="text-white"
                      />
                    </div>

                    {selectedDate && (
                      <div className="grid grid-cols-2 gap-3 mt-6">
                        {loadingSlots ? (
                          <div className="col-span-2 text-center text-white/50 text-xs py-4 animate-pulse">
                            Checking availability...
                          </div>
                        ) : availableTimes.length > 0 ? (
                          availableTimes.map(time => (
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
                          ))
                        ) : (
                          <div className="col-span-2 text-center text-white/50 text-xs py-4">
                            No available slots for this duration today.
                          </div>
                        )}
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
