import { MarketMetrics, PredictionResult, TargetIndex, TechnicalAnalysis, IndexPreset, TrendShiftAnalysis } from '../types';

/**
 * Calculates the trend comparison between previous session return and current vector prediction.
 */
export function calculateTrendShift(
  currentReturn: number,
  previousReturn: number,
  predictionDirection: 'BULLISH' | 'BEARISH'
): TrendShiftAnalysis {
  const velocityDelta = currentReturn - previousReturn;

  if (previousReturn < -0.15 && predictionDirection === 'BULLISH') {
    return {
      status: 'BULLISH_REVERSAL',
      headline: 'Bullish Reversal & Mean Reversion Surge',
      description: `Intraday demand cleanly absorbs previous session decline (${previousReturn >= 0 ? '+' : ''}${previousReturn.toFixed(2)}%). Vector projects high-probability buyer reclamation.`,
      velocityDelta,
      previousReturn,
      currentReturn,
      indicatorColor: 'emerald',
      trendDirection: 'DOWN_TO_UP_REVERSAL',
    };
  }

  if (previousReturn > 0.15 && predictionDirection === 'BULLISH') {
    return {
      status: 'BULLISH_CONTINUATION',
      headline: 'Sustained Upward Momentum & Continuation',
      description: `Previous session advance (+${previousReturn.toFixed(2)}%) confirmed by sustained accumulation. Momentum vector remains firmly intact.`,
      velocityDelta,
      previousReturn,
      currentReturn,
      indicatorColor: 'emerald',
      trendDirection: 'UP_CONTINUATION',
    };
  }

  if (previousReturn > 0.15 && predictionDirection === 'BEARISH') {
    return {
      status: 'BEARISH_EXHAUSTION',
      headline: 'Bearish Reversal & Supply Exhaustion',
      description: `Intraday supply breaks previous session strength (+${previousReturn.toFixed(2)}%). Rejection off local resistance triggers corrective rotation.`,
      velocityDelta,
      previousReturn,
      currentReturn,
      indicatorColor: 'rose',
      trendDirection: 'UP_TO_DOWN_REVERSAL',
    };
  }

  if (previousReturn < -0.15 && predictionDirection === 'BEARISH') {
    return {
      status: 'BEARISH_CONTINUATION',
      headline: 'Sustained Bearish Drift & Downside Pressure',
      description: `Ongoing liquidation extends prior session weakness (${previousReturn.toFixed(2)}%). Key moving supports facing recurring stress.`,
      velocityDelta,
      previousReturn,
      currentReturn,
      indicatorColor: 'rose',
      trendDirection: 'DOWN_CONTINUATION',
    };
  }

  return {
    status: 'NEUTRAL_CONSOLIDATION',
    headline: predictionDirection === 'BULLISH' ? 'Bullish Impulse from Base' : 'Bearish Decay from Base',
    description: `Prior session closed neutral (${previousReturn >= 0 ? '+' : ''}${previousReturn.toFixed(2)}%). Current directional vector provides new impulse.`,
    velocityDelta,
    previousReturn,
    currentReturn,
    indicatorColor: predictionDirection === 'BULLISH' ? 'blue' : 'amber',
    trendDirection: 'SIDEWAYS',
  };
}

/**
 * Quantitative Vector Analysis Engine.
 * Multi-factor logistic scoring with price action, shadow pressure, and momentum acceleration.
 */
