import { useState } from 'react';
import { Terminal, Shield, ArrowLeft } from 'lucide-react';

export function DevPortal() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dev/analytics', { headers: { 'X-Dev-Pin': pin } });
      if (!res.ok) throw new Error('Unauthorized');
      setMetrics(await res.json());
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono text-[#00ff00]">
        <form onSubmit={handleLogin} className="w-full max-w-md flex flex-col gap-6">
          <div className="text-center">
            <Terminal className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="text-2xl font-bold tracking-[0.2em] uppercase">DarkWave System Auth</h1>
            <p className="text-sm opacity-50 mt-2">Enter Root PIN</p>
          </div>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="bg-black border border-[#00ff00]/30 p-4 text-center text-xl tracking-[0.5em] focus:border-[#00ff00] focus:outline-none transition-colors rounded-none"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm text-center animate-pulse">{error}</p>}
          <button
            type="submit"
            disabled={loading || !pin}
            className="border border-[#00ff00] py-4 hover:bg-[#00ff00] hover:text-black uppercase tracking-widest font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Access Terminal'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#00ff00] font-mono p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b border-[#00ff00]/30 pb-4">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-widest">DarkWave Operations</h1>
              <p className="text-xs opacity-60">Status: {metrics?.systemHealth}</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 border border-[#00ff00]/30 px-4 py-2 hover:bg-[#00ff00]/10 transition-colors text-sm uppercase"
          >
            <ArrowLeft className="w-4 h-4" /> Disconnect
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#00ff00]/30 p-6 flex flex-col gap-2">
            <p className="text-xs opacity-60 uppercase tracking-widest">Total Platform Revenue</p>
            <h2 className="text-4xl">${metrics?.grossRevenue || 0}</h2>
          </div>
          <div className="border border-[#00ff00] bg-[#00ff00]/5 p-6 flex flex-col gap-2 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
            <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Trust Layer Fee (20%)</p>
            <h2 className="text-4xl font-bold">${metrics?.trustLayerFee || 0}</h2>
          </div>
          <div className="border border-[#00ff00]/30 p-6 flex flex-col gap-2">
            <p className="text-xs opacity-60 uppercase tracking-widest">Total Bookings</p>
            <h2 className="text-4xl">{metrics?.totalBookings || 0}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[#00ff00]/30 p-6 flex flex-col gap-2">
            <p className="text-xs opacity-60 uppercase tracking-widest">Total Page Views</p>
            <h2 className="text-3xl">{metrics?.totalPageViews || 0}</h2>
          </div>
          <div className="border border-[#00ff00]/30 p-6 flex flex-col gap-2">
            <p className="text-xs opacity-60 uppercase tracking-widest">Unique Visitors</p>
            <h2 className="text-3xl">{metrics?.totalUniqueVisitors || 0}</h2>
          </div>
        </div>
        
        <div className="mt-12 text-center text-xs opacity-40 uppercase tracking-[0.3em]">
          Powered by DarkWave Studios LLC &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
