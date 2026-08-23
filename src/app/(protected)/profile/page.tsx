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
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">Not authenticated</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Profile</h1>
      <Card>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-500">Name</label>
              <p className="text-slate-900">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Email</label>
              <p className="text-slate-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Role</label>
              <p className="text-slate-900">{user.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">
                Reputation Score
              </label>
              <p className="text-2xl font-bold text-blue-600">
                {user.reputationScore}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">
                Member Since
              </label>
              <p className="text-slate-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