export function calculatePrediction(
  index: TargetIndex,
  metrics: MarketMetrics
): PredictionResult {
  const { open, high, low, close, volume, previousReturn } = metrics;

  // Safe checks for zeroes / missing data
  const safeOpen = open > 0 ? open : 1;
  const safeHigh = Math.max(high, open, close);
  const safeLow = low > 0 ? Math.min(low, open, close) : safeOpen * 0.99;
  const range = safeHigh - safeLow;
  const safeRange = range > 0 ? range : safeOpen * 0.01;

  const changeAmount = close - open;
  const changePercent = (changeAmount / safeOpen) * 100;
  const dayRange = safeHigh - safeLow;
  const dayRangePercent = (dayRange / safeOpen) * 100;

  // Candlestick anatomy
  const bodySize = Math.abs(close - open);
  const upperShadow = safeHigh - Math.max(open, close);
  const lowerShadow = Math.min(open, close) - safeLow;
  const bodyRatio = bodySize / safeRange;

  // Pivot Points (Classic Floor Trader formula)
  const pivotPoint = (safeHigh + safeLow + close) / 3;
  const resistance1 = 2 * pivotPoint - safeLow;
  const resistance2 = pivotPoint + dayRange;
  const support1 = 2 * pivotPoint - safeHigh;
  const support2 = pivotPoint - dayRange;

  // Candlestick Pattern Recognition
  let patternDetected = 'Neutral Consolidation';
  if (bodyRatio > 0.75 && close > open) {
    patternDetected = 'Bullish Marubozu (Institutional Accumulation)';
  } else if (bodyRatio > 0.75 && close < open) {
    patternDetected = 'Bearish Marubozu (Aggressive Liquidation)';
  } else if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5) {
    patternDetected = 'Bullish Pin Bar / Hammer (Demand Absorption)';
  } else if (upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5) {
    patternDetected = 'Shooting Star / Supply Rejection (Resistance Cap)';
  } else if (bodyRatio < 0.1) {
    patternDetected = 'Doji Equilibrium (Compression Zone)';
  } else if (close > open && previousReturn < -0.5) {
    patternDetected = 'Bullish Piercing Reversal (Counter-Trend)';
  } else if (close < open && previousReturn > 0.5) {
    patternDetected = 'Dark Cloud Cover (Distribution Reversal)';
  }

  // Quantitative Score Calculation (-3.0 to +3.0)
  let quantScore = 0;

  // Intraday price movement component
  quantScore += Math.tanh(changePercent * 1.5) * 1.6;

  // Shadow pressure (wick rejection)
  const lowerShadowPressure = lowerShadow / safeRange;
  const upperShadowPressure = upperShadow / safeRange;
  quantScore += (lowerShadowPressure - upperShadowPressure) * 0.8;

  // Previous return momentum / mean-reversion factor
  if (previousReturn !== 0) {
    quantScore += Math.tanh(previousReturn * 0.3) * 0.5;
  }

  // Volume weighting
  if (volume > 100000) {
    const volumeMultiplier = Math.min(1.2, 1 + Math.log10(volume / 100000) * 0.1);
    quantScore *= volumeMultiplier;
  }

  // Sigmoid probability mapping
  const bullishProbRaw = 1 / (1 + Math.exp(-quantScore * 1.8));

  // Determine prediction vector direction
  const isBullish = close >= open ? bullishProbRaw >= 0.45 : bullishProbRaw > 0.52;
  const prediction = isBullish ? 1 : 0;

  let bullishProb = bullishProbRaw;
  let bearishProb = 1 - bullishProbRaw;

  // Calibrate confidence (bounded between 62% and 96.5%)
  const primaryProb = prediction === 1 ? bullishProb : bearishProb;
  const confidence = Math.min(96.5, Math.max(62.0, primaryProb * 100));

  if (prediction === 1) {
    bullishProb = confidence / 100;
    bearishProb = 1 - bullishProb;
  } else {
    bearishProb = confidence / 100;
    bullishProb = 1 - bearishProb;
  }

  const vectorDirection: 'BULLISH' | 'BEARISH' = prediction === 1 ? 'BULLISH' : 'BEARISH';
  const vectorText = prediction === 1 ? 'BULLISH (EXPANSION)' : 'BEARISH (CONTRACTION)';

  // Calculate trend shift vs previous return
  const trendShift = calculateTrendShift(changePercent, previousReturn, vectorDirection);

  const outputSummary = `PROJECTION VECTOR: ${vectorDirection === 'BULLISH' ? '▲ BULLISH (EXPANSION)' : '▼ BEARISH (CONTRACTION)'}
Confidence Threshold: ${confidence.toFixed(2)}% | Win Probability: ${(bullishProb * 100).toFixed(1)}%
Trend Comparison: ${trendShift.headline}
Intraday Delta: ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% | Prior Session: ${previousReturn >= 0 ? '+' : ''}${previousReturn.toFixed(2)}%
Technical Signal: ${patternDetected}
Pivot Matrix: PP ₹${pivotPoint.toFixed(2)} · R1 ₹${resistance1.toFixed(2)} · S1 ₹${support1.toFixed(2)}`;

  const technicalAnalysis: TechnicalAnalysis = {
    changeAmount,
    changePercent,
    dayRange,
    dayRangePercent,
    pivotPoint,
    resistance1,
    resistance2,
    support1,
    support2,
    patternDetected,
    sentimentScore: quantScore,
  };

  return {
    vectorDirection,
    vectorText,
    confidence,
    bullishProb,
    bearishProb,
    outputSummary,
    technicalAnalysis,
    trendShift,
    timestamp: new Date().toLocaleTimeString(),
    index,
    inputMetrics: { ...metrics },
  };
}

export const INDEX_PRESETS: IndexPreset[] = [
  {
    name: 'NIFTY 50 - Trend Continuation',
    description: 'Gap-up continuation above key resistance with high institutional volume',
    index: 'NIFTY 50',
    metrics: {
      open: 24820.5,
      high: 25015.0,
      low: 24790.25,
      close: 24985.6,
      volume: 4820000,
      previousReturn: 0.85,
    },
  },
  {
    name: 'NIFTY 50 - Mean Reversion Rebound',
    description: 'Demand absorption following prior sell-off, bullish pin bar confirmation',
    index: 'NIFTY 50',
    metrics: {
      open: 24650.0,
      high: 24820.0,
      low: 24610.5,
      close: 24790.0,
      volume: 5120000,
      previousReturn: -1.24,
    },
  },
  {
    name: 'SENSEX - High Momentum Rally',
    description: 'Broad-based capital inflows driving benchmark index toward fresh highs',
    index: 'SENSEX',
    metrics: {
      open: 81400.0,
      high: 82150.25,
      low: 81320.0,
      close: 82080.5,
      volume: 7200000,
      previousReturn: 1.15,
    },
  },
  {
    name: 'BANKEX - Expiry Volatility Rotation',
    description: 'Sharp intraday range test with strong demand absorption at support',
    index: 'BANKEX',
    metrics: {
      open: 58250.0,
      high: 58940.0,
      low: 57980.0,
      close: 58820.75,
      volume: 3890000,
      previousReturn: -0.45,
    },
  },
];
