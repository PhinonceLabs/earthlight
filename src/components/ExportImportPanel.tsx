"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Code, Download, FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { importScenarioFromJson } from "@/features/scenarios/actions";
import { describeActionError } from "@/features/shared/actionErrors";
import type { ScenarioDetailDTO } from "@/features/scenarios/queries";
import { downloadTextFile } from "@/lib/browser-download";
import {
  scheduleExportFilename,
  serializeScheduleToCsv,
  serializeScheduleToIes,
  serializeScheduleToJson,
} from "@/features/export/serializers";

export default function ExportImportPanel({
  projectId,
  scenario,
}: {
  projectId: string;
  scenario: ScenarioDetailDTO | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [importData, setImportData] = useState("");

  const exportSchedule = (format: "json" | "csv" | "ies") => {
    if (!scenario) {
      toast({ title: "No schedule available", description: "Create or select a scenario first.", variant: "destructive" });
      return;
    }

    try {
      const serializers = {
        json: () => serializeScheduleToJson(scenario.schedule),
        csv: () => serializeScheduleToCsv(scenario.schedule),
        ies: () => serializeScheduleToIes(scenario.schedule),
      };
      const contentTypes = {
        json: "application/json",
        csv: "text/csv",
        ies: "text/plain",
      };

      downloadTextFile(serializers[format](), scheduleExportFilename(format), contentTypes[format]);
      toast({ title: "Schedule exported", description: `Validated ${format.toUpperCase()} export downloaded.` });
    } catch {
      toast({ title: "Export failed", description: "The selected schedule failed validation.", variant: "destructive" });
    }
  };

  const importSchedule = () => {
    startTransition(async () => {
      const result = await importScenarioFromJson({ projectId, rawJson: importData });

      if (result.ok === false) {
        toast({ title: "Import failed", description: describeActionError(result), variant: "destructive" });
        return;
      }

      setImportData("");
      toast({ title: "Scenario imported", description: "The imported schedule was validated and saved." });
      router.push(`/projects/${projectId}/scenarios/${result.data.scenarioId}`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Export schedule
          </CardTitle>
          <CardDescription>
            Export the active persisted scenario after shared schema validation. Exports are portable data, not canonical state.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button onClick={() => exportSchedule("json")} variant="outline" disabled={!scenario}>
              <FileText className="mr-2 h-4 w-4" />
              JSON
            </Button>
            <Button onClick={() => exportSchedule("csv")} variant="outline" disabled={!scenario}>
              <FileText className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button onClick={() => exportSchedule("ies")} variant="outline" disabled={!scenario}>
              <Code className="mr-2 h-4 w-4" />
              IES format
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Import schedule
          </CardTitle>
          <CardDescription>
            Imports create a new authenticated scenario through server actions. Imported JSON is never trusted as canonical until validation passes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-data">JSON schedule data</Label>
            <Textarea
              id="import-data"
              placeholder="Paste Earthlight schedule JSON here..."
              value={importData}
              onChange={(event) => setImportData(event.target.value)}
              rows={8}
            />
          </div>
          <Button onClick={importSchedule} disabled={isPending || !importData.trim()} className="w-full">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Validate and save scenario
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}