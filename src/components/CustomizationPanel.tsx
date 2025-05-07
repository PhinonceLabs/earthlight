
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { standardSchedules } from '../utils/lightingStandards';
import { generateCustomSchedule } from '../utils/scheduleGenerator';

interface CustomizationPanelProps {
  onScheduleChange: (scheduleIndex: number) => void;
  onCustomScheduleChange: (schedule: any) => void;
  currentScheduleIndex: number;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ 
  onScheduleChange, 
  onCustomScheduleChange,
  currentScheduleIndex
}) => {
  const [wakeTime, setWakeTime] = useState<number>(6);
  const [sleepTime, setSleepTime] = useState<number>(22);
  const [maxIntensity, setMaxIntensity] = useState<number>(100);
  
  // Handle time format conversion
  const formatTime = (hour: number): string => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };
  
  // Generate a custom schedule
  const handleGenerateCustom = () => {
    const customSchedule = generateCustomSchedule(
      wakeTime,
      sleepTime,
      maxIntensity,
      standardSchedules[currentScheduleIndex].name
    );
    
    onCustomScheduleChange({
      name: "Custom Schedule",
      description: `Wake: ${formatTime(wakeTime)}, Sleep: ${formatTime(sleepTime)}, Max: ${maxIntensity}%`,
      schedule: customSchedule,
      citations: ["Generated based on selected preset and custom parameters."]
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Customize Schedule</CardTitle>
        <CardDescription>Adjust parameters to create a personalized lighting schedule.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="preset-schedule" className="text-sm font-medium text-gray-700 mb-1 block">
              Preset Schedule
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {standardSchedules.map((schedule, index) => (
                <Button 
                  key={schedule.name}
                  variant={currentScheduleIndex === index ? "default" : "outline"}
                  className="justify-start text-left font-normal h-auto py-2"
                  onClick={() => onScheduleChange(index)}
                >
                  {schedule.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Parameters</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="wake-time">Wake Time</Label>
                  <span className="text-sm">{formatTime(wakeTime)}</span>
                </div>
                <Slider 
                  id="wake-time"
                  min={4} 
                  max={10} 
                  step={0.5} 
                  value={[wakeTime]}
                  onValueChange={(value) => setWakeTime(value[0])}
                  className="w-full" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="sleep-time">Sleep Time</Label>
                  <span className="text-sm">{formatTime(sleepTime)}</span>
                </div>
                <Slider 
                  id="sleep-time"
                  min={20} 
                  max={24} 
                  step={0.5} 
                  value={[sleepTime]}
                  onValueChange={(value) => setSleepTime(value[0])}
                  className="w-full" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="max-intensity">Maximum Light Intensity</Label>
                  <span className="text-sm">{maxIntensity}%</span>
                </div>
                <Slider 
                  id="max-intensity"
                  min={50} 
                  max={100} 
                  step={5} 
                  value={[maxIntensity]}
                  onValueChange={(value) => setMaxIntensity(value[0])}
                  className="w-full" 
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button onClick={handleGenerateCustom} className="w-full">
          Generate Custom Schedule
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomizationPanel;
