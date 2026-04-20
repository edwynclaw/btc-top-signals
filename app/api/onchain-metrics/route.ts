import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';

interface CoinMetricsResponse {
  data: Array<{
    asset: string;
    time: string;
    CapMVRVCur?: string;
    FlowInExUSD?: string;
    FlowOutExUSD?: string;
  }>;
}

export async function GET() {
  try {
    const cacheKey = 'onchain-metrics';
    const cached = getCached<any>(cacheKey, 15);

    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch MVRV and Exchange Flow data in parallel
    const [mvrvRes, flowRes] = await Promise.all([
      fetch(
        'https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=btc&metrics=CapMVRVCur&frequency=1d&page_size=30',
        { next: { revalidate: 900 } } // 15 minutes
      ),
      fetch(
        'https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=btc&metrics=FlowInExUSD,FlowOutExUSD&frequency=1d&page_size=30',
        { next: { revalidate: 900 } }
      ),
    ]);

    if (!mvrvRes.ok || !flowRes.ok) {
      throw new Error('CoinMetrics API request failed');
    }

    const mvrvData: CoinMetricsResponse = await mvrvRes.json();
    const flowData: CoinMetricsResponse = await flowRes.json();

    // Process MVRV data
    let mvrvValue: number | null = null;
    let mvrvHistory: Array<{ timestamp: number; value: number }> = [];

    if (mvrvData.data && mvrvData.data.length > 0) {
      mvrvHistory = mvrvData.data
        .filter((item) => item.CapMVRVCur !== null && item.CapMVRVCur !== undefined)
        .map((item) => ({
          timestamp: new Date(item.time).getTime(),
          value: parseFloat(item.CapMVRVCur!),
        }));

      if (mvrvHistory.length > 0) {
        mvrvValue = mvrvHistory[mvrvHistory.length - 1].value;
      }
    }

    // Process Exchange Flow data
    let netFlowValue: number | null = null;
    let netFlowHistory: Array<{ timestamp: number; value: number }> = [];

    if (flowData.data && flowData.data.length > 0) {
      netFlowHistory = flowData.data
        .filter(
          (item) =>
            item.FlowInExUSD !== null &&
            item.FlowInExUSD !== undefined &&
            item.FlowOutExUSD !== null &&
            item.FlowOutExUSD !== undefined
        )
        .map((item) => {
          const inflow = parseFloat(item.FlowInExUSD!);
          const outflow = parseFloat(item.FlowOutExUSD!);
          const netFlow = inflow - outflow;
          return {
            timestamp: new Date(item.time).getTime(),
            value: netFlow,
          };
        });

      if (netFlowHistory.length > 0) {
        netFlowValue = netFlowHistory[netFlowHistory.length - 1].value;
      }
    }

    const result = {
      mvrv: {
        value: mvrvValue,
        history: mvrvHistory,
      },
      exchangeNetFlow: {
        value: netFlowValue,
        history: netFlowHistory,
      },
      lastUpdated: Date.now(),
    };

    setCache(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('CoinMetrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onchain metrics' },
      { status: 500 }
    );
  }
}
