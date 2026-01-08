/**
 * Health Data Processing Pipeline
 * 
 * Processes raw health metrics into normalized, date-based structures
 * for visualization and analysis.
 */

import { StoredHealthData, HealthMetric } from '@/lib/models/HealthData';
import { DailyHealthMetrics, HistoricalStats, TimeSeriesDataPoint, METRIC_MAPPINGS } from '@/lib/models/ProcessedHealthData';

/**
 * Normalize date to local timezone YYYY-MM-DD format
 */
function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  // Get local date components (handles timezone automatically)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Find metric by name using fuzzy matching
 */
function findMetric(metrics: HealthMetric[], names: string[]): HealthMetric | null {
  for (const name of names) {
    const metric = metrics.find(m => 
      m.name.toLowerCase().replace(/_/g, '') === name.toLowerCase().replace(/_/g, '')
    );
    if (metric) return metric;
  }
  return null;
}

/**
 * Get value for a specific date from a metric
 */
function getValueForDate(metric: HealthMetric, date: string): number | null {
  if (!metric.data || metric.data.length === 0) return null;
  
  const normalizedDate = normalizeDate(date);
  const dataPoint = metric.data.find(d => normalizeDate(d.date) === normalizedDate);
  
  return dataPoint ? dataPoint.qty : null;
}

/**
 * Aggregate values for a date (sum for totals, average for rates)
 */
function aggregateDailyValue(
  metrics: HealthMetric[],
  date: string,
  mappingNames: string[],
  aggregation: 'sum' | 'avg' | 'max' | 'min' = 'sum'
): number | null {
  const metric = findMetric(metrics, mappingNames);
  if (!metric) return null;
  
  const value = getValueForDate(metric, date);
  if (value === null) return null;
  
  // For event-based metrics, we might have multiple entries per day
  // Sum them for totals (steps, calories), average for rates (HR)
  if (aggregation === 'sum') {
    // Sum all values for this date
    const allValues = metric.data
      .filter(d => normalizeDate(d.date) === normalizeDate(date))
      .map(d => d.qty);
    
    return allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) : null;
  } else if (aggregation === 'avg') {
    const allValues = metric.data
      .filter(d => normalizeDate(d.date) === normalizeDate(date))
      .map(d => d.qty);
    
    if (allValues.length === 0) return null;
    return allValues.reduce((a, b) => a + b, 0) / allValues.length;
  } else if (aggregation === 'max') {
    const allValues = metric.data
      .filter(d => normalizeDate(d.date) === normalizeDate(date))
      .map(d => d.qty);
    
    return allValues.length > 0 ? Math.max(...allValues) : null;
  } else if (aggregation === 'min') {
    const allValues = metric.data
      .filter(d => normalizeDate(d.date) === normalizeDate(date))
      .map(d => d.qty);
    
    return allValues.length > 0 ? Math.min(...allValues) : null;
  }
  
  return value;
}

/**
 * Process raw health data into daily metrics
 */
export function processDailyMetrics(allData: StoredHealthData[]): DailyHealthMetrics[] {
  // Collect all unique dates from all metrics
  const dateSet = new Set<string>();
  
  allData.forEach(entry => {
    entry.metrics.forEach(metric => {
      metric.data.forEach(d => {
        dateSet.add(normalizeDate(d.date));
      });
    });
  });
  
  const dates = Array.from(dateSet).sort();
  
  // Process each date
  return dates.map(date => {
    // Merge metrics from ALL entries, not just the latest
    // Each export may contain different date ranges, so we need to combine them
    const allMetricsMap = new Map<string, HealthMetric>();
    
    // Collect all metrics from all entries
    allData.forEach(entry => {
      entry.metrics.forEach(metric => {
        const existingMetric = allMetricsMap.get(metric.name);
        if (existingMetric) {
          // Merge data points - combine arrays and deduplicate by date
          const existingDates = new Set(existingMetric.data.map(d => normalizeDate(d.date)));
          metric.data.forEach(dataPoint => {
            const normalizedDate = normalizeDate(dataPoint.date);
            if (!existingDates.has(normalizedDate)) {
              existingMetric.data.push(dataPoint);
              existingDates.add(normalizedDate);
            }
          });
          // Sort by date
          existingMetric.data.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        } else {
          // First time seeing this metric, add it
          allMetricsMap.set(metric.name, {
            name: metric.name,
            units: metric.units,
            data: [...metric.data],
          });
        }
      });
    });
    
    // Convert map to array
    const metrics = Array.from(allMetricsMap.values());
    
    // Activity metrics (sum for totals)
    const activeCalories = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.activeCalories, 'sum');
    const exerciseMinutes = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.exerciseMinutes, 'sum');
    const standHours = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.standHours, 'sum');
    const steps = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.steps, 'sum');
    const distance = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.distance, 'sum');
    const flightsClimbed = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.flightsClimbed, 'sum');
    
    // Heart metrics (average for rates, min/max for extremes)
    const restingHeartRate = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.restingHeartRate, 'avg');
    const averageHeartRate = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.averageHeartRate, 'avg');
    const minHeartRate = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.minHeartRate, 'min');
    const maxHeartRate = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.maxHeartRate, 'max');
    const heartRateVariability = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.heartRateVariability, 'avg');
    
    // Sleep metrics (sum for total time)
    const timeInBed = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.timeInBed, 'sum');
    const timeAsleep = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.timeAsleep, 'sum');
    
    // VO2 Max (sparse, use latest available)
    const vo2Max = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.vo2Max, 'avg');
    
    // Derive speed from distance/time if available
    // Note: This is approximate - we'd need workout data for accurate speed
    let speed: number | null = null;
    if (distance !== null && exerciseMinutes !== null && exerciseMinutes > 0) {
      // Convert distance to km, time to hours
      const distanceKm = distance / 1000; // assuming meters
      const timeHours = exerciseMinutes / 60;
      speed = distanceKm / timeHours; // km/h
    }
    
    return {
      date,
      activeCalories,
      exerciseMinutes,
      standHours,
      steps,
      distance,
      flightsClimbed,
      speed,
      restingHeartRate,
      averageHeartRate,
      minHeartRate,
      maxHeartRate,
      heartRateVariability,
      timeInBed,
      timeAsleep,
      vo2Max,
    };
  });
}

