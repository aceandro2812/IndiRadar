import { RATE_LIMIT_CONFIG } from '../config/rateLimits';

export interface RateLimitStatus {
  canMakeRequest: boolean;
  currentCount: number;
  dailyLimit: number;
  remainingCalls: number;
  resetTime: Date;
  isWarning: boolean;
  minuteCallsRemaining: number;
}

export interface MinuteCall {
  timestamp: number;
}

class RateLimitService {
  private storageKeys = RATE_LIMIT_CONFIG.STORAGE_KEYS;

  /**
   * Get current date in YYYY-MM-DD format for daily reset tracking
   */
  private getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get the time until midnight (daily reset)
   */
  private getTimeUntilReset(): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Initialize or reset daily counter if needed
   */
  private initializeDailyCounter(): void {
    const today = this.getTodayDateString();
    const lastReset = localStorage.getItem(this.storageKeys.LAST_RESET);

    if (lastReset !== today) {
      // New day, reset counter
      localStorage.setItem(this.storageKeys.DAILY_COUNT, '0');
      localStorage.setItem(this.storageKeys.LAST_RESET, today);
      localStorage.removeItem(this.storageKeys.MINUTE_CALLS); // Clear minute tracking
    }
  }

  /**
   * Get current daily API call count
   */
  private getDailyCount(): number {
    this.initializeDailyCounter();
    const count = localStorage.getItem(this.storageKeys.DAILY_COUNT);
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Increment daily counter
   */
  private incrementDailyCount(): void {
    const currentCount = this.getDailyCount();
    localStorage.setItem(this.storageKeys.DAILY_COUNT, (currentCount + 1).toString());
  }

  /**
   * Get calls made in the last minute
   */
  private getMinuteCalls(): MinuteCall[] {
    const stored = localStorage.getItem(this.storageKeys.MINUTE_CALLS);
    if (!stored) return [];

    try {
      const calls: MinuteCall[] = JSON.parse(stored);
      const oneMinuteAgo = Date.now() - 60000; // 60 seconds

      // Filter out calls older than 1 minute
      const recentCalls = calls.filter(call => call.timestamp > oneMinuteAgo);

      // Update storage with filtered calls
      if (recentCalls.length !== calls.length) {
        localStorage.setItem(this.storageKeys.MINUTE_CALLS, JSON.stringify(recentCalls));
      }

      return recentCalls;
    } catch {
      return [];
    }
  }

  /**
   * Record a new API call for per-minute tracking
   */
  private recordMinuteCall(): void {
    const calls = this.getMinuteCalls();
    calls.push({ timestamp: Date.now() });
    localStorage.setItem(this.storageKeys.MINUTE_CALLS, JSON.stringify(calls));
  }

  /**
   * Check if we can make an API request
   */
  public checkRateLimit(): RateLimitStatus {
    this.initializeDailyCounter();

    const currentCount = this.getDailyCount();
    const dailyLimit = RATE_LIMIT_CONFIG.DAILY_LIMIT;
    const remainingCalls = Math.max(0, dailyLimit - currentCount);
    const resetTime = this.getTimeUntilReset();
    const isWarning = currentCount >= dailyLimit * RATE_LIMIT_CONFIG.WARNING_THRESHOLD;

    // Check per-minute limit
    const minuteCalls = this.getMinuteCalls();
    const minuteCallsRemaining = Math.max(0, RATE_LIMIT_CONFIG.PER_MINUTE_LIMIT - minuteCalls.length);

    const canMakeRequest = currentCount < dailyLimit && minuteCalls.length < RATE_LIMIT_CONFIG.PER_MINUTE_LIMIT;

    return {
      canMakeRequest,
      currentCount,
      dailyLimit,
      remainingCalls,
      resetTime,
      isWarning,
      minuteCallsRemaining
    };
  }

  /**
   * Record an API call (increments both daily and per-minute counters)
   */
  public recordApiCall(): void {
    this.incrementDailyCount();
    this.recordMinuteCall();
  }

  /**
   * Get current usage statistics
   */
  public getUsageStats(): RateLimitStatus {
    return this.checkRateLimit();
  }

  /**
   * Reset all counters (for testing purposes)
   */
  public resetCounters(): void {
    localStorage.removeItem(this.storageKeys.DAILY_COUNT);
    localStorage.removeItem(this.storageKeys.LAST_RESET);
    localStorage.removeItem(this.storageKeys.MINUTE_CALLS);
  }

  /**
   * Get percentage of daily limit used
   */
  public getUsagePercentage(): number {
    const stats = this.getUsageStats();
    return (stats.currentCount / stats.dailyLimit) * 100;
  }
}

// Export singleton instance
export const rateLimitService = new RateLimitService();
