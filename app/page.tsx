'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardData } from '@/types';
import MetricCard from '@/components/MetricCard';
import AggregateScoreGauge from '@/components/AggregateScoreGauge';

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const preferences = localStorage.getItem('btc-metrics-preferences');
      const url = preferences
        ? `/api/dashboard?preferences=${encodeURIComponent(preferences)}`
        : '/api/dashboard';

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-400">Error: {error || 'No data available'}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Bitcoin Topping Signals
            </h1>
            <p className="text-gray-400">
              Track cycle top indicators and aggregate confidence score
            </p>
          </div>
          <Link
            href="/settings"
            className="bg-card border border-border hover:border-gray-400 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Settings
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <AggregateScoreGauge score={dashboardData.aggregateScore} />
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData.metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>

        <footer className="text-center text-gray-500 text-sm">
          <p>
            Last updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
          </p>
          <p className="mt-2">
            Data sources: CoinGecko, alternative.me | Updates every 5 minutes
          </p>
        </footer>
      </div>
    </main>
  );
}
