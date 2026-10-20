import React, { useState } from 'react';
import { SmartApiCredentials } from '../types';
import { ShieldCheck, Lock, Key, User, KeyRound, ChevronDown, ChevronUp, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { generateTOTP } from '../utils/totp';

interface GatewayTerminalProps {
  credentials: SmartApiCredentials;
  onChange: (credentials: SmartApiCredentials) => void;
  onTestConnection: () => void;
  isLoading: boolean;
  statusMessage: string;
}

export const GatewayTerminal: React.FC<GatewayTerminalProps> = ({
  credentials,
  onChange,
  onTestConnection,
  isLoading,
  statusMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [currentOtp, setCurrentOtp] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleInputChange = (field: keyof SmartApiCredentials, value: string) => {
    onChange({
      ...credentials,
      [field]: value,
    });
  };

  const handleGeneratePreviewOtp = async () => {
    if (!credentials.totpSecret) {
      setOtpError('Enter a base32 TOTP Secret first');
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

  const handleFillDemoCredentials = () => {
    onChange({
      apiKey: 'SMARTAPI_DEMO_KEY_99X',
      clientCode: 'M129384',
      password: 'MPIN_9841',
      totpSecret: 'JBSWY3DPEHPK3PXP',
    });
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs mb-6 transition-all">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer border-b border-slate-200"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-900">
                Live Broker Stream (AngelOne Gateway)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Optional
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect your AngelOne SmartAPI credentials to stream live ticks directly into the AI model
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-xs hidden sm:inline-block">
            {isOpen ? 'Close Settings' : 'Configure Credentials'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-700" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="p-5 space-y-4 bg-white">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-200">
            <span className="text-xs text-slate-500">
              Keys remain stored in your local session. Direct browser simulation handles CORS gracefully.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFillDemoCredentials}
                className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-emerald-700 font-medium border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fill Test Sandbox Credentials
              </button>
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showSecrets ? 'Hide Secrets' : 'Show Secrets'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* API Key */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                SmartAPI Key
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={credentials.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="SmartAPI Key"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono transition-colors"
              />
            </div>

            {/* Client ID / Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Client ID / Code
              </label>
              <input
                type="text"
                value={credentials.clientCode}
                onChange={(e) => handleInputChange('clientCode', e.target.value)}
                placeholder="e.g. M123456"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono transition-colors"
              />
            </div>

            {/* Mpin / Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                MPIN / Password
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="MPIN"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono transition-colors"
              />
            </div>

            {/* TOTP Secret String */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                TOTP Secret String
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={credentials.totpSecret}
                onChange={(e) => handleInputChange('totpSecret', e.target.value)}
                placeholder="Base32 TOTP String"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono transition-colors"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGeneratePreviewOtp}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 cursor-pointer font-mono font-medium"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                Calculate 6-digit TOTP
              </button>
              {currentOtp && (
                <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Code: <strong className="tracking-widest text-sm text-emerald-900">{currentOtp}</strong>
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
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-spin text-sm">⟳</span>
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              TEST SMARTAPI HANDSHAKE
            </button>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-mono leading-relaxed border ${
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
      )}
    </div>
  );
};
