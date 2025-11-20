import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { BriefingView } from './components/BriefingView';
import { SourcesList } from './components/SourcesList';
import { TrendChart } from './components/TrendChart';
import { StatsGrid } from './components/StatsGrid';
import { RateLimitIndicator } from './components/RateLimitIndicator';
import { fetchIndiaAINews } from './services/aiService';
import { Category, AIReport } from './types';
import { Loader2, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { rateLimitService } from './services/rateLimitService';

const App: React.FC = () => {
  const [category, setCategory] = useState<Category>('latest');
  const [report, setReport] = useState<AIReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimitError, setIsRateLimitError] = useState<boolean>(false);

  const loadData = async (cat: Category) => {
    setIsLoading(true);
    setError(null);
    setIsRateLimitError(false);

    try {
      const data = await fetchIndiaAINews(cat);
      setReport(data);
    } catch (err: any) {
      console.error(err);

      // Check if it's a rate limit error
      if (err.message && err.message.includes('RATE_LIMIT_EXCEEDED')) {
        setIsRateLimitError(true);
        const cleanMessage = err.message.replace('RATE_LIMIT_EXCEEDED: ', '');
        setError(cleanMessage);
      } else {
        setError("Failed to gather intelligence. Connection to neural grid unstable.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleRefresh = () => {
    const rateLimitStatus = rateLimitService.checkRateLimit();
    if (!rateLimitStatus.canMakeRequest) {
      setIsRateLimitError(true);
      const reason = rateLimitStatus.remainingCalls === 0
        ? `Daily API limit reached (${rateLimitStatus.dailyLimit} calls). Resets at midnight.`
        : `Per-minute rate limit exceeded. Please wait a moment before trying again.`;
      setError(reason);
      return;
    }
    loadData(category);
  };

  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1e1b4b] via-[#020617] to-[#020617]">
      <Header />
      
      <CategoryNav 
        activeCategory={category} 
        onSelect={setCategory} 
        isLoading={isLoading} 
      />

      <main className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
               {category === 'latest' && 'Latest Intel'}
               {category === 'startups' && 'Startup Ecosystem'}
               {category === 'enterprise' && 'Enterprise AI'}
               {category === 'research' && 'Research & Development'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time surveillance of the Indian Artificial Intelligence landscape</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 hover:border-india-saffron/50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error ? (
          <div className={`p-8 rounded-2xl ${isRateLimitError ? 'bg-india-saffron/10 border-india-saffron/20 text-india-saffron' : 'bg-red-500/10 border-red-500/20 text-red-400'} border flex flex-col items-center justify-center text-center`}>
            {isRateLimitError ? (
              <ShieldAlert className="w-8 h-8 mb-2 opacity-80" />
            ) : (
              <AlertTriangle className="w-8 h-8 mb-2 opacity-80" />
            )}
            <p className="font-medium">{error}</p>
            {!isRateLimitError && (
              <button
                onClick={handleRefresh}
                className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors text-white"
              >
                Retry Connection
              </button>
            )}
            {isRateLimitError && (
              <p className="mt-3 text-sm opacity-80">
                Please wait until the reset time or adjust your daily limit in the configuration.
              </p>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="absolute inset-0 bg-india-saffron/20 blur-2xl rounded-full animate-pulse"></div>
              <Loader2 className="w-12 h-12 text-india-saffron animate-spin relative z-10" />
            </div>
            <h3 className="mt-6 text-lg font-display font-bold text-white tracking-wide">SCANNING SECTOR</h3>
            <p className="text-sm text-slate-500 font-mono mt-1">Parsing {category} data streams...</p>
          </div>
        ) : report ? (
          <div className="animate-fade-in space-y-6">
            {/* Top Stats Row */}
            <StatsGrid stats={report.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Content Area */}
              <div className="lg:col-span-8 space-y-6">
                <BriefingView content={report.content} />
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                {/* Rate Limit Indicator */}
                <RateLimitIndicator />

                {/* Chart Component */}
                <div className="h-[300px]">
                  <TrendChart data={report.chartData} category={category} />
                </div>

                {/* Sources */}
                <div className="glass-panel rounded-xl p-6">
                   <SourcesList sources={report.sources} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      
      <footer className="border-t border-white/5 mt-12 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            Data powered by Gemini 2.5 Flash • Grounded via Google Search
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
             <span>Privacy</span>
             <span>Terms</span>
             <span>India AI Radar © 2024</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;