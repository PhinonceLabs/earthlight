"use client";

import { useMemo, useState, useTransition } from "react";
import { Calculator, Clock, HeartHandshake, Loader2, Save, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { ROI_ASSUMPTIONS_VERSION } from "@/domain/roi/assumptions";
import { calculateRoiRange } from "@/domain/roi/calculator";
import { calculateAndSaveRoiSnapshot } from "@/features/roi/actions";
import type { RoiSnapshotDTO } from "@/features/roi/queries";
import type { RoiInputs } from "@/domain/validation/roi";

function describeActionError(result: { message: string; fieldErrors?: Record<string, string[]> }) {
  const fieldMessages = Object.entries(result.fieldErrors ?? {}).flatMap(([field, messages]) =>
    messages.map((message) => `${field}: ${message}`),
  );

  return [result.message, ...fieldMessages].join("\n");
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ROICalculatorClient({
  projectId,
  scenarioId,
  snapshots,
}: {
  projectId: string;
  scenarioId: string;
  snapshots: RoiSnapshotDTO[];
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [savedSnapshots, setSavedSnapshots] = useState(snapshots);
  const [inputs, setInputs] = useState<RoiInputs>({
    employees: 100,
    averageSalary: 65_000,
    implementationCost: 50_000,
    annualLightingEnergyCost: 20_000,
    currentAbsenteeism: 8,
    currentTurnover: 15,
  });

  const previewResults = useMemo(() => calculateRoiRange(inputs), [inputs]);
  const baseResults = previewResults.base;

  const updateNumber = (field: keyof RoiInputs, value: string) => {
    const parsedValue = Number.parseFloat(value);
    setInputs((currentInputs) => ({
      ...currentInputs,
      [field]: Number.isFinite(parsedValue) ? Math.max(parsedValue, 0) : 0,
    }));
  };

  const updateInteger = (field: keyof RoiInputs, value: string) => {
    const parsedValue = Number.parseInt(value, 10);
    setInputs((currentInputs) => ({
      ...currentInputs,
      [field]: Number.isFinite(parsedValue) ? Math.max(parsedValue, 0) : 0,
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await calculateAndSaveRoiSnapshot({ projectId, scenarioId, inputs });

      if (result.ok === false) {
        toast({ title: "ROI snapshot failed", description: describeActionError(result), variant: "destructive" });
        return;
      }

      setSavedSnapshots((currentSnapshots) => [result.data.snapshot, ...currentSnapshots].slice(0, 5));
      toast({ title: "ROI snapshot saved", description: "Server-computed ROI values were persisted." });
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-primary" />
            Circadian Lighting ROI Calculator
          </CardTitle>
          <CardDescription>
            Preview ROI instantly, then save a server-validated snapshot for reports. Assumption range: {ROI_ASSUMPTIONS_VERSION}.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Organization details</CardTitle>
            <CardDescription>Inputs are validated again on the server before persistence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employees">Number of employees</Label>
              <Input id="employees" type="number" min={0} max={100000} step={1} value={inputs.employees} onChange={(event) => updateInteger("employees", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="averageSalary">Average annual salary ($)</Label>
              <Input id="averageSalary" type="number" min={0} max={10000000} step={1000} value={inputs.averageSalary} onChange={(event) => updateNumber("averageSalary", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="implementationCost">Lighting system investment ($)</Label>
              <Input id="implementationCost" type="number" min={0} max={100000000} step={1000} value={inputs.implementationCost} onChange={(event) => updateNumber("implementationCost", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualLightingEnergyCost">Annual lighting energy cost ($)</Label>
              <Input id="annualLightingEnergyCost" type="number" min={0} max={100000000} step={1000} value={inputs.annualLightingEnergyCost} onChange={(event) => updateNumber("annualLightingEnergyCost", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAbsenteeism">Current sick days per employee/year</Label>
              <Input id="currentAbsenteeism" type="number" min={0} max={365} step={0.5} value={inputs.currentAbsenteeism} onChange={(event) => updateNumber("currentAbsenteeism", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentTurnover">Current annual turnover rate (%)</Label>
              <Input id="currentTurnover" type="number" min={0} max={100} step={0.5} value={inputs.currentTurnover} onChange={(event) => updateNumber("currentTurnover", event.target.value)} />
            </div>
            <Button onClick={handleSave} className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save server-computed snapshot
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Base-case preview</CardTitle>
            <CardDescription>Preview only; saved snapshots are recomputed server-side.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <div className="text-2xl font-bold text-primary">{baseResults.roiPercentage}%</div>
                <div className="text-sm text-muted-foreground">Annual ROI</div>
              </div>
              <div className="rounded-lg bg-accent/10 p-4 text-center">
                <div className="text-2xl font-bold text-accent">{baseResults.paybackPeriod}</div>
                <div className="text-sm text-muted-foreground">Years payback</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center text-sm"><Users className="mr-2 h-4 w-4 text-muted-foreground" />Productivity gain</span>
                <Badge variant="outline" className="font-mono">{formatCurrency(baseResults.productivityGain)}</Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center text-sm"><HeartHandshake className="mr-2 h-4 w-4 text-muted-foreground" />Reduced sick days</span>
                <Badge variant="outline" className="font-mono">{formatCurrency(baseResults.reducedAbsenteeism)}</Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center text-sm"><Clock className="mr-2 h-4 w-4 text-muted-foreground" />Reduced turnover</span>
                <Badge variant="outline" className="font-mono">{formatCurrency(baseResults.reducedTurnover)}</Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center text-sm"><TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />Energy savings</span>
                <Badge variant="outline" className="font-mono">{formatCurrency(baseResults.energySavings)}</Badge>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between font-semibold">
              <span>Total annual savings</span>
              <Badge className="px-3 py-1 font-mono text-lg">{formatCurrency(baseResults.totalAnnualSavings)}</Badge>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              Range: {formatCurrency(previewResults.low.totalAnnualSavings)} low to {formatCurrency(previewResults.high.totalAnnualSavings)} high annual savings.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved ROI snapshots</CardTitle>
          <CardDescription>Most recent server-computed snapshots for this scenario.</CardDescription>
        </CardHeader>
        <CardContent>
          {savedSnapshots.length > 0 ? (
            <div className="divide-y rounded-lg border">
              {savedSnapshots.map((snapshot) => (
                <div key={snapshot.id} className="grid gap-2 p-3 text-sm md:grid-cols-4 md:items-center">
                  <div className="font-medium">{new Date(snapshot.createdAt).toLocaleString()}</div>
                  <div>{formatCurrency(snapshot.results.base.totalAnnualSavings)} base savings</div>
                  <div>{snapshot.results.base.roiPercentage}% ROI</div>
                  <div className="text-muted-foreground">{snapshot.assumptionsVersion}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No ROI snapshots saved yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
