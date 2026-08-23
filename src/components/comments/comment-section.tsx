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
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Comments ({total})
      </h2>

      <CommentForm reportId={reportId} onCommentAdded={handleCommentAdded} />

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div className="space-y-4 mt-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-slate-50 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-slate-900 text-sm">
                  {comment.user.name}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate-700">{comment.content}</p>
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
