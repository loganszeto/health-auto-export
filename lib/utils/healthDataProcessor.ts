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
 * Handles timezone correctly - uses the date in the user's local timezone
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
 * Get hour (0-23) from date string in local timezone
 */
function getLocalHour(dateString: string): number {
  const date = new Date(dateString);
  return date.getHours();
}

/**
 * Find metric by name using fuzzy matching
 */
function findMetric(metrics: HealthMetric[], names: string[]): HealthMetric | null {
  if (!metrics || metrics.length === 0) return null;
  
  for (const name of names) {
    // Try exact match first
    let metric = metrics.find(m => 
      m.name && m.name.toLowerCase() === name.toLowerCase()
    );
    if (metric) return metric;
    
    // Try match without underscores
    metric = metrics.find(m => 
      m.name && m.name.toLowerCase().replace(/_/g, '') === name.toLowerCase().replace(/_/g, '')
    );
    if (metric) return metric;
    
    // Try partial match (contains)
    metric = metrics.find(m => 
      m.name && (
        m.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(m.name.toLowerCase())
      )
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
  if (!allData || allData.length === 0) {
    return [];
  }
  
  // Collect all unique dates from all metrics
  const dateSet = new Set<string>();
  
  allData.forEach(entry => {
    if (!entry.metrics) return;
    entry.metrics.forEach(metric => {
      if (!metric.data || metric.data.length === 0) return;
      metric.data.forEach(d => {
        if (d && d.date) {
          dateSet.add(normalizeDate(d.date));
        }
      });
    });
  });
  
  const dates = Array.from(dateSet).sort(); // Oldest first (ascending)
  
  if (dates.length === 0) {
    return [];
  }
  
  // Process each date
  return dates.map(date => {
    // Merge metrics from ALL entries, not just the latest
    // Each export may contain different date ranges, so we need to combine them
    const allMetricsMap = new Map<string, HealthMetric>();
    
    // Collect all metrics from all entries
    // For bucketed data, we need to keep ALL data points (they're incremental contributions)
    allData.forEach(entry => {
      if (!entry.metrics) return;
      entry.metrics.forEach(metric => {
        if (!metric.data || metric.data.length === 0) return;
        
        const existingMetric = allMetricsMap.get(metric.name);
        if (existingMetric) {
          // Merge data points - keep ALL data points (they're bucketed contributions to be summed)
          // Only filter out exact duplicates (same timestamp AND same value)
          metric.data.forEach(dataPoint => {
            if (!dataPoint || !dataPoint.date) return;
            // Check if this exact data point already exists
            const isDuplicate = existingMetric.data.some(
              d => d.date === dataPoint.date && Math.abs(d.qty - dataPoint.qty) < 0.0001
            );
            if (!isDuplicate) {
              existingMetric.data.push(dataPoint);
            }
          });
          // Sort by date/time
          existingMetric.data.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        } else {
          // First time seeing this metric, add it
          allMetricsMap.set(metric.name, {
            name: metric.name,
            units: metric.units,
            data: metric.data.filter(d => d && d.date), // Filter out invalid entries
          });
        }
      });
    });
    
    // Convert map to array
    const metrics = Array.from(allMetricsMap.values());
    
    // Activity metrics - these are BUCKETED CONTRIBUTIONS that need to be SUMMED
    // Each data point is an incremental contribution to the daily total
    let activeCalories = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.activeCalories, 'sum');
    if (activeCalories !== null) {
      activeCalories = Math.round(activeCalories); // Round to whole kcal
    }
    
    let exerciseMinutes = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.exerciseMinutes, 'sum');
    if (exerciseMinutes !== null) {
      exerciseMinutes = Math.round(exerciseMinutes); // Round to whole minutes
    }
    
    let steps = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.steps, 'sum');
    if (steps !== null) {
      steps = Math.round(steps); // Round to whole steps
    }
    
    // Distance - convert from miles to meters if needed
    let distance = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.distance, 'sum');
    if (distance !== null) {
      const distanceMetric = findMetric(metrics, METRIC_MAPPINGS.distance);
      if (distanceMetric && distanceMetric.units) {
        const unitsLower = distanceMetric.units.toLowerCase();
        // If in miles, convert to meters
        if (unitsLower.includes('mi') || unitsLower === 'mile' || unitsLower === 'miles') {
          distance = distance * 1609.34; // miles to meters
        }
        // If already in meters or km, keep as is (assuming meters)
      }
    }
    
    let flightsClimbed = aggregateDailyValue(metrics, date, METRIC_MAPPINGS.flightsClimbed, 'sum');
    if (flightsClimbed !== null) {
      flightsClimbed = Math.round(flightsClimbed); // Round to whole flights
    }
    
    // Stand Hours - special calculation: count distinct hours with ≥1 minute of stand time
    // Stand ring = number of hours (0-23) where you stood at least 1 minute
    let standHours: number | null = null;
    const standMetric = findMetric(metrics, METRIC_MAPPINGS.standHours);
    if (standMetric && standMetric.data) {
      // Group stand minutes by hour for this date
      const standMinutesByHour = new Map<number, number>();
      standMetric.data.forEach(d => {
        if (normalizeDate(d.date) === date) {
          const hour = getLocalHour(d.date);
          const current = standMinutesByHour.get(hour) || 0;
          standMinutesByHour.set(hour, current + d.qty);
        }
      });
      
      // Count hours with ≥1 minute of stand time
      let hoursWithStand = 0;
      standMinutesByHour.forEach((minutes, hour) => {
        if (minutes >= 1.0) {
          hoursWithStand++;
        }
      });
      
      standHours = hoursWithStand > 0 ? hoursWithStand : null;
    }
    
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
    const caloriesTrend = day.activeCalories !== null
      ? rollingAverage(
          dailyMetrics.map(d => d.activeCalories),
          trendWindow,
          index
        )
      : null;
    
    const stepsTrend = day.steps !== null
      ? rollingAverage(
          dailyMetrics.map(d => d.steps),
          trendWindow,
          index
        )
      : null;
    
    return {
      date: day.date,
      activeCalories: day.activeCalories,
      steps: day.steps,
      caloriesTrend,
      stepsTrend,
    };
  });
}

