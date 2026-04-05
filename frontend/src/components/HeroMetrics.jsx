const toneMap = {
  sky: "from-sky-400/30 to-cyan-300/10 text-sky-100 border-sky-300/20",
  rose: "from-rose-400/30 to-orange-300/10 text-rose-100 border-rose-300/20",
  emerald: "from-emerald-400/30 to-lime-300/10 text-emerald-100 border-emerald-300/20",
  amber: "from-amber-400/30 to-yellow-300/10 text-amber-100 border-amber-300/20"
};

export default function HeroMetrics({ metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`group relative overflow-hidden rounded-[28px] border bg-gradient-to-br p-5 transition duration-300 hover:-translate-y-1 hover:rotate-[0.35deg] ${toneMap[metric.tone]}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)] opacity-70" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">{metric.label}</p>
              <div className="mt-3 text-3xl font-semibold text-white">{metric.value}</div>
              <p className="mt-2 text-sm text-white/80">{metric.helper}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white">
              {metric.tag}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
