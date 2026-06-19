import { useState } from "react";
import Header from "./Header";
import BrandLogo from "./BrandLogo";
import * as Icons from "./Icons";
import { apiFetch, isApiError } from "@/lib/api";

type Props = {
  onLogin: (role: "admin" | "owner" | "customer") => void;
};

export default function AccessPortal({ onLogin }: Props) {
  const [login, setLogin] = useState({ username: "", password: "" });
  const [busy, setBusy] = useState<"login" | null>(null);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy("login");
    setMessage("");
    try {
      const data = await apiFetch<{ ok: boolean; user: { role: "admin" | "owner" | "customer" } }>("/auth/login.php", {
        method: "POST",
        json: login,
      });
      onLogin(data.user.role);
      window.location.hash = data.user.role === "customer" ? "#home" : "#dashboard";
    } catch (error) {
      setMessage(isApiError(error) ? error.message : "Unable to login.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header mode="solid" />

      <section className="relative overflow-hidden pt-28 pb-16">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 scale-105"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/28827841/pexels-photo-28827841.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-emerald-50/70" />

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                <Icons.Sparkles className="w-4 h-4 text-emerald-600" />
                One access point for admin, owner, and customer
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.02] text-slate-950">
                Access TurfBD
              </h1>
              <p className="mt-5 text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
                Use the same login for admin and turf manager access. Customer signup opens on a separate page from the link below.
              </p>

              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Admin", text: "Create and manage turfs." },
                  { label: "Owner", text: "Open with the assigned login." },
                  { label: "Customer", text: "Create a booking account." },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-bold text-slate-950">{item.label}</div>
                    <div className="mt-1 text-sm text-slate-600 leading-relaxed">{item.text}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Secure login
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                  White UI
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Owner and customer access
                </span>
              </div>
            </div>

            <form
              onSubmit={handleLogin}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">Sign in</h2>
                  <p className="mt-1 text-sm text-slate-500">Enter your username and password.</p>
                </div>
                <BrandLogo className="w-28 h-8" />
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</label>
                  <input
                    value={login.username}
                    onChange={(e) => setLogin((s) => ({ ...s, username: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none text-slate-900 focus:border-emerald-500"
                    placeholder="admin"
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                  <input
                    type="password"
                    value={login.password}
                    onChange={(e) => setLogin((s) => ({ ...s, password: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none text-slate-900 focus:border-emerald-500"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                {message && <div className="text-sm text-slate-600">{message}</div>}

                <button
                  disabled={busy === "login"}
                  className="w-full rounded-2xl bg-slate-950 py-3.5 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {busy === "login" ? "Signing in..." : "Login"}
                </button>

                <a
                  href="#signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition"
                >
                  Create new account
                  <Icons.ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
