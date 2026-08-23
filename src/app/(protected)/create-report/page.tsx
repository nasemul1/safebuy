"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { gooeyToast } from "goey-toast";

const platforms = [
  "Facebook",
  "Instagram",
  "Daraz",
  "Website",
  "WhatsApp",
  "Other",
];

export default function CreateReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    platform: "Facebook",
    sellerName: "",
    sellerUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        gooeyToast.error(data.error?.message || "Failed to create report");
        return;
      }

      gooeyToast.success("Report submitted");
      router.push(`/reports/${data.data.id}`);
    } catch {
      gooeyToast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-10">
      <h1 className="text-lg font-semibold text-zinc-900 mb-1">
        Report fraud
      </h1>
      <p className="text-sm text-zinc-400 mb-8">
        Provide as much detail as possible to help the community verify your
        report.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Brief summary of what happened"
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">
            Platform
          </label>
          <select
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            className="w-full h-10 px-3 bg-white text-sm text-zinc-900 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          >
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Seller name"
          value={form.sellerName}
          onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
          placeholder="Name of the seller or shop"
          required
        />

        <Input
          label="Seller URL (optional)"
          value={form.sellerUrl}
          onChange={(e) => setForm({ ...form, sellerUrl: e.target.value })}
          placeholder="https://..."
          type="url"
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What happened? Include dates, amounts, and how you paid..."
          rows={6}
          required
        />

        <Button type="submit" loading={loading} className="w-full">
          Submit report
        </Button>
      </form>
    </div>
  );
}
