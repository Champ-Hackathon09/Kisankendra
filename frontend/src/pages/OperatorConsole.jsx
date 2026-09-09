import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  ShieldAlert,
  Bell,
  Scale,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  User,
  Phone,
  Truck,
  FileText
} from 'lucide-react';

export default function OperatorConsole({ user }) {
  const [centres, setCentres] = useState([]);
  const [selectedCentreId, setSelectedCentreId] = useState('');
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Weighbridge complete form state
  const [selectedTokenForComplete, setSelectedTokenForComplete] = useState(null);
  const [actualWeight, setActualWeight] = useState('');
  const [moistureLevel, setMoistureLevel] = useState('11.5');

  const fetchCentres = async () => {
    try {
      const res = await api.getCentres();
      setCentres(res.centres || []);
      if (res.centres?.length > 0 && !selectedCentreId) {
        setSelectedCentreId(res.centres[0].id);
      }
    } catch (err) {
      console.error('Fetch centres error:', err);
    }
  };

  const fetchQueue = async () => {
    if (!selectedCentreId) return;
    try {
      setLoading(true);
      const res = await api.getQueue(selectedCentreId);
      setQueueData(res);
    } catch (err) {
      console.error('Fetch queue error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  useEffect(() => {
    if (selectedCentreId) {
      fetchQueue();
      const interval = setInterval(fetchQueue, 8000);
      return () => clearInterval(interval);
    }
  }, [selectedCentreId]);

  const handleStatusChange = async (status, pauseReason = '') => {
    try {
      setActionLoading(true);
      await api.updateCentreStatus(selectedCentreId, status, pauseReason);
      setMessage(`Centre operational status updated to ${status}`);
      setTimeout(() => setMessage(''), 4000);
      fetchCentres();
      fetchQueue();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCallNext = async () => {
    try {
      setActionLoading(true);
      const res = await api.callNextToken(selectedCentreId);
      setMessage(`Token #${res.token?.tokenNumber} dispatched to Mandi Gate!`);
      setTimeout(() => setMessage(''), 4000);
      fetchQueue();
    } catch (err) {
      alert(err.message || 'Failed to call token');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveToWeighbridge = async (tokenId) => {
    try {
      setActionLoading(true);
      await api.updateTokenStatus(tokenId, { status: 'IN_PROGRESS' });
      fetchQueue();
    } catch (err) {
      alert(err.message || 'Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevertToBooked = async (tokenId) => {
    try {
      setActionLoading(true);
      await api.updateTokenStatus(tokenId, { status: 'BOOKED' });
      setMessage('Token successfully returned to Waiting Queue (BOOKED)');
      setTimeout(() => setMessage(''), 4000);
      fetchQueue();
    } catch (err) {
      alert(err.message || 'Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteWeighment = async (e) => {
    e.preventDefault();
    if (!selectedTokenForComplete) return;

    try {
      setActionLoading(true);
      await api.updateTokenStatus(selectedTokenForComplete.id, {
        status: 'COMPLETED',
        actualWeight: parseFloat(actualWeight),
        moistureLevel: parseFloat(moistureLevel),
      });
      setMessage(`Procurement & Weighment certified for Token #${selectedTokenForComplete.tokenNumber}`);
      setTimeout(() => setMessage(''), 4000);
      setSelectedTokenForComplete(null);
      fetchQueue();
    } catch (err) {
      alert(err.message || 'Failed to certify weighment');
    } finally {
      setActionLoading(false);
    }
  };

  const currentCentre = centres.find((c) => c.id === selectedCentreId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Operations Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Terminal Control
            </span>
            <span className="text-slate-400 text-xs">Mandi Gate & Weighbridge Inflow Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Procurement Centre Console</h1>
        </div>

        {/* Centre Dropdown Switcher */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400">Operating Centre:</label>
          <select
            value={selectedCentreId}
            onChange={(e) => setSelectedCentreId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {message}
        </div>
      )}

      {/* Control Strip: Centre Status, Gate Dispatcher, Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status Control */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Mandi Operational Status
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStatusChange('NORMAL')}
              disabled={actionLoading}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                currentCentre?.operationalStatus === 'NORMAL'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🟢 Normal
            </button>
            <button
              onClick={() => handleStatusChange('RUSH')}
              disabled={actionLoading}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                currentCentre?.operationalStatus === 'RUSH'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🟡 Heavy Rush
            </button>
            <button
              onClick={() => {
                const reason = prompt('Specify reason for pausing operations (e.g. Weighbridge Maintenance, Sudden Rain, Storage Choke):', 'Weighbridge Maintenance');
                if (reason) handleStatusChange('PAUSED', reason);
              }}
              disabled={actionLoading}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                currentCentre?.operationalStatus === 'PAUSED'
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🔴 Pause
            </button>
          </div>
        </div>

        {/* Gate Dispatcher */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-emerald-800">
              Gate Dispatcher
            </div>
            <div className="text-xl font-black text-emerald-950 mt-1">
              {queueData?.stats?.waitingCount || 0} Waiting Vehicles
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">Broadcast arrival alert to next queued farmer</p>
          </div>

          <button
            onClick={handleCallNext}
            disabled={actionLoading || queueData?.stats?.waitingCount === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all active:scale-95"
          >
            <Bell className="h-4 w-4" />
            Call Next Vehicle
          </button>
        </div>

        {/* Queue Metrics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-around text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Under Weighment</span>
            <span className="text-xl font-black text-purple-700">{queueData?.stats?.inProgressCount || 0}</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">At Gate (Called)</span>
            <span className="text-xl font-black text-amber-600">{queueData?.stats?.calledCount || 0}</span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Clearance</span>
            <span className="text-xl font-black text-slate-800">~{queueData?.stats?.estimatedTotalWaitMinutes || 0}m</span>
          </div>
        </div>
      </div>

      {/* Main Queue Management Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Active At Gate & In Weighbridge */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="h-4 w-4 text-purple-600" />
            Active at Weighbridge & Mandi Gate
          </h2>

          {/* Current in progress */}
          {queueData?.inProgressToken ? (
            <div className="bg-purple-50/70 border-2 border-purple-300 rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-purple-200">
                <span className="bg-purple-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                  Currently on Weighbridge
                </span>
                <span className="text-base font-black text-purple-950">
                  {queueData.inProgressToken.tokenNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                <div>
                  <span className="text-slate-500 block font-semibold">Farmer Name</span>
                  <span className="font-bold text-slate-800">{queueData.inProgressToken.farmer?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Vehicle Plate</span>
                  <span className="font-bold text-slate-800">{queueData.inProgressToken.vehicleNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Commodity</span>
                  <span className="font-bold text-slate-800">{queueData.inProgressToken.cropType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">Declared Produce</span>
                  <span className="font-bold text-slate-800">{queueData.inProgressToken.estimatedWeight} Quintals</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedTokenForComplete(queueData.inProgressToken);
                  setActualWeight(queueData.inProgressToken.estimatedWeight.toString());
                }}
                className="w-full mt-2 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle className="h-4 w-4" />
                Record Net Weight & Certify Procurement Receipt
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-500">
              Weighbridge is currently vacant. When an arriving tractor enters the weighbridge platform, click "Move to Weighbridge" below.
            </div>
          )}

          {/* Called to Gate Tokens */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Vehicles Dispatched to Gate ({queueData?.calledTokens?.length || 0})
            </h3>

            {queueData?.calledTokens?.length === 0 ? (
              <div className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-slate-200">
                No vehicles currently called to the gate. Use the "Call Next Vehicle" button above.
              </div>
            ) : (
              queueData?.calledTokens?.map((token) => (
                <div key={token.id} className="bg-white border-2 border-amber-300 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{token.tokenNumber}</span>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                        Arriving at Gate
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {token.farmer?.name} • {token.vehicleNumber} • {token.cropType} ({token.estimatedWeight} Q)
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRevertToBooked(token.id)}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Revert token back to BOOKED"
                    >
                      ↩ Revert to Booked
                    </button>
                    <button
                      onClick={() => handleMoveToWeighbridge(token.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Move to Weighbridge →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Waiting Queue */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            Scheduled Inflow Queue ({queueData?.waitingTokens?.length || 0})
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {queueData?.waitingTokens?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No vehicles currently waiting in queue for this centre.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {queueData?.waitingTokens?.map((token, index) => (
                  <div key={token.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{token.tokenNumber}</div>
                        <div className="text-[11px] text-slate-500">
                          {token.farmer?.name} ({token.farmer?.phone}) • {token.cropType}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-bold text-slate-700 block">{token.estimatedWeight} Q</span>
                      <span className="text-[10px] text-slate-400">Slot: {token.slotTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weighbridge Recording Modal */}
      {selectedTokenForComplete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Scale className="h-5 w-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Weighbridge & Quality Certification</h3>
              </div>
              <button onClick={() => setSelectedTokenForComplete(null)} className="text-slate-400 font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleCompleteWeighment} className="space-y-4 mt-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <div className="font-bold text-slate-900 text-sm">{selectedTokenForComplete.tokenNumber}</div>
                <div className="text-slate-500 mt-0.5">{selectedTokenForComplete.farmer?.name} • {selectedTokenForComplete.cropType}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Official Net Weight (Quintals)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Moisture Content (%) — Standard FAQ ≤ 12.0%</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={moistureLevel}
                  onChange={(e) => setMoistureLevel(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTokenForComplete(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all text-xs"
                >
                  Complete & Certify Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
