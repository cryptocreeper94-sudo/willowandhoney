import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Portal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wh_portal_auth');
    if (saved) {
      const data = JSON.parse(saved);
      setIsLoggedIn(true);
      setClientId(data.clientId);
      setClientName(data.name);
      fetchJourneys(data.clientId);
    }
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      setIsLoggedIn(true);
      setClientId(data.clientId);
      setClientName(data.name);
      localStorage.setItem('wh_portal_auth', JSON.stringify(data));
      fetchJourneys(data.clientId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchJourneys = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/journey?clientId=${id}`);
      const data = await res.json();
      setJourneys(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wh_portal_auth');
    setIsLoggedIn(false);
    setClientId(null);
    setJourneys([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-wh-dark text-white flex flex-col items-center justify-center relative p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-wh-pink/10 via-wh-dark to-black pointer-events-none" />
        <Link to="/" className="absolute top-8 left-8 text-white/50 hover:text-white flex items-center gap-2 transition-colors z-10">
          <ArrowLeft className="w-5 h-5" /> Back
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bg-black/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 z-10 shadow-2xl">
          <div className="text-center mb-8">
            <Lock className="w-8 h-8 text-wh-pink mx-auto mb-4" />
            <h1 className="text-3xl font-playfair italic mb-2">Skin Journey</h1>
            <p className="text-white/50 font-outfit text-xs uppercase tracking-widest">Client Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-wh-pink transition-colors font-outfit"
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="6-Digit PIN" 
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-wh-pink transition-colors font-outfit tracking-[0.5em]"
              />
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button type="submit" className="w-full bg-wh-pink hover:bg-white text-white hover:text-black font-bold py-4 rounded-full transition-colors uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,42,117,0.3)] mt-4">
              Unlock
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wh-dark text-white p-6 md:p-12 relative overflow-x-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <h1 className="text-4xl font-playfair italic">Welcome back, {clientName?.split(' ')[0]}</h1>
            <p className="text-wh-pink font-outfit uppercase tracking-widest text-xs mt-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Secure Client Portal
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white/50 hover:text-white font-outfit text-sm transition-colors">Book Next</Link>
            <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full font-outfit text-xs uppercase tracking-widest transition-colors">
              Lock
            </button>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-white/50">Loading your journey...</div>
        ) : journeys.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-[40px]">
            <Sparkles className="w-12 h-12 text-wh-pink/50 mx-auto mb-4" />
            <p className="text-white/60 font-outfit">Your skin journey starts here.</p>
          </div>
        ) : (
          <div className="space-y-12 relative">
            <div className="absolute top-0 bottom-0 left-6 md:left-12 w-px bg-white/10" />
            {journeys.map((j: any, index: number) => (
              <motion.div 
                key={j.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-16 md:pl-32"
              >
                <div className="absolute left-5 md:left-11 w-3 h-3 bg-wh-pink rounded-full top-6 shadow-[0_0_10px_rgba(255,42,117,1)]" />
                <div className="absolute left-0 top-6 w-16 md:w-32 text-xs font-outfit text-white/50 -translate-y-1/2 hidden md:block">
                  {new Date(j.sessionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-sm">
                  <div className="md:hidden text-xs text-wh-pink mb-4 font-outfit uppercase tracking-widest">
                    {new Date(j.sessionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  
                  {j.photos && j.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {j.photos.map((p: any) => (
                        <div key={p.id} className="relative rounded-2xl overflow-hidden aspect-[3/4]">
                          <img src={p.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt={p.type} />
                          <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] uppercase tracking-widest">
                            {p.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <h3 className="text-xl font-playfair italic text-white mb-4">Session Notes</h3>
                  <p className="text-white/70 font-outfit text-sm leading-relaxed mb-6">
                    {j.notes}
                  </p>

                  {j.recommendations && (
                    <div className="bg-wh-pink/10 border border-wh-pink/20 rounded-2xl p-4">
                      <h4 className="text-wh-pink font-outfit uppercase tracking-widest text-xs mb-2">Ariel's Recommendations</h4>
                      <p className="text-white/80 font-outfit text-sm">
                        {j.recommendations}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
