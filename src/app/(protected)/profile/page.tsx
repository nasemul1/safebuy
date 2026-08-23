"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  reputationScore: number;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <p className="text-sm text-zinc-500">Not authenticated</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-10">
      <h1 className="text-lg font-semibold text-zinc-900 mb-6">Profile</h1>
      <Card>
        <CardContent className="space-y-4">
          <Field label="Name" value={user.name} />
          <Field label="Email" value={user.email} />
          <Field
            label="Role"
            value={user.role.charAt(0) + user.role.slice(1).toLowerCase()}
          />
          <div>
            <p className="text-xs text-zinc-400 mb-1">Reputation</p>
            <p className="text-2xl font-bold tabular-nums text-accent">
              {user.reputationScore}
            </p>
          </div>
          <Field
            label="Member since"
            value={new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-zinc-900">{value}</p>
    </div>
  );
}
