import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';

interface FearGreedResponse {
  name: string;
  data: Array<{
    value: string;
    value_classification: string;
    timestamp: string;
    time_until_update?: string;
  }>;
  metadata: {
    error: null | string;
  };
}

export async function GET() {
  try {
    const cacheKey = 'fear-greed-index';
    const cached = getCached<any>(cacheKey, 15);

    if (cached) {
      return NextResponse.json(cached);
    }

    const response = await fetch('https://api.alternative.me/fng/?limit=30', {
      next: { revalidate: 900 }, // 15 minutes
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data: FearGreedResponse = await response.json();

    if (data.metadata.error || !data.data || data.data.length === 0) {
      throw new Error('Invalid API response');
    }

    const history = data.data.reverse().map((item) => ({
      timestamp: parseInt(item.timestamp) * 1000,
      value: parseInt(item.value),
    }));

    const current = history[history.length - 1];

    const result = {
      value: current.value,
      classification: data.data[0].value_classification,
      history,
      lastUpdated: Date.now(),
    };

    setCache(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fear & Greed API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Fear & Greed Index' },
      { status: 500 }
    );
  }
}
