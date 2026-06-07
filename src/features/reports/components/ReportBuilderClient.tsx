"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { describeActionError } from "@/features/shared/actionErrors";
import type { RoiSnapshotDTO } from "@/features/roi/queries";
import type { ReportSnapshotSummaryDTO } from "@/features/reports/queries";
import { createReportSnapshot } from "@/features/reports/actions";

export function ReportBuilderClient({
  projectId,
  scenarioId,
  scenarioName,
  roiSnapshots,
  reportSnapshots,
}: {
  projectId: string;
  scenarioId: string;
  scenarioName: string;
  roiSnapshots: RoiSnapshotDTO[];
  reportSnapshots: ReportSnapshotSummaryDTO[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(`${scenarioName} report`);
  const latestRoiSnapshot = roiSnapshots.at(0);

  const handleCreateReport = () => {
    startTransition(async () => {
      const result = await createReportSnapshot({
        projectId,
        scenarioId,
        roiSnapshotId: latestRoiSnapshot?.id,
        name,
      });

      if (result.ok === false) {
        toast({ title: "Report generation failed", description: describeActionError(result), variant: "destructive" });
        return;
      }

      toast({ title: "Report snapshot created", description: "Opening the immutable report snapshot." });
      router.push(result.data.reportUrl);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Report snapshots
        </CardTitle>
        <CardDescription>
          Generate immutable report JSON from the current scenario and latest saved ROI snapshot.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="report-name">Report name</Label>
            <Input id="report-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <Button onClick={handleCreateReport} disabled={isPending || !name.trim()}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Generate snapshot
          </Button>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
          {latestRoiSnapshot
            ? `Includes ROI snapshot from ${new Date(latestRoiSnapshot.createdAt).toLocaleString()}.`
            : "No ROI snapshot saved yet; report will omit financial analysis."}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Recent reports</h4>
          {reportSnapshots.length > 0 ? (
            <div className="divide-y rounded-lg border">
              {reportSnapshots.map((report) => (
                <div key={report.id} className="flex flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Generated {new Date(report.generatedAt).toLocaleString()}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/reports/${report.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No report snapshots have been generated yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
