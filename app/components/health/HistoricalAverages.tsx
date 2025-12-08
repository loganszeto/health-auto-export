'use client';

import { HistoricalStats } from '@/lib/models/ProcessedHealthData';

interface HistoricalAveragesProps {
  stats: HistoricalStats[];
}

export default function HistoricalAverages({ stats }: HistoricalAveragesProps) {
  if (stats.length === 0) {
    return (
      <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-8">
        <h2 className="text-[#e6c384] text-2xl mb-4">Historical Metrics</h2>
        <p className="text-[#7c7c7c]">No historical data available yet.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-8">
      <h2 className="text-[#e6c384] text-2xl mb-6">Historical Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[#16161d] border border-[#363646] rounded-lg p-6">
            <h3 className="text-[#e6c384] text-lg mb-4 font-semibold">{stat.metric}</h3>
            
            {/* Range Bar Visualization */}
            <div className="mb-4">
              <div className="relative h-4 bg-[#363646] rounded-full overflow-hidden">
                {/* Min to Max range */}
                <div 
                  className="absolute h-full bg-gradient-to-r from-[#7c7c7c] to-[#e6c384] rounded-full"
                  style={{ width: '100%' }}
                />
                {/* Mean indicator */}
                <div
                  className="absolute h-full w-1 bg-white rounded-full"
                  style={{
                    left: `${((stat.mean - stat.min) / (stat.max - stat.min)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#7c7c7c] mt-1">
                <span>Min: {stat.min.toFixed(1)}</span>
                <span>Max: {stat.max.toFixed(1)}</span>
              </div>
            </div>
            
            {/* Statistics */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#7c7c7c] text-sm">Min</span>
                <span className="text-white font-semibold">
                  {stat.min.toFixed(1)} {stat.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7c7c7c] text-sm">Max</span>
                <span className="text-white font-semibold">
                  {stat.max.toFixed(1)} {stat.unit}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#363646]">
                <span className="text-[#e6c384] text-sm font-semibold">Mean</span>
                <span className="text-[#e6c384] text-lg font-bold">
                  {stat.mean.toFixed(1)} {stat.unit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

