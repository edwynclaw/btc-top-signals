import { NextResponse } from 'next/server';
import { MetricData, DashboardData } from '@/types';
import { valueToScore } from '@/lib/calculations';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const preferences = searchParams.get('preferences');

    let metricWeights: Record<string, { enabled: boolean; weight: number }> = {
      'fear-greed': { enabled: true, weight: 1.0 },
      'rsi-weekly': { enabled: true, weight: 1.0 },
      'pi-cycle': { enabled: true, weight: 1.5 },
      'btc-200dma': { enabled: true, weight: 0.8 },
      'mvrv': { enabled: true, weight: 1.2 },
      'exchange-net-flow': { enabled: true, weight: 0.9 },
    };

    if (preferences) {
      try {
        metricWeights = JSON.parse(decodeURIComponent(preferences));
      } catch (e) {
        console.error('Failed to parse preferences:', e);
      }
    }

    // Fetch all data in parallel
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const [fearGreedRes, priceDataRes, onchainMetricsRes] = await Promise.all([
      fetch(`${baseUrl}/api/fear-greed`),
      fetch(`${baseUrl}/api/bitcoin-price`),
      fetch(`${baseUrl}/api/onchain-metrics`),
    ]);

    const fearGreedData = fearGreedRes.ok ? await fearGreedRes.json() : null;
    const priceData = priceDataRes.ok ? await priceDataRes.json() : null;
    const onchainMetricsData = onchainMetricsRes.ok ? await onchainMetricsRes.json() : null;

    const metrics: MetricData[] = [];

    // Fear & Greed Index
    if (fearGreedData && !fearGreedData.error) {
      const { score, signal } = valueToScore('fear-greed', fearGreedData.value);
      metrics.push({
        id: 'fear-greed',
        name: 'Fear & Greed Index',
        value: fearGreedData.value,
        signal,
        score,
        history: fearGreedData.history || [],
        lastUpdated: fearGreedData.lastUpdated,
      });
    }

    // RSI Weekly
    if (priceData && !priceData.error && priceData.rsi !== null) {
      const { score, signal } = valueToScore('rsi-weekly', priceData.rsi);
      metrics.push({
        id: 'rsi-weekly',
        name: 'RSI Weekly',
        value: Math.round(priceData.rsi * 10) / 10,
        signal,
        score,
        history: [], // Could calculate RSI history if needed
        lastUpdated: priceData.lastUpdated,
      });
    }

    // Pi Cycle Top
    if (priceData && !priceData.error && priceData.piCycle.ratio !== null) {
      const { score, signal } = valueToScore('pi-cycle', priceData.piCycle.ratio);
      metrics.push({
        id: 'pi-cycle',
        name: 'Pi Cycle Top',
        value: Math.round(priceData.piCycle.ratio * 1000) / 1000,
        signal,
        score,
        history: [],
        lastUpdated: priceData.lastUpdated,
      });
    }

    // BTC vs 200 DMA
    if (priceData && !priceData.error && priceData.distance200DMA !== null) {
      const { score, signal } = valueToScore('btc-200dma', priceData.distance200DMA);
      metrics.push({
        id: 'btc-200dma',
        name: 'BTC vs 200 DMA',
        value: Math.round(priceData.distance200DMA * 10) / 10,
        signal,
        score,
        history: priceData.priceHistory || [],
        lastUpdated: priceData.lastUpdated,
      });
    }

    // MVRV Ratio
    if (onchainMetricsData && !onchainMetricsData.error && onchainMetricsData.mvrv.value !== null) {
      const { score, signal } = valueToScore('mvrv', onchainMetricsData.mvrv.value);
      metrics.push({
        id: 'mvrv',
        name: 'MVRV Ratio',
        value: Math.round(onchainMetricsData.mvrv.value * 100) / 100,
        signal,
        score,
        history: onchainMetricsData.mvrv.history || [],
        lastUpdated: onchainMetricsData.lastUpdated,
      });
    }

    // Exchange Net Flow
    if (onchainMetricsData && !onchainMetricsData.error && onchainMetricsData.exchangeNetFlow.value !== null) {
      const { score, signal } = valueToScore('exchange-net-flow', onchainMetricsData.exchangeNetFlow.value);
      // Display value in millions for readability
      const valueInMillions = Math.round(onchainMetricsData.exchangeNetFlow.value / 1_000_000);
      metrics.push({
        id: 'exchange-net-flow',
        name: 'Exchange Net Flow',
        value: valueInMillions,
        signal,
        score,
        history: onchainMetricsData.exchangeNetFlow.history || [],
        lastUpdated: onchainMetricsData.lastUpdated,
      });
    }

    // Calculate aggregate score
    const enabledMetrics = metrics.filter((m) => metricWeights[m.id]?.enabled !== false);

    let totalWeightedScore = 0;
    let totalWeight = 0;

    enabledMetrics.forEach((metric) => {
      const weight = metricWeights[metric.id]?.weight || 1.0;
      totalWeightedScore += metric.score * weight;
      totalWeight += weight;
    });

    const aggregateScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

    const dashboardData: DashboardData = {
      aggregateScore,
      metrics,
      lastUpdated: Date.now(),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
