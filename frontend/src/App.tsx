import React, { useState, useEffect, useCallback } from 'react';
import { VegaLite } from 'react-vega';
import { 
  getTickers, getTechnicals, getComparative, getRisk, refreshData 
} from './api';
import { 
  TechnicalsResponse, ComparativeResponse, RiskResponse 
} from './types';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import ChartContainer from './components/ChartContainer';
import { LayoutDashboard, Link, ShieldAlert, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [tickers, setTickers] = useState<string[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [primaryAsset, setPrimaryAsset] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'technicals' | 'comparative' | 'risk'>('technicals');
  
  const [techData, setTechData] = useState<TechnicalsResponse | null>(null);
  const [compData, setCompData] = useState<ComparativeResponse | null>(null);
  const [riskData, setRiskData] = useState<RiskResponse | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Settings
  const [chartDays, setChartDays] = useState<number>(180);
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showSMA200, setShowSMA200] = useState(false);
  const [showBBnds, setShowBBnds] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const allTickers = await getTickers();
      setTickers(allTickers);
      if (selectedTickers.length === 0) {
        setSelectedTickers(allTickers);
        setPrimaryAsset(allTickers[0]);
      }
    } catch (error) {
      console.error("Error fetching tickers", error);
    } finally {
      setLoading(false);
    }
  }, [selectedTickers.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (primaryAsset) {
      getTechnicals({ ticker: primaryAsset, days: chartDays }).then(setTechData);
      getRisk({ ticker: primaryAsset }).then(setRiskData);
    }
    if (selectedTickers.length > 0) {
      getComparative({ tickers: selectedTickers }).then(setCompData);
    }
  }, [primaryAsset, selectedTickers, chartDays]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      await fetchData();
    } catch (error) {
      console.error("Error refreshing data", error);
    } finally {
      setRefreshing(false);
    }
  };

  const commonViewConfig: any = {
    background: "transparent",
    view: { stroke: null },
    axis: {
      gridColor: "#30363D",
      tickColor: "#30363D",
      labelColor: "#8B949E",
      titleColor: "#C9D1D9",
      labelFontSize: 10,
      titleFontSize: 12,
    },
    legend: {
      labelColor: "#8B949E",
      titleColor: "#C9D1D9",
    }
  };

  const getPriceSpec = (data: any[]) => {
    const layers: any[] = [
      {
        mark: { type: 'rule', color: '#8B949E' },
        encoding: {
          x: { field: 'Date', type: 'temporal', axis: { title: null } },
          y: { field: 'Low', type: 'quantitative', scale: { zero: false } },
          y2: { field: 'High' }
        }
      },
      {
        mark: { type: 'bar', strokeWidth: 1 },
        encoding: {
          x: { field: 'Date', type: 'temporal' },
          y: { field: 'Open', type: 'quantitative' },
          y2: { field: 'Close' },
          color: {
            condition: { test: "datum.Open < datum.Close", value: "#00C805" },
            value: "#FF3B3B"
          }
        }
      }
    ];

    if (showSMA20) layers.push({ mark: { type: 'line', color: '#F59E0B', strokeWidth: 1.5, opacity: 0.8 }, encoding: { x: { field: 'Date', type: 'temporal' }, y: { field: 'SMA_20', type: 'quantitative' } } });
    if (showSMA50) layers.push({ mark: { type: 'line', color: '#06B6D4', strokeWidth: 1.5, opacity: 0.8 }, encoding: { x: { field: 'Date', type: 'temporal' }, y: { field: 'SMA_50', type: 'quantitative' } } });
    if (showSMA200) layers.push({ mark: { type: 'line', color: '#EF4444', strokeWidth: 1.5, opacity: 0.8 }, encoding: { x: { field: 'Date', type: 'temporal' }, y: { field: 'SMA_200', type: 'quantitative' } } });
    if (showBBnds) {
      layers.push({ mark: { type: 'area', color: '#8B949E', opacity: 0.1 }, encoding: { x: { field: 'Date', type: 'temporal' }, y: { field: 'Lower_Band', type: 'quantitative' }, y2: { field: 'Upper_Band' } } });
      layers.push({ mark: { type: 'line', color: '#8B949E', strokeWidth: 1, strokeDash: [4, 4] }, encoding: { x: { field: 'Date', type: 'temporal' }, y: { field: 'Upper_Band', type: 'quantitative' } } });
      layers.push({ mark: { type: 'line', color: '#8B949E', strokeWidth: 1, strokeDash: [4, 4] }, encoding: { x: { field: 'Date', type: 'temporal' }, y: { field: 'Lower_Band', type: 'quantitative' } } });
    }

    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 'container',
      height: 'container',
      config: commonViewConfig,
      data: { values: data },
      layer: layers
    };
  };

  const getCumulativeSpec = (data: any[]) => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container', height: 'container', config: commonViewConfig,
    data: { values: data },
    mark: { type: 'line', interpolate: 'monotone', strokeWidth: 2 },
    encoding: {
      x: { field: 'Date', type: 'temporal', axis: { title: null } },
      y: { field: 'Value', type: 'quantitative', title: 'Portfolio Value ($)', scale: { zero: false } },
      color: { field: 'Ticker', type: 'nominal', scale: { range: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'] } }
    }
  });

  const getCorrSpec = (data: any[]) => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container', height: 'container', config: commonViewConfig,
    data: { values: data },
    mark: 'rect',
    encoding: {
      x: { field: 'Asset1', type: 'nominal', title: null },
      y: { field: 'Asset2', type: 'nominal', title: null },
      color: { field: 'Correlation', type: 'quantitative', scale: { scheme: 'redblue', domain: [-1, 1] } },
      tooltip: [
        { field: 'Asset1', type: 'nominal' },
        { field: 'Asset2', type: 'nominal' },
        { field: 'Correlation', type: 'quantitative', format: '.2f' }
      ]
    }
  });

  const getRiskReturnSpec = (data: any[]) => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container', height: 'container', config: commonViewConfig,
    data: { values: data },
    layer: [
      {
        mark: { type: 'point', size: 100, filled: true },
        encoding: {
          x: { field: 'Annualized Volatility', type: 'quantitative' },
          y: { field: 'Annualized Return', type: 'quantitative' },
          color: { field: 'Asset', type: 'nominal', legend: null }
        }
      },
      {
        mark: { type: 'text', dy: -15, fontWeight: 'bold' },
        encoding: {
          x: { field: 'Annualized Volatility', type: 'quantitative' },
          y: { field: 'Annualized Return', type: 'quantitative' },
          text: { field: 'Asset', type: 'nominal' },
          color: { value: 'white' }
        }
      }
    ]
  });

  const getDistSpec = (hist: any[], fit: any[]) => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container', height: 'container', config: commonViewConfig,
    layer: [
      {
        data: { values: hist },
        mark: { type: 'bar', color: '#8B5CF6', opacity: 0.6 },
        encoding: {
          x: { field: 'Return', type: 'quantitative', title: 'Daily Return' },
          y: { field: 'Density', type: 'quantitative' }
        }
      },
      {
        data: { values: fit },
        mark: { type: 'line', color: 'white', strokeWidth: 2 },
        encoding: {
          x: { field: 'Return', type: 'quantitative' },
          y: { field: 'Density', type: 'quantitative' }
        }
      }
    ]
  });

  const getMCSpec = (data: any[]) => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container', height: 'container', config: commonViewConfig,
    data: { values: data },
    mark: { type: 'line', strokeWidth: 1, opacity: 0.1, color: '#8B5CF6' },
    encoding: {
      x: { field: 'Day', type: 'quantitative', title: 'Days from Today' },
      y: { field: 'Price', type: 'quantitative', scale: { zero: false }, title: 'Simulated Price ($)' },
      detail: { field: 'Simulation' }
    }
  });

  if (loading) {
    return (
      <div className="flex-1 h-screen bg-background flex flex-col items-center justify-center text-accent">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-sm font-bold tracking-widest uppercase">Initializing Analytics...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar 
        tickers={tickers} 
        selectedTickers={selectedTickers}
        primaryAsset={primaryAsset}
        onTickersChange={setSelectedTickers}
        onPrimaryChange={setPrimaryAsset}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex items-end justify-between border-b border-gray-800 pb-6">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                Market Intelligence <span className="text-accent">Portal</span>
              </h2>
              <p className="text-gray-500 font-medium">Real-time quantitative analysis and technical forecasting.</p>
            </div>
            
            <div className="flex bg-surface p-1 rounded-xl border border-gray-800 shadow-sm">
              <button
                onClick={() => setActiveTab('technicals')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'technicals' ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                <LayoutDashboard size={18} /> Technicals
              </button>
              <button
                onClick={() => setActiveTab('comparative')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'comparative' ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                <Link size={18} /> Comparative
              </button>
              <button
                onClick={() => setActiveTab('risk')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'risk' ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                <ShieldAlert size={18} /> Risk & Quant
              </button>
            </div>
          </div>

          {activeTab === 'technicals' && techData && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard label="Current Price" value={techData.last_close.toFixed(2)} change={techData.day_change} prefix="$" />
                <MetricCard label="52-Week High" value={techData.high_52w.toFixed(2)} prefix="$" />
                <MetricCard label="Daily Volume" value={(techData.vol_latest / 1000000).toFixed(1)} suffix="M" />
                <MetricCard label="20-Day SMA" value={techData.sma_20.toFixed(2)} prefix="$" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-surface border border-gray-800 p-6 rounded-xl shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Chart Controls</h4>
                    <div className="space-y-4">
                      {[
                        { id: 'sma20', label: 'SMA 20', color: 'bg-amber-500', state: showSMA20, setter: setShowSMA20 },
                        { id: 'sma50', label: 'SMA 50', color: 'bg-cyan-500', state: showSMA50, setter: setShowSMA50 },
                        { id: 'sma200', label: 'SMA 200', color: 'bg-red-500', state: showSMA200, setter: setShowSMA200 },
                        { id: 'bbnds', label: 'Bollinger Bands', color: 'bg-gray-400', state: showBBnds, setter: setShowBBnds },
                      ].map(ctrl => (
                        <div key={ctrl.id} className="flex items-center justify-between group cursor-pointer" onClick={() => ctrl.setter(!ctrl.state)}>
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${ctrl.color} ${ctrl.state ? 'opacity-100 shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'opacity-20'}`} />
                            <span className={`text-sm font-semibold transition-colors ${ctrl.state ? 'text-gray-100' : 'text-gray-500'}`}>{ctrl.label}</span>
                          </div>
                          <div className={`w-9 h-5 rounded-full transition-colors relative ${ctrl.state ? 'bg-accent' : 'bg-gray-700'}`}>
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${ctrl.state ? 'translate-x-4' : ''}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8">
                      <div className="flex justify-between mb-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lookback Period</label>
                        <span className="text-xs font-bold text-accent">{chartDays} Days</span>
                      </div>
                      <input 
                        type="range" min="30" max="750" value={chartDays} 
                        onChange={(e) => setChartDays(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-9">
                  <ChartContainer title={`Price Action & Indicators: ${primaryAsset}`} height="h-[550px]">
                    <VegaLite spec={getPriceSpec(techData.price_data)} actions={false} className="w-full h-full" />
                  </ChartContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comparative' && compData && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ChartContainer title="Cumulative Performance (Base 100)" height="h-[450px]">
                <VegaLite spec={getCumulativeSpec(compData.cumulative_returns)} actions={false} className="w-full h-full" />
              </ChartContainer>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Asset Correlation Matrix">
                  <VegaLite spec={getCorrSpec(compData.correlation_matrix)} actions={false} className="w-full h-full" />
                </ChartContainer>
                <ChartContainer title="Risk-Return Profile (Annualized)">
                  <VegaLite spec={getRiskReturnSpec(compData.risk_return_tradeoff)} actions={false} className="w-full h-full" />
                </ChartContainer>
              </div>
            </div>
          )}

          {activeTab === 'risk' && riskData && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <ChartContainer title={`Return Distribution: ${primaryAsset}`}>
                    <VegaLite spec={getDistSpec(riskData.histogram, riskData.normal_fit)} actions={false} className="w-full h-full" />
                  </ChartContainer>
                  <div className="bg-surface border border-gray-800 p-6 rounded-xl shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Value at Risk (VaR)</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 bg-background/50 rounded-lg border border-gray-800">
                        <p className="text-xs text-gray-500 mb-1 font-bold">95% Confidence</p>
                        <p className="text-xl font-bold text-accent">{(riskData.var_95 * 100).toFixed(2)}%</p>
                      </div>
                      <div className="p-4 bg-background/50 rounded-lg border border-gray-800">
                        <p className="text-xs text-gray-500 mb-1 font-bold">99% Confidence</p>
                        <p className="text-xl font-bold text-accent">{(riskData.var_99 * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-4 leading-relaxed italic">
                      VaR measures the potential loss in value of a risky asset or portfolio over a defined period for a given confidence interval.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <ChartContainer title="Monte Carlo Price Simulation (30 Days)">
                    <VegaLite spec={getMCSpec(riskData.monte_carlo)} actions={false} className="w-full h-full" />
                  </ChartContainer>
                  <div className="bg-surface border border-gray-800 p-6 rounded-xl shadow-sm">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Day-30 Price Forecasts</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 mb-1 font-bold uppercase">10th Perc.</p>
                        <p className="text-lg font-bold text-white">${riskData.targets.p10.toFixed(2)}</p>
                      </div>
                      <div className="text-center border-x border-gray-800">
                        <p className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Median</p>
                        <p className="text-xl font-bold text-accent">${riskData.targets.p50.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 mb-1 font-bold uppercase">90th Perc.</p>
                        <p className="text-lg font-bold text-white">${riskData.targets.p90.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
