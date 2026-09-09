import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import BookingModal from '../components/BookingModal';
import JFormModal from '../components/JFormModal';
import GatePassModal from '../components/GatePassModal';
import CropStockSection from '../components/CropStockSection';
import { getCropImage, CROP_DATA_MAP, handleCropImageError } from '../utils/cropUtils';
import {
  Calendar,
  Clock,
  MapPin,
  Tractor,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Timer,
  Scale,
  ArrowRight,
  FileText,
  Sparkles,
  Zap,
  Warehouse,
  Layers,
  Droplets,
  Ticket,
  Building2,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

export default function FarmerDashboard({ user, onNavigate }) {
  const [centres, setCentres] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState('');
  const [selectedCropForBooking, setSelectedCropForBooking] = useState('');
  const [selectedTokenForJForm, setSelectedTokenForJForm] = useState(null);
  const [selectedTokenForGatePass, setSelectedTokenForGatePass] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('active'); // 'active' | 'crops' | 'history'
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [refreshNotice, setRefreshNotice] = useState('');
  
  // Smart Auto-Advance Queue Automation (Countdown & Automatic Lifecycle Progression)
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [autoCountdown, setAutoCountdown] = useState(20);

  const handleOpenBooking = (cropName = '', centreId = '') => {
    if (centreId) setSelectedCentre(centreId);
    setSelectedCropForBooking(cropName);
    setShowBookingModal(true);
  };

  const handleCancelToken = async (tokenId) => {
    if (!window.confirm('Are you sure you want to cancel this procurement slot booking?')) return;
    try {
      await api.cancelToken(tokenId, 'Cancelled by farmer');
      fetchData(true, 'Token cancelled. Yard queue updated in real time.');
    } catch (err) {
      alert(err.message || 'Failed to cancel token');
    }
  };

  const handleRevertToBooked = async (tokenId) => {
    try {
      await api.updateTokenStatus(tokenId, { status: 'BOOKED' });
      fetchData(true, 'Token status returned to BOOKED.');
    } catch (err) {
      alert(err.message || 'Failed to revert token status');
    }
  };

  const handleAdvanceToGate = async (tokenId) => {
    try {
      await api.updateTokenStatus(tokenId, { status: 'CALLED' });
      fetchData(true, 'Token dispatched to Mandi Gate! Gate Entry QR Pass is ready.');
    } catch (err) {
      alert(err.message || 'Failed to advance token to gate');
    }
  };

  const handleStartWeighment = async (tokenId) => {
    try {
      await api.updateTokenStatus(tokenId, { status: 'IN_PROGRESS' });
      fetchData(true, 'Tractor entered weighbridge! Gross weighment in progress.');
    } catch (err) {
      alert(err.message || 'Failed to start weighment');
    }
  };

  const handleCompleteMandiTrip = async (tokenId, weight) => {
    if (!window.confirm('Mark this delivery complete? The order will move to Completed History and the next vehicle in line will move up.')) return;
    try {
      await api.updateTokenStatus(tokenId, {
        status: 'COMPLETED',
        actualWeight: parseFloat(weight) || 40,
        moistureLevel: 11.5,
      });
      fetchData(true, 'Delivery completed! Form-J issued & next vehicle in line stepped forward.');
    } catch (err) {
      alert(err.message || 'Failed to complete delivery');
    }
  };

  const fetchData = async (isManual = false, customNotice = '') => {
    try {
      setLoading(true);
      const [centresRes, tokensRes] = await Promise.all([
        api.getCentres(),
        api.getMyTokens(),
      ]);
      setCentres(centresRes.centres || []);
      setTokens(tokensRes.tokens || []);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (centresRes.centres?.length > 0 && !selectedCentre) {
        setSelectedCentre(centresRes.centres[0].id);
      }
      if (isManual || customNotice) {
        setRefreshNotice(customNotice || 'Queue status & dynamic wait times updated in real time!');
        setTimeout(() => setRefreshNotice(''), 4000);
      }
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Strict FIFO Priority & BookMyShow Lifecycle Segregation:
  // 1. Active tokens: CALLED at top (highest priority), then IN_PROGRESS, then BOOKED (ordered by FIFO createdAt)
  const activeTokens = tokens
    .filter((t) => ['CALLED', 'IN_PROGRESS', 'BOOKED'].includes(t.status))
    .sort((a, b) => {
      const priorityOrder = { CALLED: 1, IN_PROGRESS: 2, BOOKED: 3 };
      const pA = priorityOrder[a.status] || 4;
      const pB = priorityOrder[b.status] || 4;
      if (pA !== pB) return pA - pB;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

  // 2. History tokens: Completed or Cancelled tokens automatically moved out of active queue
  const historyTokens = tokens
    .filter((t) => ['COMPLETED', 'CANCELLED'].includes(t.status))
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  // Automatic Queue Lifecycle Runner (Auto-Advances when enabled or on countdown)
  useEffect(() => {
    if (!autoAdvance) return;

    const timer = setInterval(() => {
      setAutoCountdown((prev) => {
        if (prev <= 1) {
          // Perform automatic stage advance
          if (activeTokens.length > 0) {
            const inProgressToken = activeTokens.find((t) => t.status === 'IN_PROGRESS');
            if (inProgressToken) {
              api.updateTokenStatus(inProgressToken.id, {
                status: 'COMPLETED',
                actualWeight: inProgressToken.estimatedWeight || 40,
                moistureLevel: 11.5,
              }).then(() => fetchData(true, `⚡ Auto-Advance: Weighment completed for ${inProgressToken.tokenNumber}!`));
              return 20;
            }

            const calledToken = activeTokens.find((t) => t.status === 'CALLED');
            if (calledToken) {
              api.updateTokenStatus(calledToken.id, { status: 'IN_PROGRESS' })
                .then(() => fetchData(true, `⚡ Auto-Advance: ${calledToken.tokenNumber} entered weighbridge!`));
              return 20;
            }

            const bookedFront = activeTokens.find((t) => t.status === 'BOOKED');
            if (bookedFront) {
              api.updateTokenStatus(bookedFront.id, { status: 'CALLED' })
                .then(() => fetchData(true, `⚡ Auto-Advance: Gate call issued for ${bookedFront.tokenNumber}!`));
              return 20;
            }
          }
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoAdvance, activeTokens]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'BOOKED':
        return (
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
            <Clock className="h-3.5 w-3.5 text-blue-300" /> Queued in Line
          </span>
        );
      case 'CALLED':
        return (
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5 shadow-md shadow-amber-500/30">
            <AlertCircle className="h-3.5 w-3.5" /> Gate Entry Call — Proceed to Mandi!
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Scale className="h-3.5 w-3.5 text-purple-300" /> On Weighbridge (Weighment Active)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Procurement Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold px-2.5 py-1 rounded-full">
            Cancelled
          </span>
        );
      default:
        return <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-slide-up">
      {/* Welcome Command Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-black/60 overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-[#0a2317] via-[#0c2e1f] to-[#06150e] transition-all duration-300 hover:border-emerald-400/50">
        {/* Ambient Radial Lights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300 animate-spin" style={{ animationDuration: '6s' }} />
              Farmer Procurement Telemetry Portal
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-200 font-semibold bg-black/40 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Yard Telemetry &bull; Synced {lastSyncTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-display text-gradient-light">
            Welcome back, {user?.name || 'Farmer'}! 🌾
          </h1>
          <p className="text-emerald-200/90 text-xs sm:text-sm mt-2 leading-relaxed max-w-2xl font-medium">
            Plan your mandi arrival with precision. Schedule advance delivery slots, inspect live weighbridge wait times, and eliminate multi-hour roadside congestion.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenBooking()}
              className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 hover:from-emerald-300 hover:to-teal-300 px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 text-slate-950 stroke-[2.5]" />
              Schedule Delivery Slot
            </button>
            <button
              type="button"
              onClick={() => setDashboardTab('crops')}
              className="bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-100 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-200 border border-emerald-500/40 cursor-pointer shadow-sm hover:border-emerald-400/70 hover:scale-[1.02] active:scale-95"
            >
              <Warehouse className="h-4 w-4 text-emerald-400" />
              View Silo Stocks & MSP
            </button>
            <button
              onClick={() => fetchData(true)}
              className="bg-black/40 hover:bg-black/60 text-emerald-200 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-200 border border-emerald-500/30 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              Refresh Queue Status
            </button>
            <button
              type="button"
              onClick={() => {
                const nextVal = !autoAdvance;
                setAutoAdvance(nextVal);
                setAutoCountdown(15);
                if (nextVal) {
                  setRefreshNotice('⚡ Auto-Advance ON: Vehicles will automatically move through Gate -> Scale -> Complete!');
                  setTimeout(() => setRefreshNotice(''), 4500);
                } else {
                  setRefreshNotice('Auto-Advance turned OFF (Manual Mode active).');
                  setTimeout(() => setRefreshNotice(''), 3000);
                }
              }}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer border shadow-sm hover:scale-[1.02] active:scale-95 ${
                autoAdvance
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 ring-2 ring-amber-300/60 shadow-lg shadow-amber-500/40 animate-pulse'
                  : 'bg-emerald-950/70 hover:bg-emerald-900 text-amber-200 border-amber-500/30'
              }`}
            >
              <Zap className={`h-4 w-4 ${autoAdvance ? 'text-amber-900 animate-bounce' : 'text-amber-400'}`} />
              {autoAdvance ? `Auto-Advance: ON (${autoCountdown}s)` : '⚡ Auto-Advance Queue: OFF'}
            </button>
            {refreshNotice && (
              <span className="bg-black/80 border border-emerald-400/60 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in shadow-lg">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> {refreshNotice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* FRONT & CENTER: DIRECT BOOKING SLOT PANEL (सामने Booking Slot) */}
      <div className="bg-gradient-to-r from-[#092218] via-[#0d2e21] to-[#071912] rounded-3xl p-5 sm:p-6 border-2 border-emerald-400/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-emerald-400 animate-pulse" />
                  Live Booking Slots (सामने Instant Schedule)
                </span>
                <span className="text-xs font-semibold text-emerald-300">Direct Gate Pass Generation</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display mt-1">
                Select Your Mandi Arrival Delivery Slot
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Pick an available time window below for zero-wait weighbridge entry at your nearest APMC yard.
              </p>
            </div>

            <button
              onClick={() => handleOpenBooking()}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-950/60 flex items-center gap-2 cursor-pointer transition active:scale-95 shrink-0 self-start md:self-auto"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              Open Full Booking Desk →
            </button>
          </div>

          {/* Quick Slot Grid (सामने) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mt-4">
            {[
              { slot: '08:00 AM - 09:00 AM', status: 'AVAILABLE', left: '6 Open', color: 'emerald' },
              { slot: '09:00 AM - 10:00 AM', status: 'AVAILABLE', left: '5 Open', color: 'emerald' },
              { slot: '10:00 AM - 11:00 AM', status: 'RECOMMENDED', left: 'Fast Filling', color: 'amber' },
              { slot: '11:00 AM - 12:00 PM', status: 'AVAILABLE', left: '4 Open', color: 'emerald' },
              { slot: '12:00 PM - 01:00 PM', status: 'AVAILABLE', left: '6 Open', color: 'emerald' },
              { slot: '02:00 PM - 03:00 PM', status: 'AVAILABLE', left: '5 Open', color: 'emerald' },
              { slot: '03:00 PM - 04:00 PM', status: 'AVAILABLE', left: '6 Open', color: 'emerald' },
              { slot: '04:00 PM - 05:00 PM', status: 'AVAILABLE', left: '6 Open', color: 'emerald' },
            ].map((item) => (
              <button
                key={item.slot}
                type="button"
                onClick={() => handleOpenBooking()}
                className="p-2.5 rounded-xl text-left bg-[#061710] hover:bg-[#0b281d] border border-emerald-500/25 hover:border-emerald-400 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:scale-[1.03] shadow-md"
              >
                <div className="text-[10px] font-mono font-bold text-white leading-tight">
                  {item.slot.split(' - ')[0]}
                </div>
                <div className="text-[9px] text-slate-400 font-medium">
                  to {item.slot.split(' - ')[1]}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                      item.color === 'amber'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    }`}
                  >
                    {item.left}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Commodity Silo Strip */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-xs">
                <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display drop-shadow-md">
                APMC Designated Commodities & Live Silo Rates
              </h3>
            </div>
            <p className="text-xs text-emerald-300 font-semibold mt-1 flex items-center gap-1.5 pl-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Government MSP benchmark rates & live warehouse intake capacity
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDashboardTab(dashboardTab === 'crops' ? 'active' : 'crops')}
            className="text-xs font-black text-emerald-200 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 px-4 py-2 rounded-xl border border-emerald-500/40 transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95 shrink-0 self-start sm:self-auto"
          >
            {dashboardTab === 'crops' ? 'Show Active Queue' : 'View Full Silo Dashboard'} <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(CROP_DATA_MAP).map(([name, info]) => (
            <div
              key={name}
              onClick={() => handleOpenBooking(name)}
              className="group relative bg-[#091f16]/90 hover:bg-[#0c2e21] rounded-2xl border border-emerald-500/25 hover:border-emerald-400 shadow-lg hover:shadow-[0_12px_28px_rgba(16,185,129,0.25)] p-2.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1.5"
            >
              <div className="relative h-24 w-full rounded-xl overflow-hidden bg-slate-900 mb-2">
                <img
                  src={info.image}
                  alt={name}
                  onError={(e) => handleCropImageError(e, name)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-[9px] font-bold text-slate-200 px-1.5 py-0.5 rounded-md border border-white/15">
                  {(info.season || 'Harvest').split(' ')[0]}
                </span>
                <span className="absolute bottom-1.5 right-1.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-[10px] font-black text-emerald-300 px-2 py-0.5 rounded-lg shadow-md border border-emerald-400/50 group-hover:border-emerald-300 transition-colors">
                  ₹{info.msp}
                </span>
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-200 line-clamp-1 leading-tight group-hover:text-emerald-300 transition-colors font-display">
                  {info.shortName}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                  <span className="font-medium">Max {info.maxMoisture}</span>
                  <span className="text-emerald-400 font-bold group-hover:text-emerald-200 flex items-center gap-0.5">
                    Book <ArrowRight className="h-2.5 w-2.5 inline group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Active Tokens & Mandi Centres */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Tokens (BookMyShow-Style Tabbed Intake vs Completed History) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-xs">
                  <Ticket className="h-4 w-4 text-emerald-400" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display drop-shadow-md">
                  Your Procurement Tokens
                </h2>
              </div>
              <p className="text-xs text-emerald-300 font-semibold mt-1 flex items-center gap-1.5 pl-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Live queue telemetry, strict FIFO rankings, and gate clearance updates
              </p>
            </div>

            {/* BookMyShow Style Lifecycle Navigation Tabs */}
            <div className="flex items-center bg-[#071711] p-1.5 rounded-2xl border border-emerald-500/25 shadow-inner">
              <button
                type="button"
                onClick={() => setDashboardTab('active')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  dashboardTab === 'active'
                    ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-md border border-emerald-400/40 shadow-emerald-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Active Queue ({activeTokens.length})
              </button>
              <button
                type="button"
                onClick={() => setDashboardTab('crops')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  dashboardTab === 'crops'
                    ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-md border border-emerald-400/40 shadow-emerald-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Warehouse className="h-3.5 w-3.5 text-emerald-400" />
                🌾 Crop Silo Stocks
              </button>
              <button
                type="button"
                onClick={() => setDashboardTab('history')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  dashboardTab === 'history'
                    ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-md border border-emerald-400/40 shadow-emerald-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Completed & Receipts ({historyTokens.length})
              </button>
            </div>
          </div>

          {/* CROP SILO STOCKS TAB */}
          {dashboardTab === 'crops' && (
            <CropStockSection onBookCropSlot={(cropName) => handleOpenBooking(cropName)} />
          )}

          {/* ACTIVE QUEUE TAB */}
          {dashboardTab === 'active' && (
            <>
              {activeTokens.length === 0 ? (
                <div className="bg-[#091f16]/95 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
                  {/* Subtle decorative radial light */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-950/60 animate-float-slow">
                      <Tractor className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-black text-white font-display">No Active Procurement Tokens in Queue</h3>
                    <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed font-medium">
                      You currently have no pending mandi intake slots. Reserve your next delivery slot below to receive an automated FIFO token with live weighbridge telemetry.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => handleOpenBooking()}
                        className="inline-flex items-center gap-2 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
                      >
                        <PlusCircle className="h-4 w-4 stroke-[2.5]" /> Schedule Arrival Delivery Slot
                      </button>
                      <button
                        onClick={() => setDashboardTab('crops')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-200 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
                      >
                        <Warehouse className="h-4 w-4 text-emerald-400" /> Check Silo Stocks & Rates
                      </button>
                    </div>

                    {/* Telemetry Feature Badges */}
                    <div className="mt-8 pt-6 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                      <div className="bg-[#061710] p-3 rounded-xl border border-emerald-500/20">
                        <div className="text-[10px] uppercase font-bold text-emerald-400">Strict FIFO Rule</div>
                        <div className="text-xs font-semibold text-slate-200 mt-0.5">Automated Gate Sequence</div>
                      </div>
                      <div className="bg-[#061710] p-3 rounded-xl border border-emerald-500/20">
                        <div className="text-[10px] uppercase font-bold text-teal-400">Zero Wait Mandi</div>
                        <div className="text-xs font-semibold text-slate-200 mt-0.5">Real-Time Weighbridge Alert</div>
                      </div>
                      <div className="bg-[#061710] p-3 rounded-xl border border-emerald-500/20">
                        <div className="text-[10px] uppercase font-bold text-amber-400">DBT Bank Transfer</div>
                        <div className="text-xs font-semibold text-slate-200 mt-0.5">Instant Digital Form-J</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTokens.map((token, index) => {
                    // Calculate FIFO position relative to waiting booked tokens
                    const bookedIndex = activeTokens
                      .filter((t) => t.status === 'BOOKED')
                      .findIndex((t) => t.id === token.id);
                    const fifoPosNumber = bookedIndex !== -1 ? bookedIndex + 1 : index + 1;

                    return (
                      <div
                        key={token.id}
                        className={`bg-[#091f16]/90 backdrop-blur-xl rounded-2xl border transition-all overflow-hidden card-hover-effect ${
                          token.status === 'CALLED'
                            ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-2xl shadow-amber-500/20'
                            : 'border-emerald-500/25 shadow-xl hover:border-emerald-400/50'
                        }`}
                      >
                        {/* Priority Gate Call Alert Strip (Pushes to Very Top) */}
                        {token.status === 'CALLED' && (
                          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 flex items-center justify-between shadow-inner">
                            <span className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 shrink-0 animate-bounce" />
                              GATE ENTRY CALL: YOUR TOKEN HAS BEEN DISPATCHED TO ENTER THE MANDI!
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedTokenForGatePass(token)}
                              className="text-[11px] uppercase tracking-wider bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-lg font-black text-white shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-white/20 shrink-0"
                            >
                              Proceed to Gate <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        <div className="p-5">
                          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-emerald-500/20 pb-4">
                            <div className="flex items-start gap-3.5">
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md border border-emerald-400/40 shrink-0 bg-slate-900">
                                <img
                                  src={getCropImage(token.cropType)}
                                  alt={token.cropType || 'Crop'}
                                  onError={(e) => handleCropImageError(e, token.cropType)}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-emerald-950/90 text-[9px] text-emerald-300 font-bold text-center py-0.5 backdrop-blur-xs border-t border-emerald-500/20">
                                  {(token.cropType || 'Produce').split(' ')[0]}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-2xl font-black text-white tracking-tight font-display">{token.tokenNumber}</span>
                                  {getStatusBadge(token.status)}
                                  {token.status === 'BOOKED' && (
                                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
                                      token.isNextInLine || token.queuePosition === 1
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse'
                                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    }`}>
                                      {token.isNextInLine || token.queuePosition === 1 ? '🔥 Next to Enter (Pos #1)' : `FIFO Pos #${token.queuePosition || fifoPosNumber}`}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1 font-medium">
                                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                                  {token.centre?.name || 'Procurement Centre'} ({token.centre?.district}, {token.centre?.state})
                                </p>
                              </div>
                            </div>

                            {/* Live Dynamic Queue Estimate */}
                            {token.status === 'BOOKED' && (
                              <div className="bg-[#061710] border border-emerald-500/30 rounded-xl px-4 py-2.5 text-right shadow-inner">
                                <div className="text-[10px] uppercase font-black tracking-wider text-emerald-400 flex items-center justify-end gap-1">
                                  {token.isNextInLine || token.queuePosition === 1 ? (
                                    <span className="text-amber-300 flex items-center gap-1 font-black">
                                      <AlertCircle className="h-3 w-3 text-amber-400" /> Gate Call Imminent
                                    </span>
                                  ) : (
                                    <span>Dynamic Wait Time</span>
                                  )}
                                </div>
                                <div className="text-xl font-black text-emerald-300 flex items-center justify-end gap-1 mt-0.5 font-display">
                                  <Timer className="h-4 w-4 text-emerald-400" /> ~{token.estimatedWaitMinutes} Mins
                                </div>
                                <div className="text-[10px] text-slate-300 font-bold flex items-center justify-end gap-1 mt-0.5 font-mono">
                                  <Clock className="h-3 w-3 text-emerald-400 shrink-0" />
                                  <span>Est. Entry: <strong className="text-emerald-200">{token.estimatedClearanceTime}</strong></span>
                                </div>
                                <div className="text-[10px] text-emerald-400/80 font-semibold mt-0.5">
                                  {token.aheadCount === 0 ? '0 vehicles ahead in yard' : `${token.aheadCount} vehicle${token.aheadCount > 1 ? 's' : ''} ahead in line`}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                            <div className="bg-[#061710]/70 p-2.5 rounded-xl border border-emerald-500/15">
                              <span className="text-slate-400 block font-semibold mb-0.5 text-[10px] uppercase">Commodity</span>
                              <span className="text-white font-bold">{token.cropType}</span>
                            </div>
                            <div className="bg-[#061710]/70 p-2.5 rounded-xl border border-emerald-500/15">
                              <span className="text-slate-400 block font-semibold mb-0.5 text-[10px] uppercase">Estimated Produce</span>
                              <span className="text-white font-bold">{token.estimatedWeight} Quintals</span>
                            </div>
                            <div className="bg-[#061710]/70 p-2.5 rounded-xl border border-emerald-500/15">
                              <span className="text-slate-400 block font-semibold mb-0.5 text-[10px] uppercase">Transport Vehicle</span>
                              <span className="text-white font-bold font-mono">{token.vehicleNumber || 'Tractor-Trolley'}</span>
                            </div>
                            <div className="bg-[#061710]/70 p-2.5 rounded-xl border border-emerald-500/15">
                              <span className="text-slate-400 block font-semibold mb-0.5 text-[10px] uppercase">Scheduled Slot</span>
                              <span className="text-emerald-300 font-black">{token.slotTime}</span>
                            </div>
                          </div>

                          {token.actualWeight && (
                            <div className="mt-4 p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs">
                              <span className="font-semibold text-emerald-200">Certified Weighbridge Net Weight:</span>
                              <span className="font-black text-emerald-300 text-sm font-display">{token.actualWeight} Quintals</span>
                            </div>
                          )}

                          {/* Token Card Action Controls */}
                          <div className="mt-4 pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-[11px] font-semibold text-slate-300">
                              Estimated MSP Value: <strong className="text-emerald-300 font-bold">₹{(token.estimatedWeight * 2275).toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                              {token.status === 'CALLED' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedTokenForGatePass(token)}
                                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                                  >
                                    <Tractor className="h-3.5 w-3.5" /> Gate QR Pass
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStartWeighment(token.id)}
                                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                                    title="Drive tractor onto weighbridge (Start Gross Weighment)"
                                  >
                                    <Scale className="h-3.5 w-3.5 text-purple-200" /> Drive to Scale
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCompleteMandiTrip(token.id, token.estimatedWeight)}
                                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                                    title="Complete trip and advance next vehicle in line"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Complete Delivery
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRevertToBooked(token.id)}
                                    className="px-2.5 py-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-300 transition font-bold cursor-pointer"
                                    title="Revert status back to BOOKED"
                                  >
                                    ↩ Set to BOOKED
                                  </button>
                                </>
                              )}
                              {token.status === 'IN_PROGRESS' && (
                                <button
                                  type="button"
                                  onClick={() => handleCompleteMandiTrip(token.id, token.estimatedWeight)}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                                  title="Complete weighment and advance next vehicle in line"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Complete Weighment
                                </button>
                              )}
                              {token.status === 'BOOKED' && (
                                <>
                                  {(token.isNextInLine || token.queuePosition === 1) && (
                                    <button
                                      type="button"
                                      onClick={() => handleAdvanceToGate(token.id)}
                                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer"
                                      title="Advance this vehicle to Mandi Gate (Issue Gate Entry Call)"
                                    >
                                      <Tractor className="h-3.5 w-3.5 text-emerald-200" /> Call to Gate Now
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleCompleteMandiTrip(token.id, token.estimatedWeight)}
                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                                    title="Complete this procurement delivery and generate Form-J receipt immediately"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Complete Delivery
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCancelToken(token.id)}
                                    className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl border border-rose-200 transition font-semibold cursor-pointer"
                                  >
                                    Cancel Slot
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedTokenForJForm(token)}
                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5 text-emerald-400" /> View Form-J
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* COMPLETED & CANCELLED HISTORY TAB (BookMyShow-Style Segregated View) */}
          {dashboardTab === 'history' && (
            <>
              {historyTokens.length === 0 ? (
                <div className="bg-[#091f16]/50 border-2 border-dashed border-emerald-500/20 rounded-3xl p-10 text-center shadow-inner">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500/40 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-200">No Completed Procurement Deliveries Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Once your vehicle completes certified weighment at the mandi yard, official digital Form-J receipts and payment records will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyTokens.map((token) => (
                    <div
                      key={token.id}
                      className="bg-[#091f16]/80 backdrop-blur-xl rounded-2xl border border-emerald-500/20 shadow-md hover:border-emerald-400/40 hover:shadow-xl transition-all overflow-hidden p-5 card-hover-effect"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-emerald-500/20 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getCropImage(token.cropType)}
                            alt={token.cropType}
                            className="w-14 h-14 rounded-xl object-cover border border-emerald-400/30 shadow-sm shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xl font-black text-white font-display">{token.tokenNumber}</span>
                              {getStatusBadge(token.status)}
                            </div>
                            <p className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1 font-medium">
                              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                              {token.centre?.name || 'Procurement Centre'} ({token.centre?.district}, {token.centre?.state})
                            </p>
                          </div>
                        </div>

                        {token.status === 'COMPLETED' && (
                          <div className="bg-emerald-950/80 border border-emerald-400/30 rounded-xl px-3.5 py-1.5 text-right shadow-xs">
                            <div className="text-[10px] uppercase font-bold text-emerald-300">Final MSP Payout</div>
                            <div className="text-base font-black text-emerald-400 font-display">
                              ₹{((token.actualWeight || token.estimatedWeight) * 2275).toLocaleString('en-IN')}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
                        <div className="bg-[#061710]/70 p-2.5 rounded-xl border border-emerald-500/15">
                          <span className="text-slate-400 block font-semibold mb-0.5 text-[10px] uppercase">Commodity</span>
                          <span className="text-white font-bold">{token.cropType}</span>
                        </div>
                        <div className="bg-[#061710]/70 p-2.5 rounded-xl border border-emerald-500/15">
                          <span className="text-slate-400 block font-semibold mb-0.5 text-[10px] uppercase">Certified Net Weight</span>
                          <span className="text-emerald-300 font-black">
                            {token.actualWeight || token.estimatedWeight} Quintals
                          </span>
                        </div>
                        <div className="bg-[#061710]/70 p-2.5 rounded-xl border border-emerald-500/15">
                          <span className="text-slate-400 block font-semibold mb-0.5 text-[10px] uppercase">Transport Vehicle</span>
                          <span className="text-white font-bold font-mono">{token.vehicleNumber || 'Tractor-Trolley'}</span>
                        </div>
                        <div className="bg-[#061710]/70 p-2.5 rounded-xl border border-emerald-500/15">
                          <span className="text-slate-400 block font-semibold mb-0.5 text-[10px] uppercase">Completed On</span>
                          <span className="text-slate-300 font-semibold font-mono">
                            {token.updatedAt ? new Date(token.updatedAt).toLocaleDateString('en-IN') : token.slotDate}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-emerald-400/80 font-medium">
                          {token.status === 'COMPLETED' ? 'Direct Benefit Transfer (DBT) Verified' : 'Slot reservation was cancelled'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedTokenForJForm(token)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5 text-emerald-300" />
                          {token.status === 'COMPLETED' ? 'View Certified Form-J Voucher' : 'View Booking Slip'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Col: Mandi Centres Live Status */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-xs">
                <Building2 className="h-4 w-4 text-emerald-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display drop-shadow-md">
                Procurement Centres
              </h2>
            </div>
            <p className="text-xs text-emerald-300 font-semibold mt-1 flex items-center gap-1.5 pl-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Live yard congestion and weighbridge availability
            </p>
          </div>

          <div className="space-y-3">
            {centres.map((c) => (
              <div key={c.id} className="bg-[#091f16]/80 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-4 shadow-md hover:border-emerald-400/40 transition-all card-hover-effect">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-white font-display">{c.name}</h3>
                    <p className="text-xs text-slate-400">{c.district}, {c.state}</p>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-xs ${
                      c.operationalStatus === 'NORMAL'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : c.operationalStatus === 'RUSH'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/30 animate-pulse'
                        : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                    }`}
                  >
                    {c.operationalStatus === 'NORMAL' ? 'Normal Yard Operations' : c.operationalStatus === 'RUSH' ? 'Heavy Yard Congestion' : 'Operations Paused'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-emerald-500/15 pt-3">
                  <div className="bg-[#061710] p-2.5 rounded-xl border border-emerald-500/15">
                    <span className="text-[10px] text-slate-400 block font-semibold">Active Queue</span>
                    <span className="font-bold text-emerald-300 font-display text-sm">{c.activeQueueCount || 0} Vehicles</span>
                  </div>
                  <div className="bg-[#061710] p-2.5 rounded-xl border border-emerald-500/15">
                    <span className="text-[10px] text-slate-400 block font-semibold">Avg. Weigh Time</span>
                    <span className="font-bold text-white font-display text-sm">{c.currentWaitMinutes} Minutes</span>
                  </div>
                </div>

                {c.operationalStatus === 'PAUSED' && (
                  <div className="mt-2.5 text-[11px] bg-rose-950/50 text-rose-300 border border-rose-500/30 p-2.5 rounded-xl font-semibold flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                    <span>Temporarily Paused: {c.pauseReason || 'Weighbridge Maintenance'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mandi Operational Transparency & Telemetry Status Footer */}
      <div className="mt-12 pt-8 border-t border-emerald-500/20">
        <div className="bg-gradient-to-r from-[#091f16] via-[#0b271c] to-[#091f16] rounded-2xl p-5 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 text-xl shadow-inner">
              🌾
            </div>
            <div>
              <div className="text-sm font-black text-white font-display flex items-center gap-2">
                KisanKendra Smart Mandi Automation Platform
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  v2.4 Production Live
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5 font-medium">
                Ministry of Agriculture & Farmers Welfare, Govt. of India &bull; Direct Benefit Transfer (DBT) Assured
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-[#061710] px-3.5 py-2 rounded-xl border border-emerald-500/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Weighbridge Sensors:</span>
              <strong className="text-emerald-400 font-bold">100% Active</strong>
            </div>
            <div className="flex items-center gap-2 bg-[#061710] px-3.5 py-2 rounded-xl border border-emerald-500/20 shadow-xs">
              <PhoneCall size={13} className="text-amber-400" />
              <span className="text-slate-300 font-medium">24x7 Mandi Helpline:</span>
              <strong className="text-amber-300 font-mono font-bold">1800-180-1551</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedCropForBooking('');
        }}
        centres={centres}
        initialCentreId={selectedCentre}
        initialCropType={selectedCropForBooking}
        onSuccess={() => {
          fetchData();
        }}
      />

      {/* Official Form-J Voucher Modal */}
      <JFormModal
        isOpen={!!selectedTokenForJForm}
        onClose={() => setSelectedTokenForJForm(null)}
        token={selectedTokenForJForm}
      />

      {/* Gate Entry Navigation & QR Pass Modal */}
      <GatePassModal
        isOpen={!!selectedTokenForGatePass}
        onClose={() => setSelectedTokenForGatePass(null)}
        token={selectedTokenForGatePass}
        onArrivalConfirmed={() => {
          fetchData();
        }}
        onOpenMap={() => {
          if (onNavigate) onNavigate('map');
        }}
      />
    </div>
  );
}
