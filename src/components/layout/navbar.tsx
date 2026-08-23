"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserPayload } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setUser(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900">SafeBuy</span>
            <span className="text-sm text-slate-500">Forum</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/reports"
              className={`text-sm font-medium ${
                pathname === "/reports"
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Reports
            </Link>

            {loading ? (
              <div className="h-8 w-20 bg-slate-100 rounded animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/create-report"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Report Fraud
                </Link>
                <Link
                  href="/profile"
                  className={`text-sm font-medium ${
                    pathname === "/profile"
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Profile
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={`text-sm font-medium ${
                      pathname.startsWith("/admin")
                        ? "text-blue-600"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
