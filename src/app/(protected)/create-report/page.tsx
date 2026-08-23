"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { gooeyToast } from "goey-toast";

const platforms = ["Facebook", "Instagram", "Daraz", "Website", "WhatsApp", "Other"];

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

      gooeyToast.success("Report created successfully");
      router.push(`/reports/${data.data.id}`);
    } catch {
      gooeyToast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Report Fraud
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Brief summary of the fraud"
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Platform
          </label>
          <select
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Seller Name"
          value={form.sellerName}
          onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
          placeholder="Name of the seller/shop"
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
          placeholder="Describe what happened in detail..."
          rows={6}
          required
        />

        <Button type="submit" loading={loading} className="w-full">
          Submit Report
        </Button>
      </form>
    </div>
  );
}
