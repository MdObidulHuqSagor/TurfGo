import { useState } from "react";
import Header from "./Header";
import BrandLogo from "./BrandLogo";
import * as Icons from "./Icons";
import { apiFetch, isApiError } from "@/lib/api";

type Props = {
  onBack?: () => void;
};

export default function CustomerSignup({ onBack }: Props) {
  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    password: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState<{ full_name: string; phone_number: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const body = new FormData();
      body.append("full_name", form.full_name);
      body.append("phone_number", form.phone_number);
      body.append("password", form.password);
      if (image) body.append("profile_image", image);

      const data = await apiFetch<{
        ok: boolean;
        message: string;
        user: { full_name: string; phone_number: string };
      }>("/auth/register-customer.php", {
        method: "POST",
        body,
      });

      setMessage(data.message);
      setCreated(data.user);
      setForm({ full_name: "", phone_number: "", password: "" });
      setImage(null);
    } catch (error) {
      setMessage(isApiError(error) ? error.message : "Unable to create account.");
    } finally {
      setBusy(false);
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
              "url(https://images.pexels.com/photos/33210166/pexels-photo-33210166.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-emerald-50/70" />

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <a href="#access" onClick={onBack} className="text-sm font-semibold text-slate-500 hover:text-slate-900">
              Back to login
            </a>
            <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Customer account</span>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                <Icons.Sparkles className="w-4 h-4 text-emerald-600" />
                Customer signup
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.02] text-slate-950">
                Create a new account
              </h1>
              <p className="mt-5 text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
                Register your profile to book turfs faster.
              </p>

              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Profile", text: "Upload a photo." },
                  { label: "Contact", text: "Use your phone number." },
                  { label: "Access", text: "Sign in after signup." },
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
                  Fast signup
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                  Clean profile
                </span>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">Signup form</h2>
                  <p className="mt-1 text-sm text-slate-500">Fill in your details to continue.</p>
                </div>
                <BrandLogo className="w-28 h-8" />
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Profile image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full name</label>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none text-slate-900 focus:border-emerald-500"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone number</label>
                  <input
                    value={form.phone_number}
                    onChange={(e) => setForm((s) => ({ ...s, phone_number: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none text-slate-900 focus:border-emerald-500"
                    placeholder="+880 1XXX XXXXXX"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none text-slate-900 focus:border-emerald-500"
                    placeholder="Create password"
                  />
                </div>

                {message && <div className="text-sm text-slate-600">{message}</div>}

                <button
                  disabled={busy}
                  className="w-full rounded-2xl bg-slate-950 py-3.5 font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {busy ? "Creating..." : "Create new account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {created && (
        <section className="border-t border-slate-200 bg-slate-50 py-8">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-slate-700">
              Account created for <span className="font-bold text-slate-950">{created.full_name}</span> using phone{" "}
              <span className="font-bold text-slate-950">{created.phone_number}</span>.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
