"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EvidenceGallery } from "@/components/reports/evidence-gallery";
import { CommentSection } from "@/components/comments/comment-section";

interface Report {
  id: string;
  title: string;
  description: string;
  platform: string;
  sellerName: string;
  sellerUrl: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string; reputationScore: number };
  evidence: { id: string; url: string; type: string }[];
}

const statusColors: Record<string, "warning" | "info" | "success" | "danger"> = {
  PENDING: "warning",
  UNDER_REVIEW: "info",
  VERIFIED: "success",
  REJECTED: "danger",
};

export default function ReportDetailPage() {
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reports/${params.id}`)
      .then((res) => res.json())
      .then((data) => setReport(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">Report not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={statusColors[report.status] || "default"}>
            {report.status.replace("_", " ")}
          </Badge>
          <span className="text-sm text-slate-500">{report.platform}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {report.title}
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Reported by {report.user.name}</span>
          <span>&middot;</span>
          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          {report.sellerName}
        </h2>
        {report.sellerUrl && (
          <a
            href={report.sellerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline mb-4 block"
          >
            {report.sellerUrl}
          </a>
        )}
        <p className="text-slate-700 whitespace-pre-wrap">
          {report.description}
        </p>
      </div>

      {report.evidence.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Evidence</h2>
          <EvidenceGallery evidence={report.evidence} />
        </div>
      )}

      <CommentSection reportId={report.id} />
    </div>
  );
}
