import React from 'react';
import { Sprout, LogOut, Shield, Tractor } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-100">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Kisan<span className="text-emerald-600">Kendra</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  SIH 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Smart Agricultural Procurement Queue & Token System</p>
            </div>
          </div>

          {/* User Profile & Actions */}
          {user ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.role === 'OPERATOR' ? <Shield className="h-4 w-4" /> : <Tractor className="h-4 w-4" />}
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-slate-900">{user.name}</div>
                  <div className="text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${user.role === 'OPERATOR' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    {user.role === 'OPERATOR' ? 'Mandi Operations Officer' : 'Registered Farmer'}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Ministry of Consumer Affairs & Food Distribution
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