function createEmptyDailyMetrics(date: string): DailyHealthMetrics {
  return {
    date,
    activeCalories: null,
    exerciseMinutes: null,
    standHours: null,
    steps: null,
    distance: null,
    flightsClimbed: null,
    speed: null,
    restingHeartRate: null,
    averageHeartRate: null,
    minHeartRate: null,
    maxHeartRate: null,
    heartRateVariability: null,
    timeInBed: null,
    timeAsleep: null,
    vo2Max: null,
  };
}

/**
 * Compute historical statistics for all metrics
 */
export function computeHistoricalStats(dailyMetrics: DailyHealthMetrics[]): HistoricalStats[] {
  const stats: HistoricalStats[] = [];
  
  // Helper to compute stats for a metric
  const computeStats = (
    values: (number | null)[],
    metricName: string,
    unit: string
  ): HistoricalStats | null => {
    const validValues = values.filter((v): v is number => v !== null);
    if (validValues.length === 0) return null;
    
    return {
      metric: metricName,
      min: Math.min(...validValues),
      max: Math.max(...validValues),
      mean: validValues.reduce((a, b) => a + b, 0) / validValues.length,
      unit,
    };
  };
  
  // Activity metrics
  const activeCaloriesStats = computeStats(
    dailyMetrics.map(d => d.activeCalories),
    'Active Calories',
    'kcal'
  );
  if (activeCaloriesStats) stats.push(activeCaloriesStats);
  
  const exerciseStats = computeStats(
    dailyMetrics.map(d => d.exerciseMinutes),
    'Exercise Minutes',
    'min'
  );
  if (exerciseStats) stats.push(exerciseStats);
  
  const standStats = computeStats(
    dailyMetrics.map(d => d.standHours),
    'Stand Hours',
    'hrs'
  );
  if (standStats) stats.push(standStats);
  
  const stepsStats = computeStats(
    dailyMetrics.map(d => d.steps),
    'Steps',
    'steps'
  );
  if (stepsStats) stats.push(stepsStats);
  
  const distanceStats = computeStats(
    dailyMetrics.map(d => d.distance),
    'Distance',
    'm'
  );
  if (distanceStats) stats.push(distanceStats);
  
  // Heart metrics
  const restingHRStats = computeStats(
    dailyMetrics.map(d => d.restingHeartRate),
    'Resting HR',
    'bpm'
  );
  if (restingHRStats) stats.push(restingHRStats);
  
  const avgHRStats = computeStats(
    dailyMetrics.map(d => d.averageHeartRate),
    'Average HR',
    'bpm'
  );
  if (avgHRStats) stats.push(avgHRStats);
  
  // Sleep metrics
  const sleepStats = computeStats(
    dailyMetrics.map(d => d.timeAsleep),
    'Sleep Duration',
    'min'
  );
  if (sleepStats) stats.push(sleepStats);
  
  // VO2 Max
  const vo2Stats = computeStats(
    dailyMetrics.map(d => d.vo2Max),
    'VO2 Max',
    'ml/kg/min'
  );
  if (vo2Stats) stats.push(vo2Stats);
  
  return stats;
}

/**
 * Compute rolling average for trend lines
 */
function rollingAverage(values: (number | null)[], window: number, index: number): number | null {
  const start = Math.max(0, index - Math.floor(window / 2));
  const end = Math.min(values.length, index + Math.ceil(window / 2));
  
  const windowValues = values.slice(start, end).filter((v): v is number => v !== null);
  if (windowValues.length === 0) return null;
  
  return windowValues.reduce((a, b) => a + b, 0) / windowValues.length;
}

/**
 * Generate time series data with trend lines
 */
export function generateTimeSeries(
  dailyMetrics: DailyHealthMetrics[],
  trendWindow: number = 7
): TimeSeriesDataPoint[] {
  return dailyMetrics.map((day, index) => {
    const vo2MaxTrend = day.vo2Max !== null
      ? rollingAverage(
          dailyMetrics.map(d => d.vo2Max),
          trendWindow,
          index
        )
      : null;
    
    const sleepTrend = day.timeAsleep !== null
      ? rollingAverage(
          dailyMetrics.map(d => d.timeAsleep),
          trendWindow,
          index
        )
      : null;
    
    const caloriesTrend = day.activeCalories !== null
      ? rollingAverage(
          dailyMetrics.map(d => d.activeCalories),
          trendWindow,
          index
        )
      : null;
    
    return {
      date: day.date,
      vo2Max: day.vo2Max,
      sleepDuration: day.timeAsleep,
      activeCalories: day.activeCalories,
      vo2MaxTrend,
      sleepTrend,
      caloriesTrend,
    };
  });
}

