export default function FeatureSpotlight({ items }) {
  return (
    <section className="panel p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Visible Features</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Security Showcase</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(2,6,23,0.95))] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(8,145,178,0.12)]"
          >
            <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
              {item.kicker}
            </div>
            <h4 className="mt-4 text-xl font-semibold text-white">{item.title}</h4>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
              {item.status}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
