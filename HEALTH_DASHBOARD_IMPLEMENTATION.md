# Health Dashboard Implementation

## Overview

This document describes the comprehensive health dashboard implementation that transforms raw Apple Health data into an intuitive, Apple Watch-style visualization.

## Data Model

### Unified Schema (`ProcessedHealthData.ts`)

The `DailyHealthMetrics` interface normalizes all health data into a date-based structure:

- **Activity Metrics**: activeCalories, exerciseMinutes, standHours, steps, distance, flightsClimbed, speed (derived)
- **Heart Metrics**: restingHeartRate, averageHeartRate, minHeartRate, maxHeartRate, heartRateVariability
- **Sleep Metrics**: timeInBed, timeAsleep (both in minutes)
- **Cardio Fitness**: vo2Max (sparse data)

### Metric Mapping

The system uses fuzzy matching to map Health Auto Export metric names to our unified model. Common mappings include:
- `active_energy_burned` → `activeCalories`
- `apple_exercise_time` → `exerciseMinutes`
- `heart_rate` → `averageHeartRate`
- `sleep_time_asleep` → `timeAsleep`

## Processing Pipeline

### 1. Data Collection (`healthDataProcessor.ts`)

- Collects all metrics from all stored data entries
- Normalizes dates to local timezone (YYYY-MM-DD format)
- Handles timezone variations automatically

### 2. Date Normalization

All dates are normalized to local timezone using JavaScript's `Date` object, ensuring consistent daily aggregation regardless of timezone in source data.

### 3. Aggregation Rules

- **Sum aggregation**: Steps, calories, distance, exercise minutes (daily totals)
- **Average aggregation**: Heart rates (average values)
- **Min/Max aggregation**: Heart rate extremes
- **Latest value**: VO2 Max (sparse data)

### 4. Derived Metrics

- **Speed**: Calculated from distance/exercise time (km/h)
- **Trend lines**: 7-day rolling averages for VO2 Max, sleep, and calories

### 5. Historical Statistics

Computes min, max, and mean for all available metrics across all historical data.

## UI Components

### Section A: Daily Summary (`DailySummary.tsx`)

**Features:**
- Date header with left/right navigation
- Apple Activity Rings visualization (Move, Exercise, Stand)
- Three-column layout:
  - **Activity**: Steps, Distance, Flights, Speed, Move ring value
  - **Heart**: Average HR, Min HR, Max HR, Resting HR
  - **Sleep**: In Bed time, Asleep time
- Graceful "no data" states

**Activity Rings (`ActivityRings.tsx`):**
- Concentric circles matching Apple Watch design
- Colors: Red (Move), Green (Exercise), Yellow (Stand)
- Progress calculated as percentage of goals (600 kcal, 30 min, 12 hrs)
- Smooth animations with CSS transitions

### Section B: Historical Averages (`HistoricalAverages.tsx`)

**Features:**
- Grid layout showing all available metrics
- Range bar visualization:
  - Full bar shows min-to-max range
  - White indicator shows mean position
- Statistics display: Min, Max, Mean with units
- Automatically updates when new data arrives

### Time Series Chart (`TimeSeriesChart.tsx`)

**Features:**
- Three-line visualization:
  - VO2 Max (blue)
  - Sleep Duration (yellow, converted to hours)
  - Active Calories (red)
- **Dual Y-axes**:
  - Left: VO2 Max and Calories
  - Right: Sleep Duration (hours)
- **Toggles**:
  - Show/hide each series independently
  - Show/hide trend lines (7-day rolling averages)
- Handles sparse VO2 Max data (shows gaps, no interpolation)
- Trend lines use dashed style to distinguish from raw data

**Chart Library**: Chart.js with react-chartjs-2

## API Updates

### `/api/data` Endpoint

Updated to fetch all historical data (default: 365 days) instead of just the latest entry. This enables:
- Historical analysis
- Trend computation
- Statistical calculations

## Data Assumptions & Handling

### Missing Fields

- **Speed**: Derived from distance/exercise time if available, otherwise hidden
- **VO2 Max**: Sparse data - chart shows gaps, no interpolation
- **HRV**: Only shown if available in data
- **Flights Climbed**: Only shown if available

### Timezone Handling

All dates normalized to local timezone using JavaScript Date object. Assumes user wants everything in their local date regardless of source timezone.

### Duplicate Prevention

The aggregation functions sum all values for a given date, preventing double-counting when multiple entries exist for the same day.

## Usage

The dashboard automatically:
1. Fetches all historical data on load
2. Processes it into daily metrics
3. Displays the most recent day by default
4. Allows navigation through historical days
5. Updates every 5 minutes

## Future Enhancements

Potential additions:
- Customizable activity ring goals
- Weekly/monthly views
- Export functionality
- Comparison with previous periods
- Workout detection and analysis
- Sleep quality metrics (if available)

