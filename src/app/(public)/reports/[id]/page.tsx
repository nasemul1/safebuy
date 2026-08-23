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

const statusColors: Record<
  string,
  "warning" | "info" | "success" | "danger"
> = {
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
      <div className="flex justify-center py-24">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-zinc-400"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-zinc-500 font-medium">Report not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={statusColors[report.status] || "default"} dot>
            {report.status.replace("_", " ")}
          </Badge>
          <span className="text-xs text-zinc-400">{report.platform}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">
          {report.title}
        </h1>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="font-medium text-zinc-600">{report.user.name}</span>
          <span className="text-zinc-200">&middot;</span>
          <span>
            Rep: {report.user.reputationScore}
          </span>
          <span className="text-zinc-200">&middot;</span>
          <span>
            {new Date(report.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Seller info */}
      <div className="bg-white border border-zinc-200/80 rounded-xl mb-6">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">
            {report.sellerName}
          </h2>
        </div>
        {report.sellerUrl && (
          <div className="px-5 py-3 border-b border-zinc-50">
            <a
              href={report.sellerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:text-accent-hover transition-colors break-all"
            >
              {report.sellerUrl}
            </a>
          </div>
        )}
        <div className="px-5 py-4">
          <p className="text-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">
            {report.description}
          </p>
        </div>
      </div>

      {/* Evidence */}
      {report.evidence.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
            Evidence
          </h2>
          <EvidenceGallery evidence={report.evidence} />
        </div>
      )}

      {/* Comments */}
      <CommentSection reportId={report.id} />
    </div>
  );
}
