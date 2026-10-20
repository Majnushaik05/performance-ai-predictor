import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TargetIndex, IntakeMode, MarketMetrics, SmartApiCredentials, PredictionResult, UserSession, TerminalDashboard } from './types';
import { Header } from './components/Header';
import { GatewayTerminal } from './components/GatewayTerminal';
import { MatrixTuning } from './components/MatrixTuning';
import { InferenceOutput } from './components/InferenceOutput';
import { CandlePreview } from './components/CandlePreview';
import { PredictionHistory } from './components/PredictionHistory';
import { MarketTrendTicker } from './components/MarketTrendTicker';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { StockIndexChart } from './components/StockIndexChart';
import { FnoCallsDashboard } from './components/FnoCallsDashboard';
import { EquityStocksDashboard } from './components/EquityStocksDashboard';
import { IpoCenterDashboard } from './components/IpoCenterDashboard';
import { AngelOneDashboard } from './components/AngelOneDashboard';
import { MarketHeatmap } from './components/MarketHeatmap';
import { calculatePrediction, INDEX_PRESETS } from './services/quantModel';
import { syncAngelOneLiveTicks, generateSimulatedLiveTick } from './services/angelOneService';

export const App: React.FC = () => {
  // Navigation View State: 'landing' or 'terminal'
  const [activeView, setActiveView] = useState<'landing' | 'terminal'>('landing');
  const [currentDashboard, setCurrentDashboard] = useState<TerminalDashboard>('indices');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('aetheris_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register' | 'guest'>('signin');

  // Market & Quantitative State
  const [targetIndex, setTargetIndex] = useState<TargetIndex>('NIFTY 50');
  const [intakeMode, setIntakeMode] = useState<IntakeMode>('Manual Input');

  // Gateway Terminal Credentials
  const [credentials, setCredentials] = useState<SmartApiCredentials>({
    apiKey: '',
    clientCode: '',
    password: '',
    totpSecret: '',
  });
  const [gatewayStatus, setGatewayStatus] = useState<string>('');
  const [isGatewayLoading, setIsGatewayLoading] = useState<boolean>(false);

  // Dynamic Matrix Tuning Inputs
  const [metrics, setMetrics] = useState<MarketMetrics>({
    open: 24820.5,
    high: 25015.0,
    low: 24790.25,
    close: 24985.6,
    volume: 4820000,
    previousReturn: 0.85,
  });

  // Inference & Output State
  const [prediction, setPrediction] = useState<PredictionResult | null>(() => {
    return calculatePrediction('NIFTY 50', {
      open: 24820.5,
      high: 25015.0,
      low: 24790.25,
      close: 24985.6,
      volume: 4820000,
      previousReturn: 0.85,
    });
  });
  const [statusText, setStatusText] = useState<string>(() => prediction ? prediction.outputSummary : '');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // History
  const [history, setHistory] = useState<PredictionResult[]>(() => {
    try {
      const saved = localStorage.getItem('aetheris_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Live Auto-Stream Timer
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const streamIntervalRef = useRef<number | null>(null);

  // Persist User Session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('aetheris_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('aetheris_user');
      }
    } catch {
      // Ignore
    }
  }, [currentUser]);

  // Persist History
  useEffect(() => {
    try {
      localStorage.setItem('aetheris_history', JSON.stringify(history.slice(0, 30)));
    } catch {
      // Ignore
    }
  }, [history]);

  // Launch terminal from landing
  const handleLaunchTerminal = (
    mode: 'guest' | 'auth' = 'guest',
    initialDashboard: TerminalDashboard = 'indices'
  ) => {
    if (!currentUser && mode === 'guest') {
      const guest: UserSession = {
        id: `guest_${Date.now()}`,
        name: 'Guest Explorer',
        email: 'guest@aetheris-quant.internal',
        role: 'Guest Explorer',
        isGuest: true,
      };
      setCurrentUser(guest);
    }
    setCurrentDashboard(initialDashboard);
    setActiveView('terminal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'signin' | 'register' | 'guest' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthenticate = (user: UserSession) => {
    setCurrentUser(user);
    setActiveView('terminal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('landing');
  };

  // Adjust default levels when target index changes if metrics are zero
  const handleIndexChange = (newIndex: TargetIndex) => {
    setTargetIndex(newIndex);
    const matchingPreset = INDEX_PRESETS.find((p) => p.index === newIndex);
    if (matchingPreset && (metrics.open === 0 || metrics.close === 0)) {
      setMetrics({ ...matchingPreset.metrics });
    }
  };

  // Test Gateway Handshake
  const handleTestGateway = async () => {
    setIsGatewayLoading(true);
    setGatewayStatus('⏳ Initiating SmartAPI Gateway handshake...');
    const result = await syncAngelOneLiveTicks(targetIndex, credentials, true);
    setGatewayStatus(result.statusMessage);
    setIsGatewayLoading(false);
  };

  // Execute Core Prediction Matrix
  const handleExecutePrediction = useCallback(async () => {
    setIsExecuting(true);
    let currentMetrics = { ...metrics };

    // If stream mode is selected, fetch live ticks first
    if (intakeMode === 'AngelOne Live Stream') {
      const syncRes = await syncAngelOneLiveTicks(targetIndex, credentials, true);
      setGatewayStatus(syncRes.statusMessage);

      if (syncRes.statusMessage.includes('🔴')) {
        const abortedText = `Execution Aborted. Reason: ${syncRes.statusMessage}`;
        setStatusText(abortedText);
        setIsExecuting(false);
        return;
      }

      currentMetrics = syncRes.metrics;
      setMetrics(currentMetrics);
    }

    // Run Quantitative Model Inference
    const result = calculatePrediction(targetIndex, currentMetrics);

    setPrediction(result);
    setStatusText(result.outputSummary);
    setHistory((prev) => [result, ...prev]);
    setIsExecuting(false);
  }, [intakeMode, targetIndex, credentials, metrics]);

  // Handle live tick stream loop
  useEffect(() => {
    if (isStreaming && intakeMode === 'AngelOne Live Stream') {
      streamIntervalRef.current = window.setInterval(() => {
        if (credentials.apiKey && credentials.clientCode) {
          syncAngelOneLiveTicks(targetIndex, credentials, true).then((res) => {
            if (res.success) {
              setMetrics(res.metrics);
              const p = calculatePrediction(targetIndex, res.metrics);
              setPrediction(p);
              setStatusText(p.outputSummary);
            }
          });
        } else {
          // Simulated tick engine
          const simTick = generateSimulatedLiveTick(targetIndex);
          setMetrics(simTick);
          const p = calculatePrediction(targetIndex, simTick);
          setPrediction(p);
          setStatusText(p.outputSummary);
        }
      }, 4000);
    } else {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
    }

    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
    };
  }, [isStreaming, intakeMode, targetIndex, credentials]);

  // Apply Preset
  const handleApplyPreset = (presetIndex: number) => {
    const selected = INDEX_PRESETS[presetIndex];
    if (selected) {
      setTargetIndex(selected.index);
      setMetrics({ ...selected.metrics });
    }
  };

  // Reset to Zero
  const handleResetMetrics = () => {
    setMetrics({
      open: 0.0,
      high: 0.0,
      low: 0.0,
      close: 0.0,
      volume: 0,
      previousReturn: 0.0,
    });
    setPrediction(null);
    setStatusText('Dynamic matrix reset to 0.0 values.');
  };

  // Reload Historical Prediction
  const handleSelectHistorical = (hist: PredictionResult) => {
    setTargetIndex(hist.index);
    setMetrics({ ...hist.inputMetrics });
    setPrediction(hist);
    setStatusText(hist.outputSummary);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear History
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('aetheris_history');
    } catch {
      // Ignore
    }
  };

  return (
    <>
      {activeView === 'landing' ? (
        <LandingPage
          onLaunchTerminal={handleLaunchTerminal}
          onOpenAuth={handleOpenAuth}
        />
      ) : (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-600 selection:text-white">
          {/* Top Navigation & App Header */}
          <Header
            targetIndex={targetIndex}
            onSelectIndex={handleIndexChange}
            intakeMode={intakeMode}
            onSelectMode={(m) => {
              setIntakeMode(m);
              if (m === 'Manual Input') {
                setIsStreaming(false);
              }
            }}
            isStreaming={isStreaming}
            onToggleStreaming={() => setIsStreaming(!isStreaming)}
            currentUser={currentUser}
            onLogout={handleLogout}
            onReturnToLanding={() => setActiveView('landing')}
            currentDashboard={currentDashboard}
            onSelectDashboard={setCurrentDashboard}
          />

          {/* Market Pulse Ticker Bar */}
          <MarketTrendTicker onSelectSymbol={(sym) => {
            if (sym.includes('NIFTY')) {
              setTargetIndex('NIFTY 50');
              setCurrentDashboard('indices');
            } else if (sym.includes('SENSEX')) {
              setTargetIndex('SENSEX');
              setCurrentDashboard('indices');
            } else if (sym.includes('BANKEX')) {
              setTargetIndex('BANKEX');
              setCurrentDashboard('indices');
            }
          }} />

          {/* Main Content Area: Step-by-Step Clear Operational Dashboards */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {currentDashboard === 'indices' && (
              <>
                {/* Accordion: AngelOne SmartAPI Gateway */}
                <GatewayTerminal
                  credentials={credentials}
                  onChange={setCredentials}
                  onTestConnection={handleTestGateway}
                  isLoading={isGatewayLoading}
                  statusMessage={gatewayStatus}
                />

                {/* Live Interactive Stock Index Market Graph with RSI (14) */}
                <StockIndexChart
                  targetIndex={targetIndex}
                  currentMetrics={metrics}
                  onSelectIndex={handleIndexChange}
                />

                {/* 2-Column Core Architecture (Matrix Tuning vs Inference Output with Bull/Bear Watermarks) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* Column 1: Dynamic Matrix Tuning & Candlestick Preview */}
                  <div className="flex flex-col space-y-6">
                    <MatrixTuning
                      metrics={metrics}
                      targetIndex={targetIndex}
                      onChange={setMetrics}
                      onApplyPreset={handleApplyPreset}
                      onReset={handleResetMetrics}
                    />

                    <CandlePreview metrics={metrics} targetIndex={targetIndex} />
                  </div>

                  {/* Column 2: Inference Pipeline Output with Visual Trend Indicator & Bull/Bear Shadows */}
                  <div className="flex flex-col">
                    <InferenceOutput
                      prediction={prediction}
                      onExecute={handleExecutePrediction}
                      isExecuting={isExecuting}
                      statusText={statusText}
                      onNavigateDashboard={setCurrentDashboard}
                    />
                  </div>
                </div>

                {/* Prediction Audit History Log */}
                <PredictionHistory
                  history={history}
                  onClear={handleClearHistory}
                  onSelectHistorical={handleSelectHistorical}
                />
              </>
            )}

            {currentDashboard === 'heatmap' && (
              <MarketHeatmap onNavigateDashboard={(d) => setCurrentDashboard(d)} />
            )}

            {currentDashboard === 'fno_calls' && (
              <FnoCallsDashboard onNavigateAngelOne={() => setCurrentDashboard('angelone')} />
            )}

            {currentDashboard === 'equity_stocks' && (
              <EquityStocksDashboard />
            )}

            {currentDashboard === 'ipo_center' && (
              <IpoCenterDashboard />
            )}

            {currentDashboard === 'angelone' && (
              <AngelOneDashboard
                credentials={credentials}
                onChangeCredentials={setCredentials}
                onTestConnection={handleTestGateway}
                isLoading={isGatewayLoading}
                statusMessage={gatewayStatus}
                isStreaming={isStreaming}
                onToggleStreaming={() => setIsStreaming(!isStreaming)}
                targetIndex={targetIndex}
              />
            )}
          </main>

          {/* Clean Light Footer */}
          <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-800">
                  AI Stock Predictor &bull; Market Trend Engine
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                NIFTY 50 &bull; SENSEX &bull; BANKEX &bull; AngelOne SmartAPI Gateway
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={handleAuthenticate}
      />
    </>
  );
};

export default App;
