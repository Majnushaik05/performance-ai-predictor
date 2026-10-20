import React, { useState, useEffect } from 'react';
import { SmartApiCredentials, TargetIndex } from '../types';
import { ASSETS } from '../assets';
import { generateTOTP } from '../utils/totp';
import {
  ShieldCheck,
  Key,
  User,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Radio,
  Zap,
  Activity,
  Server,
} from 'lucide-react';

interface AngelOneDashboardProps {
  credentials: SmartApiCredentials;
  onChangeCredentials: (creds: SmartApiCredentials) => void;
  onTestConnection: () => void;
  isLoading: boolean;
  statusMessage: string;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  targetIndex: TargetIndex;
}

export const AngelOneDashboard: React.FC<AngelOneDashboardProps> = ({
  credentials,
  onChangeCredentials,
  onTestConnection,
  isLoading,
  statusMessage,
  isStreaming,
  onToggleStreaming,
  targetIndex,
}) => {
  const [showSecrets, setShowSecrets] = useState(false);
  const [currentOtp, setCurrentOtp] = useState<string | null>(null);
  const [otpCounter, setOtpCounter] = useState(30);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Live countdown for 30s TOTP
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setOtpCounter(remaining);
      if (remaining === 30 && credentials.totpSecret) {
        generateTOTP(credentials.totpSecret)
          .then((code) => setCurrentOtp(code))
          .catch(() => {});
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [credentials.totpSecret]);

  const handleInputChange = (field: keyof SmartApiCredentials, value: string) => {
    onChangeCredentials({
      ...credentials,
      [field]: value,
    });
  };

  const handleGeneratePreviewOtp = async () => {
    if (!credentials.totpSecret) {
      setOtpError('Provide a base32 TOTP Secret first');
      return;
    }
    try {
      setOtpError(null);
      const code = await generateTOTP(credentials.totpSecret);
      setCurrentOtp(code);
    } catch (err) {
      setOtpError((err as Error).message);
    }
  };

  const handleFillDemo = () => {
    onChangeCredentials({
      apiKey: 'SMARTAPI_ANGELONE_PRO_KEY_88X',
      clientCode: 'M129384',
      password: 'MPIN_9841',
      totpSecret: 'JBSWY3DPEHPK3PXP',
    });
  };

  return (
    <div className="space-y-6">
      {/* Angel One Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={ASSETS.angelOneLogo}
            alt="Angel One SmartAPI Logo"
            className="w-16 h-16 rounded-xl object-contain border border-slate-100 shadow-xs p-1 bg-white"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Angel One SmartAPI Gateway Hub
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                Official Connector
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              High-speed programmatic market data integration for NSE and BSE indices. Generates RFC 6238 TOTP tokens locally in client memory.
            </p>
          </div>
        </div>

        {/* Live Stream Status Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onToggleStreaming}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-2 ${
              isStreaming
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm animate-pulse'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <Radio className="w-4 h-4 text-white" />
            {isStreaming ? 'Live Auto-Stream Active' : 'Start Live Stream'}
          </button>
        </div>
      </div>

      {/* Connection Specs Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Gateway Endpoint</span>
            <span className="text-xs font-bold text-slate-900 font-mono">apiconnect.angelone.in</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Handshake Protocol</span>
            <span className="text-xs font-bold text-slate-900 font-mono">RFC 6238 HMAC-SHA1</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Index Stream</span>
            <span className="text-xs font-bold text-slate-900">{targetIndex}</span>
          </div>
        </div>
      </div>

      {/* Main Credentials Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              SmartAPI Credentials & Authentication Tokens
            </h3>
            <p className="text-xs text-slate-500">
              Keys remain stored in your local session. Direct browser simulation handles CORS gracefully.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Autofill Test Sandbox Credentials
            </button>
            <button
              type="button"
              onClick={() => setShowSecrets(!showSecrets)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showSecrets ? 'Hide Secrets' : 'Show Secrets'}
            </button>
          </div>
        </div>

        {/* 4 Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              SmartAPI Key
            </label>
            <input
              type={showSecrets ? 'text' : 'password'}
              value={credentials.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              placeholder="Private API Key"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              Client ID / Code
            </label>
            <input
              type="text"
              value={credentials.clientCode}
              onChange={(e) => handleInputChange('clientCode', e.target.value)}
              placeholder="e.g. M123456"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              MPIN / Password
            </label>
            <input
              type={showSecrets ? 'text' : 'password'}
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="MPIN"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              TOTP Secret Key
            </label>
            <input
              type={showSecrets ? 'text' : 'password'}
              value={credentials.totpSecret}
              onChange={(e) => handleInputChange('totpSecret', e.target.value)}
              placeholder="Base32 TOTP Secret"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-mono transition-colors"
            />
          </div>
        </div>

        {/* Action Row & Live TOTP */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGeneratePreviewOtp}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              Compute 6-Digit TOTP Token
            </button>
            {currentOtp && (
              <div className="flex items-center gap-2 text-xs font-numbers px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Code: <strong className="text-base tracking-widest text-emerald-900">{currentOtp}</strong></span>
                <span className="text-[10px] text-slate-400">({otpCounter}s left)</span>
              </div>
            )}
            {otpError && (
              <span className="text-xs text-rose-600 font-mono">{otpError}</span>
            )}
          </div>

          <button
            type="button"
            onClick={onTestConnection}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-spin text-sm">⟳</span>
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            TEST ANGELONE HANDSHAKE
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-lg text-xs font-mono leading-relaxed border ${
              statusMessage.includes('🟢')
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : statusMessage.includes('🔴')
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}
          >
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};
