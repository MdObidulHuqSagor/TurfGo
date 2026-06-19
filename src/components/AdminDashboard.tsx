import { useEffect, useMemo, useState } from "react";
import * as Icons from "./Icons";
import { apiFetch, isApiError } from "@/lib/api";

type SessionUser = {
  id: number;
  role: string;
  username: string;
  full_name?: string | null;
  phone_number?: string | null;
  profile_image?: string | null;
};

type TurfRow = {
  id: number;
  turf_name: string;
  owner_name: string;
  owner_phone: string;
  division: string;
  district: string;
  upazila: string | null;
  area: string | null;
  address_line: string | null;
  price_per_hour: number;
  turf_image: string | null;
  owner_username: string | null;
  created_at: string;
};

type Props = {
  onBack?: () => void;
};

const emptyForm = {
  turf_name: "",
  owner_name: "",
  owner_phone: "",
  division: "",
  district: "",
  upazila: "",
  area: "",
  address_line: "",
  price_per_hour: "2500",
  username: "",
  password: "",
};

export default function AdminDashboard({ onBack }: Props) {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [turfs, setTurfs] = useState<TurfRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"create" | "list">("create");
  const [ownerReveal, setOwnerReveal] = useState<{ username: string; password: string } | null>(null);

  const stats = useMemo(
    () => [
      { label: "Turfs", value: turfs.length.toString() },
      { label: "Owners", value: String(new Set(turfs.map((t) => t.owner_username)).size) },
      { label: "Locations", value: String(new Set(turfs.map((t) => `${t.division}:${t.district}`)).size) },
    ],
    [turfs],
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await apiFetch<{ ok: boolean; user: SessionUser | null }>("/auth/me.php");
        if (mounted) setSession(data.user);
        if (data.user?.role) {
          await loadTurfs(data.user.role, mounted);
        }
      } catch {
        if (mounted) setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function loadTurfs(role: SessionUser["role"] = "admin", mounted = true) {
    const path = role === "owner" ? "/owner/turfs.php" : "/admin/turfs.php";
    const data = await apiFetch<{ ok: boolean; turfs: TurfRow[] }>(path);
    if (mounted) setTurfs(data.turfs);
  }

  async function handleLogout() {
    setBusy(true);
    try {
      await apiFetch("/auth/logout.php", { method: "POST" });
      setSession(null);
      setTurfs([]);
      setOwnerReveal(null);
      setMessage("Logged out.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateTurf(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      if (image) body.append("turf_image", image);

      const data = await apiFetch<{
        ok: boolean;
        message: string;
        owner: { username: string; password: string };
        turf: TurfRow;
      }>("/admin/create-turf.php", {
        method: "POST",
        body,
      });

      setOwnerReveal(data.owner);
      setMessage(data.message);
      setForm(emptyForm);
      setImage(null);
      await loadTurfs();
      setTab("list");
    } catch (error) {
      setMessage(isApiError(error) ? error.message : "Unable to create turf.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-950 text-white grid place-items-center px-5">
        <div className="text-sm text-white/70">Loading admin dashboard...</div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="min-h-screen bg-slate-50 text-slate-900 grid place-items-center px-5">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] text-center">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Access required</div>
          <h1 className="mt-4 text-3xl font-black text-slate-950">Please sign in</h1>
          <p className="mt-3 text-slate-600">
            Use the access page to sign in or create a customer account.
          </p>
          <a
            href="#access"
            onClick={onBack}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-slate-800"
          >
            Go to login
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-emerald-600 font-bold">
              {session.role === "admin" ? "Admin dashboard" : "Owner dashboard"}
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {session.role === "admin" ? "Turf operations" : "Assigned turfs"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="#home" onClick={onBack} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              Back to site
            </a>
            <button
              onClick={handleLogout}
              disabled={busy}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm text-slate-500">{stat.label}</div>
              <div className="mt-2 text-3xl font-black text-slate-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {session.role === "admin" && (
          <div className="flex gap-2 mb-6">
            {[
              { id: "create", label: "Create Turf" },
              { id: "list", label: "Turfs" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as "create" | "list")}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  tab === item.id ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {session.role === "admin"
                    ? tab === "create"
                      ? "Create turf and owner access"
                      : "Registered turfs"
                    : "Registered turfs"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {session.role === "admin"
                    ? tab === "create"
                      ? "Create the owner login and store the turf metadata in MySQL."
                      : "Review created entries and the location data used for search."
                    : "Your turfs and locations are shown here."}
                </p>
              </div>
              {message && <div className="text-sm text-emerald-700">{message}</div>}
            </div>

            {session.role === "admin" && tab === "create" ? (
              <form onSubmit={handleCreateTurf} className="mt-6 grid md:grid-cols-2 gap-4">
                {[
                  ["turf_name", "Turf name"],
                  ["owner_name", "Owner name"],
                  ["owner_phone", "Owner phone number"],
                  ["division", "Division"],
                  ["district", "District"],
                  ["upazila", "Upazila / Thana"],
                  ["area", "Area / Ward"],
                  ["username", "Owner username"],
                  ["password", "Owner password"],
                  ["price_per_hour", "Price per hour"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                    <input
                      type={key === "password" ? "password" : key === "price_per_hour" ? "number" : "text"}
                      step={key === "price_per_hour" ? "0.01" : undefined}
                      min={key === "price_per_hour" ? "0" : undefined}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
                      className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Address line</label>
                  <textarea
                    value={form.address_line}
                    onChange={(e) => setForm((s) => ({ ...s, address_line: e.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 min-h-28"
                    placeholder="Road, landmark, building, gate, etc."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Turf image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    The owner credentials are stored as a hashed MySQL user record.
                  </div>
                  <button
                    disabled={busy}
                    className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {busy ? "Saving..." : "Create turf"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                <div className="max-h-[720px] overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="sticky top-0 bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Turf</th>
                        <th className="px-4 py-3 font-semibold">Location</th>
                        <th className="px-4 py-3 font-semibold">Owner</th>
                        <th className="px-4 py-3 font-semibold">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {turfs.map((turf) => (
                        <tr key={turf.id} className="align-top">
                          <td className="px-4 py-4">
                            <div className="font-bold text-slate-900">{turf.turf_name}</div>
                            <div className="text-xs text-slate-500 mt-1">#{turf.id}</div>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            <div>{turf.division}</div>
                            <div>{turf.district}</div>
                            <div>{turf.upazila}</div>
                            <div className="text-xs text-slate-400 mt-1">{turf.area}</div>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            <div className="font-semibold text-slate-900">{turf.owner_name}</div>
                            <div>{turf.owner_phone}</div>
                            <div className="text-xs text-slate-400 mt-1">{turf.owner_username}</div>
                          </td>
                          <td className="px-4 py-4 text-slate-900 font-semibold">
                            ৳{Number(turf.price_per_hour).toFixed(0)}
                            <div className="text-xs text-slate-400 mt-1">{turf.created_at}</div>
                          </td>
                        </tr>
                      ))}
                      {turfs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                            No turfs created yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {session.role === "admin" ? (
              <>
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-black text-slate-900">Created owner access</h3>
                  {ownerReveal ? (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-slate-700">
                      <div><span className="font-bold">Username:</span> {ownerReveal.username}</div>
                      <div className="mt-1"><span className="font-bold">Password:</span> {ownerReveal.password}</div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      The latest owner credentials will appear here after turf creation.
                    </p>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-black text-slate-900">Search fields saved</h3>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>Division</li>
                    <li>District</li>
                    <li>Upazila / Thana</li>
                    <li>Area / Ward</li>
                    <li>Address line</li>
                    <li>Owner name and phone</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-black text-slate-900">Owner access</h3>
                <p className="mt-4 text-sm text-slate-600">
                  Turf manager accounts can review their assigned turfs here after signing in.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
