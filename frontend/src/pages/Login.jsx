import React, { useState } from 'react';
import { api } from '../api/client';
import {
  Sprout,
  Shield,
  Tractor,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  User,
  Mail,
  X,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [error, setError] = useState('');

  // Custom account mode within the Google Chooser
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState('FARMER');

  const googleAccounts = [
    {
      id: 'ramesh',
      name: 'Ramesh Kumar',
      email: 'ramesh.farmer@gmail.com',
      role: 'FARMER',
      roleTitle: 'Farmer Member',
      avatarText: 'R',
      avatarBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white',
      badge: 'Verified Kisan',
      mandi: 'Karnal APMC Yard',
    },
    {
      id: 'vikram',
      name: 'Vikram Singh',
      email: 'vikram.officer@gmail.com',
      role: 'OPERATOR',
      roleTitle: 'APMC Weighbridge Officer',
      avatarText: 'V',
      avatarBg: 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white',
      badge: 'Mandi Incharge',
      mandi: 'Bays #1 & #2 Incharge',
    },
    {
      id: 'amit',
      name: 'Amit Sharma',
      email: 'amit.kisan@gmail.com',
      role: 'FARMER',
      roleTitle: 'Grain Producer & Farmer',
      avatarText: 'A',
      avatarBg: 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white',
      badge: 'Progressive Farmer',
      mandi: 'Haryana APMC Network',
    }
  ];

  const handleAccountSelect = async (account) => {
    setSelectedEmail(account.email);
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: account.name,
        email: account.email,
        role: account.role,
      };

      let res;
      try {
        res = await api.googleLogin(payload);
      } catch (backendErr) {
        console.warn('Backend google login fallback:', backendErr);
        res = {
          user: {
            id: account.role === 'OPERATOR' ? 'demo-operator-1' : 'demo-farmer-1',
            name: account.name,
            phone: account.role === 'OPERATOR' ? '9123456780' : '9876543210',
            role: account.role,
            state: 'Haryana',
            district: 'Karnal',
            village: 'Karnal Mandi',
            email: account.email,
          },
          token: 'demo-google-token-2026',
        };
      }

      // Small authentic Google sign-in delay for realistic transition
      setTimeout(() => {
        api.setSession(res.token, res.user);
        onLoginSuccess(res.user);
      }, 600);
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      setError(err.message || 'Google Sign-In failed. Please try again.');
      setLoading(false);
      setSelectedEmail('');
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      setError('Please provide a name and email address.');
      return;
    }
    handleAccountSelect({
      name: customName.trim(),
      email: customEmail.trim(),
      role: customRole,
    });
  };

  return (
    <div className="min-h-screen bg-[#070c16] text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Agritech Glow Effects */}
      <div className="absolute top-1/6 left-1/5 w-[500px] h-[500px] bg-emerald-500/12 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="absolute bottom-1/6 right-1/5 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[110px] pointer-events-none"></div>

      <div className="relative z-10 max-w-lg w-full bg-[#0d1627]/90 border border-slate-800/90 rounded-3xl p-7 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-2xl hover:border-emerald-500/40 transition-all duration-300">
        {/* Brand Header */}
        <div className="text-center pb-6 border-b border-emerald-500/15">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30 border border-emerald-300/40 animate-float-slow">
            <Sprout className="h-8 w-8 text-slate-950 stroke-[2.2]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight font-display text-gradient-light">
            KisanKendra
          </h1>
          <p className="text-xs sm:text-sm text-emerald-300/90 font-medium mt-1">
            Smart Mandi & AI Queue Management Portal
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 bg-emerald-500/15 text-emerald-300 text-[11px] font-black uppercase px-3.5 py-1 rounded-full border border-emerald-400/30">
            <Sparkles size={12} className="text-emerald-400" /> Government APMC e-Procurement
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 bg-rose-950/70 border border-rose-500/40 text-rose-200 rounded-2xl text-xs font-semibold text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Action Area */}
        <div className="mt-8 space-y-5">
          <div className="text-center">
            <p className="text-xs text-slate-300">
              Sign in with your verified Google Account to access real-time queue tokens, weighbridge schedules, and Form-J receipts.
            </p>
          </div>

          {/* Authentic High-Impact "Continue with Google" Button */}
          <div>
            <button
              type="button"
              onClick={() => {
                setError('');
                setIsCustomMode(false);
                setShowGoogleModal(true);
              }}
              className="w-full py-3.5 px-5 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-800 font-bold text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer border border-slate-200 font-google group"
            >
              {/* Authentic Google Multi-Color 'G' Logo */}
              <svg className="h-5 w-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Quick Direct Demo Bypass */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => handleAccountSelect(googleAccounts[0])}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 transition cursor-pointer"
            >
              ⚡ Instant 1-Click Entry as Farmer Ramesh Kumar (Skip)
            </button>
          </div>
        </div>

        {/* Portal Footer Notice */}
        <div className="mt-8 pt-5 border-t border-emerald-500/15 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            Ministry of Agriculture & Farmers Welfare &bull; Government of India
            <br />
            Certified National Agriculture Market (e-NAM) Integration
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* AUTHENTIC GOOGLE ACCOUNT CHOOSER POPUP MODAL DIALOG            */}
      {/* ------------------------------------------------------------- */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-[440px] bg-white text-slate-900 rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden relative animate-modal-in font-google"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Loading Progress Bar */}
            {loading && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden z-20">
                <div className="h-full bg-blue-600 animate-pulse w-full"></div>
              </div>
            )}

            {/* Modal Header */}
            <div className="px-7 pt-7 pb-4">
              <div className="flex items-center justify-between">
                {/* Official Google Wordmark */}
                <div className="flex items-center gap-1.5 select-none">
                  <span className="text-xl font-bold font-sans tracking-tight">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </span>
                </div>

                {!loading && (
                  <button
                    onClick={() => setShowGoogleModal(false)}
                    className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="mt-4">
                <h2 className="text-xl font-normal text-slate-900 leading-snug">
                  Choose an account
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  to continue to <strong className="text-slate-900 font-semibold">KisanKendra APMC</strong>
                </p>
              </div>
            </div>

            {/* Accounts List */}
            <div className="px-4 pb-2 divide-y divide-slate-100">
              {!isCustomMode ? (
                <>
                  {googleAccounts.map((acc) => {
                    const isSelected = selectedEmail === acc.email;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        disabled={loading}
                        onClick={() => handleAccountSelect(acc)}
                        className={`w-full text-left px-3 py-3 rounded-2xl flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer ${
                          isSelected ? 'bg-blue-50/80 ring-1 ring-blue-500/40' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${acc.avatarBg}`}
                          >
                            {acc.avatarText}
                          </div>

                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate flex items-center gap-1.5">
                              {acc.name}
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {acc.badge}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 truncate">{acc.email}</div>
                          </div>
                        </div>

                        {loading && isSelected ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                        ) : (
                          <ChevronRight size={16} className="text-slate-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}

                  {/* Option: Use Another Account */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setIsCustomMode(true)}
                    className="w-full text-left px-3 py-3 rounded-2xl flex items-center gap-3.5 hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shadow-xs shrink-0">
                      <Plus size={18} />
                    </div>
                    <div className="text-sm font-medium text-slate-700">
                      Use another account
                    </div>
                  </button>
                </>
              ) : (
                /* Custom Google Account Form */
                <form onSubmit={handleCustomSubmit} className="p-3 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Ramesh Singh"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Google Email
                    </label>
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Type / Role
                    </label>
                    <select
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="FARMER">Farmer (Kisan Portal)</option>
                      <option value="OPERATOR">Mandi Operator (Weighbridge Console)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(false)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      ← Back to accounts
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer / Privacy Terms */}
            <div className="p-6 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
              <p>
                To continue, Google will share your name, email address, language preference, and profile picture with KisanKendra. Before using this app, review its{' '}
                <a href="#privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="#terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
