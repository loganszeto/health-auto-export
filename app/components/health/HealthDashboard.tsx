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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchHealthData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (rawData.length > 0) {
      // Process raw data into daily metrics
      const processed = processDailyMetrics(rawData);
      setDailyMetrics(processed);
      // Set selected date to most recent day (index 0, since dates are sorted descending)
      if (processed.length > 0) {
        setSelectedDateIndex(0);
      }
    }
  }, [rawData]);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/data?days=365'); // Fetch 1 year of data
      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        setRawData(result.data);
        setError(null);
      } else {
        setError('No health data available yet. Make sure Health Auto Export is configured and syncing.');
      }
    } catch (err) {
      setError('Error loading health data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousDay = () => {
    // Go backwards in time (to older dates) = decrease index
    if (selectedDateIndex > 0) {
      setSelectedDateIndex(selectedDateIndex - 1);
    }
  };

  const handleNextDay = () => {
    // Go forwards in time (to newer dates) = increase index
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
      </div>
    );
  }

  if (dailyMetrics.length === 0) {
    return (
      <div className="border-t border-[#2a2a2a] pt-8">
        <p className="text-[#969696]">No processed health data available.</p>
      </div>
    );
  }

  const selectedDay = dailyMetrics[selectedDateIndex];
  const timeSeriesData = generateTimeSeries(dailyMetrics);

  return (
    <div className="space-y-8">
      {/* Section A: Daily Summary */}
      <DailySummary
        dailyData={selectedDay}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        canGoPrevious={selectedDateIndex > 0}
        canGoNext={selectedDateIndex < dailyMetrics.length - 1}
      />

      {/* Time Series Chart */}
      <TimeSeriesChart data={timeSeriesData} />
    </div>
  );
}
