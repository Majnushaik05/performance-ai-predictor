export type TargetIndex = 'NIFTY 50' | 'SENSEX' | 'BANKEX';

export type IntakeMode = 'Manual Input' | 'AngelOne Live Stream';

export type TerminalDashboard =
  | 'indices'
  | 'heatmap'
  | 'fno_calls'
  | 'equity_stocks'
  | 'ipo_center'
  | 'angelone';

export type TrendStatusType =
  | 'BULLISH_CONTINUATION'
  | 'BULLISH_REVERSAL'
  | 'BEARISH_EXHAUSTION'
  | 'BEARISH_CONTINUATION'
  | 'NEUTRAL_CONSOLIDATION';

export interface TrendShiftAnalysis {
  status: TrendStatusType;
  headline: string;
  description: string;
  velocityDelta: number;
  previousReturn: number;
  currentReturn: number;
  indicatorColor: 'emerald' | 'rose' | 'amber' | 'blue';
  trendDirection: 'UP_CONTINUATION' | 'DOWN_TO_UP_REVERSAL' | 'UP_TO_DOWN_REVERSAL' | 'DOWN_CONTINUATION' | 'SIDEWAYS';
}

export interface MarketMetrics {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previousReturn: number;
}

export interface SmartApiCredentials {
  apiKey: string;
  clientCode: string;
  password: string;
  totpSecret: string;
}

export interface TechnicalAnalysis {
  changeAmount: number;
  changePercent: number;
  dayRange: number;
  dayRangePercent: number;
  pivotPoint: number;
  resistance1: number;
  resistance2: number;
  support1: number;
  support2: number;
  patternDetected: string;
  sentimentScore: number;
}

export interface PredictionResult {
  vectorDirection: 'BULLISH' | 'BEARISH';
  vectorText: string;
  confidence: number;
  bullishProb: number;
  bearishProb: number;
  outputSummary: string;
  technicalAnalysis: TechnicalAnalysis;
  trendShift: TrendShiftAnalysis;
  timestamp: string;
  index: TargetIndex;
  inputMetrics: MarketMetrics;
}

export interface IndexPreset {
  name: string;
  description: string;
  index: TargetIndex;
  metrics: MarketMetrics;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'Institutional Trader' | 'Quantitative Analyst' | 'Guest Explorer';
  isGuest: boolean;
  avatarUrl?: string;
}

export interface MarketTickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  isBullish: boolean;
}

// Interactive F&O AI Options & Futures Calls (Take Calls)
export type MarketCallCategory =
  | 'NIFTY 50'
  | 'SENSEX'
  | 'BANKEX'
  | 'BANK NIFTY'
  | 'FINNIFTY'
  | 'STOCK F&O';

export interface MarketCallItem {
  id: string;
  direction: 'BULLISH' | 'BEARISH';
  symbol: string;
  category: MarketCallCategory;
  contractName: string;
  spotPrice: number;
  recommendedEntry: number;
  targetPrice: number;
  stopLoss: number;
  lotSize: number;
  confidence: number;
  riskReward: string;
  timeframe: string;
  rationale: string;
  expiry: string;
  action: 'BUY CE' | 'BUY PE' | 'LONG FUT' | 'SHORT FUT';
}

export interface TakenCallRecord {
  id: string;
  call: MarketCallItem;
  lots: number;
  totalQty: number;
  capitalInvested: number;
  entryPrice: number;
  currentEstimatedPrice: number;
  targetPrice: number;
  stopLoss: number;
  status: 'OPEN' | 'TARGET_HIT' | 'SL_HIT' | 'CLOSED';
  pnl: number;
  pnlPercent: number;
  takenAt: string;
  route: 'AngelOne SmartAPI' | 'Paper Trading Sandbox';
}

// Top Equity Stocks for Investment
export interface EquityStockItem {
  id: string;
  symbol: string;
  companyName: string;
  sector: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  target1Y: number;
  upsidePercent: number;
  peRatio: number;
  marketCap: string;
  rating: 'Strong Buy' | 'Buy' | 'Accumulate' | 'Hold';
  confidenceScore: number;
  highlights: string[];
}

// Top IPOs & Recent Listings
export interface IpoItem {
  id: string;
  companyName: string;
  symbol: string;
  sector: string;
  priceBand: string;
  issueSize: string;
  lotSize?: number;
  minInvestment?: string;
  gmpPrice: number;
  gmpPercent: number;
  openDate: string;
  closeDate: string;
  listingDate: string;
  status: 'Upcoming' | 'Open Now' | 'Recently Listed';
  subscription: string;
  aiRecommendation: 'Must Apply (High Gain)' | 'Subscribe (Long Term)' | 'Neutral / Watch';
  verdictDetail: string;
  // Historical listing day performance (for Recently Listed)
  issuePrice?: number;
  listingPrice?: number;
  listingGainPercent?: number;
  currentMarketPrice?: number;
}

// Market Heatmap
export type HeatmapSector =
  | 'All Sectors'
  | 'Banking & Finance'
  | 'Information Tech'
  | 'Energy & Oil'
  | 'Automobile & EV'
  | 'FMCG & Consumption'
  | 'Pharma & Healthcare'
  | 'Metals & Mining'
  | 'Infrastructure';

export interface HeatmapStockItem {
  id: string;
  symbol: string;
  companyName: string;
  sector: HeatmapSector;
  price: number;
  change: number;
  changePercent: number;
  marketCapCr: number; // in Crores
  volume: string;
  rsi: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  dayHigh: number;
  dayLow: number;
  peRatio?: number;
}

