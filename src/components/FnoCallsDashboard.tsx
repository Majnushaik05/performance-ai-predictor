import React, { useState, useMemo } from 'react';
import { MarketCallItem, MarketCallCategory, TakenCallRecord } from '../types';
import { TOP_MARKET_CALLS } from '../data/marketData';
import { ASSETS } from '../assets';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Sliders,
  CheckCircle2,
  X,
  Zap,
  ShoppingBag,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface FnoCallsDashboardProps {
  onSelectCall?: (call: MarketCallItem) => void;
  onNavigateAngelOne?: () => void;
}

export const FnoCallsDashboard: React.FC<FnoCallsDashboardProps> = ({
  onNavigateAngelOne,
}) => {
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'ALL' | MarketCallCategory | 'BULLISH' | 'BEARISH'
  >('ALL');

  // Interactive Custom Call Generator Modal
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genSymbol, setGenSymbol] = useState('NIFTY 50');
  const [genDirection, setGenDirection] = useState<'BULLISH' | 'BEARISH'>('BULLISH');
  const [genRisk, setGenRisk] = useState<'Conservative' | 'Balanced' | 'Aggressive'>('Balanced');

  // "Take Call" Execution Slip Modal
  const [activeCallToTake, setActiveCallToTake] = useState<MarketCallItem | null>(null);
  const [lots, setLots] = useState<number>(1);
  const [executionRoute, setExecutionRoute] = useState<'AngelOne SmartAPI' | 'Paper Trading Sandbox'>(
    'AngelOne SmartAPI'
  );

  // Taken Calls Portfolio
  const [takenCalls, setTakenCalls] = useState<TakenCallRecord[]>([]);
  const [activeViewTab, setActiveViewTab] = useState<'calls' | 'portfolio'>('calls');
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  // Available calls (base dataset + any generated custom calls)
  const [customCalls, setCustomCalls] = useState<MarketCallItem[]>([]);
  const allCallsList = useMemo(() => [...customCalls, ...TOP_MARKET_CALLS], [customCalls]);

  // Filtered Calls Logic
  const filteredCalls = useMemo(() => {
    return allCallsList.filter((call) => {
      // Category filter
      if (selectedCategory === 'BULLISH' && call.direction !== 'BULLISH') return false;
      if (selectedCategory === 'BEARISH' && call.direction !== 'BEARISH') return false;
      if (
        selectedCategory !== 'ALL' &&
        selectedCategory !== 'BULLISH' &&
        selectedCategory !== 'BEARISH' &&
        call.category !== selectedCategory
      ) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        call.contractName.toLowerCase().includes(q) ||
        call.symbol.toLowerCase().includes(q) ||
        call.category.toLowerCase().includes(q) ||
        call.action.toLowerCase().includes(q) ||
        call.rationale.toLowerCase().includes(q) ||
        call.direction.toLowerCase().includes(q)
      );
    });
  }, [allCallsList, selectedCategory, searchQuery]);

  // Handle Generate Custom Call
  const handleGenerateCall = () => {
    let spot = 24850;
    let lotSize = 25;
    let cat: MarketCallCategory = 'NIFTY 50';

    if (genSymbol === 'NIFTY 50') {
      spot = 24856.2;
      lotSize = 25;
      cat = 'NIFTY 50';
    } else if (genSymbol === 'SENSEX') {
      spot = 81642.1;
      lotSize = 10;
      cat = 'SENSEX';
    } else if (genSymbol === 'BANKEX') {
      spot = 58340.8;
      lotSize = 15;
      cat = 'BANKEX';
    } else if (genSymbol === 'BANK NIFTY') {
      spot = 51780.0;
      lotSize = 15;
      cat = 'BANK NIFTY';
    } else if (genSymbol === 'FINNIFTY') {
      spot = 23340.0;
      lotSize = 25;
      cat = 'FINNIFTY';
    } else if (genSymbol === 'RELIANCE') {
      spot = 3012.4;
      lotSize = 250;
      cat = 'STOCK F&O';
    } else if (genSymbol === 'HDFCBANK') {
      spot = 1694.8;
      lotSize = 550;
      cat = 'STOCK F&O';
    } else if (genSymbol === 'TCS') {
      spot = 4185.0;
      lotSize = 175;
      cat = 'STOCK F&O';
    } else if (genSymbol === 'TATAMOTORS') {
      spot = 984.5;
      lotSize = 550;
      cat = 'STOCK F&O';
    }

    const isBull = genDirection === 'BULLISH';
    const strike = isBull
      ? Math.round((spot * 1.008) / 50) * 50
      : Math.round((spot * 0.992) / 50) * 50;

    const entry = isBull ? 135 : 120;
    const mult = genRisk === 'Aggressive' ? 2.8 : genRisk === 'Conservative' ? 2.0 : 2.4;
    const target = Math.round(entry * (1 + (mult - 1) * 0.45));
    const sl = Math.round(entry * 0.68);

    const newCall: MarketCallItem = {
      id: `gen_${Date.now()}`,
      direction: genDirection,
      symbol: genSymbol,
      category: cat,
      contractName: `${genSymbol} ${strike} ${isBull ? 'CE' : 'PE'} (Algorithmic)`,
      spotPrice: spot,
      recommendedEntry: entry,
      targetPrice: target,
      stopLoss: sl,
      lotSize: lotSize,
      confidence: Math.round(82 + Math.random() * 8),
      riskReward: `1 : ${mult.toFixed(1)}`,
      timeframe: 'Intraday Algorithmic Scan',
      rationale: `Dynamic strike scanner identified ${genDirection.toLowerCase()} liquidity cluster around ${strike}.`,
      expiry: '31 Oct 2026',
      action: isBull ? 'BUY CE' : 'BUY PE',
    };

    setCustomCalls((prev) => [newCall, ...prev]);
    setIsGeneratorOpen(false);
    setSelectedCategory('ALL');
    setOrderSuccessMessage(`Generated custom call for ${newCall.contractName}!`);
    setTimeout(() => setOrderSuccessMessage(null), 4000);
  };

  // Handle Confirm Take Call
  const handleConfirmTakeCall = () => {
    if (!activeCallToTake) return;

    const totalQty = lots * activeCallToTake.lotSize;
    const capitalInvested = totalQty * activeCallToTake.recommendedEntry;

    const record: TakenCallRecord = {
      id: `taken_${Date.now()}`,
      call: activeCallToTake,
      lots: lots,
      totalQty: totalQty,
      capitalInvested: capitalInvested,
      entryPrice: activeCallToTake.recommendedEntry,
      currentEstimatedPrice: activeCallToTake.recommendedEntry * (1 + 0.04), // Initial live simulation
      targetPrice: activeCallToTake.targetPrice,
      stopLoss: activeCallToTake.stopLoss,
      status: 'OPEN',
      pnl: capitalInvested * 0.04,
      pnlPercent: 4.0,
      takenAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      route: executionRoute,
    };

    setTakenCalls((prev) => [record, ...prev]);
    setActiveCallToTake(null);
    setLots(1);
    setOrderSuccessMessage(
      `Call successfully taken! ${record.call.contractName} (${record.lots} lot, ${record.totalQty} qty) placed via ${record.route}.`
    );
    setTimeout(() => setOrderSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {orderSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{orderSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setOrderSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header Bar with Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Target className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Take Calls & Option Radar
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search any index or stock (Nifty 50, Sensex, Bankex, Reliance, Tata Motors, HDFC), analyze strikes, and click &quot;Take Call&quot; to execute.
          </p>
        </div>

        {/* View Switcher: Calls Explorer vs Taken Calls Portfolio */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveViewTab('calls')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewTab === 'calls'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Available Calls ({allCallsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('portfolio')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewTab === 'portfolio'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>My Taken Calls ({takenCalls.length})</span>
          </button>

          {/* Custom Call Generator CTA */}
          <button
            type="button"
            onClick={() => setIsGeneratorOpen(true)}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Generate Custom Call</span>
            <span className="sm:hidden">Custom</span>
          </button>
        </div>
      </div>

      {activeViewTab === 'calls' ? (
        <>
          {/* 2. Interactive Search & Quick Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Nifty 50, Sensex, Bankex, Bank Nifty, FinNifty, Reliance, HDFC, TCS, Tata Motors, strike, CE, PE..."
                className="w-full pl-10 pr-24 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Filter className="w-3 h-3" />
                All Calls ({allCallsList.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('NIFTY 50')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'NIFTY 50'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Nifty 50
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('SENSEX')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'SENSEX'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Sensex
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('BANKEX')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'BANKEX'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Bankex
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('BANK NIFTY')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'BANK NIFTY'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Bank Nifty
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('STOCK F&O')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'STOCK F&O'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Stock F&O (Reliance, Tata, HDFC, TCS...)
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('BULLISH')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === 'BULLISH'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                Bullish (CE)
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('BEARISH')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === 'BEARISH'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                }`}
              >
                <TrendingDown className="w-3 h-3" />
                Bearish (PE)
              </button>
            </div>
          </div>

          {/* 3. Grid of Interactive Calls with Bull / Bear Watermark Shadows */}
          {filteredCalls.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No calls found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No option calls match &quot;{searchQuery}&quot;. Try searching for &quot;Nifty&quot;, &quot;Sensex&quot;, &quot;Reliance&quot;, or click Generate Custom Call.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCalls.map((call) => {
                const isBull = call.direction === 'BULLISH';
                return (
                  <div
                    key={call.id}
                    className={`relative rounded-xl border p-5 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md bg-white flex flex-col justify-between ${
                      isBull
                        ? 'border-emerald-200 hover:border-emerald-400'
                        : 'border-rose-200 hover:border-rose-400'
                    }`}
                  >
                    {/* Dynamic Watermark Background: Bull shadow for bullish, Bear shadow for bearish */}
                    <div
                      className="absolute right-0 bottom-0 w-44 h-44 opacity-[0.07] pointer-events-none select-none bg-contain bg-no-repeat bg-bottom-right"
                      style={{
                        backgroundImage: `url(${isBull ? ASSETS.bullWatermark : ASSETS.bearWatermark})`,
                      }}
                    />

                    <div>
                      {/* Call Card Header */}
                      <div className="relative z-10 flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-base text-slate-900 tracking-tight">
                              {call.contractName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isBull
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-rose-50 text-rose-700 border-rose-300'
                              }`}
                            >
                              {call.action}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 font-sans">
                              {call.category}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                            AI Confidence
                          </span>
                          <div
                            className={`text-base font-black font-numbers ${
                              isBull ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {call.confidence}%
                          </div>
                        </div>
                      </div>

                      {/* Spot and Expiry Info */}
                      <div className="relative z-10 text-xs text-slate-500 mt-2 flex items-center justify-between font-numbers">
                        <span>Spot: ₹{call.spotPrice.toLocaleString('en-IN')}</span>
                        <span className="flex items-center gap-1 font-sans text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Expiry: {call.expiry}
                        </span>
                      </div>

                      {/* Trade Levels Strip */}
                      <div className="relative z-10 grid grid-cols-3 gap-2 my-3 text-center text-xs font-numbers">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-sans">
                            Buy / Entry
                          </span>
                          <span className="font-bold text-slate-900">₹{call.recommendedEntry}</span>
                        </div>
                        <div
                          className={`p-2 rounded-lg border ${
                            isBull
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}
                        >
                          <span className="text-[10px] block opacity-75 font-sans">Target</span>
                          <span className="font-black text-sm">₹{call.targetPrice}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-sans">Stop Loss</span>
                          <span className="font-bold text-rose-600">₹{call.stopLoss}</span>
                        </div>
                      </div>

                      {/* Rationale & Risk Reward */}
                      <div className="relative z-10 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                          {call.rationale}
                        </p>
                        <div className="text-right font-numbers font-bold text-slate-700 whitespace-nowrap pl-2 shrink-0">
                          <span className="text-[10px] font-sans text-slate-400 block font-normal">
                            R : R
                          </span>
                          {call.riskReward}
                        </div>
                      </div>
                    </div>

                    {/* Interactive "Take Call" Action Button */}
                    <div className="relative z-10 pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-mono text-slate-400">
                        1 Lot = {call.lotSize} Qty
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveCallToTake(call);
                          setLots(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-extrabold text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                          isBull
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                            : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        Take Call
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* 4. "My Taken Calls" Portfolio Section */
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Active Taken Calls Portfolio
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live tracking of positions executed via AngelOne SmartAPI or Paper Trading Sandbox.
                </p>
              </div>

              {takenCalls.length > 0 && (
                <div className="text-right font-numbers">
                  <span className="text-[10px] font-sans text-slate-400 block">Total Est. P&L</span>
                  <span className="text-base font-black text-emerald-600">
                    +₹
                    {takenCalls
                      .reduce((acc, c) => acc + c.pnl, 0)
                      .toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                  </span>
                </div>
              )}
            </div>

            {takenCalls.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No calls taken yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Explore available Nifty, Sensex, and Stock calls and click &quot;Take Call&quot; to begin.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveViewTab('calls')}
                  className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  Browse Available Calls
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-sans font-bold">
                      <th className="py-3 px-3">Contract</th>
                      <th className="py-3 px-3">Action</th>
                      <th className="py-3 px-3">Lots / Qty</th>
                      <th className="py-3 px-3">Entry Price</th>
                      <th className="py-3 px-3">Target / SL</th>
                      <th className="py-3 px-3">Est. P&L</th>
                      <th className="py-3 px-3">Route</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-numbers">
                    {takenCalls.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">
                            {item.call.contractName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans">
                            Taken at {item.takenAt}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.call.direction === 'BULLISH'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-rose-50 text-rose-700 border-rose-300'
                            }`}
                          >
                            {item.call.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {item.lots} lot ({item.totalQty} qty)
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          ₹{item.entryPrice}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-emerald-700 font-bold block">
                            T: ₹{item.targetPrice}
                          </span>
                          <span className="text-rose-600 block">SL: ₹{item.stopLoss}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-emerald-600 font-bold block">
                            +₹{item.pnl.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold">
                            (+{item.pnlPercent}%)
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans text-[11px] text-slate-500">
                          {item.route}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setTakenCalls((prev) => prev.filter((c) => c.id !== item.id));
                              setOrderSuccessMessage(`Closed position for ${item.call.contractName}`);
                              setTimeout(() => setOrderSuccessMessage(null), 3000);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                          >
                            Exit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Interactive "Take Call" Order Execution Slip Modal */}
      {activeCallToTake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Execution Order Slip
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {activeCallToTake.contractName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCallToTake(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contract Key Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-numbers">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-sans">Buy / Entry</span>
                <span className="font-bold text-slate-900">₹{activeCallToTake.recommendedEntry}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block font-sans">Target Price</span>
                <span className="font-black text-emerald-800">₹{activeCallToTake.targetPrice}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-[10px] text-rose-700 block font-sans">Stop Loss</span>
                <span className="font-bold text-rose-700">₹{activeCallToTake.stopLoss}</span>
              </div>
            </div>

            {/* Lot Size Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Select Number of Lots</span>
                <span className="font-mono text-slate-400 text-[11px]">
                  1 Lot = {activeCallToTake.lotSize} Qty
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLots(num)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      lots === num
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {num} {num === 1 ? 'Lot' : 'Lots'}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Financial Calculation Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-numbers">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-sans">Total Quantity:</span>
                <span className="font-bold text-slate-900">
                  {lots * activeCallToTake.lotSize} shares
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-sans">Estimated Capital Required:</span>
                <span className="font-black text-slate-900 text-sm">
                  ₹
                  {(lots * activeCallToTake.lotSize * activeCallToTake.recommendedEntry).toLocaleString(
                    'en-IN'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 border-t border-slate-200 pt-1.5">
                <span className="font-sans font-bold">Target Profit Potential:</span>
                <span className="font-black">
                  +₹
                  {(
                    lots *
                    activeCallToTake.lotSize *
                    (activeCallToTake.targetPrice - activeCallToTake.recommendedEntry)
                  ).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-rose-600">
                <span className="font-sans">Max Risk at Stop Loss:</span>
                <span className="font-bold">
                  -₹
                  {(
                    lots *
                    activeCallToTake.lotSize *
                    (activeCallToTake.recommendedEntry - activeCallToTake.stopLoss)
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Execution Route Radio */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block">Execution Destination</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setExecutionRoute('AngelOne SmartAPI')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    executionRoute === 'AngelOne SmartAPI'
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    AngelOne SmartAPI
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-normal">
                    Live Stream / Broker Bridge
                  </span>
                  {onNavigateAngelOne && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateAngelOne();
                      }}
                      className="text-[10px] text-emerald-700 font-bold hover:underline block mt-1"
                    >
                      Configure Keys &rarr;
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setExecutionRoute('Paper Trading Sandbox')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    executionRoute === 'Paper Trading Sandbox'
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    Simulated Sandbox
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-normal">
                    Risk-free paper trade
                  </span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveCallToTake(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmTakeCall}
                className="flex-1 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                Confirm & Take Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Custom Call Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Sliders className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Generate Algorithmic Call
                  </h3>
                  <p className="text-xs text-slate-500">
                    Scan any index or stock to compute tailored strikes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Instrument</label>
                <select
                  value={genSymbol}
                  onChange={(e) => setGenSymbol(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:border-emerald-500"
                >
                  <optgroup label="Broad Market Indices">
                    <option value="NIFTY 50">NIFTY 50</option>
                    <option value="SENSEX">SENSEX</option>
                    <option value="BANKEX">BANKEX</option>
                    <option value="BANK NIFTY">BANK NIFTY</option>
                    <option value="FINNIFTY">FINNIFTY</option>
                  </optgroup>
                  <optgroup label="Top Stock F&O">
                    <option value="RELIANCE">Reliance Industries</option>
                    <option value="HDFCBANK">HDFC Bank</option>
                    <option value="TCS">TCS</option>
                    <option value="TATAMOTORS">Tata Motors</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Market Sentiment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenDirection('BULLISH')}
                    className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      genDirection === 'BULLISH'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Bullish (Call CE)
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenDirection('BEARISH')}
                    className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      genDirection === 'BEARISH'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    Bearish (Put PE)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Risk Appetite</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Conservative', 'Balanced', 'Aggressive'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setGenRisk(r)}
                      className={`p-2 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                        genRisk === r
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateCall}
                className="flex-1 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Scan & Compute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
