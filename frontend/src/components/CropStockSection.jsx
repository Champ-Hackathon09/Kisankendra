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
    <div className="w-full space-y-7 animate-fade-in-up">
      {/* Top Banner / Metrics Overview */}
      <div className="relative rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl shadow-black/60 overflow-hidden bg-gradient-to-br from-[#0c1626]/95 via-[#0e1d33]/90 to-[#070c16]/98 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider flex items-center gap-1.5 border border-emerald-400/30">
                <Warehouse size={13} className="text-emerald-400" /> Mandi Silo & Storage Telemetry
              </span>
              <span className="text-xs text-emerald-300/90 font-semibold bg-black/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Real-time Certified Stock
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-display text-gradient-light">
              Commodity Warehouse Stock & Government MSP Registry
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1.5 max-w-3xl font-medium leading-relaxed">
              Live capacity utilization of covered steel silos and sheds across designated APMC yards. Certified MSP prices, moisture intake compliance, and direct delivery slot booking.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchStocks}
              disabled={loading}
              className="px-4 py-2.5 border border-emerald-500/30 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 transition flex items-center gap-2 text-xs font-bold cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
              title="Refresh Silo Stock"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-400' : ''} />
              <span>Refresh Stock</span>
            </button>
          </div>
        </div>

        {/* Silo Aggregates Bar */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 relative z-10">
            <div className="bg-[#0b1424]/80 p-4 rounded-2xl border border-slate-800 shadow-inner">
              <div className="text-[11px] uppercase font-bold text-slate-400">Total Supported Crops</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 font-display">
                {summary.totalCropsSupported} Commodities
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">Government MSP Notified</div>
            </div>

            <div className="bg-[#0b1424]/80 p-4 rounded-2xl border border-slate-800 shadow-inner">
              <div className="text-[11px] uppercase font-bold text-slate-400">Total Silo Capacity</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 font-display">
                {(summary.totalYardCapacityQuintals / 10).toLocaleString()} MT
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {summary.totalYardCapacityQuintals.toLocaleString()} Quintals
              </div>
            </div>

            <div className="bg-[#0b1424]/80 p-4 rounded-2xl border border-slate-800 shadow-inner">
              <div className="text-[11px] uppercase font-bold text-slate-400">Current Mandi Stock</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-300 mt-1 font-display">
                {summary.totalYardStockQuintals.toLocaleString()} Qtl
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">Weighbridge Certified</div>
            </div>

            <div className="bg-[#0b1424]/80 p-4 rounded-2xl border border-slate-800 shadow-inner">
              <div className="text-[11px] uppercase font-bold text-slate-400">Yard Storage Occupancy</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-300 mt-1 font-display">
                {summary.overallYardOccupancyPercentage || summary.overallOccupancyPercentage || 45}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Aerated Covered Bays</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterSeason('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
              filterSeason === 'ALL'
                ? 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white shadow-md border border-emerald-400/50 shadow-emerald-900/40'
                : 'bg-[#091f16]/70 text-slate-300 hover:text-white border border-emerald-500/20 hover:border-emerald-400/40'
            }`}
          >
            All Crops ({cropStocks.length})
          </button>
          <button
            onClick={() => setFilterSeason('Rabi Harvest')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
              filterSeason === 'Rabi Harvest'
                ? 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white shadow-md border border-emerald-400/50 shadow-emerald-900/40'
                : 'bg-[#091f16]/70 text-slate-300 hover:text-white border border-emerald-500/20 hover:border-emerald-400/40'
            }`}
          >
            🌾 Rabi Harvest (Wheat, Mustard, Gram)
          </button>
          <button
            onClick={() => setFilterSeason('Kharif Harvest')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
              filterSeason === 'Kharif Harvest'
                ? 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white shadow-md border border-emerald-400/50 shadow-emerald-900/40'
                : 'bg-[#091f16]/70 text-slate-300 hover:text-white border border-emerald-500/20 hover:border-emerald-400/40'
            }`}
          >
            🌽 Kharif Harvest (Paddy, Maize, Soybean, Cotton)
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop name or grade..."
            className="w-full bg-[#0d172a] border border-slate-700/80 pl-10 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition"
          />
        </div>
      </div>

      {/* Dynamic Grid of Large Crop Cards: Fluid layout completely filling wide screens */}
      {loading ? (
        <div className="p-20 text-center bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl">
          <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-emerald-300">Loading Mandi Silo Stock & Crop Details...</p>
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 font-display">No matching crops found</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or season filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 w-full">
          {filteredCrops.map((crop, idx) => {
            const isFull = crop.occupancyPercentage >= 85;
            const isModerate = crop.occupancyPercentage >= 60;

            return (
              <div
                key={crop.id}
                style={{ animationDelay: `${idx * 60}ms` }}
                className="bg-[#0e172a]/90 backdrop-blur-xl rounded-3xl border border-slate-800/90 shadow-xl hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/30 transition-all duration-300 card-hover-effect overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* High Resolution Real Agricultural Photograph Header (Enlarged to h-64) */}
                  <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-slate-950">
                    <img
                      src={crop.image}
                      alt={crop.name}
                      onError={(e) => handleCropImageError(e, crop.name)}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e172a] via-[#0e172a]/40 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                      <span className="backdrop-blur-md bg-black/70 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
                        {crop.season}
                      </span>
                      <span className="backdrop-blur-md bg-gradient-to-r from-emerald-900 to-teal-900 text-emerald-200 text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-full shadow-lg border border-emerald-400/50">
                        MSP: ₹{crop.mspPerQuintal.toLocaleString('en-IN')}/Qtl
                      </span>
                    </div>

                    {/* Bottom Image Overlay Details */}
                    <div className="absolute bottom-3.5 left-4 right-4 text-white">
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md font-display leading-tight">
                        {crop.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-300 font-semibold drop-shadow-sm flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {crop.shortName} &bull; {crop.qualityGrade}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                      {crop.description}
                    </p>

                    {/* Silo Capacity & Storage Stock Gauge */}
                    <div className="bg-[#070d18]/90 p-4 rounded-2xl border border-slate-800/90 space-y-2.5 shadow-inner">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Warehouse size={15} className="text-emerald-400" />
                          Silo Stock: <strong className="text-white font-extrabold">{crop.currentStockQuintals.toLocaleString()} Qtl</strong>
                        </span>
                        <span
                          className={`text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-md border ${
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
                      <div className="w-full bg-slate-800/90 rounded-full h-3 overflow-hidden border border-slate-700/60">
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

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Total: {crop.siloCapacityQuintals.toLocaleString()} Qtl</span>
                        <span>Available: <strong className="text-emerald-300 font-bold">{crop.availableCapacityQuintals.toLocaleString()} Qtl</strong></span>
                      </div>
                    </div>

                    {/* Quality & Market Specifications Grid */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 bg-[#070d18]/90 rounded-xl border border-slate-800/90">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                          <Droplets size={12} className="text-cyan-400" /> Max Moisture
                        </span>
                        <span className="font-black text-white text-xs sm:text-sm mt-1 block">
                          ≤ {crop.maxMoisture}
                        </span>
                        <span className="text-[10px] text-slate-400">FAQ Rejection Limit</span>
                      </div>

                      <div className="p-3 bg-[#070d18]/90 rounded-xl border border-slate-800/90">
                        <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                          <Scale size={12} className="text-emerald-400" /> Est. Payout
                        </span>
                        <span className="font-black text-emerald-300 text-xs sm:text-sm mt-1 block font-display">
                          ₹{(crop.mspPerQuintal * 40).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400">Per 40 Qtl Trolley</span>
                      </div>
                    </div>

                    {crop.activeIncomingTrolleys > 0 && (
                      <div className="text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3.5 py-2 rounded-xl flex items-center justify-between">
                        <span>🚜 {crop.activeIncomingTrolleys} Trolleys En Route ({crop.activeIncomingQuintals} Qtl)</span>
                        <span className="text-[10px] font-black uppercase text-amber-400">In Queue</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-5 pt-0 border-t border-emerald-500/15 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onBookCropSlot) onBookCropSlot(crop.name);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm py-3 rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition cursor-pointer group-hover:shadow-emerald-500/30"
                  >
                    <PlusCircle size={16} className="text-slate-950 stroke-[2.5]" />
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
