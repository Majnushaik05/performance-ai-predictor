import React from 'react';
import { TargetIndex, IntakeMode, UserSession, TerminalDashboard } from '../types';
import { Radio, RefreshCw, LogOut, ArrowLeft, User, BarChart2, Target, Award, Rocket, ShieldCheck, Activity } from 'lucide-react';
import { ASSETS } from '../assets';

interface HeaderProps {
  targetIndex: TargetIndex;
  onSelectIndex: (index: TargetIndex) => void;
  intakeMode: IntakeMode;
  onSelectMode: (mode: IntakeMode) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  currentUser: UserSession | null;
  onLogout: () => void;
  onReturnToLanding: () => void;
  currentDashboard: TerminalDashboard;
  onSelectDashboard: (tab: TerminalDashboard) => void;
}

export const Header: React.FC<HeaderProps> = ({
  targetIndex,
  onSelectIndex,
  intakeMode,
  onSelectMode,
  isStreaming,
  onToggleStreaming,
  currentUser,
  onLogout,
  onReturnToLanding,
  currentDashboard,
  onSelectDashboard,
}) => {
  const indices: TargetIndex[] = ['NIFTY 50', 'SENSEX', 'BANKEX'];
  const modes: IntakeMode[] = ['Manual Input', 'AngelOne Live Stream'];

  const dashboardTabs: { id: TerminalDashboard; label: string; icon: React.ReactNode }[] = [
    { id: 'indices', label: 'Index Predictor', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: 'heatmap', label: 'Market Heatmap', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'fno_calls', label: 'Take Calls (F&O & Options)', icon: <Target className="w-3.5 h-3.5" /> },
    { id: 'equity_stocks', label: 'Top Equity Stocks', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'ipo_center', label: 'Top IPO Center', icon: <Rocket className="w-3.5 h-3.5" /> },
    { id: 'angelone', label: 'AngelOne Connect', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      {/* Top Brand & Actions Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand Lockup */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onReturnToLanding}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Return to Landing Page"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <img
                src={ASSETS.logo}
                alt="AI Stock Predictor Logo"
                className="w-8 h-8 rounded-lg object-cover border border-emerald-500/30 shadow-xs"
                referrerPolicy="no-referrer"
              />

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                    AI Stock <span className="text-emerald-600">Predictor</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Terminal
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  Step-by-Step Market Operating System
                </span>
              </div>
            </div>

            {/* Target Index Segmented Selector */}
            {currentDashboard === 'indices' && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
                {indices.map((idx) => {
                  const isSelected = targetIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectIndex(idx)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      {idx}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Controls: Intake Mode & Profile */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto flex-wrap">
            {currentDashboard === 'indices' && (
              <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-lg">
                {modes.map((mode) => {
                  const isSelected = intakeMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onSelectMode(mode)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60 font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode === 'AngelOne Live Stream' && (
                        <Radio className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      {mode}
                    </button>
                  );
                })}
              </div>
            )}

            {intakeMode === 'AngelOne Live Stream' && currentDashboard === 'indices' && (
              <button
                type="button"
                onClick={onToggleStreaming}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  isStreaming
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin text-emerald-600' : ''}`} />
                {isStreaming ? 'Streaming LIVE' : 'Start Live Feed'}
              </button>
            )}

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                  <User className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {currentUser?.name || 'Guest Explorer'}
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    {currentUser?.role || 'Guest'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Dashboard Navigation Bar (Step-by-step clear operational dashboards) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 text-xs font-bold">
          {dashboardTabs.map((tab) => {
            const isActive = currentDashboard === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectDashboard(tab.id)}
                className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
