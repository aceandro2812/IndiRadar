# API Rate Limiting Feature

## Overview

The India AI Radar now includes a comprehensive rate limiting system to protect against exceeding your Gemini API free tier limits. This feature ensures you never get charged unexpectedly by tracking and limiting API calls both daily and per-minute.

## Features

### 1. Daily Rate Limiting
- Tracks total API calls per day
- Automatically resets at midnight (00:00 local time)
- Prevents API calls when daily limit is reached
- Configurable daily limit (default: 50 calls/day)

### 2. Per-Minute Rate Limiting
- Tracks API calls within a 60-second rolling window
- Prevents rapid-fire requests that exceed per-minute limits
- Configurable per-minute limit (default: 10 calls/minute)
- Automatically cleans up old call records

### 3. Visual Monitoring
- Real-time usage indicator in the UI
- Color-coded status (green/warning/danger)
- Progress bar showing usage percentage
- Countdown timer until daily reset
- Remaining calls display

### 4. Persistent Storage
- Uses browser localStorage for persistence
- Survives page refreshes and browser restarts
- Automatic daily reset mechanism
- Clean separation of storage keys

## Configuration

### Adjusting Rate Limits

Edit the configuration file at [config/rateLimits.ts](config/rateLimits.ts):

```typescript
export const RATE_LIMIT_CONFIG = {
  // Daily limit for API calls
  DAILY_LIMIT: 50,

  // Per-minute limit
  PER_MINUTE_LIMIT: 10,

  // Warning threshold (80% = show warning at 40/50 calls)
  WARNING_THRESHOLD: 0.8,
}
```

### Recommended Settings

#### Free Tier (Default)
- Daily Limit: 50 calls
- Per-Minute Limit: 10 calls
- Provides safety margin below actual Gemini limits

#### Conservative
- Daily Limit: 25 calls
- Per-Minute Limit: 5 calls
- Maximum cost protection

#### Aggressive (if you know your limits)
- Daily Limit: 100 calls
- Per-Minute Limit: 15 calls
- Higher usage, monitor carefully

## How It Works

### 1. Pre-Request Validation

Before every API call, the system checks:
```typescript
const status = rateLimitService.checkRateLimit();
if (!status.canMakeRequest) {
  // Block the request and show error
  throw new Error("Rate limit exceeded");
}
```

### 2. Post-Request Recording

After successful API calls:
```typescript
rateLimitService.recordApiCall();
// Increments both daily and per-minute counters
```

### 3. Automatic Reset

The service automatically:
- Detects date changes and resets daily counters
- Cleans up per-minute tracking older than 60 seconds
- Maintains accurate state across sessions

## UI Components

### Rate Limit Indicator

Located in the right sidebar, displays:
- **Current Usage**: X/Y format (e.g., "5/50")
- **Remaining Calls**: Calls left today
- **Progress Bar**: Visual percentage indicator
- **Reset Timer**: Time until midnight reset
- **Status Message**: Current state description

### Status Colors

- **Green**: Healthy usage (< 80% of limit)
- **Orange/Saffron**: Warning (≥ 80% of limit)
- **Red**: Limit reached (no calls allowed)

### Error Handling

When rate limit is exceeded:
- Shows specific error message
- Disables refresh button
- Displays shield alert icon
- Shows time until reset

## Usage Examples

### Normal Operation

1. User opens app → Initial API call
2. Rate limit checked ✓
3. API call succeeds
4. Counter incremented (1/50)
5. UI updates to show usage

### Approaching Limit

1. User at 40/50 calls
2. Rate limit indicator turns orange
3. Warning message displayed
4. All functionality still works

### Limit Reached

1. User reaches 50/50 calls
2. Rate limit indicator turns red
3. New API calls blocked
4. Error message shows reset time
5. Refresh button disabled

### Daily Reset

1. Midnight arrives
2. Service detects date change
3. Counters reset to 0/50
4. Full functionality restored

## Technical Details

