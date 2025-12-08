'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TimeSeriesDataPoint } from '@/lib/models/ProcessedHealthData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
}

/**
 * Time Series Chart Component
 * 
 * Displays VO2 Max, Sleep Duration, and Active Calories over time
 * Uses dual Y-axes: left for VO2 Max and Calories, right for Sleep Duration
 * Includes toggles for each series and trend lines
 */
export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const [showVO2Max, setShowVO2Max] = useState(true);
  const [showSleep, setShowSleep] = useState(true);
  const [showCalories, setShowCalories] = useState(true);
  const [showTrends, setShowTrends] = useState(true);
  
  if (data.length === 0) {
    return (
      <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-8">
        <h2 className="text-[#e6c384] text-2xl mb-4">Time Series Analysis</h2>
        <p className="text-[#7c7c7c]">No data available for chart.</p>
      </div>
    );
  }
  
  // Prepare chart data
  const labels = data.map(d => {
    const date = new Date(d.date + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  // Normalize data for visualization
  // VO2 Max: typically 20-60 ml/kg/min
  // Sleep: minutes (typically 300-600 = 5-10 hours)
  // Calories: typically 200-1000 kcal
  
  // For dual-axis: VO2 Max and Calories on left, Sleep on right
  const vo2MaxData = data.map(d => d.vo2Max);
  const sleepData = data.map(d => d.sleepDuration ? d.sleepDuration / 60 : null); // Convert to hours for better scale
  const caloriesData = data.map(d => d.activeCalories);
  
  // Trend lines
  const vo2MaxTrend = data.map(d => d.vo2MaxTrend);
  const sleepTrend = data.map(d => d.sleepTrend ? d.sleepTrend / 60 : null);
  const caloriesTrend = data.map(d => d.caloriesTrend);
  
  const chartData = {
    labels,
    datasets: [
      // VO2 Max
      ...(showVO2Max ? [{
        label: 'VO2 Max',
        data: vo2MaxData,
        borderColor: '#00d9ff',
        backgroundColor: 'rgba(0, 217, 255, 0.1)',
        yAxisID: 'y',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
      }] : []),
      // VO2 Max Trend
      ...(showVO2Max && showTrends ? [{
        label: 'VO2 Max Trend',
        data: vo2MaxTrend,
        borderColor: '#00d9ff',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        yAxisID: 'y',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      }] : []),
      // Sleep Duration
      ...(showSleep ? [{
        label: 'Sleep Duration (hours)',
        data: sleepData,
        borderColor: '#ffd60a',
        backgroundColor: 'rgba(255, 214, 10, 0.1)',
        yAxisID: 'y1',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
      }] : []),
      // Sleep Trend
      ...(showSleep && showTrends ? [{
        label: 'Sleep Trend',
        data: sleepTrend,
        borderColor: '#ffd60a',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        yAxisID: 'y1',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      }] : []),
      // Active Calories
      ...(showCalories ? [{
        label: 'Active Calories',
        data: caloriesData,
        borderColor: '#fa114f',
        backgroundColor: 'rgba(250, 17, 79, 0.1)',
        yAxisID: 'y',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
      }] : []),
      // Calories Trend
      ...(showCalories && showTrends ? [{
        label: 'Calories Trend',
        data: caloriesTrend,
        borderColor: '#fa114f',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        yAxisID: 'y',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      }] : []),
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#c8c093',
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f1f28',
        titleColor: '#e6c384',
        bodyColor: '#c8c093',
        borderColor: '#363646',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#363646',
        },
        ticks: {
          color: '#7c7c7c',
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: '#363646',
        },
        ticks: {
          color: '#7c7c7c',
        },
        title: {
          display: true,
          text: 'VO2 Max (ml/kg/min) / Calories (kcal)',
          color: '#7c7c7c',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#7c7c7c',
        },
        title: {
          display: true,
          text: 'Sleep Duration (hours)',
          color: '#7c7c7c',
        },
      },
    },
  };
  
  return (
    <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-[#e6c384] text-2xl mb-4 md:mb-0">Time Series Analysis</h2>
        
        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showVO2Max}
              onChange={(e) => setShowVO2Max(e.target.checked)}
              className="w-4 h-4 text-[#e6c384] bg-[#16161d] border-[#363646] rounded focus:ring-[#e6c384]"
            />
            <span className="text-[#7c7c7c] text-sm">VO2 Max</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSleep}
              onChange={(e) => setShowSleep(e.target.checked)}
              className="w-4 h-4 text-[#e6c384] bg-[#16161d] border-[#363646] rounded focus:ring-[#e6c384]"
            />
            <span className="text-[#7c7c7c] text-sm">Sleep</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCalories}
              onChange={(e) => setShowCalories(e.target.checked)}
              className="w-4 h-4 text-[#e6c384] bg-[#16161d] border-[#363646] rounded focus:ring-[#e6c384]"
            />
            <span className="text-[#7c7c7c] text-sm">Calories</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showTrends}
              onChange={(e) => setShowTrends(e.target.checked)}
              className="w-4 h-4 text-[#e6c384] bg-[#16161d] border-[#363646] rounded focus:ring-[#e6c384]"
            />
            <span className="text-[#7c7c7c] text-sm">Trend Lines</span>
          </label>
        </div>
      </div>
      
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>
      
      <p className="text-[#7c7c7c] text-xs mt-4">
        Trend lines show 7-day rolling averages. VO2 Max data may be sparse.
      </p>
    </div>
  );
}

