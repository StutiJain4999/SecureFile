import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import StatusBanner from "../components/StatusBanner";
import { loginUser } from "../services/authService";

export default function LoginPage({ onAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [status, setStatus] = useState({ message: "", tone: "info" });

  const submit = async (event) => {
    event.preventDefault();

    try {
      const data = await loginUser(form);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      onAuthenticated(data.user);
      navigate("/");
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || "Unable to sign in",
        tone: "danger"
      });
    }
  };

  return (
    <AuthLayout title="Sign In" subtitle="Use your password and OTP if two-factor authentication is enabled.">
      <form className="space-y-4" onSubmit={submit}>
        <StatusBanner message={status.message} tone={status.tone} />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        <input className="input" type="text" placeholder="OTP (if required)" value={form.otp} onChange={(event) => setForm({ ...form, otp: event.target.value })} />
        <button className="button-primary w-full" type="submit">
          Sign In
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-300">
        Need an account? <Link to="/register" className="text-sky-300">Create one</Link>
      </p>
    </AuthLayout>
  );
}
