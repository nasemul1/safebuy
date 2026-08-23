import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Report E-commerce Fraud
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Help others avoid scams. Share your experience, upload evidence, and
          build a safer shopping community.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/reports"
            className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Browse Reports
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 text-base font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
