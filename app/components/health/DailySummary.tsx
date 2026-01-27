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
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) {
      return dateString;
    }
    return `${month} - ${day} - ${year}`;
  };

  const formatDistance = (meters: number | null) => {
    if (meters === null) return '0 mi';
    // Convert meters to miles (1 meter = 0.000621371 miles)
    const miles = meters * 0.000621371;
    return `${miles.toFixed(2)} mi`;
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

      {/* Activity Rings - only show if there's actual activity data */}
      {((dailyData.activeCalories !== null && dailyData.activeCalories > 0) ||
        (dailyData.exerciseMinutes !== null && dailyData.exerciseMinutes > 0) ||
        (dailyData.standHours !== null && dailyData.standHours > 0)) && (
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
      )}

      {/* All Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Metrics */}
        <div className="border-t border-[#2a2a2a] pt-6">
          <h3 className="text-[#c8c8c8] text-lg mb-4 font-normal">Activity</h3>
          <div className="space-y-3">
            <div>
              <div className="text-[#969696] text-sm">Steps</div>
              <div className="text-[#c8c8c8] text-2xl font-normal">
                {dailyData.steps !== null ? dailyData.steps.toLocaleString() : '0'}
              </div>
            </div>
            <div>
              <div className="text-[#969696] text-sm">Distance</div>
              <div className="text-[#c8c8c8] text-xl font-normal">
                {dailyData.distance !== null ? formatDistance(dailyData.distance) : '0 m'}
              </div>
            </div>
            <div>
              <div className="text-[#969696] text-sm">Flights Climbed</div>
              <div className="text-[#c8c8c8] text-xl font-normal">
                {dailyData.flightsClimbed !== null ? Math.round(dailyData.flightsClimbed) : '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Heart Metrics */}
        <div className="border-t border-[#2a2a2a] pt-6">
          <h3 className="text-[#c8c8c8] text-lg mb-4 font-normal">Heart</h3>
          <div className="space-y-3">
            {dailyData.restingHeartRate !== null ? (
              <div>
                <div className="text-[#969696] text-sm">Resting HR</div>
                <div className="text-[#c8c8c8] text-2xl font-normal">
                  {Math.round(dailyData.restingHeartRate)} bpm
                </div>
              </div>
            ) : (
              <div className="text-[#969696] text-sm">No heart data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
