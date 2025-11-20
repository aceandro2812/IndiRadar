// Rate Limit Configuration
// Adjust these values based on your Gemini API free tier limits

export const RATE_LIMIT_CONFIG = {
  // Daily limit for API calls (Free tier: typically 1500/day, but set lower to be safe)
  DAILY_LIMIT: 50,

  // Per-minute limit (Free tier: typically 15/min)
  PER_MINUTE_LIMIT: 10,

  // Warning threshold (percentage of daily limit before showing warning)
  WARNING_THRESHOLD: 0.8, // 80%

  // Storage keys
  STORAGE_KEYS: {
    DAILY_COUNT: 'india_radar_daily_api_count',
    LAST_RESET: 'india_radar_last_reset_date',
    MINUTE_CALLS: 'india_radar_minute_calls',
  }
} as const;
