'use client';

import { MetricData } from '@/types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  metric: MetricData;
}

export default function MetricCard({ metric }: MetricCardProps) {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'green':
        return 'bg-signal-green text-white';
      case 'yellow':
        return 'bg-signal-yellow text-black';
      case 'orange':
        return 'bg-signal-orange text-white';
      case 'red':
        return 'bg-signal-red text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSignalBorderColor = (signal: string) => {
    switch (signal) {
      case 'green':
        return 'border-signal-green';
      case 'yellow':
        return 'border-signal-yellow';
      case 'orange':
        return 'border-signal-orange';
      case 'red':
        return 'border-signal-red';
      default:
        return 'border-gray-500';
    }
  };

  const getLineColor = (signal: string) => {
    switch (signal) {
      case 'green':
        return '#10b981';
      case 'yellow':
        return '#fbbf24';
      case 'orange':
        return '#f97316';
      case 'red':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatValue = (value: number | null) => {
    if (value === null) return 'N/A';

    if (metric.id === 'pi-cycle') {
      return value.toFixed(3);
    }

    return value.toFixed(1);
  };

  return (
    <div
      className={`bg-card border-2 ${getSignalBorderColor(
        metric.signal
      )} rounded-lg p-6 hover:shadow-lg transition-shadow`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{metric.name}</h3>
          <div className="text-3xl font-bold text-white mt-2">
            {formatValue(metric.value)}
          </div>
        </div>
        <div
          className={`${getSignalColor(
            metric.signal
          )} px-3 py-1 rounded-full text-xs font-semibold uppercase`}
        >
          {metric.signal}
        </div>
      </div>

      {metric.history && metric.history.length > 0 && (
        <div className="h-16 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metric.history}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={getLineColor(metric.signal)}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="text-gray-400">Risk Score</span>
        <span className="text-white font-semibold">{metric.score}/100</span>
      </div>
    </div>
  );
}
