import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';
import {
  calculateRSI,
  calculatePiCycle,
  calculateDistanceFrom200DMA,
  calculateSMA,
  PriceDataPoint,
} from '@/lib/calculations';

interface CoinGeckoMarketChart {
  prices: [number, number][];
}

export async function GET() {
  try {
    const cacheKey = 'bitcoin-price-data';
    const cached = getCached<any>(cacheKey, 10);

    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch 1 year of daily price data from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily',
      {
        next: { revalidate: 600 }, // 10 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}`);
    }

    const data: CoinGeckoMarketChart = await response.json();

    if (!data.prices || data.prices.length === 0) {
      throw new Error('No price data returned');
    }

    // Convert to our format
    const priceData: PriceDataPoint[] = data.prices.map(([timestamp, price]) => ({
      timestamp,
      price,
    }));

    const currentPrice = priceData[priceData.length - 1].price;

    // Calculate RSI (14-day)
    const rsi = calculateRSI(priceData, 14);

    // Calculate Pi Cycle
    const piCycle = calculatePiCycle(priceData);

    // Calculate distance from 200 DMA
    const distance200DMA = calculateDistanceFrom200DMA(currentPrice, priceData);

    // Calculate 200 DMA for reference
    const dma200 = calculateSMA(priceData, 200);

    // Get price history for last 30 days for sparklines
    const recentHistory = priceData.slice(-30).map((point) => ({
      timestamp: point.timestamp,
      value: point.price,
    }));

    const result = {
      currentPrice,
      rsi,
      piCycle: {
        ratio: piCycle.ratio,
        dma111: piCycle.dma111,
        dma350x2: piCycle.dma350x2,
      },
      distance200DMA,
      dma200,
      priceHistory: recentHistory,
      lastUpdated: Date.now(),
    };

    setCache(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Bitcoin price API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin price data' },
      { status: 500 }
    );
  }
}
