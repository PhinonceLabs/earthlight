
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Sun, Moon, Clock, Globe } from "lucide-react";
import { standardSchedules } from '../utils/lightingStandards';
import { generateCustomSchedule, formatTime, fetchSunTimes, SunTimesData, getUserTimezone } from '../utils/scheduleGenerator';
import { useToast } from '@/components/ui/use-toast';

interface CustomizationPanelProps {
  onScheduleChange: (scheduleIndex: number) => void;
  onCustomScheduleChange: (schedule: any) => void;
  currentScheduleIndex: number;
}

// Common timezones for the dropdown
const commonTimezones = [
  'America/New_York',
  'America/Chicago', 
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Mumbai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'UTC'
];

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ 
  onScheduleChange, 
  onCustomScheduleChange,
  currentScheduleIndex
}) => {
  const { toast } = useToast();
  const [wakeTime, setWakeTime] = useState<number>(6);
  const [sleepTime, setSleepTime] = useState<number>(22);
  const [maxIntensity, setMaxIntensity] = useState<number>(100);
  const [useSunTimes, setUseSunTimes] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [timezone, setTimezone] = useState<string>(getUserTimezone());
  const [sunTimes, setSunTimes] = useState<SunTimesData | null>(null);
  
  // Try to get user's location on first load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);
  
  // Fetch sun times when latitude/longitude changes and sun times are enabled
  useEffect(() => {
    const fetchSunTimesData = async () => {
      if (useSunTimes && latitude && longitude) {
        try {
          const lat = parseFloat(latitude);
          const lng = parseFloat(longitude);
          
          if (isNaN(lat) || isNaN(lng)) {
            return;
          }
          
          const sunData = await fetchSunTimes(lat, lng, timezone);
          if (sunData) {
            setSunTimes(sunData);
            toast({
              title: "Sun times updated",
              description: `Sunrise: ${sunData.sunrise.toLocaleTimeString()}, Sunset: ${sunData.sunset.toLocaleTimeString()}`,
            });
          }
        } catch (error) {
          console.error('Error fetching sun times:', error);
          toast({
            title: "Error fetching sun data",
            description: "Could not get sunrise and sunset times",
            variant: "destructive",
          });
        }
      }
    };
    
    fetchSunTimesData();
  }, [latitude, longitude, useSunTimes, timezone, toast]);
  
  // Generate a custom schedule
  const handleGenerateCustom = () => {
    const customSchedule = generateCustomSchedule(
      wakeTime,
      sleepTime,
      maxIntensity,
      standardSchedules[currentScheduleIndex].name,
      useSunTimes ? sunTimes : undefined
    );
    
    let scheduleDescription = `Wake: ${formatTime(wakeTime)}, Sleep: ${formatTime(sleepTime)}, Max: ${maxIntensity}%`;
    
    if (useSunTimes && sunTimes) {
      scheduleDescription += `, Adjusted for ${sunTimes.timezone}`;
    }
    
    onCustomScheduleChange({
      name: "Custom Schedule",
      description: scheduleDescription,
      schedule: customSchedule,
      citations: [
        "Generated based on selected preset and custom parameters.",
        useSunTimes && sunTimes ? 
          `Optimized for sunrise at ${sunTimes.sunrise.toLocaleTimeString()} and sunset at ${sunTimes.sunset.toLocaleTimeString()}` : 
          null
      ].filter(Boolean)
    });
  };
  
  // Handle getting current location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          toast({
            title: "Location updated",
            description: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: error.message,
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
    }
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
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Time Zone
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Select your current time zone
                  </p>
                </div>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60 z-50">
                    {commonTimezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base" htmlFor="use-sun-times">Adjust Based on Sunrise/Sunset</Label>
                  <p className="text-sm text-muted-foreground">
                    Customize schedule based on your location's daylight
                  </p>
                </div>
                <Switch 
                  id="use-sun-times" 
                  checked={useSunTimes} 
                  onCheckedChange={setUseSunTimes} 
                />
              </div>
              
              {useSunTimes && (
                <div className="space-y-3 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input 
                        id="latitude"
                        value={latitude} 
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="e.g., 40.7128"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input 
                        id="longitude"
                        value={longitude} 
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="e.g., -74.0060"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={handleGetLocation}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Use My Location
                  </Button>
                  
                  {sunTimes && (
                    <div className="text-sm mt-2 space-y-1 text-gray-600">
                      <p className="flex items-center">
                        <Sun className="w-4 h-4 mr-1 text-amber-500" />
                        Sunrise: {sunTimes.sunrise.toLocaleTimeString()}
                      </p>
                      <p className="flex items-center">
                        <Moon className="w-4 h-4 mr-1 text-blue-500" />
                        Sunset: {sunTimes.sunset.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
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
