export default function SecurityGraphPanel({ metrics }) {
  const maxValue = Math.max(...metrics.map((item) => item.value), 1);

  return (
    <section className="panel p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Defense Graphs</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Protection Coverage</h3>
      </div>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-200">{metric.label}</span>
              <span className="text-white">{metric.value}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${metric.gradient}`}
                style={{ width: `${(metric.value / maxValue) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">{metric.helper}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
