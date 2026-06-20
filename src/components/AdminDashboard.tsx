import { useEffect, useMemo, useState } from "react";
import type { ReactNode, SVGProps } from "react";
import BrandLogo from "./BrandLogo";
import * as Icons from "./Icons";
import { apiFetch, isApiError } from "@/lib/api";

type SessionUser = {
  id: number;
  role: "admin" | "owner" | "customer";
  username: string;
  full_name?: string | null;
  phone_number?: string | null;
  profile_image?: string | null;
  is_active?: number;
};

type Summary = Record<string, number>;

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
  approval_status?: string;
  is_available?: number;
  city?: string | null;
  created_at: string;
};

type BookingRow = {
  id: number;
  user_id: number;
  booked_by_role?: SessionUser["role"] | null;
  turf_id: number;
  booking_date: string;
  start_time: string;
  hours: number;
  status: string;
  payment_method: string | null;
  total_amount: number;
  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;
  created_at: string;
  turf_name: string;
  owner_name: string;
};

type ReviewRow = {
  id: number;
  turf_name: string;
  rating: number;
  comment: string;
  created_at: string;
  customer_name: string;
};

type Payload = {
  ok: boolean;
  role: SessionUser["role"];
  user: SessionUser;
  summary: Summary;
  users?: Array<{
    id: number;
    role: string;
    username: string;
    full_name: string | null;
    phone_number: string | null;
    is_active: number;
    created_at: string;
  }>;
  bookings?: BookingRow[];
  calendar_bookings?: BookingRow[];
  pending_turfs?: TurfRow[];
  requests?: BookingRow[];
  reviews?: ReviewRow[];
  turfs?: TurfRow[];
  upcoming?: BookingRow[];
  history?: BookingRow[];
  favorites?: TurfRow[];
  reports?: {
    monthly: {
      labels: string[];
      bookings: number[];
      revenue: number[];
    };
    top_turfs?: Array<{ turf_name: string; bookings: number; revenue: number }>;
  };
};

type Props = {
  onBack?: () => void;
};

type IconType = (props: SVGProps<SVGSVGElement>) => JSX.Element;

type SectionId =
  | "admin-home"
  | "create-turf"
  | "overview"
  | "users"
  | "bookings"
  | "calendar"
  | "approvals"
  | "reports"
  | "turfs"
  | "requests"
  | "availability"
  | "reviews"
  | "revenue"
  | "upcoming"
  | "history"
  | "favorites"
  | "profile"
  | "payments";

const roleNav: Record<SessionUser["role"], Array<{ id: SectionId; label: string; icon: IconType }>> = {
  admin: [
    { id: "admin-home", label: "Overview", icon: Icons.Bolt },
    { id: "create-turf", label: "Create Turf", icon: Icons.Gift },
    { id: "approvals", label: "Approvals", icon: Icons.Shield },
    { id: "users", label: "Users", icon: Icons.Users },
    { id: "bookings", label: "Bookings", icon: Icons.Calendar },
    { id: "calendar", label: "Calendar", icon: Icons.Clock },
    { id: "reports", label: "Reports", icon: Icons.Trophy },
  ],
  owner: [
    { id: "overview", label: "Overview", icon: Icons.Bolt },
    { id: "turfs", label: "Turf Management", icon: Icons.MapPin2 },
    { id: "requests", label: "Requests", icon: Icons.Calendar },
    { id: "calendar", label: "Calendar", icon: Icons.Clock },
    { id: "availability", label: "Availability", icon: Icons.Wifi },
    { id: "reviews", label: "Reviews", icon: Icons.Heart },
    { id: "revenue", label: "Revenue", icon: Icons.CreditCard },
  ],
  customer: [
    { id: "overview", label: "Overview", icon: Icons.Bolt },
    { id: "upcoming", label: "Upcoming", icon: Icons.Calendar },
    { id: "history", label: "History", icon: Icons.Clock },
    { id: "favorites", label: "Favorites", icon: Icons.Heart },
    { id: "profile", label: "Profile", icon: Icons.Users },
    { id: "payments", label: "Payments", icon: Icons.CreditCard },
    { id: "reviews", label: "Reviews", icon: Icons.Star },
  ],
};

const roleTitle: Record<SessionUser["role"], string> = {
  admin: "Admin Dashboard",
  owner: "Turf Owner Dashboard",
  customer: "Customer Dashboard",
};

