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
    <nav className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 group-hover:text-accent transition-colors">
            SafeBuy
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink href="/reports" active={pathname === "/reports"}>
            Reports
          </NavLink>

          {loading ? (
            <div className="h-8 w-16 rounded-md bg-zinc-100 animate-pulse" />
          ) : user ? (
            <>
              <NavLink
                href="/create-report"
                active={pathname === "/create-report"}
              >
                Report
              </NavLink>
              <NavLink href="/profile" active={pathname === "/profile"}>
                Profile
              </NavLink>
              {user.role === "ADMIN" && (
                <NavLink
                  href="/admin"
                  active={pathname.startsWith("/admin")}
                >
                  Admin
                </NavLink>
              )}
              <div className="w-px h-4 bg-zinc-200 mx-1" />
              <button
                onClick={handleLogout}
                className="inline-flex items-center h-8 px-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login" active={pathname === "/login"}>
                Sign in
              </NavLink>
              <Link
                href="/register"
                className="inline-flex items-center h-8 px-3.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors ml-1"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center h-8 px-3 text-xs font-medium rounded-md transition-colors ${
        active
          ? "text-accent bg-accent-light"
          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
      }`}
    >
      {children}
    </Link>
  );
}
