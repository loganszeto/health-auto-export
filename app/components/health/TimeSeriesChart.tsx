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
 * Displays Active Calories and Steps over time with trend lines
 */
export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const [showTrends, setShowTrends] = useState(true);
  
  if (data.length === 0) {
    return (
      <div className="border-t border-[#2a2a2a] pt-8">
        <h2 className="text-[#c8c8c8] text-xl mb-4 font-normal">Time Series</h2>
        <p className="text-[#969696]">No data available for chart.</p>
      </div>
    );
  }
  
  // Prepare chart data
  const labels = data.map(d => {
    const date = new Date(d.date + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }); // Changed to 1/1 format
  });
  
  // Map data - use 0 for null values to ensure lines connect
  const caloriesData = data.map(d => d.activeCalories ?? 0);
  const stepsData = data.map(d => d.steps ?? 0);
  
  // Trend lines - use 0 for null to ensure lines connect
  const caloriesTrend = data.map(d => d.caloriesTrend ?? 0);
  const stepsTrend = data.map(d => d.stepsTrend ?? 0);
  
  const chartData = {
    labels,
    datasets: [
      // Active Calories
      {
        label: 'Active Calories',
        data: caloriesData,
        borderColor: '#c8c8c8',
        backgroundColor: 'rgba(200, 200, 200, 0.1)',
        yAxisID: 'y',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      // Calories Trend
      ...(showTrends ? [{
        label: 'Calories Trend',
        data: caloriesTrend,
        borderColor: '#c8c8c8',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        yAxisID: 'y',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      }] : []),
      // Steps
      {
        label: 'Steps',
        data: stepsData,
        borderColor: '#969696',
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        yAxisID: 'y1',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      // Steps Trend
      ...(showTrends ? [{
        label: 'Steps Trend',
        data: stepsTrend,
        borderColor: '#969696',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        yAxisID: 'y1',
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
          color: '#c8c8c8',
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#141414',
        titleColor: '#c8c8c8',
        bodyColor: '#c8c8c8',
        borderColor: '#2a2a2a',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#2a2a2a',
        },
        ticks: {
          color: '#969696',
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: '#2a2a2a',
        },
        ticks: {
          color: '#969696',
        },
        title: {
          display: true,
          text: 'Calories (kcal)',
          color: '#969696',
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
          color: '#969696',
        },
        title: {
          display: true,
          text: 'Steps',
          color: '#969696',
        },
      },
    },
  };
  
  return (
    <div className="border-t border-[#2a2a2a] pt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-[#c8c8c8] text-xl mb-4 md:mb-0 font-normal">Time Series</h2>
        
        {/* Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTrends}
            onChange={(e) => setShowTrends(e.target.checked)}
            className="w-4 h-4 text-[#c8c8c8] bg-[#1a1a1a] border-[#2a2a2a] rounded focus:ring-[#c8c8c8]"
          />
          <span className="text-[#969696] text-sm">Trend Lines</span>
        </label>
      </div>
      
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>
      
      <p className="text-[#969696] text-xs mt-4 text-center">
        Trend lines show 7-day rolling averages.
      </p>
    </div>
  );
}

