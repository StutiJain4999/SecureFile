export default function ThreatRadar({ items }) {
  const center = 110;
  const radius = 82;
  const points = items
    .map((item, index) => {
      const angle = (Math.PI * 2 * index) / items.length - Math.PI / 2;
      const distance = radius * item.value;
      const x = center + Math.cos(angle) * distance;
      const y = center + Math.sin(angle) * distance;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section className="panel p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-300">Threat Surface</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Defense Radar</h3>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="mx-auto">
          <svg viewBox="0 0 220 220" className="h-[220px] w-[220px]">
            {[1, 0.75, 0.5, 0.25].map((scale) => (
              <circle
                key={scale}
                cx="110"
                cy="110"
                r={82 * scale}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
              />
            ))}
            {items.map((item, index) => {
              const angle = (Math.PI * 2 * index) / items.length - Math.PI / 2;
              const x = center + Math.cos(angle) * radius;
              const y = center + Math.sin(angle) * radius;
              return (
                <line
                  key={item.label}
                  x1="110"
                  y1="110"
                  x2={x}
                  y2={y}
                  stroke="rgba(255,255,255,0.14)"
                />
              );
            })}
            <polygon
              points={points}
              fill="rgba(56,189,248,0.18)"
              stroke="rgba(125,211,252,0.85)"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{item.label}</span>
                <span className="text-sm text-sky-200">{Math.round(item.value * 100)}%</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{item.helper}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
