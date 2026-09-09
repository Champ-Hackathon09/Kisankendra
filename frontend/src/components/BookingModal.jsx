import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api/client';
import { getCropImage, CROP_DATA_MAP, handleCropImageError } from '../utils/cropUtils';
import {
  Tractor,
  Calendar,
  Clock,
  MapPin,
  Scale,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  QrCode,
  Truck,
  IndianRupee,
  FileCheck,
  Printer,
  Droplets,
  Warehouse
} from 'lucide-react';

const CROP_MSP_MAP = {
  'Wheat (Sharbati / Common)': 2275,
  'Paddy (Basmati / Common)': 2300,
  'Mustard / Rapeseed': 5650,
  'Gram / Chickpea': 5440,
  'Maize / Corn': 2090,
  'Soybean': 4600,
  'Cotton (Medium / Long Staple)': 6620,
};

export default function BookingModal({
  isOpen,
  onClose,
  centres = [],
  onSuccess,
  initialCentreId = '',
  initialCropType = '',
}) {
  const [selectedCentreId, setSelectedCentreId] = useState(
    initialCentreId || (centres.length > 0 ? centres[0].id : '')
  );
  const [cropType, setCropType] = useState(initialCropType || 'Wheat (Sharbati / Common)');
  const [estimatedWeight, setEstimatedWeight] = useState('40');
  const [vehicleNumber, setVehicleNumber] = useState('HR-05-AB-1234');
  const [vehicleType, setVehicleType] = useState('Tractor Trolley');
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotTime, setSlotTime] = useState('10:00 AM - 11:00 AM');
  
  const [slotData, setSlotData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookedToken, setBookedToken] = useState(null);

  const currentCentre = centres.find((c) => c.id === selectedCentreId) || centres[0];

  const fetchSlots = async (cId, d) => {
    if (!cId) return;
    try {
      setLoadingSlots(true);
      const res = await api.getSlotAvailability(cId, d);
      setSlotData(res);
      if (res.recommendedSlot) {
        const currentSlotObj = res.slots?.find((s) => s.slotTime === slotTime);
        if (!slotTime || (currentSlotObj && currentSlotObj.status === 'FULL')) {
          setSlotTime(res.recommendedSlot);
        }
      }
    } catch (err) {
      console.error('Error fetching slot availability:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (initialCropType) {
      setCropType(initialCropType);
    }
  }, [initialCropType, isOpen]);

  useEffect(() => {
    const targetId = selectedCentreId || currentCentre?.id;
    if (isOpen && targetId) {
      fetchSlots(targetId, slotDate);
    }
  }, [isOpen, selectedCentreId, slotDate]);

  if (!isOpen) return null;

  const isCentrePaused = currentCentre?.operationalStatus === 'PAUSED';

  const mspRate = CROP_MSP_MAP[cropType] || 2200;
  const parsedWeight = parseFloat(estimatedWeight) || 0;
  const estimatedPayout = Math.round(parsedWeight * mspRate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCentreId && currentCentre) {
      setSelectedCentreId(currentCentre.id);
    }
    const targetCentreId = selectedCentreId || currentCentre?.id;

    if (!targetCentreId) {
      setError('Please select an APMC procurement centre.');
      return;
    }

    if (isCentrePaused) {
      setError('This centre is currently paused. Please select another operational centre.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        centreId: targetCentreId,
        cropType,
        estimatedWeight: parsedWeight,
        vehicleNumber: vehicleNumber ? `${vehicleNumber} (${vehicleType})` : `N/A (${vehicleType})`,
        slotDate,
        slotTime,
      };

      const res = await api.bookToken(payload);
      setBookedToken(res.token);
      if (onSuccess) {
        onSuccess(res.token);
      }
    } catch (err) {
      setError(err.message || 'Failed to book procurement slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setBookedToken(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const modalNode = (
    <div 
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={handleResetAndClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b1f17] text-white rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl border border-emerald-500/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col relative"
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 px-5 py-2.5 text-white flex items-center justify-between border-b border-emerald-500/25 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold border border-emerald-400/30 shadow-inner">
              <Tractor className="h-4 w-4 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight font-display leading-tight">Schedule Mandi Arrival & Booking Slot</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Live FIFO Telemetry
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/80 font-medium">Select your delivery window upfront & eliminate roadside queue waiting</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer border border-emerald-500/20"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1">
          {bookedToken ? (
            /* Success State with Gate Token Summary */
            <div className="text-center space-y-3 animate-in fade-in zoom-in-95 max-w-md mx-auto py-1">
              <div className="h-12 w-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-400/40 shadow-inner">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Booking Confirmed</span>
                <h4 className="text-2xl font-black text-white tracking-tight mt-0.5 font-mono">
                  {bookedToken.tokenNumber}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Digital queue token generated. Present this token or QR pass at the Mandi Ingate.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-[#071711] p-3 rounded-xl border border-emerald-500/20 text-left text-xs space-y-1.5">
                <div className="flex justify-between items-center pb-1.5 border-b border-emerald-500/15">
                  <span className="text-slate-400 font-medium text-[11px]">Procurement Centre:</span>
                  <span className="font-bold text-white text-[11px]">{bookedToken.centre?.name || currentCentre?.name}</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-emerald-500/15">
                  <span className="text-slate-400 font-medium text-[11px]">Arrival Schedule:</span>
                  <span className="font-bold text-emerald-300 text-[11px]">{bookedToken.slotDate} ({bookedToken.slotTime})</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-1.5 border-b border-emerald-500/15">
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Commodity:</span>
                    <span className="font-bold text-white text-[11px]">{bookedToken.cropType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Declared Weight:</span>
                    <span className="font-bold text-white text-[11px]">{bookedToken.estimatedWeight} Quintals</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px]">Initial Queue Rank:</span>
                    <span className="font-black text-emerald-400 text-xs">#{bookedToken.queuePosition} in Line</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-medium block text-[10px]">Estimated Wait:</span>
                    <span className="font-black text-amber-300 text-xs">~{bookedToken.estimatedWaitMinutes} Mins</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2 bg-[#061710] hover:bg-black/40 text-slate-200 border border-emerald-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Gate Slip
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> View in My Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* 2-COLUMN BOOKING FORM (SLOTS PROMINENTLY IN FRONT / SAMNE - COMPACT NO SCROLL) */
            <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
              {error && (
                <div className="p-2 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-xl font-medium flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
                
                {/* LEFT COLUMN: Mandi, Commodity & Vehicle (5 Cols) */}
                <div className="md:col-span-5 space-y-2.5">
                  {/* 1. Mandi Selection */}
                  <div className="bg-[#071811] p-2.5 rounded-xl border border-emerald-500/20">
                    <label className="block font-bold text-slate-200 mb-1 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-400" /> APMC Mandi
                      </span>
                      {currentCentre && (
                        <span
                          className={`text-[8px] font-black px-1.5 py-0.2 rounded-full border ${
                            currentCentre.operationalStatus === 'NORMAL'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                              : currentCentre.operationalStatus === 'RUSH'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                          }`}
                        >
                          {currentCentre.operationalStatus === 'NORMAL'
                            ? 'Normal'
                            : currentCentre.operationalStatus === 'RUSH'
                            ? 'Rush'
                            : 'Paused'}
                        </span>
                      )}
                    </label>
                    <select
                      value={selectedCentreId}
                      onChange={(e) => setSelectedCentreId(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs font-semibold border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#06140e] text-white"
                      required
                    >
                      {centres.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#06140e] text-white">
                          {c.name} ({c.district}) — Wait: {c.currentWaitMinutes}m
                        </option>
                      ))}
                    </select>
                    {isCentrePaused && (
                      <p className="text-[9px] text-rose-400 font-bold mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Intake paused: {currentCentre?.pauseReason || 'Capacity reached'}.
                      </p>
                    )}
                  </div>

                  {/* 2. Commodity & Produce Weight */}
                  <div className="bg-[#071811] p-2.5 rounded-xl border border-emerald-500/20 space-y-2">
                    <div>
                      <label className="block font-bold text-slate-200 mb-1 text-[11px]">Crop / Produce Commodity</label>
                      <select
                        value={cropType}
                        onChange={(e) => setCropType(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-bold border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#06140e] text-emerald-100"
                      >
                        {Object.keys(CROP_MSP_MAP).map((crop) => (
                          <option key={crop} value={crop} className="bg-[#06140e] text-white">
                            {crop}
                          </option>
                        ))}
                      </select>

                      {/* Visual Crop Preview Card with Real Photo & Fallback */}
                      <div className="mt-1.5 p-1.5 bg-[#06140e] border border-emerald-500/25 rounded-lg flex items-center gap-2.5">
                        <img
                          src={getCropImage(cropType)}
                          alt={cropType}
                          onError={(e) => handleCropImageError(e, cropType)}
                          className="w-8 h-8 rounded-lg object-cover border border-emerald-400/40 shadow-xs shrink-0 bg-slate-900"
                        />
                        <div className="min-w-0 flex-1 text-[10px]">
                          <div className="font-black text-white truncate leading-tight font-display">{cropType.split('(')[0]}</div>
                          <div className="text-[9px] text-emerald-300 font-bold flex items-center gap-1.5">
                            <span>MSP: ₹{mspRate.toLocaleString('en-IN')}/Qtl</span>
                            <span className="text-slate-400">Moisture ≤ 12%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-0.5">
                      <label className="block font-bold text-slate-200 mb-1 flex justify-between text-[11px]">
                        <span>Produce Weight</span>
                        <span className="text-emerald-400 font-semibold">{parsedWeight} Quintals</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min="1"
                          max="1000"
                          step="0.5"
                          value={estimatedWeight}
                          onChange={(e) => setEstimatedWeight(e.target.value)}
                          placeholder="40"
                          className="w-full pl-2.5 pr-10 py-1 text-xs font-semibold border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#06140e] text-white font-mono"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">
                          QTL
                        </span>
                      </div>
                      {parsedWeight > 0 && (
                        <p className="text-[9px] text-emerald-300/80 mt-0.5 font-medium flex items-center justify-between">
                          <span>≈ {(parsedWeight * 100).toLocaleString()} kg produce</span>
                          <strong className="text-emerald-300 font-display">Est: ₹{estimatedPayout.toLocaleString('en-IN')}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3. Vehicle Info */}
                  <div className="bg-[#071811] p-2.5 rounded-xl border border-emerald-500/20">
                    <label className="block font-bold text-slate-200 mb-1 text-[11px]">Vehicle Details</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="px-2 py-1 text-[11px] font-medium border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#06140e] text-white"
                      >
                        <option value="Tractor Trolley">Tractor Trolley</option>
                        <option value="Mini Truck">Mini Truck</option>
                        <option value="Commercial Truck">Commercial Truck</option>
                        <option value="Bullock Cart">Bullock Cart</option>
                      </select>
                      <input
                        type="text"
                        required
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        placeholder="HR-05-AB-1234"
                        className="px-2 py-1 text-[11px] font-bold border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#06140e] text-white uppercase font-mono tracking-wider"
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: BOOKING SLOTS UPFRONT (सामने - 7 Cols, Compact Fit) */}
                <div className="md:col-span-7 bg-[#071811] p-3 sm:p-3.5 rounded-xl border-2 border-emerald-500/40 shadow-xl space-y-2.5">
                  {/* Front Banner for Slot Selection */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-500/20">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-300 uppercase tracking-wider">
                        <Clock className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                        Live Arrival Time Slots (सामने)
                      </div>
                      <p className="text-[10px] text-slate-300 mt-0.5">
                        Choose arrival window for instant weighbridge clearance
                      </p>
                    </div>

                    <div className="text-[9px] font-bold bg-[#06140e] text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/25 shrink-0">
                      Limit: <strong className="text-white font-mono">{slotData?.capacityPerHour || currentCentre?.capacityPerHour || 6}</strong>/Hr
                    </div>
                  </div>

                  {/* Scheduled Delivery Date Picker */}
                  <div className="bg-[#06140e] px-2.5 py-1.5 rounded-lg border border-emerald-500/20 flex items-center justify-between gap-2">
                    <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                      <Calendar size={13} className="text-emerald-400" />
                      Delivery Date:
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      className="px-2.5 py-1 text-xs font-bold border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-[#091f16] text-emerald-200"
                    />
                  </div>

                  {/* 8 TIME SLOTS GRID - RIGHT IN FRONT (सामने) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider">
                        Slots for {slotDate}:
                      </span>
                      {slotTime && (
                        <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.2 rounded border border-emerald-400/30">
                          Selected: {slotTime}
                        </span>
                      )}
                    </div>

                    {loadingSlots ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-[#06140e] rounded-lg border border-emerald-500/20 animate-pulse">
                        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-1.5"></div>
                        Checking real-time slot capacity...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {(slotData?.slots || [
                          { slotTime: '08:00 AM - 09:00 AM', status: 'AVAILABLE', available: 6 },
                          { slotTime: '09:00 AM - 10:00 AM', status: 'AVAILABLE', available: 6 },
                          { slotTime: '10:00 AM - 11:00 AM', status: 'AVAILABLE', available: 6 },
                          { slotTime: '11:00 AM - 12:00 PM', status: 'AVAILABLE', available: 6 },
                          { slotTime: '12:00 PM - 01:00 PM', status: 'AVAILABLE', available: 6 },
                          { slotTime: '02:00 PM - 03:00 PM', status: 'AVAILABLE', available: 6 },
                          { slotTime: '03:00 PM - 04:00 PM', status: 'AVAILABLE', available: 6 },
                          { slotTime: '04:00 PM - 05:00 PM', status: 'AVAILABLE', available: 6 },
                        ]).map((s) => {
                          const isSelected = slotTime === s.slotTime;
                          const isFull = s.status === 'FULL';
                          return (
                            <button
                              key={s.slotTime}
                              type="button"
                              disabled={isFull}
                              onClick={() => setSlotTime(s.slotTime)}
                              className={`py-2 px-2.5 rounded-lg text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                                isFull
                                  ? 'bg-[#06140e]/50 border-slate-800 text-slate-500 opacity-40 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-gradient-to-r from-emerald-900/90 to-teal-900/90 border-emerald-400 ring-2 ring-emerald-400/50 text-white shadow-md scale-[1.01]'
                                  : 'bg-[#06140e] border-emerald-500/20 hover:border-emerald-400/60 text-slate-200 hover:bg-[#081a13]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 w-full">
                                <span className="text-[11px] font-black font-mono leading-tight">{s.slotTime}</span>
                                {isSelected && (
                                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                )}
                              </div>
                              <div className="mt-1 flex items-center justify-between w-full">
                                <span
                                  className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                                    isFull
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : s.status === 'FAST_FILLING'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}
                                >
                                  {isFull
                                    ? 'Full'
                                    : s.status === 'FAST_FILLING'
                                    ? `Fast Filling (${s.available} Left)`
                                    : `${s.available} Open`}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium">
                                  {isSelected ? 'Selected' : 'Tap'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {slotData?.recommendedSlot && (
                      <div className="mt-2 text-[10px] text-emerald-300 flex items-center justify-between font-semibold bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30">
                        <span className="flex items-center gap-1">
                          <Sparkles size={11} className="text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
                          Earliest Window:
                        </span>
                        <strong className="text-white font-black font-mono">{slotData.recommendedSlot}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar (Compact) */}
              <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
                <div className="text-[10px] text-slate-300 font-medium flex items-center gap-1.5 text-center sm:text-left">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Slot: <strong className="text-emerald-300">{slotDate} ({slotTime})</strong> for <strong className="text-white">{parsedWeight} Qtl {cropType.split('(')[0]}</strong></span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 border border-emerald-500/30 hover:bg-black/30 text-slate-300 font-bold rounded-lg transition cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || isCentrePaused}
                    className={`flex-1 sm:flex-none px-4 py-1.5 font-black text-xs rounded-xl text-slate-950 shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCentrePaused
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 active:scale-95 shadow-emerald-500/30'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Reserving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Confirm Slot & Issue Token</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}
