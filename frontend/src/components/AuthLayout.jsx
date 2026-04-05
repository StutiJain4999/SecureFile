export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel flex flex-col justify-between p-10">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
              Secure File Management System
            </span>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white md:text-5xl">
                Encrypted file handling with defense-in-depth controls.
              </h1>
              <p className="max-w-xl text-base text-slate-300">
                Authenticate with strong credentials and 2FA, enforce role-based access,
                and audit every sensitive action from a single secure workspace.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "AES-256-GCM encrypted storage",
              "JWT sessions with rate-limited auth",
              "Audit logs and threat-aware uploads"
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
