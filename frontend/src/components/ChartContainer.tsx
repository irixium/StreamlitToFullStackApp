import React from 'react';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  height?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, height = 'h-[400px]' }) => {
  return (
    <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden shadow-lg">
      <div className="bg-background/40 border-b border-gray-800 px-6 py-4">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest">{title}</h3>
      </div>
      <div className={`p-6 ${height} flex items-center justify-center`}>
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
