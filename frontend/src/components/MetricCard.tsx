import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, prefix = '', suffix = '' }) => {
  const isPositive = change && change >= 0;

  return (
    <div className="bg-surface border border-gray-800 p-5 rounded-xl flex flex-col gap-1 shadow-sm transition-transform hover:scale-[1.02]">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">
          {prefix}{value}{suffix}
        </span>
        {change !== undefined && (
          <div className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
            isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
          }`}>
            {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
            {Math.abs(change).toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
