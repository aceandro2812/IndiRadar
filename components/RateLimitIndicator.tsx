import React, { useState, useEffect } from 'react';
import { rateLimitService, RateLimitStatus } from '../services/rateLimitService';
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

export const RateLimitIndicator: React.FC = () => {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  useEffect(() => {
    const updateStatus = () => {
      const currentStatus = rateLimitService.getUsageStats();
      setStatus(currentStatus);

      // Calculate time until reset
      if (currentStatus.resetTime) {
        const now = new Date();
        const diff = currentStatus.resetTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilReset(`${hours}h ${minutes}m`);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const usagePercentage = (status.currentCount / status.dailyLimit) * 100;
  const isLimitReached = !status.canMakeRequest && status.remainingCalls === 0;
  const isWarning = status.isWarning && !isLimitReached;
  const isOk = !isWarning && !isLimitReached;

  // Color scheme based on usage
  let progressColor = 'bg-green-500';
  let textColor = 'text-green-400';
  let borderColor = 'border-green-500/30';
  let bgColor = 'bg-green-500/10';
  let icon = <CheckCircle className="w-4 h-4" />;

  if (isLimitReached) {
    progressColor = 'bg-red-500';
    textColor = 'text-red-400';
    borderColor = 'border-red-500/30';
    bgColor = 'bg-red-500/10';
    icon = <AlertTriangle className="w-4 h-4" />;
  } else if (isWarning) {
    progressColor = 'bg-india-saffron';
    textColor = 'text-india-saffron';
    borderColor = 'border-india-saffron/30';
    bgColor = 'bg-india-saffron/10';
    icon = <AlertTriangle className="w-4 h-4" />;
  }

  return (
    <div className={`glass-panel rounded-xl p-4 border ${borderColor} ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={textColor}>{icon}</div>
          <h3 className="text-sm font-bold text-white">API Usage</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          <span>Resets in {timeUntilReset}</span>
        </div>
      </div>

      {/* Usage Counter */}
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <span className={`text-2xl font-bold ${textColor}`}>
            {status.currentCount}
          </span>
          <span className="text-slate-500 text-sm ml-1">/ {status.dailyLimit}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Remaining</div>
          <div className={`text-lg font-bold ${textColor}`}>
            {status.remainingCalls}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/50 rounded-full h-2 mb-3 overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-500 ease-out rounded-full relative`}
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        >
          {isOk && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          )}
        </div>
      </div>

      {/* Per-minute rate limit indicator */}
      {status.minuteCallsRemaining < 5 && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-3">
          <Zap className="w-3 h-3" />
          <span>Per-minute limit: {status.minuteCallsRemaining} calls remaining</span>
        </div>
      )}

      {/* Status Messages */}
      {isLimitReached && (
        <div className="text-xs text-red-400 font-medium">
          Daily limit reached. No more API calls allowed until reset.
        </div>
      )}
      {isWarning && !isLimitReached && (
        <div className="text-xs text-india-saffron font-medium">
          Approaching daily limit. Use remaining calls wisely.
        </div>
      )}
      {isOk && (
        <div className="text-xs text-green-400 font-medium">
          API usage is healthy. {usagePercentage.toFixed(0)}% of daily limit used.
        </div>
      )}
    </div>
  );
};
