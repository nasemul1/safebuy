"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { gooeyToast } from "goey-toast";

interface CommentFormProps {
  reportId: string;
  onCommentAdded: () => void;
}

export function CommentForm({ reportId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        gooeyToast.error(data.error?.message || "Failed to add comment");
        return;
      }

      setContent("");
      gooeyToast.success("Comment added");
      onCommentAdded();
    } catch {
      gooeyToast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        rows={3}
      />
      <Button type="submit" loading={loading} size="sm">
        Post Comment
      </Button>
    </form>
  );
}
