"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Import, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { describeActionError } from "@/features/shared/actionErrors";
import { standardSchedules } from "@/utils/lightingStandards";
import { formatTime, getUserTimezone } from "@/utils/scheduleGenerator";
import {
  createScenarioFromCustomInputs,
  createScenarioFromPreset,
  importScenarioFromJson,
} from "../actions";

const commonTimezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
];

type CustomFormState = {
  name: string;
  wakeTime: number;
  sleepTime: number;
  maxIntensity: number;
  basePresetName: string;
  useSunTimes: boolean;
  latitude: string;
  longitude: string;
  timezone: string;
};

export function ScenarioFormClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [presetName, setPresetName] = useState(standardSchedules[0]?.name ?? "");
  const [presetScenarioName, setPresetScenarioName] = useState("");
  const [importName, setImportName] = useState("");
  const [importJson, setImportJson] = useState("");
  const [customForm, setCustomForm] = useState<CustomFormState>(() => ({
    name: "Custom Schedule",
    wakeTime: 6,
    sleepTime: 22,
    maxIntensity: 100,
    basePresetName: standardSchedules[0]?.name ?? "Optimal Office Lighting",
    useSunTimes: false,
    latitude: "",
    longitude: "",
    timezone: getUserTimezone(),
  }));

  const selectedPreset = useMemo(
    () => standardSchedules.find((schedule) => schedule.name === presetName),
    [presetName],
  );

  const pushScenario = (scenarioId: string) => {
    router.push(`/projects/${projectId}/scenarios/${scenarioId}`);
    router.refresh();
  };

  const handlePresetSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await createScenarioFromPreset({
        projectId,
        presetName,
        name: presetScenarioName,
      });
      if (result.ok === false) {
        toast({ title: "Preset save failed", description: describeActionError(result), variant: "destructive" });
        return;
      }
      toast({ title: "Scenario saved", description: "The preset was persisted as a full schedule snapshot." });
      pushScenario(result.data.scenarioId);
    });
  };

  const handleCustomSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const location =
        customForm.useSunTimes && customForm.latitude && customForm.longitude
          ? {
              latitude: Number(customForm.latitude),
              longitude: Number(customForm.longitude),
              timezone: customForm.timezone,
            }
          : undefined;

      const result = await createScenarioFromCustomInputs({
        projectId,
        name: customForm.name,
        inputs: {
          wakeTime: customForm.wakeTime,
          sleepTime: customForm.sleepTime,
          maxIntensity: customForm.maxIntensity,
          basePresetName: customForm.basePresetName,
          useSunTimes: customForm.useSunTimes,
          location,
        },
      });

      if (result.ok === false) {
        toast({ title: "Custom scenario failed", description: describeActionError(result), variant: "destructive" });
        return;
      }
      toast({ title: "Custom scenario saved", description: "The generated schedule was persisted in Postgres JSONB." });
      pushScenario(result.data.scenarioId);
    });
  };

  const handleImport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await importScenarioFromJson({ projectId, rawJson: importJson, name: importName });
      if (result.ok === false) {
        toast({ title: "Import failed", description: describeActionError(result), variant: "destructive" });
        return;
      }
      toast({ title: "Scenario imported", description: "The imported schedule passed server-side Zod validation." });
      setImportJson("");
      setImportName("");
      pushScenario(result.data.scenarioId);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card>
        <form onSubmit={handlePresetSave}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Save preset
            </CardTitle>
            <CardDescription>Persist a code-owned standard preset as a project scenario snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Preset</Label>
              <Select value={presetName} onValueChange={setPresetName}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {standardSchedules.map((schedule) => (
                    <SelectItem key={schedule.name} value={schedule.name}>
                      {schedule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPreset && <p className="text-sm text-muted-foreground">{selectedPreset.description}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="preset-name">Scenario name</Label>
              <Input
                id="preset-name"
                value={presetScenarioName}
                onChange={(event) => setPresetScenarioName(event.target.value)}
                placeholder={selectedPreset?.name ?? "Scenario name"}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending || !presetName} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save preset scenario
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <form onSubmit={handleCustomSave}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Custom generator
            </CardTitle>
            <CardDescription>Server-generates and validates the canonical schedule before saving.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="custom-name">Scenario name</Label>
              <Input
                id="custom-name"
                value={customForm.name}
                onChange={(event) => setCustomForm({ ...customForm, name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Base preset</Label>
              <Select
                value={customForm.basePresetName}
                onValueChange={(basePresetName) => setCustomForm({ ...customForm, basePresetName })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {standardSchedules.map((schedule) => (
                    <SelectItem key={schedule.name} value={schedule.name}>
                      {schedule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Wake time</Label>
                <span>{formatTime(customForm.wakeTime)}</span>
              </div>
              <Slider
                min={4}
                max={10}
                step={0.5}
                value={[customForm.wakeTime]}
                onValueChange={([wakeTime]) => setCustomForm({ ...customForm, wakeTime })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Sleep time</Label>
                <span>{formatTime(customForm.sleepTime)}</span>
              </div>
              <Slider
                min={20}
                max={24}
                step={0.5}
                value={[customForm.sleepTime]}
                onValueChange={([sleepTime]) => setCustomForm({ ...customForm, sleepTime })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Max intensity</Label>
                <span>{customForm.maxIntensity}%</span>
              </div>
              <Slider
                min={50}
                max={100}
                step={5}
                value={[customForm.maxIntensity]}
                onValueChange={([maxIntensity]) => setCustomForm({ ...customForm, maxIntensity })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="use-sun-times">Use sun times</Label>
                <p className="text-xs text-muted-foreground">Optional server-side sunrise/sunset adjustment.</p>
              </div>
              <Switch
                id="use-sun-times"
                checked={customForm.useSunTimes}
                onCheckedChange={(useSunTimes) => setCustomForm({ ...customForm, useSunTimes })}
              />
            </div>
            {customForm.useSunTimes && (
              <div className="grid gap-3 rounded-lg border bg-muted/30 p-3">
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Latitude"
                  value={customForm.latitude}
                  onChange={(event) => setCustomForm({ ...customForm, latitude: event.target.value })}
                />
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Longitude"
                  value={customForm.longitude}
                  onChange={(event) => setCustomForm({ ...customForm, longitude: event.target.value })}
                />
                <Select
                  value={customForm.timezone}
                  onValueChange={(timezone) => setCustomForm({ ...customForm, timezone })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {commonTimezones.map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate & save
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <form onSubmit={handleImport}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Import className="h-5 w-5" />
              Import JSON
            </CardTitle>
            <CardDescription>Imports create new scenarios only after server validation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-name">Optional scenario name</Label>
              <Input
                id="import-name"
                value={importName}
                onChange={(event) => setImportName(event.target.value)}
                placeholder="Imported schedule"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="import-json">Schedule JSON</Label>
              <Textarea
                id="import-json"
                value={importJson}
                onChange={(event) => setImportJson(event.target.value)}
                placeholder='{"name":"...","schedule":[...]}'
                rows={10}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending || !importJson.trim()} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import scenario
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
