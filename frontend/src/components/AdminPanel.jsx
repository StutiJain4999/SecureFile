export default function AdminPanel({ logs, users, onToggleUser }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <section className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Audit Logs</h3>
          <span className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Admin visibility
          </span>
        </div>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log._id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="font-medium text-white">{log.action}</div>
                <div className="text-xs text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-300">
                Actor: {log.actor?.email || "Anonymous"} | Status: {log.status}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {log.ipAddress} | {log.targetType} {log.targetId || ""}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">User Management</h3>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-4"
            >
              <div>
                <div className="font-medium text-white">{user.name}</div>
                <div className="text-sm text-slate-300">
                  {user.email} | {user.role}
                </div>
              </div>
              <button
                className="button-secondary py-2"
                onClick={() => onToggleUser(user._id, !user.isActive)}
              >
                {user.isActive ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
