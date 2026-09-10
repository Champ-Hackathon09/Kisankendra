import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Building2,
  Map,
  Bot,
  CloudSun,
  TrendingUp,
  Bell,
  HelpCircle,
  Settings,
  Scale,
  Sprout,
  ChevronRight,
  ShieldAlert,
  Warehouse,
  Sparkles,
  PhoneCall,
  Activity,
  Droplets,
  Wind,
  Sun,
  Flame,
  Radio,
  LogOut,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, unreadAlerts = 3, user, onLogout }) {
  const isOperator = user?.role === 'OPERATOR';
  const [weatherExpanded, setWeatherExpanded] = useState(false);

  const mainNav = [
    { id: 'dashboard', label: 'Farmer Dashboard', icon: LayoutDashboard },
    ...(isOperator ? [{ id: 'operator', label: 'Operator Console', icon: Scale, badge: 'Live', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }] : []),
    { id: 'stocks', label: 'Crop Silo Stocks', icon: Warehouse, badge: 'MSP', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'queue', label: 'Live Mandi Queue', icon: Users, isLive: true },
    { id: 'status', label: 'J-Form & Tokens', icon: ClipboardCheck },
    { id: 'centres', label: 'APMC Centres', icon: Building2 },
    { id: 'map', label: 'Geospatial Yard Map', icon: Map },
  ];

  const intelligenceNav = [
    { id: 'predictions', label: 'AI Surge Predictor', icon: Bot, badge: 'AI', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { id: 'weather', label: 'Weather & Moisture', icon: CloudSun, badge: 'Live 28°C', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { id: 'analytics', label: 'Intake Analytics', icon: TrendingUp },
    { id: 'alerts', label: 'Mandi Broadcasts', icon: Bell, count: unreadAlerts },
  ];

  const supportNav = [
    { id: 'help', label: 'Help & Toll-Free', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-72 glass-sidebar flex flex-col shrink-0 h-screen max-h-screen select-none shadow-[4px_0_24px_rgba(0,0,0,0.4)] relative z-30 overflow-hidden">
      {/* Brand Header */}
      <div className="p-5 border-b border-emerald-500/15 relative overflow-hidden bg-gradient-to-b from-emerald-950/40 to-transparent shrink-0">
        {/* Ambient background glow */}
        <div className="absolute -top-10 -left-10 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative group cursor-pointer">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-400/40 transition-transform duration-300 group-hover:scale-105">
              <Sprout className="h-6 w-6 text-emerald-100 animate-float-slow" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#081410]"></span>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-display">
                KisanKendra
              </span>
              <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
                PRO APMC
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/80 truncate font-medium flex items-center gap-1 mt-0.5">
              <Radio size={11} className="text-emerald-400 animate-pulse" />
              Smart Mandi & AI Queue
            </p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {/* 1. Mandi Operations Section */}
        <div>
          <div className="px-2.5 pb-2.5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400/70 flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400" />
              Mandi Operations
            </span>
            <span className="text-[9px] font-bold text-slate-500 font-mono">07 APMC HUBS</span>
          </div>

          <div className="space-y-1.5">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-900/80 to-emerald-950/90 text-white border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1.5 before:bg-emerald-400 before:rounded-r-full before:shadow-[0_0_10px_#34d399]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-emerald-950/30 hover:border-emerald-500/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pl-1">
                    <Icon
                      size={16}
                      className={`transition-all duration-300 ${
                        isActive
                          ? 'text-emerald-300 scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                          : 'text-slate-400 group-hover:text-emerald-400 group-hover:scale-115'
                      }`}
                    />
                    <span className="truncate group-hover:translate-x-1 transition-transform duration-200">
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border shadow-xs ${
                        item.badgeColor || (isActive ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' : 'bg-slate-800 text-slate-300 border-slate-700')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.isLive && (
                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      LIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Intelligence & Weather Section */}
        <div>
          <div className="px-2.5 pb-2.5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400/80 flex items-center gap-1.5">
              <Sparkles size={12} className="text-cyan-400" />
              Intelligence & Weather
            </span>
            <span className="text-[9px] font-bold text-cyan-400/70 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
              AI ENGINE
            </span>
          </div>

          <div className="space-y-1.5">
            {intelligenceNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-900/80 to-emerald-950/90 text-white border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1.5 before:bg-cyan-400 before:rounded-r-full before:shadow-[0_0_10px_#22d3ee]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-emerald-950/30 hover:border-emerald-500/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pl-1">
                    <Icon
                      size={16}
                      className={`transition-all duration-300 ${
                        isActive
                          ? 'text-cyan-300 scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                          : 'text-slate-400 group-hover:text-cyan-400 group-hover:scale-115'
                      }`}
                    />
                    <span className="truncate group-hover:translate-x-1 transition-transform duration-200">
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border shadow-xs ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.count > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                      {item.count} NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Live Weather & Moisture Telemetry Card (Inside Sidebar!) */}
          <div
            onClick={() => setActiveTab('weather')}
            className="mt-3.5 p-3 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-[#071912] to-teal-950/60 border border-emerald-500/30 hover:border-emerald-400/60 shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                <Sun size={12} className="text-amber-400 animate-spin" style={{ animationDuration: '18s' }} />
                Mandi Micro-Weather
              </span>
              <span className="text-[9px] font-bold text-slate-400 group-hover:text-emerald-300 flex items-center gap-0.5 transition-colors">
                Inspect <ChevronRight size={10} />
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-black text-white font-display flex items-center gap-1.5">
                  28°C
                  <span className="text-[11px] font-semibold text-emerald-300 font-sans">Clear Sky</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Karnal APMC Yard Station</div>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-black text-emerald-400 flex items-center justify-end gap-1">
                  <Droplets size={11} className="text-cyan-400" /> 42%
                </div>
                <div className="text-[9px] font-semibold text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                  <Wind size={10} className="text-teal-300" /> 11 km/h
                </div>
              </div>
            </div>

            {/* Grain Moisture Advisory Indicator */}
            <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Moisture Safety Index:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Safe (≤ 11.2%)
              </span>
            </div>
          </div>

          {/* Real-time Yard Telemetry Gauge Card */}
          <div className="mt-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
              <span className="text-slate-300 flex items-center gap-1">
                <Scale size={12} className="text-emerald-400" />
                Yard Flow Velocity
              </span>
              <span className="text-emerald-400 font-mono">~12m avg</span>
            </div>
            
            {/* Animated progress flow bar */}
            <div className="w-full bg-emerald-950/60 rounded-full h-1.5 overflow-hidden border border-emerald-500/20">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-4/5 animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1">
              <span>Weighbridges 1 & 2 Active</span>
              <span className="text-emerald-400 font-bold">Optimal Speed</span>
            </div>
          </div>
        </div>

        {/* 3. System & Preferences Section */}
        <div>
          <div className="px-2.5 pb-2.5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Settings size={12} className="text-slate-400" />
              System & Helpline
            </span>
          </div>

          <div className="space-y-1.5">
            {supportNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-900/80 to-emerald-950/90 text-white border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1.5 before:bg-emerald-400 before:rounded-r-full'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-emerald-950/30 hover:border-emerald-500/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pl-1">
                    <Icon
                      size={16}
                      className={`transition-all duration-300 ${
                        isActive
                          ? 'text-emerald-300 scale-110'
                          : 'text-slate-400 group-hover:text-emerald-400 group-hover:scale-115'
                      }`}
                    />
                    <span className="truncate group-hover:translate-x-1 transition-transform duration-200">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 24x7 Mandi Support SOS Pill */}
          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-br from-amber-950/50 to-orange-950/30 border border-amber-500/30 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <PhoneCall size={12} className="animate-bounce" />
              </div>
              <div>
                <div className="text-[10px] font-black text-amber-200 uppercase tracking-wide">
                  24x7 APMC Toll-Free SOS
                </div>
                <div className="text-xs font-black text-white font-mono">1800-180-1551</div>
              </div>
            </div>
            <p className="text-[9px] text-amber-300/70 leading-relaxed">
              Toll-free government helpline for weighbridge disputes & gate clearance.
            </p>
          </div>
        </div>
      </div>

      {/* User Profile & System Status Footer */}
      <div className="p-4 border-t border-emerald-500/15 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-md border border-emerald-400/40">
                {user?.name?.charAt(0) || 'K'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#081410]"></span>
            </div>

            <div className="min-w-0">
              <div className="text-xs font-black text-white truncate font-display">
                {user?.name || 'Farmer Member'}
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={10} className="text-emerald-400" />
                Verified {user?.role || 'FARMER'}
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 hover:border-rose-500/30 border border-transparent transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-emerald-500/10 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1 text-emerald-400/80 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            APMC Sensor Core v2.4
          </span>
          <span className="font-mono text-slate-500">Karnal APMC</span>
        </div>
      </div>
    </aside>
  );
}
