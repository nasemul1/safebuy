import Link from "next/link";

export default function Home() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-light/40 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-5 pt-20 pb-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Community-driven fraud protection
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-5">
              Report fraud.
              <br />
              <span className="text-accent">Protect others.</span>
            </h1>
            <p className="text-base text-zinc-500 leading-relaxed max-w-md mb-8">
              Share your e-commerce fraud experiences, upload evidence, and
              help fellow shoppers avoid scams before they happen.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/reports"
                className="h-10 px-5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98] inline-flex items-center"
              >
                Browse reports
              </Link>
              <Link
                href="/register"
                className="h-10 px-5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg transition-all inline-flex items-center"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-zinc-100 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-3 gap-8">
          <Stat number="2,500+" label="Reports filed" />
          <Stat number="1,200+" label="Verified scams" />
          <Stat number="850+" label="Protected shoppers" />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-8">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <Step
            number="01"
            title="Report the fraud"
            desc="Describe what happened, name the seller, and categorize the platform."
          />
          <Step
            number="02"
            title="Upload evidence"
            desc="Screenshots, chat logs, receipts — attach proof to strengthen your report."
          />
          <Step
            number="03"
            title="Community verifies"
            desc="Other users confirm or dispute reports, building a trusted fraud database."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-100 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-5 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-3">
            Been scammed? Don&apos;t stay silent.
          </h2>
          <p className="text-sm text-zinc-500 mb-8 max-w-md mx-auto">
            Your report could prevent someone else from losing money. It takes
            two minutes to file.
          </p>
          <Link
            href="/register"
            className="h-10 px-5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98] inline-flex items-center"
          >
            Get started free
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
        {number}
      </div>
      <div className="text-sm text-zinc-400 mt-1">{label}</div>
    </div>
  );
}

function Step({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div>
      <div className="text-xs font-mono text-zinc-300 mb-3">{number}</div>
      <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  );
}
