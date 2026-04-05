const orbitItems = [
  { label: "2FA", angle: 20, radius: 124, tone: "bg-sky-400" },
  { label: "AES-256", angle: 85, radius: 118, tone: "bg-emerald-400" },
  { label: "RBAC", angle: 150, radius: 112, tone: "bg-amber-400" },
  { label: "Logs", angle: 220, radius: 120, tone: "bg-rose-400" },
  { label: "Scan", angle: 295, radius: 116, tone: "bg-cyan-300" }
];

export default function FeatureOrbit() {
  return (
    <section className="panel relative overflow-hidden p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Interactive Core</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Security Orbit</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          Live concept view
        </div>
      </div>

      <div className="relative mx-auto mt-6 h-[360px] w-full max-w-[420px] perspective-[1400px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-72 w-72 rotate-x-[66deg] rounded-full border border-sky-300/25 bg-[radial-gradient(circle,rgba(56,189,248,0.18),transparent_65%)] shadow-[0_0_80px_rgba(14,165,233,0.12)]">
            <div className="absolute inset-8 rounded-full border border-white/10" />
            <div className="absolute inset-16 rounded-full border border-white/10" />
            <div className="absolute inset-[5.6rem] rounded-full border border-dashed border-sky-300/20" />
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-white/15 bg-slate-950/85 p-5 shadow-[0_30px_90px_rgba(2,6,23,0.6)] backdrop-blur-xl transition duration-300 hover:rotate-y-12 hover:rotate-x-6">
          <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Secure Node</div>
          <div className="mt-3 text-2xl font-semibold text-white">Core</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Authentication, encryption, RBAC, auditing, and threat defense layered together.
          </p>
        </div>

        {orbitItems.map((item) => {
          const radians = (item.angle * Math.PI) / 180;
          const x = Math.cos(radians) * item.radius;
          const y = Math.sin(radians) * item.radius;

          return (
            <div
              key={item.label}
              className="absolute left-1/2 top-1/2 transition duration-300 hover:scale-110"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
              }}
            >
              <div className="rounded-2xl border border-white/15 bg-slate-900/85 px-4 py-3 shadow-[0_18px_50px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${item.tone}`} />
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
