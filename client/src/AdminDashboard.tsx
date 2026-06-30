import { useState } from 'react';
import { ShieldCheck, Lock, Activity, Users, DollarSign, ArrowLeft, Plus, Edit3, Trash2, Download, QrCode, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminDashboard() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'marketing' | 'memberships'>('overview');
  const [slideIndex, setSlideIndex] = useState(0);

  const [analytics, setAnalytics] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  // New Service Form State
  const [newService, setNewService] = useState({ category: 'Facials', name: '', price: '', durationMinutes: 60, isMobileEligible: true });

  const fetchData = async () => {
    try {
      const [analyticsRes, bookingsRes, servicesRes] = await Promise.all([
        fetch('http://localhost:3000/api/admin/analytics', { headers: { 'X-Admin-Pin': pin } }),
        fetch('http://localhost:3000/api/admin/bookings', { headers: { 'X-Admin-Pin': pin } }),
        fetch('http://localhost:3000/api/services')
      ]);

      if (!analyticsRes.ok) throw new Error('Invalid PIN');

      setAnalytics(await analyticsRes.json());
      setBookings(await bookingsRes.json());
      setServices(await servicesRes.json());
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await fetchData();
    setLoading(false);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3000/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Pin': pin },
        body: JSON.stringify({ ...newService, price: Number(newService.price) })
      });
      setNewService({ category: 'Facials', name: '', price: '', durationMinutes: 60, isMobileEligible: true });
      fetchData(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await fetch(`http://localhost:3000/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Pin': pin }
      });
      fetchData(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("booking-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "WillowAndHoney_BookingQR.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-wh-dark flex items-center justify-center p-4 font-outfit">
        <form onSubmit={handleLogin} className="bg-wh-card p-8 rounded-3xl border border-white/10 w-full max-w-md flex flex-col gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-wh-pink to-transparent opacity-50" />
          <div className="flex flex-col items-center gap-4 text-center z-10">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
              <Lock className="w-10 h-10 text-wh-pink" />
            </div>
            <h2 className="text-3xl font-playfair text-white italic">Command Center</h2>
            <p className="text-white/50 text-sm tracking-wide">Enter your secure PIN to access the Trust Layer backend.</p>
          </div>

          <div className="flex flex-col gap-2 z-10">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-black/60 border border-white/10 rounded-xl p-5 text-center text-3xl text-white font-mono tracking-[1em] focus:border-wh-pink focus:ring-1 focus:ring-wh-pink focus:outline-none transition-all"
              autoFocus
            />
            {error && <p className="text-wh-pink text-sm text-center animate-pulse">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full bg-wh-pink text-white font-bold py-5 rounded-xl hover:bg-white hover:text-wh-pink transition-all disabled:opacity-50 text-lg uppercase tracking-widest z-10 shadow-[0_0_20px_rgba(255,42,117,0.3)]"
          >
            {loading ? 'Decrypting...' : 'Unlock'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wh-dark text-white p-4 md:p-8 font-outfit selection:bg-wh-pink selection:text-white pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Tabs */}
        <header className="flex flex-col gap-6 pb-6 border-b border-white/10 sticky top-0 bg-wh-dark/90 backdrop-blur-xl z-50 pt-4 -mt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-playfair italic mb-2">Command Center</h1>
              <div className="flex items-center gap-2 text-white/50 text-xs font-inter tracking-[0.2em] uppercase">
                <ShieldCheck className="w-4 h-4 text-wh-pink" />
                Powered by DarkWave Trust Layer
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/20"
            >
              <ArrowLeft className="w-4 h-4" /> Live Site
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'services', label: 'Service Manager', icon: Edit3 },
              { id: 'marketing', label: 'Marketing Hub', icon: QrCode },
              { id: 'memberships', label: 'Memberships', icon: CreditCard }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-wh-pink text-white shadow-[0_0_15px_rgba(255,42,117,0.4)]' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-wh-card p-8 rounded-3xl border border-white/10 flex flex-col gap-4 relative overflow-hidden group hover:border-white/20 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/40 text-xs font-inter tracking-[0.2em] uppercase mb-2">Total Bookings</p>
                    <h3 className="text-5xl font-light">{analytics?.totalBookings || 0}</h3>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl text-white/80 group-hover:bg-white/10 transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-wh-card p-8 rounded-3xl border border-white/10 flex flex-col gap-4 relative overflow-hidden group hover:border-white/20 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/40 text-xs font-inter tracking-[0.2em] uppercase mb-2">Gross Revenue</p>
                    <h3 className="text-5xl font-light">${(analytics?.grossRevenue || 0).toLocaleString()}</h3>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl text-white/80 group-hover:bg-white/10 transition-colors">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-wh-card p-8 rounded-3xl border border-wh-pink flex flex-col gap-4 relative overflow-hidden shadow-[0_0_30px_rgba(255,42,117,0.15)]">
                <div className="flex justify-between items-start z-10">
                  <div>
                    <p className="text-wh-pink/80 text-xs font-inter tracking-[0.2em] uppercase mb-2 font-bold">Orbit Staffing (20%)</p>
                    <h3 className="text-5xl font-bold text-wh-pink">${(analytics?.trustLayerFee || 0).toLocaleString()}</h3>
                  </div>
                  <div className="p-4 bg-wh-pink/10 rounded-2xl text-wh-pink">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-wh-pink/20 blur-[60px]" />
              </div>
            </div>

            {/* Growth Chart */}
            <div className="bg-wh-card p-6 md:p-8 rounded-3xl border border-white/10">
              <h2 className="text-xl font-playfair italic mb-6">Revenue Growth (Live)</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.chartData?.length > 0 ? analytics.chartData : [{date: 'No Data', revenue: 0}]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a20', borderColor: '#ffffff20', borderRadius: '12px' }}
                      itemStyle={{ color: '#ff2a75' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#ff2a75" strokeWidth={3} dot={{ r: 4, fill: '#ff2a75', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#ffffff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-wh-card rounded-3xl border border-white/10 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-playfair italic">Recent Appointments</h2>
                <BadgeCheck />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/40 text-white/40 font-inter uppercase text-[10px] tracking-[0.2em]">
                    <tr>
                      <th className="p-6 font-medium">Client</th>
                      <th className="p-6 font-medium">Contact</th>
                      <th className="p-6 font-medium">Type</th>
                      <th className="p-6 font-medium">Time</th>
                      <th className="p-6 font-medium text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-white/30 italic">No bookings have been made yet.</td>
                      </tr>
                    ) : (
                      bookings.map((b: any) => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-6 font-medium">{b.clientName}</td>
                          <td className="p-6 text-white/60">
                            <div>{b.clientPhone}</div>
                            <div className="text-xs">{b.clientEmail}</div>
                          </td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-xs border ${b.isMobile ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : 'bg-blue-500/10 text-blue-300 border-blue-500/20'}`}>
                              {b.isMobile ? 'Mobile' : 'In-Studio'}
                            </span>
                          </td>
                          <td className="p-6 text-white/80">
                            {format(new Date(b.startTime), 'MMM d, h:mm a')}
                          </td>
                          <td className="p-6 text-right font-bold text-white">
                            ${b.servicePrice}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-wh-card p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <h2 className="text-2xl font-playfair italic">Add New Service</h2>
                <p className="text-sm text-white/50">Expand your menu instantly. Changes go live on the booking page immediately.</p>
                <form onSubmit={handleAddService} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-white/60 uppercase tracking-wider">Category</label>
                      <select 
                        value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-wh-pink focus:outline-none"
                      >
                        <option>Facials</option>
                        <option>Body Treatment</option>
                        <option>Hair Removal</option>
                        <option>Other Services</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-white/60 uppercase tracking-wider">Name</label>
                      <input 
                        type="text" required value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-wh-pink focus:outline-none"
                        placeholder="e.g. Signature Glow"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-white/60 uppercase tracking-wider">Price ($)</label>
                      <input 
                        type="number" required value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-wh-pink focus:outline-none"
                        placeholder="120"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-white/60 uppercase tracking-wider">Duration (mins)</label>
                      <input 
                        type="number" required value={newService.durationMinutes} onChange={e => setNewService({...newService, durationMinutes: Number(e.target.value)})}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-wh-pink focus:outline-none"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={newService.isMobileEligible} onChange={e => setNewService({...newService, isMobileEligible: e.target.checked})}
                      className="w-5 h-5 rounded border-white/20 text-wh-pink focus:ring-wh-pink bg-black"
                    />
                    <div className="text-sm">
                      <p className="font-medium">Mobile Eligible</p>
                      <p className="text-white/40 text-xs">Can you perform this service at the client's home?</p>
                    </div>
                  </label>
                  <button type="submit" className="w-full bg-wh-pink text-white font-bold py-4 rounded-xl hover:bg-white hover:text-wh-pink transition-all shadow-lg flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Add Service
                  </button>
                </form>
              </div>

              <div className="flex-1 bg-black/40 rounded-2xl p-6 border border-white/5">
                <h3 className="text-sm font-inter tracking-[0.2em] uppercase text-white/40 mb-6">Active Menu</h3>
                <div className="space-y-3 h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  {services.map(s => (
                    <div key={s.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center group hover:border-white/20 transition-all">
                      <div>
                        <h4 className="font-medium text-white">{s.name}</h4>
                        <div className="flex gap-3 text-xs text-white/50 mt-1">
                          <span>${s.price}</span>
                          <span>&bull;</span>
                          <span>{s.durationMinutes}m</span>
                          <span>&bull;</span>
                          <span className={s.isMobileEligible ? "text-green-400" : "text-red-400"}>
                            {s.isMobileEligible ? 'Mobile OK' : 'Studio Only'}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteService(s.id)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MARKETING TAB */}
        {activeTab === 'marketing' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-wh-card p-6 md:p-12 rounded-3xl border border-white/10 flex flex-col md:flex-row gap-12 items-center justify-between overflow-hidden relative">
              <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-wh-pink/5 blur-[100px] pointer-events-none rounded-full" />
              
              <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-wh-pink/50 bg-wh-pink/10 text-wh-pink text-xs font-bold tracking-widest uppercase">
                  <Activity className="w-4 h-4" /> Growth Tools
                </div>
                <h2 className="text-4xl md:text-5xl font-playfair italic leading-tight">Your Digital<br />Flyer is Ready.</h2>
                <p className="text-white/60 text-lg font-light max-w-md mx-auto md:mx-0">
                  Download your custom QR code. Print it on business cards, stickers, or post it on Instagram to drive direct bookings.
                </p>
                <button 
                  onClick={handleDownloadQR}
                  className="bg-white text-black font-bold py-4 px-8 rounded-full hover:bg-wh-pink hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-3 mx-auto md:mx-0"
                >
                  <Download className="w-5 h-5" /> Download QR Code Flyer
                </button>
              </div>

              <div className="relative z-10 bg-white p-8 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-white/20">
                <div className="text-center mb-6">
                  <h3 className="font-playfair italic text-3xl text-black">Willow & Honey</h3>
                  <p className="text-black/50 text-xs font-inter tracking-[0.2em] uppercase mt-2">Scan to Book</p>
                </div>
                <QRCodeSVG 
                  id="booking-qr-code"
                  value={window.location.origin}
                  size={250}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"Q"}
                  includeMargin={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* MEMBERSHIPS TAB */}
        {activeTab === 'memberships' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="bg-black/60 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl min-h-[500px] flex flex-col justify-center">
              
              <AnimatePresence mode="wait">
                {slideIndex === 0 && (
                  <motion.div 
                    key="slide1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center text-center max-w-xl mx-auto space-y-6"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-wh-pink to-purple-600 flex items-center justify-center shadow-[0_0_50px_rgba(255,42,117,0.3)]">
                      <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-playfair italic">The Trust Layer Economy</h2>
                    <p className="text-white/60 font-outfit text-lg font-light leading-relaxed">
                      Prepare for Recurring Revenue. The DarkWave Trust Layer will soon integrate directly with Stripe to allow you to capture payments instantly upon booking.
                    </p>
                  </motion.div>
                )}

                {slideIndex === 1 && (
                  <motion.div 
                    key="slide2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center text-center max-w-xl mx-auto space-y-6"
                  >
                    <div className="w-32 h-20 rounded-xl bg-gradient-to-r from-wh-gold via-yellow-500 to-wh-gold flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.3)] border border-white/20">
                      <span className="font-playfair italic text-black font-bold text-xl">VIP</span>
                    </div>
                    <h2 className="text-4xl font-playfair italic">VIP Memberships</h2>
                    <p className="text-white/60 font-outfit text-lg font-light leading-relaxed">
                      Why charge once when you can charge monthly? Soon, you will be able to offer exclusive VIP Memberships (e.g., $150/mo for 1 Facial + 1 Brow Wax). Guaranteed monthly income, automated billing.
                    </p>
                  </motion.div>
                )}

                {slideIndex === 2 && (
                  <motion.div 
                    key="slide3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center text-center max-w-xl mx-auto space-y-6"
                  >
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl">
                      <span className="font-bold text-[#635BFF] text-3xl tracking-tighter">stripe</span>
                    </div>
                    <h2 className="text-4xl font-playfair italic">Seamless Integration</h2>
                    <p className="text-white/60 font-outfit text-lg font-light leading-relaxed">
                      When this feature unlocks, you will be prompted to connect your bank account via Stripe. The Trust Layer handles the secure tokenization, you keep the profits.
                    </p>
                    <div className="px-6 py-3 bg-white/5 rounded-full border border-white/10 text-sm text-wh-pink uppercase tracking-widest mt-4">
                      Deploying Soon
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
                <button 
                  onClick={() => setSlideIndex(prev => Math.max(0, prev - 1))}
                  disabled={slideIndex === 0}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${slideIndex === i ? 'bg-wh-pink w-6' : 'bg-white/20'}`} />
                  ))}
                </div>
                <button 
                  onClick={() => setSlideIndex(prev => Math.min(2, prev + 1))}
                  disabled={slideIndex === 2}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function BadgeCheck() {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400">
      <ShieldCheck className="w-4 h-4" />
    </div>
  );
}
