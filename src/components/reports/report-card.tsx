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

const statusColors: Record<
  string,
  "warning" | "info" | "success" | "danger"
> = {
  PENDING: "warning",
  UNDER_REVIEW: "info",
  VERIFIED: "success",
  REJECTED: "danger",
};

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Link href={`/reports/${report.id}`}>
      <div className="group bg-white border border-zinc-200/80 rounded-xl p-4 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant={statusColors[report.status] || "default"} dot>
                {report.status.replace("_", " ")}
              </Badge>
              <span className="text-xs text-zinc-400">{report.platform}</span>
            </div>
            <h3 className="text-sm font-medium text-zinc-900 group-hover:text-accent transition-colors line-clamp-1 mb-0.5">
              {report.title}
            </h3>
            <p className="text-xs text-zinc-500">{report.sellerName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-zinc-400">{report.user.name}</p>
            <p className="text-[11px] text-zinc-300 mt-0.5">
              {new Date(report.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
