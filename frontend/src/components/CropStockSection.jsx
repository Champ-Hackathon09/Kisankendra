import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Wheat,
  Warehouse,
  TrendingUp,
  Scale,
  Sparkles,
  Calendar,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  Droplets,
  Layers,
  ArrowRight
} from 'lucide-react';

import { handleCropImageError } from '../utils/cropUtils';

export default function CropStockSection({ onBookCropSlot }) {
  const [cropStocks, setCropStocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSeason, setFilterSeason] = useState('ALL'); // 'ALL' | 'Rabi Harvest' | 'Kharif Harvest'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await api.getCropStocks();
      setCropStocks(res.crops || []);
      setSummary(res.summary || null);
    } catch (err) {
      console.error('Error fetching crop stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const filteredCrops = cropStocks.filter((crop) => {
    if (!crop) return false;
    const matchesSeason = filterSeason === 'ALL' || crop.season === filterSeason;
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (crop.name || '').toLowerCase().includes(q) ||
      (crop.shortName || '').toLowerCase().includes(q) ||
      (crop.description || '').toLowerCase().includes(q);
    return matchesSeason && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics Overview */}
      <div className="relative rounded-3xl p-6 border border-emerald-500/30 shadow-2xl shadow-black/50 overflow-hidden bg-gradient-to-br from-[#092218] via-[#0b291d] to-[#06160f] text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 border border-emerald-400/30">
                <Warehouse size={12} className="text-emerald-400" /> Mandi Silo & Storage Telemetry
              </span>
              <span className="text-xs text-emerald-400/80 font-medium">Real-time Certified Stock</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display text-gradient-light">
              Commodity Warehouse Stock & Government MSP Registry
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-2xl font-medium">
              Live capacity utilization of covered steel silos and sheds across designated APMC yards. Certified MSP prices and moisture intake compliance.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchStocks}
              disabled={loading}
              className="p-2.5 border border-emerald-500/30 rounded-xl bg-black/40 hover:bg-black/60 text-emerald-300 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-xs"
              title="Refresh Silo Stock"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-400' : ''} />
              <span className="hidden sm:inline">Refresh Stock</span>
            </button>
          </div>
        </div>

        {/* Silo Aggregates Bar */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-emerald-500/20 relative z-10">
            <div className="bg-[#061710]/80 p-3.5 rounded-2xl border border-emerald-500/20 shadow-inner">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Supported Crops</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5 font-display">{summary.totalCropsSupported} Commodities</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Government MSP Notified</div>
            </div>

            <div className="bg-[#061710]/80 p-3.5 rounded-2xl border border-emerald-500/20 shadow-inner">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Silo Capacity</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5 font-display">
                {(summary.totalYardCapacityQuintals / 10).toLocaleString()} MT
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {summary.totalYardCapacityQuintals.toLocaleString()} Quintals
              </div>
            </div>

            <div className="bg-[#061710]/80 p-3.5 rounded-2xl border border-emerald-500/20 shadow-inner">
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Mandi Stock</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5 font-display">
                {summary.totalYardStockQuintals.toLocaleString()} Qtl
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Weighbridge Certified</div>
            </div>

            <div className="bg-[#061710]/80 p-3.5 rounded-2xl border border-emerald-500/20 shadow-inner">
              <div className="text-[10px] uppercase font-bold text-slate-400">Yard Storage Occupancy</div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-display">{summary.overallYardOccupancyPercentage}%</div>
                <div className="flex-1 bg-[#091a13] rounded-full h-2 overflow-hidden border border-emerald-500/20">
                  <div
                    className="bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${summary.overallYardOccupancyPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Aerated Covered Bays</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterSeason('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              filterSeason === 'ALL'
                ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-md border border-emerald-400/40 shadow-emerald-900/30'
                : 'bg-[#091f16]/70 text-slate-300 hover:text-white border border-emerald-500/20 hover:border-emerald-400/40'
            }`}
          >
            All Crops ({cropStocks.length})
          </button>
          <button
            onClick={() => setFilterSeason('Rabi Harvest')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              filterSeason === 'Rabi Harvest'
                ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-md border border-emerald-400/40 shadow-emerald-900/30'
                : 'bg-[#091f16]/70 text-slate-300 hover:text-white border border-emerald-500/20 hover:border-emerald-400/40'
            }`}
          >
            🌾 Rabi Harvest (Wheat, Mustard, Gram)
          </button>
          <button
            onClick={() => setFilterSeason('Kharif Harvest')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              filterSeason === 'Kharif Harvest'
                ? 'bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-md border border-emerald-400/40 shadow-emerald-900/30'
                : 'bg-[#091f16]/70 text-slate-300 hover:text-white border border-emerald-500/20 hover:border-emerald-400/40'
            }`}
          >
            🌽 Kharif Harvest (Paddy, Maize, Soybean, Cotton)
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop name..."
            className="w-full bg-[#0b1b14] border border-emerald-500/30 pl-9 pr-3 py-1.5 rounded-xl text-xs text-emerald-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Grid of Crop Cards with Real Photographs */}
      {loading ? (
        <div className="p-16 text-center bg-[#091f16]/80 rounded-3xl border border-emerald-500/25">
          <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-bold text-emerald-300">Loading Mandi Silo Stock & Crop Details...</p>
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="p-12 text-center bg-[#091f16]/80 rounded-3xl border border-emerald-500/25">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-200 font-display">No matching crops found</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or season filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCrops.map((crop) => {
            const isFull = crop.occupancyPercentage >= 85;
            const isModerate = crop.occupancyPercentage >= 60;

            return (
              <div
                key={crop.id}
                className="bg-[#091f16]/85 backdrop-blur-xl rounded-3xl border border-emerald-500/20 shadow-lg hover:border-emerald-400/50 hover:shadow-2xl transition-all duration-300 card-hover-effect overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* High Resolution Real Agricultural Photograph Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={crop.image}
                      alt={crop.name}
                      onError={(e) => handleCropImageError(e, crop.name)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#091f16] via-[#091f16]/30 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="backdrop-blur-md bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                        {crop.season}
                      </span>
                      <span className="backdrop-blur-md bg-emerald-950/90 text-emerald-300 text-xs font-black px-3 py-1 rounded-full shadow-lg border border-emerald-400/40">
                        MSP: ₹{crop.mspPerQuintal.toLocaleString('en-IN')}/Qtl
                      </span>
                    </div>

                    {/* Bottom Image Overlay Details */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-lg font-black tracking-tight drop-shadow-md font-display">
                        {crop.name}
                      </h3>
                      <p className="text-xs text-emerald-300 font-semibold drop-shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {crop.shortName} • {crop.qualityGrade}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {crop.description}
                    </p>

                    {/* Silo Capacity & Storage Stock Gauge */}
                    <div className="bg-[#061710] p-3.5 rounded-2xl border border-emerald-500/20 space-y-2 shadow-inner">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1">
                          <Warehouse size={13} className="text-emerald-400" />
                          Silo Stock: <strong className="text-white">{crop.currentStockQuintals.toLocaleString()} Qtl</strong>
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                            isFull
                              ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                              : isModerate
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                          }`}
                        >
                          {crop.occupancyPercentage}% Silo Full
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#091a13] rounded-full h-2.5 overflow-hidden border border-emerald-500/15">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFull
                              ? 'bg-rose-500 shadow-rose-500/40'
                              : isModerate
                              ? 'bg-amber-400 shadow-amber-400/40'
                              : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                          }`}
                          style={{ width: `${crop.occupancyPercentage}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Total Capacity: {crop.siloCapacityQuintals.toLocaleString()} Qtl</span>
                        <span>Available Space: <strong className="text-emerald-300">{crop.availableCapacityQuintals.toLocaleString()} Qtl</strong></span>
                      </div>
                    </div>

                    {/* Quality & Market Specifications Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-[#061710]/70 rounded-xl border border-emerald-500/15">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block flex items-center gap-1">
                          <Droplets size={11} className="text-cyan-400" /> Max Moisture
                        </span>
                        <span className="font-black text-white text-xs mt-0.5 block">
                          ≤ {crop.maxMoisture}
                        </span>
                        <span className="text-[9px] text-slate-400">FAQ Rejection Limit</span>
                      </div>

                      <div className="p-2.5 bg-[#061710]/70 rounded-xl border border-emerald-500/15">
                        <span className="text-[10px] uppercase font-bold text-cyan-400 block flex items-center gap-1">
                          <Scale size={11} className="text-emerald-400" /> Est. Payout
                        </span>
                        <span className="font-black text-emerald-300 text-xs mt-0.5 block font-display">
                          ₹{(crop.mspPerQuintal * 40).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] text-slate-400">Per 40 Qtl Trolley</span>
                      </div>
                    </div>

                    {crop.activeIncomingTrolleys > 0 && (
                      <div className="text-[11px] font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center justify-between">
                        <span>🚜 {crop.activeIncomingTrolleys} Trolleys En Route ({crop.activeIncomingQuintals} Qtl)</span>
                        <span className="text-[10px] font-black uppercase text-amber-400">In Queue</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-4 pt-0 border-t border-emerald-500/15 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onBookCropSlot) onBookCropSlot(crop.name);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <PlusCircle size={14} className="text-emerald-200" />
                    Book Delivery Slot for {(crop.shortName || crop.name || 'Crop').split('/')[0]} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
