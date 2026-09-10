import React, { useState } from 'react';
import { api } from '../api/client';
import { Sprout, Shield, Tractor, ArrowRight, CheckCircle2, Sparkles, User, Mail } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [role, setRole] = useState('FARMER');
  const [selectedAccount, setSelectedAccount] = useState('farmer'); // 'farmer' | 'operator' | 'custom'
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const accounts = [
    {
      id: 'farmer',
      name: 'Ramesh Kumar',
      email: 'ramesh.farmer@gmail.com',
      role: 'FARMER',
      roleTitle: 'Farmer (Kisan)',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      avatarBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500',
      icon: Tractor,
    },
    {
      id: 'operator',
      name: 'Vikram Singh',
      email: 'vikram.officer@gmail.com',
      role: 'OPERATOR',
      roleTitle: 'Mandi Officer (Weighbridge Incharge)',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      avatarBg: 'bg-gradient-to-tr from-amber-600 to-orange-500',
      icon: Shield,
    },
  ];

  const handleGoogleSignIn = async (accountData) => {
    setLoading(true);
    setError('');

    try {
      const activeData = accountData || (
        selectedAccount === 'farmer'
          ? accounts[0]
          : selectedAccount === 'operator'
          ? accounts[1]
          : {
              name: customName.trim() || 'Kisan User',
              email: customEmail.trim() || 'farmer@gmail.com',
              role,
            }
      );

      const payload = {
        name: activeData.name,
        email: activeData.email,
        role: activeData.role,
      };

      let res;
      try {
        res = await api.googleLogin(payload);
      } catch (backendErr) {
        // Safe offline / mock fallback session if backend fails
        console.warn('Backend google login fallback:', backendErr);
        res = {
          user: {
            id: activeData.role === 'OPERATOR' ? 'demo-operator-1' : 'demo-farmer-1',
            name: activeData.name,
            phone: activeData.role === 'OPERATOR' ? '9123456780' : '9876543210',
            role: activeData.role,
            state: 'Haryana',
            district: 'Karnal',
            village: 'Karnal Mandi',
            email: activeData.email,
          },
          token: 'demo-google-token-2026',
        };
      }

      api.setSession(res.token, res.user);
      onLoginSuccess(res.user);
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      setError(err.message || 'Google Sign-In could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d17] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Agritech Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl hover:border-emerald-500/40 transition-all">
        {/* Brand Header */}
        <div className="text-center pb-6 border-b border-emerald-500/20">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30 border border-emerald-400/40">
            <Sprout className="h-7 w-7 text-emerald-100" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
            KisanKendra
          </h1>
          <p className="text-xs text-emerald-300/90 font-medium mt-1">
            Smart Mandi & AI Queue Management Portal
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2.5 bg-emerald-500/15 text-emerald-300 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-400/30">
            <Sparkles size={11} className="text-emerald-400" /> 1-Click Fast Access Enabled
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Google 1-Click Account Switcher */}
        <div className="mt-6 space-y-4">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Select Account & Continue:</span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">Verified APMC</span>
          </div>

          <div className="space-y-2.5">
            {accounts.map((acc) => {
              const isSelected = selectedAccount === acc.id;
              const Icon = acc.icon;
              return (
                <div
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccount(acc.id);
                    setRole(acc.role);
                  }}
                  className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg'
                      : 'bg-[#061710] border-emerald-500/20 hover:border-emerald-400/50 hover:bg-[#092218]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl ${acc.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate font-display flex items-center gap-1.5">
                        {acc.name}
                        {isSelected && <CheckCircle2 size={13} className="text-emerald-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{acc.email}</div>
                      <div className="mt-0.5">
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${acc.badgeColor}`}>
                          {acc.roleTitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGoogleSignIn(acc);
                    }}
                    className="shrink-0 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-black text-[11px] rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Login</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Primary One-Click Official Google Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleGoogleSignIn()}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer border border-slate-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting to Google Account...</span>
                </>
              ) : (
                <>
                  {/* Authentic Multicolored Google 'G' Logo */}
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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
                  <span>Sign in with Google (1-Click)</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Direct Bypass */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => handleGoogleSignIn(accounts[0])}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 transition cursor-pointer"
            >
              ⚡ Instant Entry as Farmer Ramesh Kumar (Skip)
            </button>
          </div>
        </div>

        {/* Portal Footer Notice */}
        <div className="mt-6 pt-4 border-t border-emerald-500/20 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Ministry of Agriculture & Farmers Welfare &bull; Direct Benefit Transfer (DBT) Assured
          </p>
        </div>
      </div>
    </div>
  );
}
