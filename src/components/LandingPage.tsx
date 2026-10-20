import React, { useState, useEffect } from 'react';
import { ASSETS } from '../assets';
import { MarketTrendTicker } from './MarketTrendTicker';
import { StockIndexChart } from './StockIndexChart';
import { BullBearVideoBackground } from './BullBearVideoBackground';
import { MarketHeatmap } from './MarketHeatmap';
import { TargetIndex, TerminalDashboard } from '../types';
import {
  ArrowRight,
  TrendingUp,
  Zap,
  BarChart3,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight,
  Target,
  Award,
  Rocket,
  Activity,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchTerminal: (mode?: 'guest' | 'auth', initialDashboard?: TerminalDashboard) => void;
  onOpenAuth: (initialMode?: 'signin' | 'register' | 'guest') => void;
}

const ROLLING_HEADLINES = [
  'NIFTY 50 Intraday Reversals',
  'SENSEX Breakout Direction',
  'BANKEX Expiry Momentum',
  'Stock Market Pivot Levels',
  'Top Equity Long-Term Picks',
];

const ROLLING_TAGS = [
  'Real-Time NSE & BSE Ticks',
  '99.4% Inference Latency SLA',
  'AngelOne SmartAPI Connected',
  'Floor Trader Pivot Levels',
  'Candlestick Pattern AI',
  'RFC 6238 Web Crypto TOTP',
  'Trend Reversal Detection',
  'Overbought / Oversold RSI (14)',
];

