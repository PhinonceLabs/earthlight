import React, { useState, useEffect } from 'react';
import ScheduleVisualizer from './ScheduleVisualizer';
import CustomizationPanel from './CustomizationPanel';
import ResearchInfo from './ResearchInfo';
import { standardSchedules } from '../utils/lightingStandards';
import { getCurrentLightSettings, getUserTimezone } from '../utils/scheduleGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Clock, Info, Globe } from "lucide-react";
const LightingSchedule: React.FC = () => {
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
  const [activeSchedule, setActiveSchedule] = useState(standardSchedules[0]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>(getUserTimezone());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle preset schedule change
  const handleScheduleChange = (scheduleIndex: number) => {
    setCurrentScheduleIndex(scheduleIndex);
    setActiveSchedule(standardSchedules[scheduleIndex]);
  };

  // Handle custom schedule change
  const handleCustomScheduleChange = (customSchedule: any) => {
    setActiveSchedule(customSchedule);
    setCurrentScheduleIndex(-1); // -1 indicates custom
  };

  // Get current lighting recommendation
  const currentSettings = getCurrentLightSettings(activeSchedule.schedule, currentTime.getHours() + currentTime.getMinutes() / 60);

  // Check if this is a sun-adjusted schedule
  const hasSunAdjustment = activeSchedule.description?.includes('Adjusted for');
  return <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Earthlight Scheduler</h2>
        <p className="text-lg text-gray-600">Research-based lighting recommendations for optimal human health.</p>
      </div>
      
      <div className="mb-6">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-lumify-blue-light via-lumify-blue to-lumify-blue-dark text-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Current Recommendation</CardTitle>
                <CardDescription className="text-white/80">
                  Based on {activeSchedule.name}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary" className="bg-white text-lumify-blue-dark">
                  {currentTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}
                </Badge>
                {hasSunAdjustment && <Badge variant="outline" className="bg-white/10 border-white/30 text-white text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    {timezone}
                  </Badge>}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg flex items-center bg-gradient-to-r from-amber-50 to-amber-100">
                <div className="p-3 rounded-full bg-amber-200 mr-4">
                  <Sun className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Light Intensity</p>
                  <h3 className="text-2xl font-bold">{currentSettings.intensity}%</h3>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg flex items-center bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="p-3 rounded-full bg-blue-200 mr-4">
                  <Moon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Color Temperature</p>
                  <h3 className="text-2xl font-bold">{currentSettings.temperature}K</h3>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg flex items-center bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="p-3 rounded-full bg-purple-200 mr-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Schedule Name</p>
                  <h3 className="text-xl font-bold truncate">{activeSchedule.name}</h3>
                </div>
              </div>
            </div>
            
            {hasSunAdjustment && <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center">
                <Sun className="h-4 w-4 mr-2 text-amber-500" />
                <span>This schedule is optimized based on your location's sunrise and sunset times.</span>
              </div>}
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <ScheduleVisualizer schedule={activeSchedule.schedule} />
      </div>
      
      <Tabs defaultValue="customize" className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="customize">
            <Sun className="mr-2 h-4 w-4" />
            Customize Schedule
          </TabsTrigger>
          <TabsTrigger value="research">
            <Info className="mr-2 h-4 w-4" />
            Research & Standards
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="customize">
          <CustomizationPanel onScheduleChange={handleScheduleChange} onCustomScheduleChange={handleCustomScheduleChange} currentScheduleIndex={currentScheduleIndex} />
        </TabsContent>
        
        <TabsContent value="research">
          <ResearchInfo currentSchedule={activeSchedule} />
        </TabsContent>
      </Tabs>
    </div>;
};
export default LightingSchedule;