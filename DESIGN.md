# Bitcoin Topping Signals Dashboard

## Overview
A customizable dashboard for tracking Bitcoin cycle top indicators. Users can select which metrics to track, adjust weightings, and see an aggregate confidence score.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Data:** Free APIs (CoinGecko, Blockchain.com, alternative.me, etc.)
- **State:** Local storage for user preferences (metric selection, weights)
- **Deployment:** Vercel

## Features

### Core
1. **Dashboard Grid** — Card-based layout showing each selected metric
2. **Aggregate Score** — Weighted composite score (0-100) with color coding:
   - 0-30: Green (accumulate zone)
   - 30-60: Yellow (caution)
   - 60-80: Orange (elevated risk)
   - 80-100: Red (extreme risk / likely top)
3. **Metric Cards** — Each card shows:
   - Current value
   - Historical chart (mini sparkline)
   - Signal status (bullish/neutral/bearish)
   - Individual score contribution
4. **Customization Panel** — Add/remove metrics, adjust weights per metric
5. **Dark Theme** — Professional dark mode by default (matches Boss's preference)

### Metrics to Include (v1)
All should have toggles and adjustable weights:

| Metric | Source | Signal Logic |
|--------|--------|-------------|
| MVRV Z-Score | Blockchain.com / CoinGlass | >7 = extreme overvaluation |
| Pi Cycle Top | Calculate from 111DMA & 350DMA×2 | Crossover = top signal |
| NUPL | Blockchain.com | >0.75 = euphoria |
| Puell Multiple | Calculate from daily issuance / 365MA | >4 = overvalued |
| Reserve Risk | Calculate from HODL waves | High = confident holders selling |
| Fear & Greed Index | alternative.me API | >80 = extreme greed |
| Funding Rates | CoinGlass API | Persistently high = overheated |
| RSI (Weekly) | Calculate from price data | >90 = overbought |
| Exchange Net Flow | CryptoQuant-style (may need proxy) | Large inflows = sell pressure |
| Google Trends "Bitcoin" | Google Trends (scrape or API) | Spike = retail FOMO |

### Nice to Have (v2)
- Historical comparison overlay (2017 top, 2021 top)
- Alert system (notify when aggregate score crosses thresholds)
- Mobile responsive
- Export data as CSV

## API Strategy
Use FREE APIs only (no paid keys required for v1):
- **CoinGecko** — Price, market data, volume (free tier: 10-30 calls/min)
- **alternative.me** — Fear & Greed Index
- **Blockchain.com** — On-chain metrics
- **Calculate locally** — RSI, moving averages, Pi Cycle from price history

## Pages
- `/` — Main dashboard with metric grid + aggregate score
- `/settings` — Metric selection, weight adjustment, preferences

## Data Flow
1. Next.js API routes fetch from external APIs (server-side, avoids CORS)
2. Cache responses in memory (5-15 min TTL depending on metric)
3. Client polls every 5 minutes for updates
4. User preferences stored in localStorage

## Design
- Dark background (#0a0a0a)
- Card-based grid layout
- Green/yellow/orange/red color system for signals
- Clean typography, minimal UI
- Responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop)
