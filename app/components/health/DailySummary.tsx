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
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (minutes: number | null) => {
    if (minutes === null) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };
  
  const formatDistance = (meters: number | null) => {
    if (meters === null) return 'N/A';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };
  
  const hasNoData = 
    dailyData.activeCalories === null &&
    dailyData.exerciseMinutes === null &&
    dailyData.standHours === null &&
    dailyData.steps === null;
  
  return (
    <div className="border-t border-[#2a2a2a] pt-8">
      {/* Date Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPreviousDay}
          disabled={!canGoPrevious}
          className="text-[#969696] hover:text-[#c8c8c8] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm"
        >
          ← Previous
        </button>
        <h2 className="text-[#c8c8c8] text-xl font-normal">
          {formatDate(dailyData.date)}
        </h2>
        <button
          onClick={onNextDay}
          disabled={!canGoNext}
          className="text-[#969696] hover:text-[#c8c8c8] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm"
        >
          Next →
        </button>
      </div>
      
      {hasNoData ? (
        <div className="text-center py-12">
          <p className="text-[#969696] text-base">No data available for this day</p>
        </div>
      ) : (
        <>
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
          
          {/* Two-Column Metrics Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity Column */}
            <div className="border-t border-[#2a2a2a] pt-6">
              <h3 className="text-[#c8c8c8] text-lg mb-4 font-normal">Activity</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-[#969696] text-sm">Steps</div>
                  <div className="text-[#c8c8c8] text-2xl font-normal">
                    {dailyData.steps?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[#969696] text-sm">Distance</div>
                  <div className="text-[#c8c8c8] text-xl font-normal">
                    {formatDistance(dailyData.distance)}
                  </div>
                </div>
                {dailyData.flightsClimbed !== null && (
                  <div>
                    <div className="text-[#969696] text-sm">Flights Climbed</div>
                    <div className="text-[#c8c8c8] text-xl font-normal">
                      {Math.round(dailyData.flightsClimbed)}
                    </div>
                  </div>
                )}
                {dailyData.speed !== null && (
                  <div>
                    <div className="text-[#969696] text-sm">Avg Speed</div>
                    <div className="text-[#c8c8c8] text-xl font-normal">
                      {dailyData.speed.toFixed(1)} km/h
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-[#2a2a2a]">
                  <div className="text-[#969696] text-xs">Move Ring</div>
                  <div className="text-[#c8c8c8] text-lg font-normal">
                    {Math.round(dailyData.activeCalories || 0)} / 600 kcal
                  </div>
                </div>
              </div>
            </div>
            
            {/* Heart Column */}
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
                {dailyData.restingHeartRate !== null && (
                  <div>
                    <div className="text-[#969696] text-sm">Resting HR</div>
                    <div className="text-[#c8c8c8] text-xl font-normal">
                      {Math.round(dailyData.restingHeartRate)} bpm
                    </div>
                  </div>
                )}
                {dailyData.averageHeartRate === null && 
                 dailyData.minHeartRate === null && 
                 dailyData.maxHeartRate === null && 
                 dailyData.restingHeartRate === null && (
                  <div className="text-[#969696] text-sm">No heart data available</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

