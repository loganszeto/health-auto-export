'use client';

import { useEffect, useState } from 'react';
import { StoredHealthData } from '@/lib/models/HealthData';

export default function HealthDashboard() {
  const [healthData, setHealthData] = useState<StoredHealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchHealthData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchHealthData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/data?limit=1&days=30');
      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        setHealthData(result.data);
        setLastUpdated(new Date(result.data[0].timestamp));
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

  const getMetricValue = (metricName: string): number | null => {
    if (!healthData[0]?.metrics) return null;
    const metric = healthData[0].metrics.find(m => 
      m.name.toLowerCase().includes(metricName.toLowerCase())
    );
    if (!metric || !metric.data || metric.data.length === 0) return null;
    return metric.data[metric.data.length - 1]?.qty || null;
  };

  const formatMetric = (value: number | null, unit: string): string => {
    if (value === null) return 'N/A';
    return `${Math.round(value)} ${unit}`;
  };

  if (loading) {
    return (
      <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-8">
        <p className="text-gray-400">Loading health data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const activeEnergy = getMetricValue('active_energy');
  const heartRate = getMetricValue('heart_rate');
  const steps = getMetricValue('step_count');
  const sleepHours = getMetricValue('sleep');

  return (
    <div className="space-y-6">
      {lastUpdated && (
        <div className="bg-[#16161d] border border-[#363646] rounded p-4">
          <p className="text-[#7c7c7c] text-sm">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      )}

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-6">
          <h3 className="text-[#e6c384] text-lg mb-2">Active Energy</h3>
          <p className="text-gray-400 text-2xl font-bold">
            {formatMetric(activeEnergy, 'kcal')}
          </p>
        </div>

        <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-6">
          <h3 className="text-[#e6c384] text-lg mb-2">Heart Rate</h3>
          <p className="text-gray-400 text-2xl font-bold">
            {formatMetric(heartRate, 'bpm')}
          </p>
        </div>

        <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-6">
          <h3 className="text-[#e6c384] text-lg mb-2">Steps</h3>
          <p className="text-gray-400 text-2xl font-bold">
            {formatMetric(steps, 'steps')}
          </p>
        </div>

        <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-6">
          <h3 className="text-[#e6c384] text-lg mb-2">Sleep</h3>
          <p className="text-gray-400 text-2xl font-bold">
            {formatMetric(sleepHours, 'hrs')}
          </p>
        </div>
      </div>

      {/* All Metrics */}
      <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-8">
        <h2 className="text-[#e6c384] text-2xl mb-4">All Health Metrics</h2>
        <div className="space-y-4">
          {healthData[0]?.metrics.map((metric, index) => (
            <div key={index} className="bg-[#16161d] border border-[#363646] rounded p-4">
              <h3 className="text-[#e6c384] text-lg mb-2 capitalize">
                {metric.name.replace(/_/g, ' ')}
              </h3>
              <p className="text-gray-400 text-sm mb-2">Unit: {metric.units}</p>
              {metric.data && metric.data.length > 0 && (
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">
                    Latest: {metric.data[metric.data.length - 1]?.qty} {metric.units}
                  </p>
                  <p className="text-[#7c7c7c] text-xs">
                    Data points: {metric.data.length}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

