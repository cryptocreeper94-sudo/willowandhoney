import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

// Using the same PRICING list as defined in App.tsx (in a real app, this would be fetched from /api/services)
const SERVICES = [
  { id: 1, name: "Back treatment", duration: 90, isMobileEligible: true },
  { id: 2, name: "30 minute facial", duration: 90, isMobileEligible: true }, // duration includes downtime
  { id: 3, name: "Brow wax", duration: 30, isMobileEligible: true },
  { id: 4, name: "Lash lift", duration: 30, isMobileEligible: true },
];

export function BookingWidget() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
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
      // Simulation of hitting our API
      // await fetch('http://localhost:3000/api/bookings', { method: 'POST', ... })
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isSuccess) {
    return (
      <div className="bento-card flex flex-col items-center justify-center text-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <CheckCircle className="w-20 h-20 text-wh-gold mb-6" />
        </motion.div>
        <h2 className="text-3xl font-playfair text-white mb-4">You're Booked, Gorgeous!</h2>
        <p className="text-gray-300 font-inter max-w-sm">
          Ariel has received your appointment request. You'll get a confirmation email shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bento-card">
      <h2 className="text-2xl font-playfair text-white mb-6 border-b border-wh-pink/20 pb-4">
        Book Your Session
      </h2>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h3 className="text-wh-pink font-outfit uppercase tracking-widest mb-4 text-sm">Select Service</h3>
          <div className="space-y-3">
            {SERVICES.map(s => (
              <button 
                key={s.id}
                onClick={() => setSelectedService(s.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedService === s.id ? 'border-wh-gold bg-wh-gold/10' : 'border-white/10 hover:border-wh-pink/50 bg-black/30'}`}
              >
                <p className="text-white font-medium">{s.name}</p>
                <p className="text-sm text-gray-400">{s.duration} mins</p>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <input type="checkbox" id="mobile" checked={isMobile} onChange={(e) => setIsMobile(e.target.checked)} className="w-4 h-4 accent-wh-pink" />
            <label htmlFor="mobile" className="text-gray-300 cursor-pointer">Request In-Home Mobile Service (Min 2hrs)</label>
          </div>

          {isMobile && (
            <div className="mt-4">
              <label className="text-sm text-gray-400 mb-2 block">Service Address</label>
              <input 
                type="text" 
                value={address} 
                onChange={e => setAddress(e.target.value)}
                placeholder="123 Country Road, Nashville TN"
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-wh-pink"
              />
            </div>
          )}

          <button 
            disabled={!selectedService || (isMobile && !address)}
            onClick={() => setStep(2)}
            className="w-full mt-6 bg-wh-pink hover:bg-wh-gold text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-wh-pink"
          >
            Continue
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h3 className="text-wh-pink font-outfit uppercase tracking-widest mb-4 text-sm flex justify-between">
            Pick Date & Time
            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white lowercase text-xs">← back</button>
          </h3>
          
          <div className="bg-black/30 rounded-xl p-4 flex justify-center mb-6">
             <DayPicker 
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ dayOfWeek: [1, 2, 3, 4, 5] }} // Weekends only
                className="text-white"
                modifiersClassNames={{
                  selected: 'bg-wh-pink text-white font-bold rounded-full',
                  today: 'text-wh-gold font-bold'
                }}
             />
          </div>

          {selectedDate && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['09:00 AM', '10:00 AM', '11:00 AM'].map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 rounded-lg border text-sm font-medium transition-all ${selectedTime === time ? 'bg-wh-gold text-black border-wh-gold' : 'border-white/10 text-gray-300 hover:border-wh-pink'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}

          <button 
            disabled={!selectedDate || !selectedTime}
            onClick={() => setStep(3)}
            className="w-full bg-wh-pink hover:bg-wh-gold text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-wh-pink"
          >
            Continue
          </button>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h3 className="text-wh-pink font-outfit uppercase tracking-widest mb-4 text-sm flex justify-between">
            Your Details
            <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white lowercase text-xs">← back</button>
          </h3>

          <div className="space-y-4 mb-8">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={clientInfo.name} 
              onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-wh-pink"
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={clientInfo.email} 
              onChange={e => setClientInfo({...clientInfo, email: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-wh-pink"
            />
            <input 
              type="tel" 
              placeholder="Phone Number" 
              value={clientInfo.phone} 
              onChange={e => setClientInfo({...clientInfo, phone: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-wh-pink"
            />
          </div>

          <button 
            disabled={!clientInfo.name || !clientInfo.email || !clientInfo.phone || isSubmitting}
            onClick={handleBook}
            className="w-full bg-wh-gold hover:bg-white text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex justify-center items-center gap-2"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
