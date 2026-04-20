# Bitcoin Topping Signals Dashboard

A customizable dashboard for tracking Bitcoin cycle top indicators with an aggregate confidence score.

## Features

- **Aggregate Score**: Weighted composite score (0-100) with color-coded risk levels
- **Multiple Metrics**: Fear & Greed Index, RSI Weekly, Pi Cycle Top, BTC vs 200 DMA
- **Customizable**: Toggle metrics on/off and adjust weights
- **Real-time Updates**: Auto-refresh every 5 minutes
- **Dark Theme**: Professional dark mode interface
- **Free APIs**: Uses only free data sources (CoinGecko, alternative.me)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

Deploy to Vercel:

```bash
vercel
```

Set the `NEXT_PUBLIC_BASE_URL` environment variable to your production URL.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Language**: TypeScript
- **Data Sources**: CoinGecko API, alternative.me Fear & Greed Index

## Metrics Explained

### Fear & Greed Index
Market sentiment indicator from alternative.me
- Green: < 25 (Extreme Fear)
- Yellow: 25-50 (Fear)
- Orange: 50-75 (Greed)
- Red: > 75 (Extreme Greed)

### RSI Weekly
14-day Relative Strength Index calculated from daily price data
- Green: < 30 (Oversold)
- Yellow: 30-70 (Neutral)
- Orange: 70-85 (Overbought)
- Red: > 85 (Extreme)

### Pi Cycle Top
111 DMA vs 350 DMA × 2 crossover indicator
- Green: No crossover, far from crossing
- Yellow: Approaching crossover (within 10%)
- Orange: Very close (within 5%)
- Red: Crossover detected (historical top signal)

### BTC vs 200 DMA
Price distance from 200-day moving average
- Green: < 100% above 200DMA
- Yellow: 100-200% above
- Orange: 200-300% above
- Red: > 300% above

## Customization

Visit `/settings` to:
- Enable/disable individual metrics
- Adjust metric weights (0.0 - 2.0)
- Reset to defaults

Preferences are saved in browser localStorage.

## License

MIT
