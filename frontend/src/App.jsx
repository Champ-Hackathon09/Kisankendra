import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import FarmerDashboard from './pages/FarmerDashboard';
import OperatorConsole from './pages/OperatorConsole';
import Login from './pages/Login';
import BookingModal from './components/BookingModal';
import JFormModal from './components/JFormModal';
import CropStockSection from './components/CropStockSection';
import { api } from './api/client';
import {
  Users,
  ClipboardCheck,
  Building2,
  Map,
  Bot,
  CloudSun,
  TrendingUp,
  Bell,
  Search,
  RefreshCw,
  Clock,
  Tractor,
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  ShieldCheck,
  Activity,
  Droplets,
  Wind,
  Calendar,
  MapPin,
  Sparkles,
  Printer,
  Trash2,
  Save,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  PhoneCall,
  Send,
  FileCheck
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Global Booking and J-Form Modals
  const [centres, setCentres] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingCentreId, setBookingCentreId] = useState('');
  const [bookingCropType, setBookingCropType] = useState('');
  const [selectedJFormToken, setSelectedJFormToken] = useState(null);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchGlobalCentres = async () => {
    try {
      const res = await api.getCentres();
      setCentres(res.centres || []);
    } catch (err) {
      console.error('Error fetching global centres:', err);
    }
  };

  useEffect(() => {
    const currentUser = api.getUser();
    if (currentUser) {
      setUser(currentUser);
    }
    fetchGlobalCentres();
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    fetchGlobalCentres();
    if (userData?.role === 'OPERATOR') {
      setActiveTab('operator');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    api.clearSession();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleOpenBooking = (centreId = '', cropType = '') => {
    setBookingCentreId(centreId);
    setBookingCropType(cropType);
    setShowBookingModal(true);
  };

  const handleOpenJForm = (token) => {
    setSelectedJFormToken(token);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070c16]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-emerald-400">Connecting to KisanKendra Telemetry...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#070c16] text-slate-100 flex">
      {/* 1. Left Vertical Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlerts={3}
        user={user}
        onLogout={handleLogout}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#070c16]">
        {/* Top Floating Cyber-Agritech Command Bar */}
        <header className="bg-[#0b1222]/90 backdrop-blur-2xl border-b border-slate-800/80 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 z-20 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
          {/* Quick Search */}
          <div className="relative w-72 shrink-0">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token, centre, crop..."
              className="w-full bg-[#111c33] border border-slate-700/70 pl-10 pr-12 py-1.5 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition shadow-inner"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-emerald-400/60 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Ctrl K
            </span>
          </div>

          {/* Center: Live APMC Market Marquee / Ticker */}
          <div className="hidden lg:flex flex-1 items-center overflow-hidden bg-[#111c33]/70 border border-slate-800/80 rounded-xl px-3 py-1.5 shadow-inner">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 pr-3 border-r border-slate-700/60 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              APMC Ticker
            </div>
            <div className="overflow-hidden whitespace-nowrap w-full ml-3">
              <div className="animate-marquee flex items-center gap-6 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5">
                  🌾 <strong className="text-white">Wheat (Sharbati):</strong> <span className="text-emerald-400 font-bold">₹2,275/Qtl</span>
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="flex items-center gap-1.5">
                  🌾 <strong className="text-white">Paddy (Basmati):</strong> <span className="text-emerald-400 font-bold">₹2,300/Qtl</span>
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="flex items-center gap-1.5">
                  🌼 <strong className="text-white">Mustard (Sarson):</strong> <span className="text-emerald-400 font-bold">₹5,650/Qtl</span>
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="flex items-center gap-1.5">
                  🌱 <strong className="text-white">Gram (Chana):</strong> <span className="text-emerald-400 font-bold">₹5,440/Qtl</span>
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="flex items-center gap-1.5">
                  🚜 <strong className="text-white">Karnal Yard:</strong> <span className="text-cyan-300 font-bold">0 Waiting at Ingate</span>
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="flex items-center gap-1.5">
                  ⚖️ <strong className="text-white">Weighbridges:</strong> <span className="text-emerald-400 font-bold">Bays #1 & #2 Operational</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Real-time IST Digital Clock */}
            <div className="hidden sm:flex items-center gap-2 bg-[#111c33] border border-slate-800 px-3 py-1.5 rounded-xl shadow-xs">
              <Clock size={13} className="text-emerald-400 animate-pulse" />
              <div className="text-xs font-mono font-bold text-emerald-300 tracking-wider">
                {currentTime}
              </div>
            </div>

            {user.role === 'OPERATOR' && (
              <button
                onClick={() => setActiveTab(activeTab === 'operator' ? 'dashboard' : 'operator')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'operator'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/50'
                }`}
              >
                <Scale size={13} />
                {activeTab === 'operator' ? 'Farmer Portal' : 'Operator Mode'}
              </button>
            )}

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xs font-bold shadow-md border border-emerald-400/40">
                {user.name?.charAt(0) || 'K'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight font-display">{user.name}</div>
                <div className="text-[10px] text-emerald-400 font-semibold leading-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {user.role} Verified
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-400 hover:text-rose-300 px-2.5 py-1.5 rounded-xl border border-slate-800 hover:border-rose-500/30 hover:bg-rose-950/40 transition cursor-pointer"
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dynamic View Body with 100% Full-Width Real Estate & Animated Orbs */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10 w-full relative">
          {/* Ambient Glowing Background Elements */}
          <div className="absolute top-10 right-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none animate-float-slow"></div>
          <div className="absolute bottom-20 left-40 w-[650px] h-[650px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse-subtle"></div>
          <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[130px] pointer-events-none animate-float-gentle"></div>

          <div className="w-full relative z-10 animate-fade-in-up">
            {activeTab === 'dashboard' && <FarmerDashboard user={user} onNavigate={setActiveTab} />}
            {activeTab === 'operator' && <OperatorConsole user={user} />}
            {activeTab === 'stocks' && (
              <CropStockSection onBookCropSlot={(crop) => handleOpenBooking('', crop)} />
            )}
            {activeTab === 'queue' && <QueueView searchQuery={searchQuery} user={user} />}
            {activeTab === 'status' && (
              <StatusView
                searchQuery={searchQuery}
                user={user}
                onBookSlot={() => handleOpenBooking()}
                onViewJForm={handleOpenJForm}
              />
            )}
            {activeTab === 'centres' && (
              <CentresView
                searchQuery={searchQuery}
                user={user}
                onBookSlot={(cId) => handleOpenBooking(cId)}
                onCentresUpdated={fetchGlobalCentres}
              />
            )}
            {activeTab === 'map' && <MapView />}
            {activeTab === 'predictions' && <AIPredictionsView />}
            {activeTab === 'weather' && <WeatherView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'alerts' && <AlertsView />}
            {activeTab === 'help' && <HelpView />}
            {activeTab === 'settings' && <SettingsView user={user} onUserUpdated={setUser} />}
          </div>
        </main>
      </div>

      {/* Global Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setBookingCropType('');
        }}
        centres={centres}
        initialCentreId={bookingCentreId}
        initialCropType={bookingCropType}
        onSuccess={() => {
          fetchGlobalCentres();
        }}
      />

      {/* Global J-Form Voucher Modal */}
      <JFormModal
        isOpen={!!selectedJFormToken}
        onClose={() => setSelectedJFormToken(null)}
        token={selectedJFormToken}
      />
    </div>
  );
}

// -------------------------------------------------------------
// 1. LIVE QUEUE VIEW (Connected to SQLite API)
// -------------------------------------------------------------
function QueueView({ searchQuery, user }) {
  const [centres, setCentres] = useState([]);
  const [selectedCentreId, setSelectedCentreId] = useState('');
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchCentres = async () => {
    try {
      const res = await api.getCentres();
      const list = res.centres || [];
      setCentres(list);
      if (list.length > 0 && !selectedCentreId) {
        setSelectedCentreId(list[0].id);
      }
    } catch (err) {
      console.error('Error fetching centres:', err);
    }
  };

  const fetchQueue = async (centreId, silent = false) => {
    if (!centreId) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await api.getQueue(centreId);
      setQueueData(data);
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (tokenId, newStatus) => {
    try {
      setUpdatingId(tokenId);
      await api.updateTokenStatus(tokenId, { status: newStatus });
      setActionSuccess(`Token status successfully updated to "${newStatus}"!`);
      setTimeout(() => setActionSuccess(''), 4000);
      await fetchQueue(selectedCentreId, true);
    } catch (err) {
      alert(err.message || 'Failed to update token status');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  useEffect(() => {
    if (selectedCentreId) {
      fetchQueue(selectedCentreId);
      const interval = setInterval(() => fetchQueue(selectedCentreId, true), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedCentreId]);

  const selectedCentre = centres.find((c) => c.id === selectedCentreId) || queueData?.centre;

  const allTokens = [
    ...(queueData?.inProgressToken ? [queueData.inProgressToken] : []),
    ...(queueData?.calledTokens || []),
    ...(queueData?.waitingTokens || []),
  ];

  const q = (searchQuery || '').toLowerCase();
  const filteredTokens = allTokens.filter(
    (t) =>
      (t.tokenNumber || '').toLowerCase().includes(q) ||
      (t.cropType || '').toLowerCase().includes(q) ||
      (t.farmer?.name || '').toLowerCase().includes(q) ||
      (t.vehicleNumber || '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="text-emerald-700 h-6 w-6" />
            <h2 className="text-lg font-black text-slate-900">Real-Time Mandi Queue Telemetry</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Live queue positions and weighbridge processing times across APMC centers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedCentreId}
            onChange={(e) => setSelectedCentreId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          >
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.district})
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchQueue(selectedCentreId, true)}
            disabled={refreshing}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Queue"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-emerald-600' : ''} />
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trolleys in Queue</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{allTokens.length} Vehicles</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">FIFO Gate Order</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Waiting Time</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            ~{queueData?.stats?.estimatedTotalWaitMinutes || 15} Mins
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Capacity: {selectedCentre?.capacityPerHour || 5} trucks / hour
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Operational Status</div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                selectedCentre?.operationalStatus === 'NORMAL'
                  ? 'bg-emerald-500 animate-pulse'
                  : selectedCentre?.operationalStatus === 'RUSH'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500'
              }`}
            ></span>
            <span className="text-lg font-black text-slate-800">{selectedCentre?.operationalStatus || 'NORMAL'}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Weighbridges active & calibrated</div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Active Queue Tokens</span>
          <span className="text-[11px] font-semibold text-slate-400">Live DB Telemetry</span>
        </div>

        {actionSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              {actionSuccess}
            </span>
            <button onClick={() => setActionSuccess('')} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-bold text-slate-500">Connecting to Mandi Yard Database...</p>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Vehicles Currently Waiting</h3>
            <p className="text-xs text-slate-500 mt-1">The weighbridge is clear or all tokens have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">FIFO Pos</th>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Farmer Name</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Est. Weight</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Slot Time</th>
                  <th className="py-3 px-4">Est. Gate Clearance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Change Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTokens.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center font-black px-2 py-0.5 rounded-md text-[11px] ${
                        t.status === 'CALLED'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        #{t.fifoRank || idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{t.tokenNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{t.farmer?.name || 'Farmer'}</td>
                    <td className="py-3 px-4 text-slate-600">{t.cropType}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{t.estimatedWeight} Qtl</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{t.vehicleNumber || '—'}</td>
                    <td className="py-3 px-4 text-slate-500">{t.slotTime}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Clock size={12} className="text-emerald-600 shrink-0" />
                        <span>{t.estimatedClearanceTime || `${t.estimatedWaitMinutes || 12} mins`}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          t.status === 'CALLED'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {t.status === 'CALLED' && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'BOOKED')}
                            disabled={updatingId === t.id}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                            title="Revert status back to BOOKED"
                          >
                            <Check size={12} />
                            Set to BOOKED
                          </button>
                        )}
                        <select
                          value={t.status}
                          onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                          disabled={updatingId === t.id}
                          className="bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 text-[11px] font-bold rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition cursor-pointer"
                        >
                          <option value="BOOKED">BOOKED (Queue)</option>
                          <option value="CALLED">CALLED (Gate)</option>
                          <option value="IN_PROGRESS">IN_PROGRESS (Weighbridge)</option>
                          <option value="COMPLETED">COMPLETED (Passed)</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. STATUS & J-FORM VIEW (Connected to SQLite API with Cancel & Voucher)
// -------------------------------------------------------------
function StatusView({ searchQuery, user, onBookSlot, onViewJForm }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const res = await api.getMyTokens();
      setTokens(res.tokens || []);
    } catch (err) {
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleCancelToken = async (tokenId) => {
    if (!window.confirm('Are you sure you want to cancel this procurement slot booking?')) return;
    try {
      await api.cancelToken(tokenId, 'Cancelled by farmer');
      fetchTokens();
    } catch (err) {
      alert(err.message || 'Failed to cancel token');
    }
  };

  const q = (searchQuery || '').toLowerCase();
  const filtered = tokens.filter(
    (t) =>
      (t.tokenNumber || '').toLowerCase().includes(q) ||
      (t.cropType || '').toLowerCase().includes(q) ||
      (t.centre?.name || '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-emerald-700 h-6 w-6" />
            <h2 className="text-lg font-black text-slate-900">Procurement Acceptance & J-Form Status</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of moisture records, certified weighbridge slips, and Direct Benefit Transfer (DBT)
          </p>
        </div>
        <button
          onClick={onBookSlot}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
        >
          Book New Slot
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-bold text-slate-500">Fetching procurement records from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Tokens Booked Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Book your delivery slot at your nearest APMC centre.</p>
          <button
            onClick={onBookSlot}
            className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-emerald-200"
          >
            Book Mandi Slot Now
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((token) => (
            <div
              key={token.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {token.tokenNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{token.centre?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      token.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : token.status === 'CALLED'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : token.status === 'CANCELLED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {token.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Crop Commodity</div>
                  <div className="font-bold text-slate-800 mt-0.5">{token.cropType}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Scheduled Slot</div>
                  <div className="font-semibold text-slate-700 mt-0.5">
                    {token.slotDate} ({token.slotTime})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Weight Record</div>
                  <div className="font-semibold text-slate-700 mt-0.5">
                    Est: {token.estimatedWeight} Qtl
                    {token.actualWeight && (
                      <span className="text-emerald-600 font-bold ml-1">| Gross: {token.actualWeight} Qtl</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Moisture Content</div>
                  <div className="font-semibold text-slate-700 mt-0.5">
                    {token.moistureLevel ? `${token.moistureLevel}% (Approved)` : 'Pending Inspection'}
                  </div>
                </div>
              </div>

              {/* J-Form / MSP Payout Summary & Actions */}
              <div className="mt-2 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-slate-50/75 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-slate-600">
                  <FileText size={16} className="text-emerald-600" />
                  <span>
                    MSP Value: <strong>₹{((token.actualWeight || token.estimatedWeight) * 2275).toLocaleString('en-IN')}</strong> (Govt. MSP
                    @ ₹2,275/Qtl)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {token.status === 'CALLED' && (
                    <button
                      onClick={async () => {
                        try {
                          await api.updateTokenStatus(token.id, { status: 'BOOKED' });
                          fetchTokens();
                        } catch (err) {
                          alert(err.message || 'Failed to revert status');
                        }
                      }}
                      className="text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 font-bold px-2.5 py-1 rounded-lg border border-amber-300 transition cursor-pointer"
                      title="Revert status to BOOKED"
                    >
                      ↩ Revert to Booked
                    </button>
                  )}
                  {token.status === 'BOOKED' && (
                    <button
                      onClick={() => handleCancelToken(token.id)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 transition"
                    >
                      Cancel Token
                    </button>
                  )}
                  <button
                    onClick={() => onViewJForm(token)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                  >
                    <Printer size={13} className="text-emerald-400" /> View & Print Form-J
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 3. APMC CENTRES VIEW (With Live Status Toggle & Direct Booking)
// -------------------------------------------------------------
function CentresView({ searchQuery, user, onBookSlot, onCentresUpdated }) {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  const fetchCentres = async () => {
    try {
      setLoading(true);
      const res = await api.getCentres();
      setCentres(res.centres || []);
    } catch (err) {
      console.error('Error loading centres:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  const handleStatusChange = async (centreId, newStatus) => {
    try {
      setUpdatingId(centreId);
      await api.updateCentreStatus(centreId, newStatus);
      await fetchCentres();
      if (onCentresUpdated) onCentresUpdated();
    } catch (err) {
      alert(err.message || 'Failed to update centre status');
    } finally {
      setUpdatingId('');
    }
  };

  const q = (searchQuery || '').toLowerCase();
  const filtered = centres.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.district || '').toLowerCase().includes(q) ||
      (c.state || '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="text-emerald-700 h-6 w-6" />
            <h2 className="text-lg font-black text-slate-900">Designated APMC Procurement Mandis</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Government PACS and APMC grain procurement yards with real-time operational status
          </p>
        </div>
        <button
          onClick={fetchCentres}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-bold text-slate-500">Loading procurement centers from database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((centre) => (
            <div
              key={centre.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {centre.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      centre.operationalStatus === 'NORMAL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : centre.operationalStatus === 'RUSH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {centre.operationalStatus}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{centre.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span>{centre.address}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs text-center">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Hourly Intake</div>
                  <div className="font-bold text-slate-800">{centre.capacityPerHour} Trucks/Hr</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Wait Time</div>
                  <div className="font-bold text-amber-600">~{centre.currentWaitMinutes} Mins</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Active Queue</div>
                  <div className="font-bold text-emerald-700">{centre.activeQueueCount || 0} Vehicles</div>
                </div>
              </div>

              {/* Operator Quick Status Controller */}
              {user.role === 'OPERATOR' && (
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Operator Control:</div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      onClick={() => handleStatusChange(centre.id, 'NORMAL')}
                      disabled={updatingId === centre.id}
                      className={`py-1 rounded-lg border font-bold ${
                        centre.operationalStatus === 'NORMAL'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      🟢 Normal
                    </button>
                    <button
                      onClick={() => handleStatusChange(centre.id, 'RUSH')}
                      disabled={updatingId === centre.id}
                      className={`py-1 rounded-lg border font-bold ${
                        centre.operationalStatus === 'RUSH'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      🟡 Rush
                    </button>
                    <button
                      onClick={() => handleStatusChange(centre.id, 'PAUSED')}
                      disabled={updatingId === centre.id}
                      className={`py-1 rounded-lg border font-bold ${
                        centre.operationalStatus === 'PAUSED'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      🔴 Pause
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => onBookSlot(centre.id)}
                disabled={centre.operationalStatus === 'PAUSED'}
                className={`mt-4 w-full font-bold text-xs py-2.5 rounded-xl border transition flex items-center justify-center gap-1.5 ${
                  centre.operationalStatus === 'PAUSED'
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border-emerald-200 shadow-sm'
                }`}
              >
                {centre.operationalStatus === 'PAUSED' ? 'Intake Paused' : 'Book Delivery Slot at This Mandi →'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 4. GEOSPATIAL YARD MAP VIEW (Dynamic APMC telemetry)
// -------------------------------------------------------------
function MapView() {
  const [centres, setCentres] = useState([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    api.getCentres().then((res) => {
      const list = res.centres || [];
      setCentres(list);
      if (list.length > 0) setSelectedId(list[0].id);
    });
  }, []);

  const activeCentre = centres.find((c) => c.id === selectedId) || centres[0];

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Map className="text-emerald-700 h-6 w-6" />
            <h2 className="text-lg font-black text-slate-900">Live Geospatial Yard Congestion Map</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual layout, queue flow and bottlenecks at Mandi entry gate, weighbridge, and storage sheds
          </p>
        </div>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5"
        >
          {centres.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Gate 1 */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Mandi Main Gate 1</div>
            <div className="text-sm font-black text-slate-800 mt-1">Ingate Token Check</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">
              🟢 Inflow Active ({activeCentre?.activeQueueCount || 2} vehicles queued)
            </div>
          </div>

          {/* Weighbridge 1 */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Weighbridge #1 (Gross)</div>
            <div className="text-sm font-black text-slate-800 mt-1">Gross Truck Scale</div>
            <div className="text-xs text-amber-600 font-semibold mt-1">
              🟡 Capacity: {activeCentre?.capacityPerHour || 6} trolleys/hr
            </div>
          </div>

          {/* Unloading Sheds */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Unloading Sheds A & B</div>
            <div className="text-sm font-black text-slate-800 mt-1">Moisture & Grain Dump</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">🟢 4 Covered Bays Operational</div>
          </div>

          {/* Weighbridge 2 & Exit */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Tare Scale & J-Form Outgate</div>
            <div className="text-sm font-black text-slate-800 mt-1">Slip Certification</div>
            <div className="text-xs text-blue-600 font-semibold mt-1">🟢 Rapid Clearance</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Activity size={16} className="text-emerald-600" />
            <span>
              Telemetry Sensor Feed for <strong>{activeCentre?.name}</strong>: Congestion Status is{' '}
              <strong className="text-emerald-700">{activeCentre?.operationalStatus || 'NORMAL'}</strong>
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[10px]">Real-time SQLite Feed</span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. AI PREDICTIONS VIEW (Surge & Forecast)
// -------------------------------------------------------------
function AIPredictionsView() {
  return (
    <div className="space-y-5">
      <div className="bg-[#091f16]/90 backdrop-blur-xl p-5 rounded-3xl border border-emerald-500/25 shadow-xl text-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Bot className="h-6 w-6 text-purple-300" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-display">AI Waiting Time & Surge Predictor</h2>
            <p className="text-xs text-emerald-400/70 mt-0.5 font-medium">
              Machine learning forecasts based on historical intake patterns and hourly farmer arrivals
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#091f16]/85 backdrop-blur-xl p-5 rounded-3xl border border-emerald-500/20 shadow-lg space-y-3 card-hover-effect">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={16} className="text-emerald-400" />
            Recommended Best Slot
          </div>
          <div className="p-4 bg-emerald-950/70 border border-emerald-400/40 rounded-2xl shadow-inner">
            <div className="text-2xl font-black text-emerald-200 font-display">11:00 AM – 12:00 PM</div>
            <div className="text-xs text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} />
              Lowest projected waiting time today: <strong>~12 minutes</strong>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Based on current queue velocities, early morning (08:00 AM) and post-lunch (02:00 PM) shifts have the highest
            congestion.
          </p>
        </div>

        <div className="bg-[#091f16]/85 backdrop-blur-xl p-5 rounded-3xl border border-emerald-500/20 shadow-lg space-y-3 card-hover-effect">
          <div className="text-slate-300 font-bold text-xs uppercase tracking-wider">Hourly Wait Forecast</div>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400">08:00 AM – 10:00 AM (Morning Surge)</span>
                <span className="font-bold text-amber-400 font-mono">35 mins</span>
              </div>
              <div className="w-full bg-[#061710] rounded-full h-2 overflow-hidden border border-emerald-500/15">
                <div className="bg-amber-400 h-full rounded-full w-[65%]"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400">10:00 AM – 01:00 PM (Optimal Speed)</span>
                <span className="font-bold text-emerald-400 font-mono">12 mins</span>
              </div>
              <div className="w-full bg-[#061710] rounded-full h-2 overflow-hidden border border-emerald-500/15">
                <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full w-[25%] shadow-sm"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400">02:00 PM – 05:00 PM (Moderate)</span>
                <span className="font-bold text-cyan-300 font-mono">22 mins</span>
              </div>
              <div className="w-full bg-[#061710] rounded-full h-2 overflow-hidden border border-emerald-500/15">
                <div className="bg-cyan-500 h-full rounded-full w-[45%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. WEATHER & MOISTURE INTELLIGENCE VIEW
// -------------------------------------------------------------
function WeatherView() {
  return (
    <div className="space-y-5">
      <div className="bg-[#091f16]/90 backdrop-blur-xl p-5 rounded-3xl border border-emerald-500/25 shadow-xl text-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <CloudSun className="h-6 w-6 text-cyan-300 animate-float-slow" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-display">Mandi Yard Weather & Grain Safety</h2>
            <p className="text-xs text-emerald-400/70 mt-0.5 font-medium">
              Moisture risk indices and open-shed weather monitoring for harvested wheat and paddy
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#091f16]/85 backdrop-blur-xl p-5 rounded-3xl border border-emerald-500/20 shadow-lg card-hover-effect">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Karnal APMC Yard Weather</div>
          <div className="text-4xl font-black text-white mt-2 font-display flex items-center gap-2">
            28°C
            <span className="text-xs font-semibold text-emerald-400 font-sans">Clear Sky</span>
          </div>
          <div className="text-xs text-slate-300 font-semibold mt-1">Low Rain Probability • Optimal Procurement</div>
          <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1 text-cyan-300">
              <Droplets size={14} /> 42% Humidity
            </span>
            <span className="flex items-center gap-1 text-teal-300">
              <Wind size={14} /> 11 km/h Wind
            </span>
          </div>
        </div>

        <div className="bg-[#091f16]/85 backdrop-blur-xl p-5 rounded-3xl border border-emerald-500/20 shadow-lg card-hover-effect">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Moisture Rejection Limit</div>
          <div className="text-4xl font-black text-emerald-300 mt-2 font-display">12.0%</div>
          <div className="text-xs text-emerald-400 font-semibold mt-1">Government FAQ Standard</div>
          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-emerald-500/20 leading-relaxed">
            Wheat exceeding 12% moisture requires aeration under covered sheds prior to certified weighment.
          </p>
        </div>

        <div className="bg-[#091f16]/85 backdrop-blur-xl p-5 rounded-3xl border border-emerald-500/20 shadow-lg card-hover-effect">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tarpaulin Shed Reserve</div>
          <div className="text-4xl font-black text-cyan-300 mt-2 font-display">1,200 Covers</div>
          <div className="text-xs text-cyan-400 font-semibold mt-1">Ready at Shed Bay 4</div>
          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-emerald-500/20 leading-relaxed">
            Rain protection waterproof tarpaulins available free of cost for all unbagged tractor trolley lines.
          </p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. INTAKE & METRICS VIEW (Connected to Database Analytics API)
// -------------------------------------------------------------
function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics();
      setData(res.analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-700 h-6 w-6" />
            <h2 className="text-lg font-black text-slate-900">Procurement Velocity & Quota Metrics</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time aggregate data computed directly from active database records
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-bold text-slate-500">Computing analytics from database...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Tokens Issued</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{data?.totalTokens || 0} Slips</div>
              <div className="text-[10px] text-emerald-600 font-semibold">In SQLite Database</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Completed Procurement</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{data?.completedTokens || 0} Delivered</div>
              <div className="text-[10px] text-slate-500">Weighment Certified</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Active In Queue</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{data?.activeTokens || 0} Vehicles</div>
              <div className="text-[10px] text-amber-700 font-semibold">Awaiting Processing</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Produce Volume</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{data?.totalWeightQuintals || 0} Qtl</div>
              <div className="text-[10px] text-emerald-600 font-semibold">MSP Settlement: {data?.totalMSPDisbursed || '₹0'}</div>
            </div>
          </div>

          {/* Commodity Distribution Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Procurement Commodity Distribution (Database Records)</h3>
            <div className="space-y-3 text-xs">
              {data?.cropBreakdown && Object.keys(data.cropBreakdown).length > 0 ? (
                Object.entries(data.cropBreakdown).map(([crop, count]) => {
                  const percentage = Math.round((count / (data.totalTokens || 1)) * 100);
                  return (
                    <div key={crop} className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{crop}</span>
                        <span className="text-emerald-700">{count} Tokens ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-400 italic">No crop data recorded yet.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 8. ALERTS & BROADCASTS VIEW
// -------------------------------------------------------------
function AlertsView() {
  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Bell className="text-rose-600 h-6 w-6" />
          <h2 className="text-lg font-black text-slate-900">Urgent Mandi Broadcasts</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">Live advisory notices from District Marketing Officers</p>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-700" />
            Karnal APMC: Weighbridge #2 Recalibration
          </div>
          <p className="text-amber-800">
            Weighbridge #2 is scheduled for routine test weights verification between 01:00 PM – 01:45 PM. All trolleys
            are rerouted to Weighbridge #1.
          </p>
        </div>

        <div className="p-4 bg-emerald-50/80 border border-emerald-200 text-emerald-900 rounded-2xl text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-700" />
            Sehore Mandi: Fresh Gunny Bags Stock Arrived
          </div>
          <p className="text-emerald-800">
            A fresh batch of 20,000 standard 50kg jute gunny bags has arrived at Warehouse Shed 4. Bagging is operating
            smoothly.
          </p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 9. COMPREHENSIVE HELP & SUPPORT CENTER
// -------------------------------------------------------------
function HelpView() {
  const [activeTab, setActiveTab] = useState('faqs');
  const [openFaq, setOpenFaq] = useState(0);
  const [faqSearch, setFaqSearch] = useState('');

  // Grievance form state
  const [issueType, setIssueType] = useState('Weighbridge Discrepancy');
  const [mandiName, setMandiName] = useState('Karnal APMC Grain Market Centre');
  const [tokenNo, setTokenNo] = useState('');
  const [description, setDescription] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      q: 'How does the Mandi Queue & Token System work?',
      a: 'Farmers book advance arrival slots for their nearest APMC mandi online. When your turn arrives, the mandi gate operator activates "Call Next" and an alert prompts you to "Proceed to Gate" on your dashboard. This eliminates long roadside queues and multi-hour traffic congestion.',
      category: 'Queue & Token',
    },
    {
      q: 'What documents are required at the Mandi Gate?',
      a: 'Required entry documents: 1. KisanKendra Digital Token QR Gate Pass, 2. Aadhaar Card (linked to bank account), 3. State Farmer Portal Registration Slip (Meri Fasal Mera Byora / MP E-Uparjan).',
      category: 'Documents',
    },
    {
      q: 'When and how is the MSP DBT payment disbursed?',
      a: 'After electronic weighment and moisture inspection are certified, a digital Form-J voucher is issued upon gate exit. Approved procurement funds are transferred directly via PFMS / DBT into the farmer\'s Aadhaar-linked bank account within 48 to 72 hours.',
      category: 'MSP & Payment',
    },
    {
      q: 'What happens if crop moisture exceeds 12%?',
      a: 'Under government Fair Average Quality (FAQ) standards, the maximum permissible moisture for wheat is 12.0%. If moisture exceeds 12%, farmers are provided covered shed space for grain aeration and drying, and can re-weigh the consignment on the same day.',
      category: 'Quality & Moisture',
    },
    {
      q: 'Can I cancel or reschedule a booked token?',
      a: 'Yes! While your token is in "BOOKED" status, you can cancel it anytime from your dashboard or the "J-Form & Tokens" tab by clicking "Cancel Token", and then reserve a new slot.',
      category: 'Cancellation',
    },
    {
      q: 'What happens if my vehicle arrives late?',
      a: 'Each scheduled slot includes a ±45 minute arrival grace period. If arrival is delayed beyond this window, your token is automatically sequenced into the next available intake opening. Tokens are never cancelled due to minor transit delays.',
      category: 'Arrival Window',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const handleGrievanceSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const ticketId = `KK-GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicket({
        id: ticketId,
        type: issueType,
        mandi: mandiName,
        token: tokenNo || 'General Query',
        date: new Date().toLocaleString(),
      });
      setSubmitting(false);
      setDescription('');
      setTokenNo('');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-700/60 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              24x7 Mandi Support Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">KisanKendra Help & Support Center</h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 font-medium">
            Government procurement assistance, frequently asked questions, toll-free helplines, and grievance redressal
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-emerald-700/60">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'faqs'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'bg-emerald-700/40 hover:bg-emerald-700/70 text-white'
            }`}
          >
            ❓ FAQs
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'process'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'bg-emerald-700/40 hover:bg-emerald-700/70 text-white'
            }`}
          >
            📋 Mandi Process Guide
          </button>
          <button
            onClick={() => setActiveTab('helplines')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'helplines'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'bg-emerald-700/40 hover:bg-emerald-700/70 text-white'
            }`}
          >
            📞 Toll-Free Helplines
          </button>
          <button
            onClick={() => setActiveTab('grievance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'grievance'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'bg-emerald-700/40 hover:bg-emerald-700/70 text-white'
            }`}
          >
            📝 File Grievance Ticket
          </button>
        </div>
      </div>

      {/* Tab 1: FAQs */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search questions (e.g., moisture, token, MSP payment, documents)..."
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            {faqSearch && (
              <button
                onClick={() => setFaqSearch('')}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">{item.q}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      <div className="pt-2">{item.a}</div>
                      <div className="mt-3 inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        Category: {item.category}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Mandi Process Guide */}
      {activeTab === 'process' && (
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Step-by-Step Mandi Procurement & Queue Workflow
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Complete transparent government procurement workflow from token booking to direct bank account settlement
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                  1
                </div>
                <h4 className="text-xs font-bold text-slate-900">1. Advance Slot Booking</h4>
                <p className="text-xs text-slate-600">
                  Select your preferred APMC mandi, crop commodity, estimated weight, and arrival time slot online to generate your digital token.
                </p>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-sm flex items-center justify-center">
                  2
                </div>
                <h4 className="text-xs font-bold text-slate-900">2. Gate Entry & QR Scan</h4>
                <p className="text-xs text-slate-600">
                  When called by the operator, click "Proceed to Gate" on your dashboard and show your digital QR pass at the entrance scanner.
                </p>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center">
                  3
                </div>
                <h4 className="text-xs font-bold text-slate-900">3. Gross Weighment</h4>
                <p className="text-xs text-slate-600">
                  Drive tractor-trolley onto Digital Weighbridge Scale #1 where calibrated electronic load sensors capture gross produce weight.
                </p>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  4
                </div>
                <h4 className="text-xs font-bold text-slate-900">4. Moisture Inspection</h4>
                <p className="text-xs text-slate-600">
                  Quality assayers sample grain and inspect moisture using digital meters (Standard permissible limit: ≤ 12.0%).
                </p>
              </div>

              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center">
                  5
                </div>
                <h4 className="text-xs font-bold text-slate-900">5. Covered Shed Unloading</h4>
                <p className="text-xs text-slate-600">
                  Unload verified grain at designated platforms and covered sheds for safe packaging into standard 50kg jute gunny bags.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center">
                  6
                </div>
                <h4 className="text-xs font-bold text-slate-900">6. Tare Weighment & Form-J DBT</h4>
                <p className="text-xs text-slate-600">
                  Empty vehicle tare weight is logged, generating the official digital Form-J voucher. Funds are disbursed within 48 to 72 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Helplines */}
      {activeTab === 'helplines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-emerald-600" />
              Emergency & Government Toll-Free Helplines
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-950">National Kisan Call Centre (KCC)</div>
                  <div className="text-slate-500 text-[11px]">6:00 AM to 10:00 PM (Toll-Free)</div>
                </div>
                <a href="tel:18001801551" className="font-mono text-emerald-700 text-sm font-black underline">
                  1800-180-1551
                </a>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Haryana APMC State Control Room</div>
                  <div className="text-slate-500 text-[11px]">Karnal, Kaithal & Kurukshetra Mandi Support</div>
                </div>
                <a href="tel:01722560341" className="font-mono text-slate-800 text-sm font-bold">
                  0172-2560341
                </a>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Madhya Pradesh Mandi Board</div>
                  <div className="text-slate-500 text-[11px]">Sehore, Bhopal & Vidisha Mandi Support</div>
                </div>
                <a href="tel:18002331551" className="font-mono text-slate-800 text-sm font-bold">
                  1800-233-1551
                </a>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-950">PFMS / DBT Payment Helpdesk</div>
                  <div className="text-slate-500 text-[11px]">Inquiries regarding MSP bank credit and transfers</div>
                </div>
                <a href="tel:1800118111" className="font-mono text-blue-700 text-sm font-bold">
                  1800-118-111
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Mandatory Mandi Gate Entry Checklist
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Aadhaar-Linked Bank Account:</strong>
                  Ensure your bank account is active and seeded with Aadhaar for seamless DBT payout.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Clean & Dry Produce:</strong>
                  Ensure grains are dry and free from foreign particles (moisture ≤ 12.0%) to prevent rejection.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Digital Gate Pass / SMS:</strong>
                  Keep your KisanKendra token QR code or SMS confirmation ready on your mobile device.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: File Grievance Ticket */}
      {activeTab === 'grievance' && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-slate-900">Farmer Support & Grievance Ticket</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              If you experience issues with weighment, moisture inspection, queue priority, or payment transfer, file a ticket.
            </p>
          </div>

          {submittedTicket ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h4 className="text-base font-black text-slate-900">Grievance Ticket Registered Successfully!</h4>
              <div className="text-xs text-slate-600">
                Your Ticket Number: <strong className="font-mono text-emerald-800">{submittedTicket.id}</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-left text-xs space-y-1">
                <div><strong>Issue Category:</strong> {submittedTicket.type}</div>
                <div><strong>Mandi Centre:</strong> {submittedTicket.mandi}</div>
                <div><strong>Date & Time:</strong> {submittedTicket.date}</div>
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold">
                A District Marketing Officer (DMO) will contact you within 24 hours.
              </p>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                File Another Ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleGrievanceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Grievance Category</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
                >
                  <option value="Weighbridge Discrepancy">Weighbridge Scale Discrepancy</option>
                  <option value="Moisture Rejection Dispute">Moisture Testing Dispute</option>
                  <option value="DBT MSP Payment Delay">DBT MSP Bank Payment Delay</option>
                  <option value="Gate Token Not Called">Queue Call Priority Delay</option>
                  <option value="Gunny Bag Shortage">Gunny Bag / Baradana Shortage</option>
                  <option value="Other">Other Procurement Assistance</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Associated APMC Mandi</label>
                  <select
                    value={mandiName}
                    onChange={(e) => setMandiName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
                  >
                    <option value="Karnal APMC Grain Market Centre">Karnal APMC Grain Market Centre</option>
                    <option value="Sehore Krishi Upaj Mandi">Sehore Krishi Upaj Mandi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Token Number (Optional)</label>
                  <input
                    type="text"
                    value={tokenNo}
                    onChange={(e) => setTokenNo(e.target.value.toUpperCase())}
                    placeholder="e.g. KK-2026-1001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Issue Description</label>
                <textarea
                  rows="3"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide a concise description of your grievance..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Submitting Ticket...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Submit Support Ticket
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 10. SETTINGS VIEW (Interactive & Directly Connected to SQLite DB)
// -------------------------------------------------------------
function SettingsView({ user, onUserUpdated }) {
  const [name, setName] = useState(user.name || '');
  const [state, setState] = useState(user.state || 'Haryana');
  const [district, setDistrict] = useState(user.district || 'Karnal');
  const [village, setVillage] = useState(user.village || 'Taraori');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErr('');

    try {
      const res = await api.updateProfile({
        name,
        state,
        district,
        village,
      });

      // Update local storage and app state
      const updatedUser = { ...user, ...res.user };
      localStorage.setItem('kk_user', JSON.stringify(updatedUser));
      if (onUserUpdated) onUserUpdated(updatedUser);

      setMsg('Profile changes saved successfully to database!');
      setTimeout(() => setMsg(''), 4000);
    } catch (error) {
      setErr(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-700 h-6 w-6" />
          <h2 className="text-lg font-black text-slate-900">User Profile & System Preferences</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal details stored in the KisanKendra database
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
        {msg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600" />
            {msg}
          </div>
        )}

        {err && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
            {err}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Registered Mobile (Permanent Key)</label>
            <input
              type="text"
              disabled
              value={user.phone}
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-bold mb-1">Account Role</label>
              <input
                type="text"
                disabled
                value={user.role}
                className="w-full px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-800 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-bold mb-1">District</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-bold mb-1">Village / Gram</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5 transition"
          >
            {loading ? (
              <span>Saving to Database...</span>
            ) : (
              <>
                <Save size={15} /> Save Changes to Database
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
