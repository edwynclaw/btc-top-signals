export interface MetricConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  weight: number;
  signalLogic: {
    green: string;
    yellow: string;
    orange: string;
    red: string;
  };
}

export interface MetricData {
  id: string;
  name: string;
  value: number | null;
  signal: 'green' | 'yellow' | 'orange' | 'red' | 'neutral';
  score: number; // 0-100
  history: Array<{ timestamp: number; value: number }>;
  lastUpdated: number;
}

export interface DashboardData {
  aggregateScore: number;
  metrics: MetricData[];
  lastUpdated: number;
}

export interface UserPreferences {
  metrics: Record<string, { enabled: boolean; weight: number }>;
}

export const DEFAULT_METRICS: MetricConfig[] = [
  {
    id: 'fear-greed',
    name: 'Fear & Greed Index',
    description: 'Market sentiment indicator',
    enabled: true,
    weight: 1.0,
    signalLogic: {
      green: '< 25 (Extreme Fear)',
      yellow: '25-50 (Fear)',
      orange: '50-75 (Greed)',
      red: '> 75 (Extreme Greed)',
    },
  },
  {
    id: 'rsi-weekly',
    name: 'RSI Weekly',
    description: 'Relative Strength Index (7-day)',
    enabled: true,
    weight: 1.0,
    signalLogic: {
      green: '< 30 (Oversold)',
      yellow: '30-70 (Neutral)',
      orange: '70-85 (Overbought)',
      red: '> 85 (Extreme)',
    },
  },
  {
    id: 'pi-cycle',
    name: 'Pi Cycle Top',
    description: '111DMA vs 350DMA×2 crossover',
    enabled: true,
    weight: 1.5,
    signalLogic: {
      green: 'No crossover, 111DMA < 350DMA×2',
      yellow: 'Approaching crossover (within 10%)',
      orange: 'Very close (within 5%)',
      red: 'Crossover detected',
    },
  },
  {
    id: 'btc-200dma',
    name: 'BTC vs 200 DMA',
    description: 'Price distance from 200-day moving average',
    enabled: true,
    weight: 0.8,
    signalLogic: {
      green: '< 100% above 200DMA',
      yellow: '100-200% above',
      orange: '200-300% above',
      red: '> 300% above',
    },
  },
];
