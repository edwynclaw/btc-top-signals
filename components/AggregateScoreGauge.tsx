'use client';

interface AggregateScoreGaugeProps {
  score: number;
}

export default function AggregateScoreGauge({ score }: AggregateScoreGaugeProps) {
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-signal-green';
    if (score < 60) return 'text-signal-yellow';
    if (score < 80) return 'text-signal-orange';
    return 'text-signal-red';
  };

  const getScoreLabel = (score: number) => {
    if (score < 30) return 'Accumulate Zone';
    if (score < 60) return 'Caution';
    if (score < 80) return 'Elevated Risk';
    return 'Extreme Risk';
  };

  const getGradientColor = (score: number) => {
    if (score < 30) return 'from-signal-green to-signal-green/50';
    if (score < 60) return 'from-signal-yellow to-signal-yellow/50';
    if (score < 80) return 'from-signal-orange to-signal-orange/50';
    return 'from-signal-red to-signal-red/50';
  };

  return (
    <div className="bg-card border-2 border-border rounded-lg p-8 text-center">
      <h2 className="text-xl font-semibold text-gray-400 mb-6">Aggregate Top Signal</h2>

      <div className="relative inline-block">
        <svg className="w-48 h-48" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={score < 30 ? '#10b981' : score < 60 ? '#fbbf24' : score < 80 ? '#f97316' : '#ef4444'}
            strokeWidth="12"
            strokeDasharray={`${(score / 100) * 565} 565`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</div>
          <div className="text-sm text-gray-400 mt-1">/ 100</div>
        </div>
      </div>

      <div className="mt-6">
        <div className={`text-2xl font-semibold ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {score < 30 && 'Market conditions favorable for accumulation'}
          {score >= 30 && score < 60 && 'Monitor market conditions closely'}
          {score >= 60 && score < 80 && 'High risk of market top approaching'}
          {score >= 80 && 'Historically dangerous levels - likely near top'}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-signal-green rounded-full"></div>
          <span className="text-gray-400">0-30</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-signal-yellow rounded-full"></div>
          <span className="text-gray-400">30-60</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-signal-orange rounded-full"></div>
          <span className="text-gray-400">60-80</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-signal-red rounded-full"></div>
          <span className="text-gray-400">80-100</span>
        </div>
      </div>
    </div>
  );
}
