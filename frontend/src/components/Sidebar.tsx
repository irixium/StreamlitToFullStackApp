import React from 'react';
import { RefreshCw, Filter, Activity } from 'lucide-react';

interface SidebarProps {
  tickers: string[];
  selectedTickers: string[];
  primaryAsset: string;
  onTickersChange: (tickers: string[]) => void;
  onPrimaryChange: (ticker: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  tickers,
  selectedTickers,
  primaryAsset,
  onTickersChange,
  onPrimaryChange,
  onRefresh,
  refreshing,
}) => {
  const handleToggleTicker = (ticker: string) => {
    if (selectedTickers.includes(ticker)) {
      if (selectedTickers.length > 1) {
        onTickersChange(selectedTickers.filter(t => t !== ticker));
      }
    } else {
      onTickersChange([...selectedTickers, ticker]);
    }
  };

  return (
    <aside className="w-72 bg-surface h-screen border-r border-gray-800 flex flex-col p-6 overflow-y-auto shrink-0">
      <div className="flex items-center gap-2 mb-8 text-accent">
        <Activity size={24} strokeWidth={2.5} />
        <h1 className="text-xl font-bold tracking-tight text-white">Analytics Engine</h1>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <RefreshCw size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Market Data</span>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-accent hover:bg-accent-dark disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Force Refresh'}
          </button>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <Filter size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Global Filters</span>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400 block mb-2">Select Assets</label>
            <div className="grid grid-cols-2 gap-2">
              {tickers.map(ticker => (
                <button
                  key={ticker}
                  onClick={() => handleToggleTicker(ticker)}
                  className={`py-1.5 px-3 rounded-md text-xs font-medium border transition-all ${
                    selectedTickers.includes(ticker)
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'bg-background border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm text-gray-400 block mb-2">Primary Asset (Deep Dive)</label>
            <select
              value={primaryAsset}
              onChange={(e) => onPrimaryChange(e.target.value)}
              className="w-full bg-background border border-gray-700 text-white text-sm rounded-lg focus:ring-accent focus:border-accent p-2.5 outline-none"
            >
              {selectedTickers.map(ticker => (
                <option key={ticker} value={ticker}>{ticker}</option>
              ))}
            </select>
          </div>
        </section>
      </div>

      <div className="mt-auto pt-8">
        <div className="p-4 bg-background/50 rounded-xl border border-gray-800/50">
          <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
            Data Source: Yahoo Finance
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