const roleSubtitle: Record<SessionUser["role"], string> = {
  admin: "Platform analytics, approvals, turf creation, user management, and booking oversight.",
  owner: "Turf operations, booking requests, availability control, and revenue tracking.",
  customer: "Upcoming bookings, booking history, favorites, payments, and profile controls.",
};

const emptyTurfForm = {
  turf_name: "",
  owner_name: "",
  owner_phone: "",
  division: "",
  district: "",
  upazila: "",
  area: "",
  address_line: "",
  city: "",
  price_per_hour: "2500",
  username: "",
  password: "",
};

function money(value = 0) {
  return `৳${Math.round(value).toLocaleString("en-US")}`;
}

function dateLabel(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function dayKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayHeading(value: Date) {
  return value.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function sortTimeValue(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!match) return 0;
  let hour = Number(match[1]) % 12;
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM") hour += 12;
  return hour * 60 + minute;
}

function localDateFromKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function timeLabel(value: string) {
  return value;
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: IconType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</div>
          {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function StatusChip({ value }: { value: string }) {
  const tone =
    value === "approved" || value === "confirmed" || value === "completed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : value === "pending"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : value === "canceled" || value === "rejected"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-slate-100 text-slate-700 border-slate-200";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${tone}`}>{value}</span>;
}

function bookingTone(role?: SessionUser["role"] | null) {
  if (role === "admin") {
    return {
      frame: "border-l-4 border-rose-600 bg-rose-50",
      badge: "bg-rose-600 text-white",
      label: "Admin booking",
    };
  }
  if (role === "owner") {
    return {
      frame: "border-l-4 border-emerald-600 bg-emerald-50",
      badge: "bg-emerald-600 text-white",
      label: "Owner booking",
    };
  }
  if (role === "customer") {
    return {
      frame: "border-l-4 border-red-800 bg-red-100",
      badge: "bg-red-800 text-white",
      label: "Customer booking",
    };
  }

  return {
    frame: "border-l-4 border-slate-300 bg-white",
    badge: "bg-slate-900 text-white",
    label: "Booking",
  };
}

function CalendarBoard({
  title,
  subtitle,
  bookings,
}: {
  title: string;
  subtitle?: string;
  bookings: BookingRow[];
}) {
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const current = new Date(today);
      current.setDate(today.getDate() + index);
      const key = dayKey(current);
      const items = bookings
        .filter((booking) => booking.booking_date === key)
        .slice()
        .sort((a, b) => sortTimeValue(a.start_time) - sortTimeValue(b.start_time));
      return { key, label: dayHeading(current), items };
    });
  }, [bookings]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Next 7 days</div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        {days.map((day) => (
          <div key={day.key} className="min-h-80 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Day</div>
                <div className="mt-1 text-sm font-black text-slate-950">{day.label}</div>
              </div>
              <div className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-600">{day.items.length}</div>
            </div>

            <div className="mt-3 space-y-3">
              {day.items.length ? (
                day.items.map((booking) => (
                  <BookingSlotCard key={booking.id} booking={booking}>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-black text-slate-950">{booking.turf_name}</div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {booking.start_time} · {booking.hours}h
                        </div>
                      </div>
                      <div className="text-xs text-slate-600">
                        {booking.customer_name || "Customer"} · {money(booking.total_amount)}
                      </div>
                    </div>
                  </BookingSlotCard>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
                  No bookings.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingSlotCard({
  booking,
  children,
}: {
  booking: BookingRow;
  children: ReactNode;
}) {
  const tone = bookingTone(booking.booked_by_role);
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tone.frame}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${tone.badge}`}>
          {tone.label}
        </span>
        <StatusChip value={booking.status} />
      </div>
      {children}
    </div>
  );
}

function BarChart({
  title,
  labels,
  values,
  color = "#059669",
}: {
  title: string;
  labels: string[];
  values: number[];
  color?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">Last 6 months</p>
        </div>
      </div>
      <div className="mt-5">
        <div className="grid grid-cols-6 gap-2 items-end h-40">
          {values.map((value, index) => {
            const height = `${Math.max((value / max) * 100, 6)}%`;
            return (
              <div key={`${title}-${index}`} className="flex flex-col items-center gap-2 h-full">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full rounded-t-xl"
                    style={{ height, backgroundColor: color }}
                    title={`${labels[index]}: ${value}`}
                  />
                </div>
                <div className="text-[10px] text-slate-500 text-center leading-tight">{labels[index]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CardList({
  title,
  subtitle,
  items,
  empty,
  renderItem,
}: {
  title: string;
  subtitle?: string;
  items: unknown[];
  empty: string;
  renderItem: (item: any) => ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-black text-slate-950">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="mt-4 space-y-3">
        {items.length ? items.map(renderItem) : <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">{empty}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard({ onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [section, setSection] = useState<SectionId>("overview");
  const [busyAction, setBusyAction] = useState<string>("");
  const [message, setMessage] = useState("");
  const [turfForm, setTurfForm] = useState(emptyTurfForm);
  const [turfImage, setTurfImage] = useState<File | null>(null);
  const [ownerReveal, setOwnerReveal] = useState<{ username: string; password: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Payload>("/dashboard.php");
      setPayload(data);
      setSidebarOpen(false);
      setSection((current) => {
        const first = roleNav[data.role][0]?.id ?? "overview";
        return roleNav[data.role].some((item) => item.id === current) ? current : first;
      });
    } catch (err) {
      setError(isApiError(err) ? err.message : "Unable to load dashboard.");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const role = payload?.role;
  const user = payload?.user;
  const nav = role ? roleNav[role] : [];

  const summaryCards = useMemo(() => {
    if (!payload || !role) return [];
    const s = payload.summary;
    if (role === "admin") {
      return [
        { label: "Total users", value: String(s.total_users ?? 0), icon: Icons.Users, hint: "All non-admin accounts" },
        { label: "Total turf owners", value: String(s.total_turf_owners ?? 0), icon: Icons.MapPin2, hint: "Owner logins created" },
        { label: "Total bookings", value: String(s.total_bookings ?? 0), icon: Icons.Calendar, hint: "All booking records" },
        { label: "Revenue", value: money(s.revenue ?? 0), icon: Icons.CreditCard, hint: "Confirmed and completed" },
        { label: "Pending approvals", value: String(s.pending_turf_approvals ?? 0), icon: Icons.Shield, hint: "Awaiting review" },
      ];
    }
    if (role === "owner") {
      return [
        { label: "Total earnings", value: money(s.total_earnings ?? 0), icon: Icons.CreditCard, hint: "Confirmed and completed" },
        { label: "Booking requests", value: String(s.booking_requests ?? 0), icon: Icons.Calendar, hint: "Pending requests" },
        { label: "Turf count", value: String(s.total_turfs ?? 0), icon: Icons.MapPin2, hint: "Managed venues" },
        { label: "Customer reviews", value: String(s.customer_reviews ?? 0), icon: Icons.Heart, hint: "Recent feedback" },
      ];
    }
    return [
      { label: "Upcoming bookings", value: String(s.upcoming_bookings ?? 0), icon: Icons.Calendar, hint: "Scheduled soon" },
      { label: "Favorite turfs", value: String(s.favorites ?? 0), icon: Icons.Heart, hint: "Saved for later" },
      { label: "Payment history", value: money(s.payment_history ?? 0), icon: Icons.CreditCard, hint: "Paid bookings" },
      { label: "Reviews written", value: String(s.reviews ?? 0), icon: Icons.Star, hint: "Your feedback" },
    ];
  }, [payload, role]);

  const monthly = payload?.reports?.monthly ?? { labels: [], bookings: [], revenue: [] };
  const calendarBookings = useMemo(() => {
    if (role === "admin" || role === "owner") {
      return payload?.calendar_bookings ?? payload?.bookings ?? [];
    }
    return payload?.upcoming ?? [];
  }, [payload, role]);

  async function runAction(action: string, body: Record<string, unknown>) {
    setBusyAction(action);
    setMessage("");
    try {
      const response = await apiFetch<{ ok: boolean; message: string }>("/dashboard-action.php", {
        method: "POST",
        json: { action, ...body },
      });
      setMessage(response.message);
      await loadDashboard();
    } catch (err) {
      setMessage(isApiError(err) ? err.message : "Action failed.");
    } finally {
      setBusyAction("");
    }
  }

  async function handleLogout() {
    await apiFetch("/auth/logout.php", { method: "POST" });
    setSidebarOpen(false);
    window.location.hash = "#access";
  }

  async function handleCreateTurf(e: React.FormEvent) {
    e.preventDefault();
    setBusyAction("create-turf");
    setMessage("");
    try {
      const body = new FormData();
      Object.entries(turfForm).forEach(([key, value]) => body.append(key, value));
      if (turfImage) body.append("turf_image", turfImage);

      const response = await apiFetch<{
        ok: boolean;
        message: string;
        owner: { username: string; password: string };
      }>("/admin/create-turf.php", {
        method: "POST",
        body,
      });

      setMessage(response.message);
      setOwnerReveal(response.owner);
      setTurfForm(emptyTurfForm);
      setTurfImage(null);
      await loadDashboard();
      setSection("admin-home");
    } catch (err) {
      setMessage(isApiError(err) ? err.message : "Unable to create turf.");
    } finally {
      setBusyAction("");
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-50 text-slate-900 grid place-items-center px-5">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          Loading dashboard...
        </div>
      </section>
    );
  }

  if (error || !payload || !role || !user) {
    return (
      <section className="min-h-screen bg-slate-50 text-slate-900 grid place-items-center px-5">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Access required</div>
          <h1 className="mt-4 text-3xl font-black text-slate-950">Sign in to continue</h1>
          <p className="mt-3 text-slate-600">{error || "No active session was found."}</p>
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
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <a href="#home" onClick={onBack} className="inline-flex items-center gap-3">
            <BrandLogo className="h-9 w-[132px]" />
          </a>
          <div className="hidden md:block">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{roleTitle[role]}</div>
            <div className="mt-0.5 text-sm text-slate-600">{roleSubtitle[role]}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
              aria-label="Open menu"
            >
              <Icons.Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-white text-xs font-black">
                {user.full_name ? user.full_name.slice(0, 1).toUpperCase() : user.username.slice(0, 1).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-950">{user.full_name || user.username}</div>
                <div className="text-xs text-slate-500 capitalize">{role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">{roleTitle[role]}</div>
            <h1 className="mt-2 text-3xl font-black text-slate-950 lg:text-4xl">{roleSubtitle[role]}</h1>
          </div>
          {message && <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{message}</div>}
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:block">
            <div className="mb-4 px-2">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Menu</div>
              <div className="mt-1 text-sm font-black text-slate-950">{roleTitle[role]}</div>
            </div>
            <div className="space-y-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSection(item.id);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                      active ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
              Switch between dashboard sections from here.
            </div>
          </aside>

          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-slate-950/50"
                aria-label="Close menu overlay"
                onClick={() => setSidebarOpen(false)}
              />
              <aside className="absolute left-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Menu</div>
                    <div className="mt-1 text-sm font-black text-slate-950">{roleTitle[role]}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
                    aria-label="Close menu"
                  >
                    <Icons.Close className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 space-y-1">
                  {nav.map((item) => {
                    const Icon = item.icon;
                    const active = section === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSection(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                          active ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
                  Switch between dashboard sections from here.
                </div>
              </aside>
            </div>
          )}

          <div className="space-y-6">
              {section === "admin-home" && (
                <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                  <div className="space-y-6">
                    <div className="grid gap-4 xl:grid-cols-2">
                      <BarChart title="Bookings trend" labels={monthly.labels} values={monthly.bookings} color="#059669" />
                      <BarChart title="Revenue trend" labels={monthly.labels} values={monthly.revenue} color="#0f172a" />
                    </div>
                    <CardList
                      title="Recent bookings"
                      subtitle="Latest platform activity"
                      items={payload.bookings ?? []}
                      empty="No bookings available."
                      renderItem={(b: BookingRow) => (
                        <BookingSlotCard key={b.id} booking={b}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-bold text-slate-950">{b.turf_name}</div>
                              <div className="mt-1 text-sm text-slate-600">{b.customer_name || "Customer"} · {b.booking_date}</div>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                            <span>{timeLabel(b.start_time)}</span>
                            <span>{b.hours}h</span>
                            <span>{money(b.total_amount)}</span>
                          </div>
                        </BookingSlotCard>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <CardList
                      title="Pending turf approvals"
                      subtitle="Review and publish new venues"
                      items={payload.pending_turfs ?? []}
                      empty="No pending turfs."
                      renderItem={(t: TurfRow) => (
                        <div key={t.id} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-bold text-slate-950">{t.turf_name}</div>
                              <div className="mt-1 text-sm text-slate-600">{t.owner_name} · {t.district}</div>
                            </div>
                            <StatusChip value={t.approval_status || "pending"} />
                          </div>
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => runAction("approve_turf", { turf_id: t.id })}
                              disabled={busyAction === "approve_turf"}
                              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => runAction("reject_turf", { turf_id: t.id })}
                              disabled={busyAction === "reject_turf"}
                              className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    />
                    <CardList
                      title="Top turfs"
                      subtitle="Revenue leaders"
                      items={payload.reports?.top_turfs ?? []}
                      empty="No revenue data yet."
                      renderItem={(t: { turf_name: string; bookings: number; revenue: number }) => (
                        <div key={t.turf_name} className="rounded-2xl border border-slate-200 p-4">
                          <div className="font-bold text-slate-950">{t.turf_name}</div>
                          <div className="mt-1 text-sm text-slate-600">{t.bookings} bookings</div>
                          <div className="mt-1 text-sm font-bold text-slate-900">{money(t.revenue)}</div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              )}

              {section === "create-turf" && (
                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <form onSubmit={handleCreateTurf} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black text-slate-950">Create turf and owner access</h2>
                        <p className="mt-1 text-sm text-slate-500">Same turf creation flow as before, now inside the dashboard.</p>
                      </div>
                      <StatusChip value="new" />
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {[
                        ["turf_name", "Turf name"],
                        ["owner_name", "Owner name"],
                        ["owner_phone", "Owner phone number"],
                        ["city", "City"],
                        ["division", "Division"],
                        ["district", "District"],
                        ["upazila", "Upazila / Thana"],
                        ["area", "Area / Ward"],
                        ["price_per_hour", "Price per hour"],
                        ["username", "Owner username"],
                        ["password", "Owner password"],
                      ].map(([key, label]) => (
                        <div key={key} className={key === "username" || key === "password" || key === "price_per_hour" ? "md:col-span-1" : ""}>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                          <input
                            type={key === "password" ? "password" : key === "price_per_hour" ? "number" : "text"}
                            step={key === "price_per_hour" ? "0.01" : undefined}
                            min={key === "price_per_hour" ? "0" : undefined}
                            value={turfForm[key as keyof typeof turfForm]}
                            onChange={(e) => setTurfForm((s) => ({ ...s, [key]: e.target.value }))}
                            className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none text-slate-900 focus:border-emerald-500"
                          />
                        </div>
                      ))}
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Address line</label>
                        <textarea
                          value={turfForm.address_line}
                          onChange={(e) => setTurfForm((s) => ({ ...s, address_line: e.target.value }))}
                          className="mt-1.5 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none text-slate-900 focus:border-emerald-500"
                          placeholder="Road, landmark, building, gate, etc."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Turf image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setTurfImage(e.target.files?.[0] ?? null)}
                          className="mt-1.5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-center justify-between gap-3">
                        <div className="text-xs text-slate-500">
                          Creating a turf also creates the owner login.
                        </div>
                        <button
                          disabled={busyAction === "create-turf"}
                          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                        >
                          {busyAction === "create-turf" ? "Saving..." : "Create turf"}
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-black text-slate-950">Created owner access</h3>
                      {ownerReveal ? (
                        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-slate-700">
                          <div><span className="font-bold">Username:</span> {ownerReveal.username}</div>
                          <div className="mt-1"><span className="font-bold">Password:</span> {ownerReveal.password}</div>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-slate-500">
                          New owner credentials will appear here after you save a turf.
                        </p>
                      )}
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-black text-slate-950">Search fields saved</h3>
                      <ul className="mt-4 space-y-2 text-sm text-slate-600">
                        <li>City</li>
                        <li>Division</li>
                        <li>District</li>
                        <li>Upazila / Thana</li>
                        <li>Area / Ward</li>
                        <li>Address line</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {section === "approvals" && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-black text-slate-950">Pending turf approvals</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(payload.pending_turfs ?? []).map((t) => (
                      <div key={t.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-slate-950">{t.turf_name}</div>
                            <div className="mt-1 text-sm text-slate-600">{t.owner_name}</div>
                          </div>
                          <StatusChip value={t.approval_status || "pending"} />
                        </div>
                        <div className="mt-3 text-sm text-slate-500">{t.division} · {t.district}</div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => runAction("approve_turf", { turf_id: t.id })}
                            disabled={busyAction === "approve_turf"}
                            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => runAction("reject_turf", { turf_id: t.id })}
                            disabled={busyAction === "reject_turf"}
                            className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                    {!payload.pending_turfs?.length && <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No pending approvals.</div>}
                  </div>
                </div>
              )}

              {section === "users" && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-slate-950">User management</h2>
                      <p className="mt-1 text-sm text-slate-500">Admin, owner, and customer accounts stored in MySQL.</p>
                    </div>
                  </div>
                  <div className="mt-4 overflow-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="py-3 pr-4">User</th>
                          <th className="py-3 pr-4">Role</th>
                          <th className="py-3 pr-4">Phone</th>
                          <th className="py-3 pr-4">Status</th>
                          <th className="py-3 pr-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(payload.users ?? []).map((u) => (
                          <tr key={u.id} className="border-b border-slate-100">
                            <td className="py-3 pr-4">
                              <div className="font-bold text-slate-950">{u.full_name || u.username}</div>
                              <div className="text-xs text-slate-500">{u.username}</div>
                            </td>
                            <td className="py-3 pr-4 capitalize">{u.role}</td>
                            <td className="py-3 pr-4">{u.phone_number || "-"}</td>
                            <td className="py-3 pr-4">
                              <StatusChip value={u.is_active ? "active" : "inactive"} />
                            </td>
                            <td className="py-3 pr-4">
                              <button
                                onClick={() => runAction("toggle_user", { user_id: u.id, is_active: u.is_active ? 0 : 1 })}
                                disabled={busyAction === "toggle_user" || u.role === "admin"}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-60"
                              >
                                {u.is_active ? "Deactivate" : "Activate"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {section === "bookings" && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-black text-slate-950">Booking management</h2>
                  <div className="mt-4 grid gap-4">
                    {(payload.bookings ?? []).map((b) => (
                      <BookingSlotCard key={b.id} booking={b}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-slate-950">{b.turf_name}</div>
                            <div className="mt-1 text-sm text-slate-600">{b.customer_name || "Customer"} · {b.booking_date} · {b.start_time}</div>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => runAction("update_booking_status", { booking_id: b.id, status: "confirmed" })}
                            disabled={busyAction === "update_booking_status"}
                            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => runAction("update_booking_status", { booking_id: b.id, status: "completed" })}
                            disabled={busyAction === "update_booking_status"}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-60"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => runAction("update_booking_status", { booking_id: b.id, status: "canceled" })}
                            disabled={busyAction === "update_booking_status"}
                            className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </BookingSlotCard>
                    ))}
                  </div>
                </div>
              )}

              {section === "calendar" && (
                <CalendarBoard
                  title={role === "admin" ? "Admin booking calendar" : "Owner booking calendar"}
                  subtitle={role === "admin" ? "All platform bookings grouped by day." : "Your turf bookings grouped by day."}
                  bookings={calendarBookings}
                />
              )}

              {section === "reports" && (
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <BarChart title="Bookings trend" labels={monthly.labels} values={monthly.bookings} color="#059669" />
                  <BarChart title="Revenue trend" labels={monthly.labels} values={monthly.revenue} color="#0f172a" />
                </div>
              )}

        {role === "owner" && section === "overview" && (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="grid gap-4 xl:grid-cols-2">
                <BarChart title="Owner bookings trend" labels={monthly.labels} values={monthly.bookings} color="#059669" />
                <BarChart title="Owner revenue trend" labels={monthly.labels} values={monthly.revenue} color="#0f172a" />
              </div>
              <CardList
                title="Booking requests"
                subtitle="New requests waiting for action"
                items={payload.requests ?? []}
                empty="No booking requests."
                renderItem={(b: BookingRow) => (
                  <BookingSlotCard key={b.id} booking={b}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-950">{b.customer_name || "Customer"}</div>
                        <div className="mt-1 text-sm text-slate-600">{b.turf_name} · {b.booking_date}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => runAction("update_booking_status", { booking_id: b.id, status: "confirmed" })}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => runAction("update_booking_status", { booking_id: b.id, status: "canceled" })}
                        className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700"
                      >
                        Decline
                      </button>
                    </div>
                  </BookingSlotCard>
                )}
              />
            </div>
            <CardList
              title="Recent reviews"
              subtitle="Customer feedback"
              items={payload.reviews ?? []}
              empty="No reviews yet."
              renderItem={(r: ReviewRow) => (
                <div key={r.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-950">{r.customer_name}</div>
                      <div className="text-xs text-slate-500">{r.turf_name}</div>
                    </div>
                    <div className="flex gap-0.5 text-amber-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Icons.Star key={i} className="h-4 w-4" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{r.comment}</p>
                </div>
              )}
            />
          </div>
        )}

        {role === "owner" && section === "turfs" && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(payload.turfs ?? []).map((t) => (
              <div key={t.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <img src={t.turf_image || "/brand-logo.png"} alt={t.turf_name} className="h-40 w-full rounded-2xl object-cover" />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-950">{t.turf_name}</div>
                    <div className="text-sm text-slate-500">{t.division} · {t.district}</div>
                  </div>
                  <StatusChip value={t.approval_status || "approved"} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Availability</span>
                  <span className="font-bold text-slate-900">{t.is_available ? "Open" : "Closed"}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {role === "owner" && section === "requests" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">Booking requests</h2>
              <div className="mt-4 grid gap-4">
                {(payload.requests ?? []).map((b) => (
                  <BookingSlotCard key={b.id} booking={b}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-950">{b.customer_name || "Customer"}</div>
                        <div className="mt-1 text-sm text-slate-600">{b.turf_name} · {b.booking_date} · {b.start_time}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                      onClick={() => runAction("update_booking_status", { booking_id: b.id, status: "confirmed" })}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => runAction("update_booking_status", { booking_id: b.id, status: "canceled" })}
                      className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700"
                    >
                      Reject
                      </button>
                    </div>
                  </BookingSlotCard>
                ))}
              </div>
            </div>
          )}

        {role === "owner" && section === "availability" && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(payload.turfs ?? []).map((t) => (
              <div key={t.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-950">{t.turf_name}</div>
                    <div className="text-sm text-slate-500">{t.district}</div>
                  </div>
                  <StatusChip value={t.is_available ? "open" : "closed"} />
                </div>
                <button
                  onClick={() => runAction("toggle_availability", { turf_id: t.id, is_available: t.is_available ? 0 : 1 })}
                  className="mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                >
                  {t.is_available ? "Mark closed" : "Mark open"}
                </button>
              </div>
            ))}
          </div>
        )}

        {role === "owner" && section === "reviews" && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(payload.reviews ?? []).map((r) => (
              <div key={r.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-950">{r.customer_name}</div>
                    <div className="text-xs text-slate-500">{r.turf_name}</div>
                  </div>
                  <div className="flex gap-0.5 text-amber-500">{Array.from({ length: r.rating }).map((_, i) => <Icons.Star key={i} className="h-4 w-4" />)}</div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {role === "owner" && section === "revenue" && (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <BarChart title="Revenue trend" labels={monthly.labels} values={monthly.revenue} color="#0f172a" />
            <CardList
              title="Monthly earning summary"
              items={(payload.reports?.monthly.labels ?? []).map((label, index) => ({
                label,
                bookings: payload.reports?.monthly.bookings[index] ?? 0,
                revenue: payload.reports?.monthly.revenue[index] ?? 0,
              }))}
              empty="No report data."
              renderItem={(row: { label: string; bookings: number; revenue: number }) => (
                <div key={row.label} className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-bold text-slate-950">{row.label}</div>
                  <div className="mt-1 text-sm text-slate-600">{row.bookings} bookings</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{money(row.revenue)}</div>
                </div>
              )}
            />
          </div>
        )}

        {role === "customer" && section === "overview" && (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="grid gap-4 xl:grid-cols-2">
                <BarChart title="Booking activity" labels={monthly.labels} values={monthly.bookings} color="#059669" />
                <BarChart title="Payment history" labels={monthly.labels} values={monthly.revenue} color="#0f172a" />
              </div>
              <CardList
                title="Upcoming bookings"
                subtitle="Your next matches"
                items={payload.upcoming ?? []}
                empty="No upcoming bookings."
                renderItem={(b: BookingRow) => (
                  <BookingSlotCard key={b.id} booking={b}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-950">{b.turf_name}</div>
                        <div className="mt-1 text-sm text-slate-600">{dateLabel(b.booking_date)} · {b.start_time}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">{money(b.total_amount)}</div>
                  </BookingSlotCard>
                )}
              />
            </div>
            <CardList
              title="Favorite turfs"
              subtitle="Saved venues"
              items={payload.favorites ?? []}
              empty="No favorite turfs yet."
              renderItem={(t: TurfRow) => (
                <div key={t.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-950">{t.turf_name}</div>
                      <div className="text-sm text-slate-500">{t.district}</div>
                    </div>
                    <button
                      onClick={() => runAction("toggle_favorite", { turf_id: t.id })}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        )}

        {role === "customer" && section === "history" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">Booking history</h2>
              <div className="mt-4 grid gap-4">
                {(payload.history ?? []).map((b) => (
                  <BookingSlotCard key={b.id} booking={b}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-950">{b.turf_name}</div>
                        <div className="mt-1 text-sm text-slate-600">{dateLabel(b.booking_date)} · {b.start_time}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>{b.hours}h</span>
                      <span>{money(b.total_amount)}</span>
                    </div>
                  </BookingSlotCard>
                ))}
              </div>
            </div>
          )}

        {role === "customer" && section === "favorites" && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(payload.favorites ?? []).map((t) => (
              <div key={t.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <img src={t.turf_image || "/brand-logo.png"} alt={t.turf_name} className="h-40 w-full rounded-2xl object-cover" />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-950">{t.turf_name}</div>
                    <div className="text-sm text-slate-500">{t.division} · {t.district}</div>
                  </div>
                  <button
                    onClick={() => runAction("toggle_favorite", { turf_id: t.id })}
                    className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {role === "customer" && section === "profile" && (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-950 text-white text-xl font-black">
                  {user.full_name ? user.full_name.slice(0, 1).toUpperCase() : user.username.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Profile settings</div>
                  <div className="mt-1 text-2xl font-black text-slate-950">{user.full_name || user.username}</div>
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</div>
                  <div className="mt-1 rounded-2xl border border-slate-200 px-4 py-3">{user.username}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</div>
                  <div className="mt-1 rounded-2xl border border-slate-200 px-4 py-3">{user.phone_number || "-"}</div>
                </div>
              </div>
            </div>
            <CardList
              title="Recent reviews"
              subtitle="Your feedback on turfs"
              items={payload.reviews ?? []}
              empty="No reviews written yet."
              renderItem={(r: ReviewRow) => (
                <div key={r.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-950">{r.turf_name}</div>
                      <div className="text-xs text-slate-500">{dateLabel(r.created_at)}</div>
                    </div>
                    <div className="flex gap-0.5 text-amber-500">{Array.from({ length: r.rating }).map((_, i) => <Icons.Star key={i} className="h-4 w-4" />)}</div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{r.comment}</p>
                </div>
              )}
            />
          </div>
        )}

        {role === "customer" && section === "payments" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">Payment history</h2>
              <div className="mt-4 grid gap-4">
                {(payload.history ?? []).map((b) => (
                  <BookingSlotCard key={b.id} booking={b}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-950">{b.turf_name}</div>
                        <div className="mt-1 text-sm text-slate-600">{b.payment_method || "Cash"} · {dateLabel(b.booking_date)}</div>
                      </div>
                      <div className="font-bold text-slate-950">{money(b.total_amount)}</div>
                    </div>
                  </BookingSlotCard>
                ))}
              </div>
            </div>
        )}

        {role === "customer" && section === "reviews" && (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <CardList
              title="Your reviews"
              subtitle="Latest ratings and comments"
              items={payload.reviews ?? []}
              empty="No reviews written yet."
              renderItem={(r: ReviewRow) => (
                <div key={r.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-950">{r.turf_name}</div>
                      <div className="text-xs text-slate-500">{dateLabel(r.created_at)}</div>
                    </div>
                    <div className="flex gap-0.5 text-amber-500">{Array.from({ length: r.rating }).map((_, i) => <Icons.Star key={i} className="h-4 w-4" />)}</div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{r.comment}</p>
                </div>
              )}
            />
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-950">Add a review</h3>
              <p className="mt-1 text-sm text-slate-500">Use the booking actions after a match to leave feedback.</p>
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                Review creation can be connected to a turf picker or a completed booking later.
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </section>
  );
}
