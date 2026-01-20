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
  
  // Ring colors (white and grey)
  const moveColor = '#c8c8c8'; // Light grey
  const exerciseColor = '#969696'; // Medium grey
  const standColor = '#c8c8c8'; // Light grey
  
  // SVG dimensions - increased to ensure rings are fully visible
  const size = 240;
  const padding = 20; // Padding to prevent clipping
  const center = size / 2;
  const radius = 70;
  const strokeWidth = 12;
  const ringSpacing = strokeWidth + 4;
  
  // Calculate circumference per ring radius
  const standCircumference = 2 * Math.PI * standRadius;
  const exerciseCircumference = 2 * Math.PI * exerciseRadius;
  const moveCircumference = 2 * Math.PI * moveRadius;
  
  // Ring positions (concentric circles)
  // Stand is innermost, Move is outermost
  const standRadius = radius;
  const exerciseRadius = radius + ringSpacing;
  const moveRadius = radius + ringSpacing * 2;
  
  // Calculate max radius to ensure everything fits
  const maxRadius = moveRadius + strokeWidth / 2;
  const viewBoxSize = (maxRadius + padding) * 2;
  
  return (
    <div className="flex flex-col items-center">
      <svg 
        width={size} 
        height={size} 
        viewBox={`${center - viewBoxSize/2} ${center - viewBoxSize/2} ${viewBoxSize} ${viewBoxSize}`}
        className="transform -rotate-90"
        style={{ overflow: 'visible' }}
      >
        {/* Move Ring (outermost) */}
        <circle
          cx={center}
          cy={center}
          r={moveRadius}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={moveRadius}
          fill="none"
          stroke={moveColor}
          strokeWidth={strokeWidth}
          strokeDasharray={moveCircumference}
          strokeDashoffset={moveCircumference * (1 - moveProgress)}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        
        {/* Exercise Ring (middle) */}
        <circle
          cx={center}
          cy={center}
          r={exerciseRadius}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={exerciseRadius}
          fill="none"
          stroke={exerciseColor}
          strokeWidth={strokeWidth}
          strokeDasharray={exerciseCircumference}
          strokeDashoffset={exerciseCircumference * (1 - exerciseProgress)}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        
        {/* Stand Ring (innermost) */}
        <circle
          cx={center}
          cy={center}
          r={standRadius}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={standRadius}
          fill="none"
          stroke={standColor}
          strokeWidth={strokeWidth}
          strokeDasharray={standCircumference}
          strokeDashoffset={standCircumference * (1 - standProgress)}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      
      {/* Labels */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-[#c8c8c8] text-sm font-normal">MOVE</div>
          <div className="text-[#c8c8c8] text-lg font-normal">{Math.round(moveValue)}</div>
          <div className="text-[#969696] text-xs">kcal</div>
        </div>
        <div>
          <div className="text-[#c8c8c8] text-sm font-normal">EXERCISE</div>
          <div className="text-[#c8c8c8] text-lg font-normal">{Math.round(exerciseValue)}</div>
          <div className="text-[#969696] text-xs">min</div>
        </div>
        <div>
          <div className="text-[#c8c8c8] text-sm font-normal">STAND</div>
          <div className="text-[#c8c8c8] text-lg font-normal">{Math.round(standValue)}</div>
          <div className="text-[#969696] text-xs">hrs</div>
        </div>
      </div>
    </div>
  );
}