### Storage Schema

```typescript
// localStorage keys
{
  "india_radar_daily_api_count": "42",
  "india_radar_last_reset_date": "2025-11-20",
  "india_radar_minute_calls": "[{\"timestamp\":1700000000000},...]"
}
```

### Rate Limit Service API

```typescript
// Check if request is allowed
const status = rateLimitService.checkRateLimit();

// Record a successful API call
rateLimitService.recordApiCall();

// Get current usage statistics
const stats = rateLimitService.getUsageStats();

// Get usage percentage (0-100)
const percent = rateLimitService.getUsagePercentage();

// Reset all counters (testing only)
rateLimitService.resetCounters();
```

### Type Definitions

```typescript
interface RateLimitStatus {
  canMakeRequest: boolean;        // Can make API call now?
  currentCount: number;            // Calls made today
  dailyLimit: number;              // Maximum daily calls
  remainingCalls: number;          // Calls left today
  resetTime: Date;                 // When counters reset
  isWarning: boolean;              // At warning threshold?
  minuteCallsRemaining: number;    // Calls left this minute
}
```

## Testing

### Manual Testing

1. Set low limits in config (e.g., `DAILY_LIMIT: 3`)
2. Reload app and make several API calls
3. Verify rate limit indicator updates
4. Reach limit and verify blocking works
5. Reset using browser DevTools:
   ```javascript
   localStorage.clear()
   ```

### Automated Testing

```typescript
import { rateLimitService } from './services/rateLimitService';

// Test daily limit
rateLimitService.resetCounters();
for (let i = 0; i < 51; i++) {
  rateLimitService.recordApiCall();
}
const status = rateLimitService.checkRateLimit();
console.assert(!status.canMakeRequest, "Should block at limit");

// Test per-minute limit
rateLimitService.resetCounters();
for (let i = 0; i < 11; i++) {
  rateLimitService.recordApiCall();
}
const minuteStatus = rateLimitService.checkRateLimit();
console.assert(!minuteStatus.canMakeRequest, "Should block per-minute");
```

## Troubleshooting

### Issue: Counter doesn't reset at midnight

**Solution**: Check browser time zone settings. The service uses local midnight.

### Issue: Limit reached but I didn't make that many calls

**Solution**: Check localStorage for corruption. Clear it and reload:
```javascript
localStorage.removeItem('india_radar_daily_api_count');
localStorage.removeItem('india_radar_last_reset_date');
localStorage.removeItem('india_radar_minute_calls');
```

### Issue: Warning threshold not working

**Solution**: Verify `WARNING_THRESHOLD` in [config/rateLimits.ts](config/rateLimits.ts) is between 0.0 and 1.0.

### Issue: Dev server shows errors

**Solution**: Ensure all TypeScript types are properly imported. Check:
- [services/rateLimitService.ts](services/rateLimitService.ts)
- [config/rateLimits.ts](config/rateLimits.ts)
- [components/RateLimitIndicator.tsx](components/RateLimitIndicator.tsx)

## Best Practices

1. **Set Conservative Limits**: Start with lower limits and increase as needed
2. **Monitor Usage**: Check the indicator regularly to understand your patterns
3. **Plan Requests**: Avoid rapid category switching to conserve calls
4. **Use Caching**: Consider implementing response caching for frequent queries
5. **Test Before Deploy**: Test rate limiting in development with low limits

## Future Enhancements

Potential improvements:
- Backend API call tracking (more reliable than localStorage)
- User accounts with personalized limits
- Response caching to reduce API calls
- Request queuing when approaching limits
- Usage analytics and reporting
- Email notifications at thresholds

## Support

If you encounter issues with the rate limiting feature:
1. Check this documentation
2. Verify your configuration in [config/rateLimits.ts](config/rateLimits.ts)
3. Clear browser cache and localStorage
4. Check browser console for errors

## License

This rate limiting implementation is part of the India AI Radar project and follows the same license terms.
