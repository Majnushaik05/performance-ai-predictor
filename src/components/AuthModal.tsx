import React, { useState } from 'react';
import { UserSession } from '../types';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { ASSETS } from '../assets';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'register' | 'guest';
  onClose: () => void;
  onAuthenticate: (user: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onAuthenticate,
}) => {
  const [mode, setMode] = useState<'signin' | 'register' | 'guest'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'guest') {
      const guestUser: UserSession = {
        id: `guest_${Date.now()}`,
        name: 'Guest Explorer',
        email: 'guest@aistock.internal',
        role: 'Guest Explorer',
        isGuest: true,
      };
      onAuthenticate(guestUser);
      onClose();
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    const authenticatedUser: UserSession = {
      id: `usr_${Date.now()}`,
      name: name.trim() || email.split('@')[0],
      email,
      role: 'Institutional Trader',
      isGuest: false,
    };

    onAuthenticate(authenticatedUser);
    onClose();
  };

  const handleInstantDemoLogin = (role: 'Institutional Trader' | 'Quantitative Analyst') => {
    const demoUser: UserSession = {
      id: `usr_demo_${Date.now()}`,
      name: role === 'Institutional Trader' ? 'Elena Rostova' : 'Marcus Vance',
      email: role === 'Institutional Trader' ? 'e.rostova@quantfund.com' : 'm.vance@algorithmic.io',
      role,
      isGuest: false,
    };
    onAuthenticate(demoUser);
    onClose();
  };

  const handleGuestQuickLaunch = () => {
    const guestUser: UserSession = {
      id: `guest_${Date.now()}`,
      name: 'Guest Explorer',
      email: 'guest@aistock.internal',
      role: 'Guest Explorer',
      isGuest: true,
    };
    onAuthenticate(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={ASSETS.logo}
              alt="AI Stock Predictor Logo"
              className="w-8 h-8 rounded-lg object-cover border border-emerald-500/30"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                AI Stock Predictor
              </h3>
              <p className="text-xs text-slate-500">Sign in to access live stock forecast</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('guest');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'guest'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:text-emerald-800'
            }`}
          >
            Guest Explorer
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'guest' ? (
            <div className="space-y-4 text-center">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed">
                Guest Explorer grants immediate access to all stock prediction matrices, presets, candlestick visualizer, and live stream simulations with zero setup.
              </div>
              <button
                type="button"
                onClick={handleGuestQuickLaunch}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                Launch Predictor as Guest
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trader@domain.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {mode === 'signin' ? 'Sign In to Predictor' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Selector */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              One-Click Instant Demo Login:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('Institutional Trader')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900">Pro Trader</div>
                <div className="text-[10px] text-slate-500">Live Stream Enabled</div>
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('Quantitative Analyst')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900">Market Analyst</div>
                <div className="text-[10px] text-slate-500">Multi-Factor Analysis</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Encrypted Session
          </span>
          <span>AI Stock Predictor v2.0</span>
        </div>
      </div>
    </div>
  );
};
