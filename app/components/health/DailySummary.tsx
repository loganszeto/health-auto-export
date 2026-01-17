'use client';

import { DailyHealthMetrics } from '@/lib/models/ProcessedHealthData';
import ActivityRings from './ActivityRings';

interface DailySummaryProps {
  dailyData: DailyHealthMetrics;
  onPreviousDay: () => void;
  onNextDay: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export default function DailySummary({
  dailyData,
  onPreviousDay,
  onNextDay,
  canGoPrevious,
  canGoNext,
}: DailySummaryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} - ${day} - ${year}`;
  };

  const formatDistance = (meters: number | null) => {
    if (meters === null) return 'N/A';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  return (
    <div className="border-t border-[#2a2a2a] pt-8">
      {/* Date Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPreviousDay}
          disabled={!canGoPrevious}
          className="text-[#969696] hover:text-[#c8c8c8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          ← Previous
        </button>
        <h2 className="text-[#c8c8c8] text-xl font-normal">
          {formatDate(dailyData.date)}
        </h2>
        <button
          onClick={onNextDay}
          disabled={!canGoNext}
          className="text-[#969696] hover:text-[#c8c8c8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Next →
        </button>
      </div>

      {/* Activity Rings */}
      <div className="flex justify-center mb-8">
        <ActivityRings
          moveValue={dailyData.activeCalories || 0}
          moveGoal={600}
          exerciseValue={dailyData.exerciseMinutes || 0}
          exerciseGoal={30}
          standValue={dailyData.standHours || 0}
          standGoal={12}
        />
      </div>

      {/* All Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Metrics */}
        <div className="border-t border-[#2a2a2a] pt-6">
          <h3 className="text-[#c8c8c8] text-lg mb-4 font-normal">Activity</h3>
          <div className="space-y-3">
            {dailyData.steps !== null && (
              <div>
                <div className="text-[#969696] text-sm">Steps</div>
                <div className="text-[#c8c8c8] text-2xl font-normal">
                  {dailyData.steps.toLocaleString()}
                </div>
              </div>
            )}
            {dailyData.distance !== null && (
              <div>
                <div className="text-[#969696] text-sm">Distance</div>
                <div className="text-[#c8c8c8] text-xl font-normal">
                  {formatDistance(dailyData.distance)}
                </div>
              </div>
            )}
            {dailyData.flightsClimbed !== null && (
              <div>
                <div className="text-[#969696] text-sm">Flights Climbed</div>
                <div className="text-[#c8c8c8] text-xl font-normal">
                  {Math.round(dailyData.flightsClimbed)}
                </div>
              </div>
            )}
            {dailyData.activeCalories !== null && (
              <div>
                <div className="text-[#969696] text-sm">Active Calories</div>
                <div className="text-[#c8c8c8] text-xl font-normal">
                  {Math.round(dailyData.activeCalories)} kcal
                </div>
              </div>
            )}
            {dailyData.exerciseMinutes !== null && (
              <div>
                <div className="text-[#969696] text-sm">Exercise Minutes</div>
                <div className="text-[#c8c8c8] text-xl font-normal">
                  {Math.round(dailyData.exerciseMinutes)} min
                </div>
              </div>
            )}
            {dailyData.standHours !== null && (
              <div>
                <div className="text-[#969696] text-sm">Stand Hours</div>
                <div className="text-[#c8c8c8] text-xl font-normal">
                  {dailyData.standHours.toFixed(1)} hrs
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Heart Metrics */}
        <div className="border-t border-[#2a2a2a] pt-6">
          <h3 className="text-[#c8c8c8] text-lg mb-4 font-normal">Heart</h3>
          <div className="space-y-3">
            {dailyData.averageHeartRate !== null && (
              <div>
                <div className="text-[#969696] text-sm">Average HR</div>
                <div className="text-[#c8c8c8] text-2xl font-normal">
                  {Math.round(dailyData.averageHeartRate)} bpm
                </div>
              </div>
            )}
            {dailyData.restingHeartRate !== null && (
              <div>
                <div className="text-[#969696] text-sm">Resting HR</div>
                <div className="text-[#c8c8c8] text-xl font-normal">
                  {Math.round(dailyData.restingHeartRate)} bpm
                </div>
              </div>
            )}
            {dailyData.minHeartRate !== null && (
              <div>
                <div className="text-[#969696] text-sm">Min HR</div>
                <div className="text-[#c8c8c8] text-xl font-normal">
                  {Math.round(dailyData.minHeartRate)} bpm
                </div>
              </div>
            )}
            {dailyData.maxHeartRate !== null && (
              <div>
                <div className="text-[#969696] text-sm">Max HR</div>
                <div className="text-[#c8c8c8] text-xl font-normal">
                  {Math.round(dailyData.maxHeartRate)} bpm
                </div>
              </div>
            )}
            {dailyData.averageHeartRate === null &&
             dailyData.restingHeartRate === null &&
             dailyData.minHeartRate === null &&
             dailyData.maxHeartRate === null && (
              <div className="text-[#969696] text-sm">No heart data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
