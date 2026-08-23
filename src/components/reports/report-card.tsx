import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ReportCardProps {
  report: {
    id: string;
    title: string;
    platform: string;
    sellerName: string;
    status: string;
    createdAt: string;
    user: { id: string; name: string };
  };
}

const statusColors: Record<string, "warning" | "info" | "success" | "danger"> = {
  PENDING: "warning",
  UNDER_REVIEW: "info",
  VERIFIED: "success",
  REJECTED: "danger",
};

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Link href={`/reports/${report.id}`}>
      <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={statusColors[report.status] || "default"}>
            {report.status.replace("_", " ")}
          </Badge>
          <span className="text-xs text-slate-500">{report.platform}</span>
        </div>
        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
          {report.title}
        </h3>
        <p className="text-sm text-slate-600 mb-2">{report.sellerName}</p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>by {report.user.name}</span>
          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
