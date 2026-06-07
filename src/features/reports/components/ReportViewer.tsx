"use client";

import { Download, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ReportSnapshotDTO } from "@/features/reports/queries";
import { reportExportFilename, serializeReportSnapshotToJson } from "@/features/export/serializers";
import { downloadTextFile } from "@/lib/browser-download";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function downloadReportJson(report: ReportSnapshotDTO) {
  downloadTextFile(serializeReportSnapshotToJson(report.reportData), reportExportFilename(), "application/json");
}

export function ReportViewer({ report }: { report: ReportSnapshotDTO }) {
  const { reportData } = report;
  const baseRoi = reportData.roi?.results.base;

  return (
    <div className="space-y-6">
      <Card className="print:hidden">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>{report.name}</CardTitle>
            <CardDescription>
              Immutable snapshot generated {new Date(report.generatedAt).toLocaleString()}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => downloadReportJson(report)} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button onClick={() => window.print()} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      <article id="report-content" className="print:shadow-none">
        <Card className="print:border-none print:shadow-none">
          <CardContent className="space-y-8 p-8">
            <header className="border-b pb-6 text-center">
              <h1 className="text-3xl font-bold text-primary">Circadian Lighting Design Report</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Professional Lighting Analysis & Recommendations
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Generated {new Date(reportData.generatedAt).toLocaleDateString()}
              </p>
            </header>

            <section>
              <h2 className="mb-4 text-xl font-semibold">Executive Summary</h2>
              <div className="rounded-lg bg-muted/30 p-4 text-sm leading-relaxed">
                This report captures a frozen snapshot of the selected Earthlight project,
                scenario schedule, and optional ROI analysis. Future edits to the project,
                scenario, or assumptions do not modify this report snapshot.
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">Project Overview</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">Project:</span>
                    <span className="text-right text-muted-foreground">{reportData.project.name}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">Client:</span>
                    <span className="text-right text-muted-foreground">{reportData.project.client || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">Location:</span>
                    <span className="text-right text-muted-foreground">{reportData.project.location || "—"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">Application:</span>
                    <Badge variant="secondary">{reportData.project.projectTypeLabel}</Badge>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">Scenario:</span>
                    <span className="text-right text-muted-foreground">{reportData.scenario.name}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">Report version:</span>
                    <span className="text-right text-muted-foreground">{reportData.reportVersion}</span>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="mb-4 text-xl font-semibold">Recommended Lighting Schedule</h2>
              <p className="mb-4 text-sm text-muted-foreground">{reportData.schedule.description}</p>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-muted/60 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium">Intensity</th>
                      <th className="px-4 py-3 font-medium">CCT</th>
                      <th className="px-4 py-3 font-medium">Color</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.scheduleRows.map((point) => (
                      <tr key={`${point.timeDecimal}-${point.temperature}`} className="border-t">
                        <td className="px-4 py-3">{point.timeLabel}</td>
                        <td className="px-4 py-3">{point.intensity}%</td>
                        <td className="px-4 py-3">{point.temperature}K</td>
                        <td className="px-4 py-3">{point.colorName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {baseRoi && reportData.roi && (
              <>
                <Separator />
                <section>
                  <h2 className="mb-4 text-xl font-semibold">Financial Analysis</h2>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {formatCurrency(baseRoi.totalAnnualSavings)}
                      </div>
                      <div className="text-sm text-muted-foreground">Base annual savings</div>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <div className="text-2xl font-bold text-blue-700">{baseRoi.roiPercentage}%</div>
                      <div className="text-sm text-muted-foreground">Base ROI</div>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4 text-center">
                      <div className="text-2xl font-bold text-purple-700">{baseRoi.paybackPeriod}</div>
                      <div className="text-sm text-muted-foreground">Years payback</div>
                    </div>
                    <div className="rounded-lg bg-orange-50 p-4 text-center">
                      <div className="text-2xl font-bold text-orange-700">
                        {formatCurrency(reportData.roi.inputs.implementationCost)}
                      </div>
                      <div className="text-sm text-muted-foreground">Investment</div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg border p-4 text-sm text-muted-foreground">
                    Range: {formatCurrency(reportData.roi.results.low.totalAnnualSavings)} low to{" "}
                    {formatCurrency(reportData.roi.results.high.totalAnnualSavings)} high annual savings,
                    using assumption set {reportData.roi.assumptionsVersion}.
                  </div>
                </section>
              </>
            )}

            <Separator />

            <section>
              <h2 className="mb-4 text-xl font-semibold">Implementation Recommendations</h2>
              <ul className="space-y-2 text-sm">
                {reportData.implementationRecommendations.map((recommendation) => (
                  <li key={recommendation}>• {recommendation}</li>
                ))}
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="mb-4 text-xl font-semibold">Scientific References</h2>
              <div className="space-y-2">
                {reportData.citations.length > 0 ? (
                  reportData.citations.map((citation, index) => (
                    <p key={`${citation}-${index}`} className="text-xs text-muted-foreground">
                      {index + 1}. {citation}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No citations were attached to this scenario.</p>
                )}
              </div>
            </section>

            <footer className="border-t pt-4 text-center text-xs text-muted-foreground">
              Earthlight report snapshot {report.id}. Ownership identifiers are intentionally omitted.
            </footer>
          </CardContent>
        </Card>
      </article>
    </div>
  );
}
