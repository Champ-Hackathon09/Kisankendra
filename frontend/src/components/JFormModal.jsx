import React from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Printer,
  X,
  CheckCircle2,
  Building2,
  Calendar,
  Scale,
  ShieldCheck,
  QrCode,
  IndianRupee,
  MapPin,
  Clock,
  Download
} from 'lucide-react';

const CROP_MSP_RATES = {
  'Wheat': 2275,
  'Paddy': 2300,
  'Mustard': 5650,
  'Gram': 5440,
  'Maize': 2090,
  'Soybean': 4600,
  'Cotton': 6620,
};

function getMspRate(cropType = '') {
  const safeCrop = (cropType || '').toLowerCase();
  for (const [key, val] of Object.entries(CROP_MSP_RATES)) {
    if (safeCrop.includes(key.toLowerCase())) {
      return val;
    }
  }
  return 2275;
}

export default function JFormModal({ isOpen, onClose, token }) {
  if (!isOpen || !token) return null;

  const mspRate = getMspRate(token.cropType);
  const weight = token.actualWeight || token.estimatedWeight || 0;
  const totalAmount = Math.round(weight * mspRate);

  const handlePrint = () => {
    window.print();
  };

  const modalNode = (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 relative"
      >
        
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Official Form-J Mandi Procurement Certificate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Printer className="h-3.5 w-3.5" /> Print Voucher
            </button>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper Layout */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white" id="printable-jform">
          
          {/* Header Banner */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              Government of India • Ministry of Agriculture & Farmers Welfare
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              APMC FORM ‘J’ — SALE VOUCHER OF AGRICULTURAL PRODUCE
            </h2>
            <div className="text-xs font-semibold text-emerald-800 mt-1">
              [Issued under Section 24(1) of the State Agricultural Produce Markets Act]
            </div>
          </div>

          {/* Token & Certificate Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Token / Receipt No.</span>
              <span className="font-mono font-black text-emerald-800 text-sm">{token.tokenNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Issuance Date</span>
              <span className="font-bold text-slate-800">{token.slotDate || new Date().toISOString().split('T')[0]}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Procurement Status</span>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                {token.status}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Arrival Time Slot</span>
              <span className="font-bold text-slate-800">{token.slotTime}</span>
            </div>
          </div>

          {/* Parties & Yard Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                Procurement Mandi / Yard
              </div>
              <div className="font-bold text-slate-900 text-sm">{token.centre?.name || 'Karnal APMC Yard'}</div>
              <div className="text-slate-600">Code: <strong>{token.centre?.code || 'HR-KRN-01'}</strong></div>
              <div className="text-slate-500">{token.centre?.address || 'GT Road, Grain Market'}</div>
              <div className="text-slate-500">District: {token.centre?.district || 'Karnal'}, {token.centre?.state || 'Haryana'}</div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Registered Farmer Beneficiary
              </div>
              <div className="font-bold text-slate-900 text-sm">{token.farmer?.name || 'Registered Farmer'}</div>
              <div className="text-slate-600">Mobile: <span className="font-mono">{token.farmer?.phone || 'XXXXXXXXXX'}</span></div>
              <div className="text-slate-500">Village: {token.farmer?.village || 'Taraori'}</div>
              <div className="text-slate-500">Vehicle Plate: <span className="font-mono font-bold text-slate-800">{token.vehicleNumber || 'HR-05-AB-1234'}</span></div>
            </div>
          </div>

          {/* Commodity & Weighment Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                <tr>
                  <th className="py-2.5 px-4">Commodity / Crop</th>
                  <th className="py-2.5 px-4">Moisture %</th>
                  <th className="py-2.5 px-4">Certified Produce</th>
                  <th className="py-2.5 px-4">MSP Rate (₹/Qtl)</th>
                  <th className="py-2.5 px-4 text-right">Net Payable Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">{token.cropType}</td>
                  <td className="py-3 px-4 text-slate-700">
                    {token.moistureLevel ? (
                      <span className="font-bold text-emerald-700">{token.moistureLevel}% (Approved)</span>
                    ) : (
                      <span className="text-slate-400 italic">11.4% (Standard FAQ)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{weight} Quintals</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">₹{mspRate.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right font-black text-emerald-700 text-sm">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DBT & Bank Settlement Terms */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1 text-emerald-950">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Direct Benefit Transfer (DBT) Settlement Guarantee
            </div>
            <p className="text-emerald-800 text-[11px]">
              This amount of <strong>₹{totalAmount.toLocaleString('en-IN')}</strong> will be disbursed electronically within 48 to 72 hours directly into the farmer's Aadhaar-seeded bank account through the Public Financial Management System (PFMS / DBT).
            </p>
          </div>

          {/* Authorized Signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs text-slate-500">
            <div>
              <div className="h-10 border-b border-dashed border-slate-300"></div>
              <span className="text-[10px] font-bold uppercase mt-1.5 block">Farmer / Deliverer Sign</span>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-300"></div>
              <span className="text-[10px] font-bold uppercase mt-1.5 block">Weighbridge In-charge</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="h-10 border-b border-dashed border-slate-300 flex items-center justify-center">
                <span className="text-[10px] font-mono font-bold text-emerald-800">SEAL • APMC MANDI</span>
              </div>
              <span className="text-[10px] font-bold uppercase mt-1.5 block">Mandi Secretary Stamp</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-white transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
          >
            <Printer className="h-4 w-4" /> Print / Save J-Form
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}
