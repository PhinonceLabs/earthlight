import { notFound } from "next/navigation";
import { getReportSnapshotForCurrentIdentity } from "@/features/reports/queries";
import { ReportViewer } from "@/features/reports/components/ReportViewer";

export const runtime = "nodejs";

type ReportPageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { reportId } = await params;
  const report = await getReportSnapshotForCurrentIdentity(reportId);

  if (!report) {
    notFound();
  }

  return <ReportViewer report={report} />;
}
