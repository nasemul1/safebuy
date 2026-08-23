"use client";

import { useState, useEffect } from "react";
import { CommentForm } from "./comment-form";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
}

export function CommentSection({ reportId }: { reportId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchComments = () => {
    setLoading(true);
    fetch(`/api/reports/${reportId}/comments?page=${page}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data.data || []);
        setTotal(data.pagination?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
  }, [page, reportId]);

  const handleCommentAdded = () => {
    setPage(1);
    fetchComments();
  };

  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-4">
        Comments ({total})
      </h2>

      <CommentForm reportId={reportId} onCommentAdded={handleCommentAdded} />

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="sm" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-zinc-400 py-6">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-3 mt-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-zinc-50 border border-zinc-100 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-zinc-900">
                  {comment.user.name}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))}
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
