export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900">SafeBuy</span>
            <span className="text-sm text-slate-500">Forum</span>
          </div>
          <p className="text-sm text-slate-500">
            Helping consumers avoid e-commerce fraud
          </p>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} SafeBuy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
