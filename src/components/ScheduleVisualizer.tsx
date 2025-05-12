
import React, { useMemo } from 'react';
import { TimeIntensityPair, kelvinToHex, getColorTemperatureName, getMelanopicRatioDescription, calculateSpectralContent, SpectralRatio } from '../utils/lightingStandards';
import { getCurrentLightSettings } from '../utils/scheduleGenerator';
import { ChartContainer } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, BarChart, Bar } from 'recharts';

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
  
  // Get the spectral data for the current settings
  const spectralData = useMemo(() => {
    // Use existing spectral data if available, or calculate based on temperature
    return currentSettings.spectralRatio || calculateSpectralContent(currentSettings.temperature);
  }, [currentSettings]);

  // Prepare data for the spectral chart
  const spectralChartData = [
    { name: 'Blue', value: spectralData.blueLight, fill: '#5b8af7' },
    { name: 'Green', value: spectralData.greenLight, fill: '#4cd964' },
    { name: 'Red', value: spectralData.redLight, fill: '#ff3b30' }
  ];
  
  // Prepare melanopic impact data
  const melanopicImpact = spectralData.melanopicRatio || 0;
  const melanopicDesc = getMelanopicRatioDescription(melanopicImpact);
  
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
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
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
      
      {/* Spectral Content Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Spectral Content Analysis</h4>
        
        <div className="h-44">
          <ChartContainer 
            config={{
              blue: { label: "Blue Light", color: "#5b8af7" },
              green: { label: "Green Light", color: "#4cd964" },
              red: { label: "Red Light", color: "#ff3b30" },
            }}
          >
            <BarChart data={spectralChartData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Percentage" />
            </BarChart>
          </ChartContainer>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">Melanopic Impact</div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(melanopicImpact * 100 / 1.5, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
            <div className="ml-4">
              <span className="text-xl font-semibold">{melanopicImpact.toFixed(2)}</span>
              <span className="text-sm text-gray-500 ml-1">M/P ratio</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">{melanopicDesc}</p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleVisualizer;
