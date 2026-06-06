"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { LightingSchedule } from "@/utils/lightingStandards";
import { getColorTemperatureName } from "@/utils/lightingStandards";
import { formatTime } from "@/utils/scheduleGenerator";

interface FinalReportProps {
  currentSchedule: LightingSchedule;
  roiData?: {
    annualSavings: number;
    roiPercentage: number;
    paybackPeriod: number;
    totalInvestment: number;
  };
}

export default function FinalReport({ currentSchedule, roiData }: FinalReportProps) {
  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Professional Circadian Lighting Report</CardTitle>
              <CardDescription>
                Legacy preview report. Persisted Phase 4 reports render through immutable report snapshots.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </Button>
              <Button onClick={handlePrint}>
                <Download className="mr-2 h-4 w-4" />
                Save via Browser
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="print:shadow-none print:border-none" id="report-content">
        <Card className="print:shadow-none print:border-none">
          <CardContent className="space-y-8 p-8">
            <div className="border-b pb-6 text-center">
              <h1 className="mb-2 text-3xl font-bold text-primary">Circadian Lighting Design Report</h1>
              <p className="text-lg text-muted-foreground">Professional Lighting Analysis & Recommendations</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>

            <section>
              <h2 className="mb-4 text-xl font-semibold">Project Overview</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Lighting Schedule:</span>
                  <Badge variant="secondary">{currentSchedule.name}</Badge>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Standards Compliance:</span>
                  <span className="text-muted-foreground">WELL Building Standard v2</span>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="mb-4 text-xl font-semibold">Recommended Lighting Schedule</h2>
              <p className="mb-4 text-sm text-muted-foreground">{currentSchedule.description}</p>
              <div className="grid gap-4 md:grid-cols-4">
                {currentSchedule.schedule.map((period) => (
                  <div key={`${period.time}-${period.temperature}`} className="rounded-lg bg-muted/20 p-3 text-center">
                    <div className="font-medium text-sm">{formatTime(period.time)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {period.intensity}% • {period.temperature}K
                    </div>
                    <div className="mt-1 text-xs">{getColorTemperatureName(period.temperature)}</div>
                  </div>
                ))}
              </div>
            </section>

            {roiData && (
              <>
                <Separator />
                <section>
                  <h2 className="mb-4 text-xl font-semibold">Financial Analysis</h2>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${roiData.annualSavings.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Annual Savings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{roiData.roiPercentage}%</div>
                      <div className="text-sm text-muted-foreground">ROI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{roiData.paybackPeriod} years</div>
                      <div className="text-sm text-muted-foreground">Payback Period</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        ${roiData.totalInvestment.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Investment</div>
                    </div>
                  </div>
                </section>
              </>
            )}

            <Separator />

            <section>
              <h2 className="mb-4 text-xl font-semibold">Scientific References</h2>
              <div className="space-y-2">
                {currentSchedule.citations.map((citation, index) => (
                  <p key={`${citation}-${index}`} className="text-xs text-muted-foreground">
                    {index + 1}. {citation}
                  </p>
                ))}
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}