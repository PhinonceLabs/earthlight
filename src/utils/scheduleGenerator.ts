
import { TimeIntensityPair, standardSchedules, LightingSchedule } from './lightingStandards';

// Helper function to create a custom schedule based on wake and sleep times
export const generateCustomSchedule = (
  wakeTime: number,  // 0-24 hour
  sleepTime: number, // 0-24 hour
  maxIntensity: number = 100,
  baseSchedule: string = "Optimal Office Lighting"
): TimeIntensityPair[] => {
  // Get the base schedule to modify
  const baseScheduleData = standardSchedules.find(s => s.name === baseSchedule) || standardSchedules[0];
  
  // Default schedule assumes wake at 6 AM and sleep at 10 PM
  const defaultWake = 6;
  const defaultSleep = 22;
  
  const customSchedule: TimeIntensityPair[] = [];
  
  // Add midnight starting point
  customSchedule.push({ time: 0, intensity: 5, temperature: 2200 });
  
  // Adjust schedule based on wake time difference
  const wakeDiff = wakeTime - defaultWake;
  
  // Find the base schedule points that occur during active hours
  const activeHoursPoints = baseScheduleData.schedule.filter(
    point => point.time >= defaultWake && point.time <= defaultSleep
  );
  
  // Scale the active hours to fit the user's wake/sleep cycle
  if (activeHoursPoints.length > 0) {
    const activeHoursDuration = defaultSleep - defaultWake;
    const userActiveHoursDuration = sleepTime - wakeTime;
    
    // Create points for the user's active hours
    activeHoursPoints.forEach(basePoint => {
      // Calculate the relative position in the active period
      const relativePosition = (basePoint.time - defaultWake) / activeHoursDuration;
      const newTime = wakeTime + (relativePosition * userActiveHoursDuration);
      const roundedTime = Math.round(newTime * 2) / 2; // Round to nearest half hour
      
      // Scale intensity if needed
      const scaledIntensity = (basePoint.intensity / 100) * maxIntensity;
      
      customSchedule.push({
        time: roundedTime,
        intensity: scaledIntensity,
        temperature: basePoint.temperature
      });
    });
  }
  
  // Add sleep time and overnight points
  customSchedule.push({ 
    time: sleepTime, 
    intensity: 10, 
    temperature: 2200 
  });
  
  customSchedule.push({ 
    time: 24, 
    intensity: 5, 
    temperature: 2200 
  });
  
  // Sort by time and remove any duplicates
  return customSchedule
    .sort((a, b) => a.time - b.time)
    .filter((point, index, self) => 
      index === 0 || point.time !== self[index - 1].time
    );
};

// Get current recommended light settings based on the time
export const getCurrentLightSettings = (
  schedule: TimeIntensityPair[],
  currentHour: number = new Date().getHours() + (new Date().getMinutes() / 60)
): { intensity: number, temperature: number } => {
  // Handle case when the current hour is before the first schedule point or after the last
  if (currentHour < schedule[0].time) {
    return {
      intensity: schedule[schedule.length - 1].intensity,
      temperature: schedule[schedule.length - 1].temperature
    };
  }
  
  if (currentHour >= schedule[schedule.length - 1].time) {
    return {
      intensity: schedule[0].intensity,
      temperature: schedule[0].temperature
    };
  }
  
  // Find the two points we're between
  let beforeIndex = 0;
  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i].time <= currentHour) {
      beforeIndex = i;
    } else {
      break;
    }
  }
  
  const afterIndex = beforeIndex + 1 < schedule.length ? beforeIndex + 1 : 0;
  
  // Calculate the interpolation factor
  let factor = 0;
  if (schedule[afterIndex].time > schedule[beforeIndex].time) {
    factor = (currentHour - schedule[beforeIndex].time) / 
      (schedule[afterIndex].time - schedule[beforeIndex].time);
  }
  
  // Interpolate the values
  const intensity = Math.round(
    schedule[beforeIndex].intensity + 
    factor * (schedule[afterIndex].intensity - schedule[beforeIndex].intensity)
  );
  
  const temperature = Math.round(
    schedule[beforeIndex].temperature + 
    factor * (schedule[afterIndex].temperature - schedule[beforeIndex].temperature)
  );
  
  return { intensity, temperature };
};

// Create a new schedule with the name and description
export const createNamedSchedule = (
  name: string,
  description: string,
  schedule: TimeIntensityPair[]
): LightingSchedule => {
  return {
    name,
    description,
    schedule,
    citations: [
      "Custom schedule based on peer-reviewed lighting research principles."
    ]
  };
};
