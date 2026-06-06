"use client";

import React, { useMemo } from 'react';
import { TimeIntensityPair, kelvinToHex, getColorTemperatureName } from '../utils/lightingStandards';
import { getCurrentLightSettings } from '../utils/scheduleGenerator';

interface ScheduleVisualizerProps {
  schedule: TimeIntensityPair[];
  currentTime?: number; // optional override for current time (for preview)
}

const ScheduleVisualizer: React.FC<ScheduleVisualizerProps> = ({ 
  schedule,
  currentTime
}) => {
  const now = new Date();
  const currentHour = currentTime !== undefined ? 
    currentTime : 
    now.getHours() + now.getMinutes() / 60;
  
  const currentSettings = useMemo(() => 
    getCurrentLightSettings(schedule, currentHour),
    [schedule, currentHour]
  );
  
  const timeMarkers = Array.from({ length: 13 }, (_, i) => i * 2); // 0, 2, 4, ... 24
  
  // Create color gradient stops from the schedule
  const gradientStops = useMemo(() => {
    return schedule.map(point => {
      const percentage = (point.time / 24) * 100;
      const color = kelvinToHex(point.temperature);
      return `${color} ${percentage.toFixed(1)}%`;
    }).join(', ');
  }, [schedule]);
  
  // Current position indicator
  const currentPosition = (currentHour / 24) * 100;
  
  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium text-gray-700">Lighting Schedule</h3>
          <div className="text-sm text-gray-500">
            Current: {currentSettings.intensity}% intensity, {getColorTemperatureName(currentSettings.temperature)}
          </div>
        </div>
        
        <div className="relative h-16 mb-3">
          {/* Schedule gradient visualization */}
          <div 
            className="absolute top-0 left-0 right-0 bottom-8 rounded-md"
            style={{ background: `linear-gradient(to right, ${gradientStops})` }}
          />
          
          {/* Intensity visualization overlay */}
          <div className="absolute top-0 left-0 right-0 bottom-8">
            {schedule.map((point, index) => {
              // Skip the last point for line segments
              if (index === schedule.length - 1) return null;
              
              const nextPoint = schedule[index + 1];
              const startPercent = (point.time / 24) * 100;
              const endPercent = (nextPoint.time / 24) * 100;
              const widthPercent = endPercent - startPercent;
              
              return (
                <div 
                  key={`intensity-${index}`}
                  className="absolute h-full bg-black bg-opacity-10"
                  style={{ 
                    left: `${startPercent}%`, 
                    width: `${widthPercent}%`,
                    top: `${100 - point.intensity}%`,
                    height: `${point.intensity}%`,
                    borderRight: index < schedule.length - 2 ? '1px dashed rgba(0,0,0,0.1)' : 'none'
                  }}
                />
              );
            })}
          </div>
          
          {/* Current time indicator */}
          <div 
            className="absolute bottom-8 w-1 rounded-full bg-red-500 h-full animate-pulse-gentle"
            style={{ left: `calc(${currentPosition}% - 2px)` }}
          />
          
          {/* Time markers */}
          <div className="absolute left-0 right-0 bottom-0 h-8 flex">
            {timeMarkers.map(hour => (
              <div 
                key={`hour-${hour}`} 
                className="relative flex-1 text-center"
              >
                <div className="time-marker text-xs text-gray-500">
                  {hour === 0 || hour === 24 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-gray-500">Current Light Intensity</div>
          <div className="text-2xl font-semibold mt-1">{currentSettings.intensity}%</div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-gray-500">Current Color Temperature</div>
          <div className="flex items-center mt-1">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: kelvinToHex(currentSettings.temperature) }}
            />
            <span className="text-2xl font-semibold">{currentSettings.temperature}K</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">({getColorTemperatureName(currentSettings.temperature)})</div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleVisualizer;
