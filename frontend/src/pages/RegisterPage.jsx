import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import StatusBanner from "../components/StatusBanner";
import { registerUser } from "../services/authService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState({ message: "", tone: "info" });

  const submit = async (event) => {
    event.preventDefault();

    try {
      const data = await registerUser(form);
      setStatus({ message: data.message, tone: "success" });
      window.setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || "Unable to register",
        tone: "danger"
      });
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Passwords must be strong and every account can enable TOTP-based 2FA.">
      <form className="space-y-4" onSubmit={submit}>
        <StatusBanner message={status.message} tone={status.tone} />
        <input className="input" type="text" placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <input className="input" type="password" placeholder="Strong password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        <button className="button-primary w-full" type="submit">
          Register
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-300">
        Already registered? <Link to="/login" className="text-sky-300">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
