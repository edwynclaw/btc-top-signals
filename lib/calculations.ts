export interface PriceDataPoint {
  timestamp: number;
  price: number;
}

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(data: PriceDataPoint[], period: number): number | null {
  if (data.length < period) return null;

  const sum = data.slice(-period).reduce((acc, point) => acc + point.price, 0);
  return sum / period;
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(data: PriceDataPoint[], period: number = 14): number | null {
  if (data.length < period + 1) return null;

  const changes = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].price - data[i - 1].price);
  }

  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter(c => c > 0);
  const losses = recentChanges.filter(c => c < 0).map(c => Math.abs(c));

  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return rsi;
}

/**
 * Calculate Pi Cycle Top indicator
 * Returns the ratio of 111DMA to (350DMA * 2)
 * When ratio >= 1, it's a crossover signal
 */
export function calculatePiCycle(data: PriceDataPoint[]): {
  ratio: number | null;
  dma111: number | null;
  dma350x2: number | null;
} {
  if (data.length < 350) {
    return { ratio: null, dma111: null, dma350x2: null };
  }

  const dma111 = calculateSMA(data, 111);
  const dma350 = calculateSMA(data, 350);

  if (dma111 === null || dma350 === null) {
    return { ratio: null, dma111: null, dma350x2: null };
  }

  const dma350x2 = dma350 * 2;
  const ratio = dma111 / dma350x2;

  return { ratio, dma111, dma350x2 };
}

/**
 * Calculate distance from 200 DMA as percentage
 */
export function calculateDistanceFrom200DMA(
  currentPrice: number,
  data: PriceDataPoint[]
): number | null {
  const dma200 = calculateSMA(data, 200);
  if (dma200 === null) return null;

  const distance = ((currentPrice - dma200) / dma200) * 100;
  return distance;
}

/**
 * Convert metric value to score (0-100) based on signal ranges
 */
export function valueToScore(
  metricId: string,
  value: number | null
): { score: number; signal: 'green' | 'yellow' | 'orange' | 'red' | 'neutral' } {
  if (value === null) return { score: 0, signal: 'neutral' };

  switch (metricId) {
    case 'fear-greed':
      if (value < 25) return { score: 0, signal: 'green' };
      if (value < 50) return { score: 25, signal: 'yellow' };
      if (value < 75) return { score: 60, signal: 'orange' };
      return { score: 90, signal: 'red' };

    case 'rsi-weekly':
      if (value < 30) return { score: 0, signal: 'green' };
      if (value < 70) return { score: 30, signal: 'yellow' };
      if (value < 85) return { score: 70, signal: 'orange' };
      return { score: 95, signal: 'red' };

    case 'pi-cycle':
      // Value is ratio (111DMA / 350DMA×2)
      if (value < 0.90) return { score: 0, signal: 'green' };
      if (value < 0.95) return { score: 40, signal: 'yellow' };
      if (value < 1.0) return { score: 75, signal: 'orange' };
      return { score: 100, signal: 'red' };

    case 'btc-200dma':
      // Value is percentage above 200DMA
      if (value < 100) return { score: 0, signal: 'green' };
      if (value < 200) return { score: 30, signal: 'yellow' };
      if (value < 300) return { score: 65, signal: 'orange' };
      return { score: 85, signal: 'red' };

    case 'mvrv':
      // MVRV Ratio - Market Value to Realized Value
      if (value < 1.0) return { score: 0, signal: 'green' };
      if (value < 2.0) return { score: 30, signal: 'yellow' };
      if (value < 3.5) return { score: 65, signal: 'orange' };
      return { score: 90, signal: 'red' };

    case 'exchange-net-flow':
      // Exchange Net Flow in USD (millions)
      const flowInMillions = value / 1_000_000;
      if (flowInMillions < -50) return { score: 0, signal: 'green' };
      if (flowInMillions < 0) return { score: 25, signal: 'yellow' };
      if (flowInMillions < 50) return { score: 60, signal: 'orange' };
      return { score: 85, signal: 'red' };

    default:
      return { score: 0, signal: 'neutral' };
  }
}
