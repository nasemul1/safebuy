export function Footer() {
  return (
    <footer className="border-t border-zinc-100">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
              <svg
                width="12"
                height="12"
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
            <span className="text-sm font-medium text-zinc-900">SafeBuy</span>
          </div>
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} SafeBuy. Protecting consumers
            from e-commerce fraud.
          </p>
        </div>
      </div>
    </footer>
  );
}
