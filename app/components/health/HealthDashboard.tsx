'use client';

import { useEffect, useState } from 'react';
import { StoredHealthData } from '@/lib/models/HealthData';
import {
  processDailyMetrics,
  generateTimeSeries,
} from '@/lib/utils/healthDataProcessor';
import { DailyHealthMetrics } from '@/lib/models/ProcessedHealthData';
import DailySummary from './DailySummary';
import TimeSeriesChart from './TimeSeriesChart';

export default function HealthDashboard() {
  const [rawData, setRawData] = useState<StoredHealthData[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<DailyHealthMetrics[]>([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data after component mounts
    const timer = setTimeout(() => {
      fetchHealthData();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (rawData.length > 0) {
      // Process asynchronously to prevent blocking
      const processData = async () => {
        try {
          // Yield to browser to prevent blocking
          await new Promise(resolve => setTimeout(resolve, 0));
          
          const processed = processDailyMetrics(rawData);
          if (processed.length > 0) {
            setDailyMetrics(processed);
            // Set to most recent day (last index since dates are ascending)
            setSelectedDateIndex(processed.length - 1);
          } else {
            setDailyMetrics([]);
          }
        } catch (error) {
          console.error('Error processing data:', error);
          setError(`Error processing health data: ${error instanceof Error ? error.message : String(error)}`);
          setDailyMetrics([]);
        }
      };
      
      processData();
    } else {
      setDailyMetrics([]);
    }
  }, [rawData]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/data?days=30');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        // Process all exports (API already limits to 30 days)
        setRawData(result.data);
      } else {
        setError('No health data available. Make sure Health Auto Export is configured and syncing.');
        setRawData([]);
      }
    } catch (err) {
      setError(`Error loading health data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setRawData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousDay = () => {
    // Previous = go to older date = decrease index (dates are ascending)
    if (selectedDateIndex > 0) {
      setSelectedDateIndex(selectedDateIndex - 1);
    }
  };

  const handleNextDay = () => {
    // Next = go to newer date = increase index (dates are ascending)
    if (selectedDateIndex < dailyMetrics.length - 1) {
      setSelectedDateIndex(selectedDateIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="border-t border-[#2a2a2a] pt-8">
        <p className="text-[#969696]">Loading health data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t border-[#2a2a2a] pt-8">
        <p className="text-[#969696]">{error}</p>
        <button
          onClick={fetchHealthData}
          className="mt-4 px-4 py-2 bg-[#2a2a2a] text-[#c8c8c8] rounded hover:bg-[#3a3a3a] transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (dailyMetrics.length === 0) {
    return (
      <div className="border-t border-[#2a2a2a] pt-8">
        <p className="text-[#969696]">No processed health data available.</p>
        <button
          onClick={fetchHealthData}
          className="mt-4 px-4 py-2 bg-[#2a2a2a] text-[#c8c8c8] rounded hover:bg-[#3a3a3a] transition-colors text-sm"
        >
          Refresh
        </button>
      </div>
    );
  }

  const selectedDay = dailyMetrics[selectedDateIndex];
  const timeSeriesData = generateTimeSeries(dailyMetrics, 7, 30); // 7-day trend, 30 days shown

  return (
    <div className="space-y-8">
      <DailySummary
        dailyData={selectedDay}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        canGoPrevious={selectedDateIndex > 0}
        canGoNext={selectedDateIndex < dailyMetrics.length - 1}
      />

      <TimeSeriesChart data={timeSeriesData} />
    </div>
  );
}
