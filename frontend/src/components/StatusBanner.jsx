export default function StatusBanner({ message, tone = "info" }) {
  if (!message) {
    return null;
  }

  const styles = {
    info: "border-sky-400/40 bg-sky-400/10 text-sky-100",
    success: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
    danger: "border-rose-400/40 bg-rose-400/10 text-rose-100"
  };

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[tone]}`}>{message}</div>;
}
