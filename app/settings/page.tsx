'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEFAULT_METRICS, MetricConfig } from '@/types';

export default function Settings() {
  const [metrics, setMetrics] = useState<MetricConfig[]>(DEFAULT_METRICS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('btc-metrics-preferences');
    if (stored) {
      try {
        const preferences = JSON.parse(stored);
        setMetrics(
          DEFAULT_METRICS.map((metric) => ({
            ...metric,
            enabled: preferences[metric.id]?.enabled ?? metric.enabled,
            weight: preferences[metric.id]?.weight ?? metric.weight,
          }))
        );
      } catch (e) {
        console.error('Failed to parse preferences:', e);
      }
    }
  }, []);

  const handleToggle = (id: string) => {
    setMetrics(
      metrics.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleWeightChange = (id: string, weight: number) => {
    setMetrics(
      metrics.map((m) => (m.id === id ? { ...m, weight: Math.max(0, weight) } : m))
    );
  };

  const handleSave = () => {
    const preferences = metrics.reduce(
      (acc, metric) => {
        acc[metric.id] = {
          enabled: metric.enabled,
          weight: metric.weight,
        };
        return acc;
      },
      {} as Record<string, { enabled: boolean; weight: number }>
    );

    localStorage.setItem('btc-metrics-preferences', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setMetrics(DEFAULT_METRICS);
    localStorage.removeItem('btc-metrics-preferences');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Customize metrics and adjust weightings</p>
        </header>

        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Metric Configuration</h2>

          <div className="space-y-6">
            {metrics.map((metric) => (
              <div key={metric.id} className="border-b border-border pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => handleToggle(metric.id)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          metric.enabled ? 'bg-signal-green' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            metric.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></div>
                      </button>
                      <h3 className="text-lg font-semibold text-white">{metric.name}</h3>
                    </div>
                    <p className="text-sm text-gray-400 ml-15">{metric.description}</p>
                  </div>
                </div>

                <div className="ml-15 mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weight: {metric.weight.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={metric.weight}
                    onChange={(e) =>
                      handleWeightChange(metric.id, parseFloat(e.target.value))
                    }
                    disabled={!metric.enabled}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.0</span>
                    <span>1.0</span>
                    <span>2.0</span>
                  </div>
                </div>

                <div className="ml-15 mt-4 bg-background/50 rounded p-3">
                  <p className="text-xs text-gray-400 font-semibold mb-2">Signal Logic:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-signal-green rounded-full"></div>
                      <span className="text-gray-300">{metric.signalLogic.green}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-signal-yellow rounded-full"></div>
                      <span className="text-gray-300">{metric.signalLogic.yellow}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-signal-orange rounded-full"></div>
                      <span className="text-gray-300">{metric.signalLogic.orange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-signal-red rounded-full"></div>
                      <span className="text-gray-300">{metric.signalLogic.red}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="bg-signal-green hover:bg-signal-green/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {saved ? '✓ Saved!' : 'Save Preferences'}
          </button>
          <button
            onClick={handleReset}
            className="bg-card border border-border hover:border-gray-400 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">How It Works</h2>
          <div className="text-gray-300 space-y-3 text-sm">
            <p>
              The aggregate score is calculated as a weighted average of all enabled
              metrics. Each metric contributes its individual score (0-100) multiplied by
              its weight.
            </p>
            <p>
              <strong>Weights:</strong> Higher weights give more influence to that metric.
              A weight of 1.5 means the metric counts 50% more than a weight of 1.0.
            </p>
            <p>
              <strong>Score Ranges:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>0-30: Green (accumulate zone)</li>
              <li>30-60: Yellow (caution)</li>
              <li>60-80: Orange (elevated risk)</li>
              <li>80-100: Red (extreme risk / likely top)</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
