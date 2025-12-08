/**
 * Unified Health Data Model
 * 
 * This model processes raw health metrics into a normalized, date-based structure
 * suitable for visualization and analysis.
 */

export interface DailyHealthMetrics {
  date: string; // YYYY-MM-DD format, normalized to local timezone
  
  // Activity Metrics
  activeCalories: number | null; // Move ring - active calories burned
  exerciseMinutes: number | null; // Exercise ring - minutes of exercise
  standHours: number | null; // Stand ring - hours stood (typically 0-12)
  steps: number | null;
  distance: number | null; // in meters or km
  flightsClimbed: number | null;
  speed: number | null; // derived from distance/time if available
  
  // Heart Metrics
  restingHeartRate: number | null; // bpm
  averageHeartRate: number | null; // bpm
  minHeartRate: number | null; // bpm
  maxHeartRate: number | null; // bpm
  heartRateVariability: number | null; // ms (if available)
  
  // Sleep Metrics
  timeInBed: number | null; // minutes
  timeAsleep: number | null; // minutes
  
  // Cardio Fitness
  vo2Max: number | null; // ml/kg/min (sparse data)
}

export interface HistoricalStats {
  metric: string;
  min: number;
  max: number;
  mean: number;
  unit: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  vo2Max: number | null;
  sleepDuration: number | null; // minutes
  activeCalories: number | null;
  // Trend lines (computed)
  vo2MaxTrend?: number | null;
  sleepTrend?: number | null;
  caloriesTrend?: number | null;
}

/**
 * Processing Pipeline
 * 
 * Steps:
 * 1. Collect all metrics from all stored data entries
 * 2. Normalize dates to local timezone (YYYY-MM-DD)
 * 3. Aggregate metrics by date (sum for daily totals, average for rates)
 * 4. Derive missing metrics where possible (e.g., speed from distance/time)
 * 5. Compute historical statistics
 * 6. Generate time series data with trend lines
 */

export interface MetricMapping {
  // Map from Health Auto Export metric names to our unified model
  activeCalories: string[];
  exerciseMinutes: string[];
  standHours: string[];
  steps: string[];
  distance: string[];
  flightsClimbed: string[];
  restingHeartRate: string[];
  averageHeartRate: string[];
  minHeartRate: string[];
  maxHeartRate: string[];
  heartRateVariability: string[];
  timeInBed: string[];
  timeAsleep: string[];
  vo2Max: string[];
}

/**
 * Default metric name mappings
 * Health Auto Export uses various naming conventions, so we try multiple matches
 */
export const METRIC_MAPPINGS: MetricMapping = {
  activeCalories: ['active_energy_burned', 'active_energy', 'active_calories'],
  exerciseMinutes: ['apple_exercise_time', 'exercise_time', 'exercise_minutes'],
  standHours: ['apple_stand_time', 'stand_time', 'stand_hours'],
  steps: ['step_count', 'steps'],
  distance: ['distance_walking_running', 'distance', 'walking_distance'],
  flightsClimbed: ['flights_climbed', 'flights'],
  restingHeartRate: ['resting_heart_rate', 'resting_hr'],
  averageHeartRate: ['heart_rate', 'average_heart_rate', 'avg_hr'],
  minHeartRate: ['min_heart_rate', 'heart_rate_min'],
  maxHeartRate: ['max_heart_rate', 'heart_rate_max'],
  heartRateVariability: ['heart_rate_variability_sdnn', 'hrv'],
  timeInBed: ['sleep_time_in_bed', 'time_in_bed'],
  timeAsleep: ['sleep_time_asleep', 'time_asleep', 'sleep_duration'],
  vo2Max: ['vo2_max', 'cardio_fitness', 'vo2max'],
};

