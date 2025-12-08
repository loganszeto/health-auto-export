'use client';

/**
 * Apple Activity Rings Component
 * 
 * Displays Move, Exercise, and Stand rings in Apple Watch style
 */

interface ActivityRingsProps {
  moveValue: number; // Active calories
  moveGoal: number; // Default: 600 kcal
  exerciseValue: number; // Exercise minutes
  exerciseGoal: number; // Default: 30 minutes
  standValue: number; // Stand hours
  standGoal: number; // Default: 12 hours
}

export default function ActivityRings({
  moveValue,
  moveGoal = 600,
  exerciseValue,
  exerciseGoal = 30,
  standValue,
  standGoal = 12,
}: ActivityRingsProps) {
  const moveProgress = Math.min(moveValue / moveGoal, 1);
  const exerciseProgress = Math.min(exerciseValue / exerciseGoal, 1);
  const standProgress = Math.min(standValue / standGoal, 1);
  
  // Ring colors (Apple Watch style)
  const moveColor = '#fa114f'; // Red
  const exerciseColor = '#00d9ff'; // Green
  const standColor = '#ffd60a'; // Yellow
  
  // SVG dimensions
  const size = 200;
  const center = size / 2;
  const radius = 70;
  const strokeWidth = 12;
  const ringSpacing = strokeWidth + 4;
  
  // Calculate circumference
  const circumference = 2 * Math.PI * radius;
  
  // Ring positions (concentric circles)
  const moveRadius = radius;
  const exerciseRadius = radius + ringSpacing;
  const standRadius = radius + ringSpacing * 2;
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Move Ring (outermost) */}
        <circle
          cx={center}
          cy={center}
          r={moveRadius}
          fill="none"
          stroke="#363646"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={moveRadius}
          fill="none"
          stroke={moveColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - moveProgress)}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        
        {/* Exercise Ring (middle) */}
        <circle
          cx={center}
          cy={center}
          r={exerciseRadius}
          fill="none"
          stroke="#363646"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={exerciseRadius}
          fill="none"
          stroke={exerciseColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - exerciseProgress)}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        
        {/* Stand Ring (innermost) */}
        <circle
          cx={center}
          cy={center}
          r={standRadius}
          fill="none"
          stroke="#363646"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={standRadius}
          fill="none"
          stroke={standColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - standProgress)}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      
      {/* Labels */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-[#fa114f] text-sm font-semibold">MOVE</div>
          <div className="text-white text-lg font-bold">{Math.round(moveValue)}</div>
          <div className="text-[#7c7c7c] text-xs">kcal</div>
        </div>
        <div>
          <div className="text-[#00d9ff] text-sm font-semibold">EXERCISE</div>
          <div className="text-white text-lg font-bold">{Math.round(exerciseValue)}</div>
          <div className="text-[#7c7c7c] text-xs">min</div>
        </div>
        <div>
          <div className="text-[#ffd60a] text-sm font-semibold">STAND</div>
          <div className="text-white text-lg font-bold">{Math.round(standValue)}</div>
          <div className="text-[#7c7c7c] text-xs">hrs</div>
        </div>
      </div>
    </div>
  );
}

