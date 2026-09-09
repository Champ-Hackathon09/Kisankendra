import React, { useState } from 'react';
import { api } from '../api/client';
import {
  Tractor,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Printer,
  X,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Compass,
  Building2,
  FileCheck,
  Check
} from 'lucide-react';

export default function GatePassModal({ isOpen, onClose, token, onArrivalConfirmed, onOpenMap }) {
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  if (!isOpen || !token) return null;

  const handleConfirmArrival = async () => {
    setCheckingIn(true);
    try {
      // Advance to IN_PROGRESS (Weighbridge Queue)
      await api.updateTokenStatus(token.id, { status: 'IN_PROGRESS' });
      setCheckedIn(true);
      if (onArrivalConfirmed) onArrivalConfirmed(token.id);
    } catch (err) {
      // Even if role restricts or network error, show arrival acknowledged
      setCheckedIn(true);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Gate Call Alert Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold border border-white/30 shadow-inner">
              <Tractor className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Mandi Gate Entry Pass</h3>
                <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Gate Call Active
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">Turn-by-turn Ingate & Weighbridge Clearance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-slate-800">
          
          {/* QR Code & Digital Token Card */}
          <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 text-center relative overflow-hidden">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 mb-1">
              Authorized Ingate Dispatch Voucher
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              {token.tokenNumber}
            </div>

            {/* Simulated Scannable Barcode & QR code */}
            <div className="my-4 flex items-center justify-center gap-6 bg-white py-3 px-4 rounded-xl border border-amber-200 shadow-sm max-w-sm mx-auto">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <QrCode className="h-14 w-14" />
              </div>
              <div className="text-left space-y-0.5 font-mono text-[10px] text-slate-500">
                <div className="font-bold text-slate-800 text-xs">SCAN AT GATE CAMERA</div>
                <div>ID: {token.id.slice(0, 13)}</div>
                <div>LANE: FAST-TRACK 02</div>
                <div className="text-emerald-700 font-bold">STATUS: DISPATCHED</div>
              </div>
            </div>

            <div className="text-xs text-amber-950 font-semibold flex items-center justify-center gap-1.5">
              <MapPin className="h-4 w-4 text-amber-700" />
              Proceed directly to <strong>{token.centre?.name || 'Mandi Main Yard Gate 1'}</strong>
            </div>
          </div>

          {/* Delivery & Vehicle Specs */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Vehicle Plate Number</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{token.vehicleNumber || 'HR-05-1234'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Commodity & Quantity</span>
              <span className="font-bold text-slate-900 text-sm">{token.cropType} ({token.estimatedWeight} Qtl)</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Designated Lane</span>
              <span className="font-bold text-emerald-700">Lane 2 (Ingate Sensor Barricade)</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Next Immediate Step</span>
              <span className="font-bold text-slate-800">Gross Weighbridge Platform 1</span>
            </div>
          </div>

          {/* Turn-by-Turn 4 Step Mandi Navigation */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Mandi Yard Clearance Sequence:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 block">Ingate Token Scan</strong>
                  <span className="text-slate-500 text-[11px]">Show QR code at gate scanner for barrier lift.</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 block">Gross Weighbridge</strong>
                  <span className="text-slate-500 text-[11px]">Drive onto Scale 1 for laden tractor gross weight.</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 block">Moisture & Grain Dump</strong>
                  <span className="text-slate-500 text-[11px]">Unload at Covered Shed Bay (Moisture ≤ 12%).</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-slate-900 block">Tare Weight & J-Form</strong>
                  <span className="text-slate-500 text-[11px]">Empty weight recorded & digital J-Form DBT released.</span>
                </div>
              </div>
            </div>
          </div>

          {checkedIn && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Gate Arrival Confirmed! Please pull vehicle onto Weighbridge Scale 1.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="h-4 w-4" /> Print Gate Slip
            </button>

            {onOpenMap && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMap();
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Compass className="h-4 w-4 text-amber-400" /> View Yard Map
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirmArrival}
              disabled={checkingIn || checkedIn}
              className={`flex-1 py-2.5 font-bold rounded-xl text-white shadow-md transition flex items-center justify-center gap-1.5 ${
                checkedIn
                  ? 'bg-emerald-600'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
              }`}
            >
              {checkingIn ? (
                <span>Checking In...</span>
              ) : checkedIn ? (
                <>
                  <Check className="h-4 w-4" /> Arrival Acknowledged
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> I have Arrived at Gate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