const CAROUSEL_SLIDES = [
  {
    image: ASSETS.heroAnalystDesk,
    title: 'Professional Market Trading Desk',
    subtitle: 'Institutional intraday monitoring and real-time execution station',
    tag: 'Live Workspace',
  },
  {
    image: ASSETS.chartAnalyticsPreview,
    title: 'AI Multi-Factor Vector Scanner',
    subtitle: 'Continuous price action velocity, volume spikes, and candle anatomy',
    tag: 'Algorithm Engine',
  },
  {
    image: ASSETS.bullBearShadow,
    title: 'Bull & Bear Market Force Equilibrium',
    subtitle: 'Directional momentum forecasting and trend reversal signals',
    tag: 'Market Dynamics',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchTerminal,
  onOpenAuth,
}) => {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<TargetIndex>('NIFTY 50');
  const [activeSlide, setActiveSlide] = useState(0);

  // Rolling headline interval
  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % ROLLING_HEADLINES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Rolling Image Carousel interval
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, []);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);

  return (
    <div className="min-h-screen relative text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* 0. FULL PAGE DYNAMIC BULL VS BEAR VIDEO BACKGROUND PLAYING ACROSS ENTIRE PAGE */}
      <BullBearVideoBackground />

      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src={ASSETS.logo}
              alt="AI Stock Predictor Logo"
              className="w-8 h-8 rounded-lg object-cover border border-emerald-500/30 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                AI Stock <span className="text-emerald-600">Predictor</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Edition
              </span>
            </div>
          </div>

          {/* Clean Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => onLaunchTerminal('guest', 'indices')}
              className="hover:text-emerald-600 transition-colors whitespace-nowrap cursor-pointer"
            >
              Index Predictor
            </button>
            <button
              type="button"
              onClick={() => onLaunchTerminal('guest', 'heatmap')}
              className="hover:text-emerald-600 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 text-emerald-700 font-bold"
            >
              <Activity className="w-3.5 h-3.5" />
              Market Heatmap
            </button>
            <button
              type="button"
              onClick={() => onLaunchTerminal('guest', 'fno_calls')}
              className="hover:text-emerald-600 transition-colors whitespace-nowrap cursor-pointer"
            >
              Take Calls (F&O)
            </button>
            <button
              type="button"
              onClick={() => onLaunchTerminal('guest', 'equity_stocks')}
              className="hover:text-emerald-600 transition-colors whitespace-nowrap cursor-pointer"
            >
              Top Equity Stocks
            </button>
            <button
              type="button"
              onClick={() => onLaunchTerminal('guest', 'ipo_center')}
              className="hover:text-emerald-600 transition-colors whitespace-nowrap cursor-pointer"
            >
              IPO Center
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenAuth('signin')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="hidden sm:inline-block px-3.5 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => onLaunchTerminal('guest', 'indices')}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              Launch Platform
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. LIVE MARKET TICKER TAPE */}
      <MarketTrendTicker onSelectSymbol={() => onLaunchTerminal('guest', 'indices')} />

      {/* 3. ROLLING TAGS MARQUEE RIBBON */}
      <div className="relative z-10 bg-slate-900/90 backdrop-blur-xs text-white py-2 overflow-x-auto no-scrollbar border-b border-slate-800">
        <div className="flex items-center gap-6 min-w-max px-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px] pr-3 border-r border-slate-700">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Live Highlights:
          </div>
          {ROLLING_TAGS.map((tag, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. HERO SECTION - TRANSLUCENT WITH FULL PAGE BULL & BEAR VIDEO PLAYING IN BACKGROUND */}
      <section className="relative z-10 overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/80 bg-white/80 backdrop-blur-xs">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Value Proposition with Clean Rolling Text (NO green underline) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Intelligent Stock Market Forecast & Trend Finder
              </div>

              {/* Dynamic Rolling Headline without green underline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Predict{' '}
                <span className="text-emerald-700 font-black transition-all duration-300">
                  {ROLLING_HEADLINES[headlineIndex]}
                </span>
                <br />
                with AI Directional Clarity
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                Engineered for stock traders, investors, and analysts. Real-time directional verdicts, overbought/oversold RSI calculations, interactive Take Calls (F&O & Options), top IPO GMP pipeline, and top equity investments in one unified system.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onLaunchTerminal('guest', 'indices')}
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  Launch Predictor (Guest Explorer)
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onLaunchTerminal('guest', 'fno_calls')}
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Target className="w-4 h-4 text-emerald-600" />
                  Take Calls & Option Radar
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>NIFTY 50 · SENSEX · BANKEX</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>RSI (14) Overbought/Oversold</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>AngelOne SmartAPI Hub</span>
                </div>
              </div>
            </div>

            {/* Right: Rolling Image Carousel */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white relative group">
                {/* Active Slide Image */}
                <div className="relative h-80 sm:h-96 w-full overflow-hidden">
                  <img
                    src={CAROUSEL_SLIDES[activeSlide].image}
                    alt={CAROUSEL_SLIDES[activeSlide].title}
                    className="w-full h-full object-cover transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                    {CAROUSEL_SLIDES[activeSlide].tag}
                  </div>
                </div>

                {/* Carousel Controls */}
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md text-slate-800 hover:bg-white hover:scale-105 transition-all cursor-pointer opacity-80 hover:opacity-100"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md text-slate-800 hover:bg-white hover:scale-105 transition-all cursor-pointer opacity-80 hover:opacity-100"
                  title="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Slide Caption and Indicator Dots */}
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {CAROUSEL_SLIDES[activeSlide].title}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {CAROUSEL_SLIDES[activeSlide].subtitle}
                    </p>
                  </div>

                  {/* Dots */}
                  <div className="flex items-center gap-1.5">
                    {CAROUSEL_SLIDES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveSlide(i)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          activeSlide === i ? 'w-5 bg-emerald-600' : 'bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STEP-BY-STEP DASHBOARD MODULES PREVIEW */}
      <section className="py-16 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600">
              Complete Trading Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Separate Dashboards Engineered for Every Market Discipline
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Clean step-by-step navigation eliminating all confusion:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Index Predictor */}
            <div
              onClick={() => onLaunchTerminal('guest', 'indices')}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 w-fit mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 mb-1 flex items-center justify-between">
                <span>01. Index Predictor</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                NIFTY 50, SENSEX, and BANKEX forecasts with live RSI (14) chart, pivot matrix, and candle anatomy.
              </p>
            </div>

            {/* 2. Take Calls (Option Radar) */}
            <div
              onClick={() => onLaunchTerminal('guest', 'fno_calls')}
              className="p-5 rounded-xl bg-white/90 backdrop-blur-xs border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 w-fit mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 mb-1 flex items-center justify-between">
                <span>02. Take Calls (Option Radar)</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Interactive search across Nifty 50, Sensex, Bankex, and Stock F&O with one-click order slip execution and bull/bear shadow backdrops.
              </p>
            </div>

            {/* 3. Top Equity Stocks */}
            <div
              onClick={() => onLaunchTerminal('guest', 'equity_stocks')}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 w-fit mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 mb-1 flex items-center justify-between">
                <span>03. Top Equity Stocks</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Curated blue-chip Indian stocks to invest with 1-Year targets, P/E ratios, and upside potentials.
              </p>
            </div>

            {/* 4. IPO Center */}
            <div
              onClick={() => onLaunchTerminal('guest', 'ipo_center')}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 w-fit mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Rocket className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 mb-1 flex items-center justify-between">
                <span>04. Top IPO Center</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Real-time Grey Market Premium (GMP) tracker, subscription counts, and AI application verdicts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LIVE CHART PREVIEW SECTION */}
      <section id="chart-preview" className="py-16 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600">
              Interactive Market Visualizer
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Live Stock Index Charts with RSI (14) Oscillator
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Toggle between NIFTY 50, SENSEX, and BANKEX to inspect overbought and oversold conditions.
            </p>
          </div>

          <StockIndexChart
            targetIndex={previewIndex}
            onSelectIndex={setPreviewIndex}
            currentMetrics={{
              open: previewIndex === 'NIFTY 50' ? 24820 : previewIndex === 'SENSEX' ? 81400 : 58250,
              high: previewIndex === 'NIFTY 50' ? 25015 : previewIndex === 'SENSEX' ? 82150 : 58940,
              low: previewIndex === 'NIFTY 50' ? 24790 : previewIndex === 'SENSEX' ? 81320 : 57980,
              close: previewIndex === 'NIFTY 50' ? 24985.6 : previewIndex === 'SENSEX' ? 82080.5 : 58820.75,
              volume: previewIndex === 'NIFTY 50' ? 4820000 : previewIndex === 'SENSEX' ? 7200000 : 3890000,
              previousReturn: previewIndex === 'NIFTY 50' ? 0.85 : previewIndex === 'SENSEX' ? 1.15 : -0.45,
            }}
          />
        </div>
      </section>

      {/* 7. QUIET FOOTER */}
      <footer className="mt-auto py-8 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={ASSETS.logo}
              alt="AI Stock Predictor Logo"
              className="w-6 h-6 rounded object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="font-bold text-slate-800">
              AI Stock Predictor &bull; Market Operating System
            </span>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-slate-500">
            <span>NIFTY 50 &bull; SENSEX &bull; BANKEX</span>
            <span>AngelOne SmartAPI Hub</span>
            <span>Educational & Analytical Use</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
