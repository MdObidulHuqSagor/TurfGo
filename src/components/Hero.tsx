import { useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "./Icons";
import { cities } from "../data/turfs";

export default function Hero({ onSearch }: { onSearch: (q: string, c: string) => void }) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("All Cities");

  return (
    <section id="home" className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/28827841/pexels-photo-28827841.jpeg?auto=compress&cs=tinysrgb&w=1920)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-emerald-950/80 to-slate-900/70" />
      {/* Floating shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-green-500/8 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-emerald-400/5 blur-2xl" />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-28 pb-32 lg:pt-32 lg:pb-40 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-semibold text-white mb-6"
            >
              <Icons.Sparkles className="w-4 h-4 text-emerald-400" />
              🇧🇩 #1 Turf Booking Platform in Bangladesh
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-black leading-[1.1] tracking-tight text-white">
              Find & Book the
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  Best Turfs
                </span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="absolute bottom-1 left-0 h-1 bg-emerald-500/40 rounded-full"
                />
              </span>{" "}
              Near You
            </h1>

            <p className="mt-6 text-lg text-white/70 max-w-lg leading-relaxed">
              Discover 500+ premium football turfs across Dhaka, Chittagong, Sylhet & more. Book in seconds, pay with bKash & hit the ground.
            </p>

            {/* Search bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSearch(q, city);
                document.getElementById("turfs")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-8 bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl shadow-black/30 max-w-xl"
            >
              <div className="flex items-center gap-2 flex-1 px-3">
                <Icons.Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by turf name or area..."
                  className="w-full py-3 outline-none text-slate-800 placeholder:text-slate-400 bg-transparent text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="px-3 py-3 rounded-xl bg-slate-50 outline-none text-slate-700 font-medium text-sm min-w-[120px]"
                >
                  {cities.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5 text-sm whitespace-nowrap">
                  Search ⚡
                </button>
              </div>
            </form>

            {/* Stats row */}
            <div className="mt-10 flex items-center gap-8 flex-wrap">
              {[
                { v: "500+", l: "Turfs Listed" },
                { v: "25+", l: "Cities" },
                { v: "50K+", l: "Happy Players" },
              ].map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.15 }}
                >
                  <div className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                    {s.v}
                  </div>
                  <div className="text-sm text-white/50 mt-0.5">{s.l}</div>
                </motion.div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex items-center gap-4 flex-wrap">
              <div className="flex -space-x-2">
                {["🧑", "👩", "🧔", "👨"].map((e, i) => (
                  <span key={i} className="w-9 h-9 rounded-full border-2 border-slate-900 bg-gradient-to-br from-emerald-500 to-green-600 grid place-items-center text-sm">
                    {e}
                  </span>
                ))}
              </div>
              <div className="text-sm text-white/60">
                <span className="text-white font-semibold">2,340+</span> bookings this week
              </div>
            </div>
          </motion.div>

          {/* Right - floating cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="hidden lg:block relative"
          >
            <div className="relative w-full h-[480px]">
              {/* Main card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-6 right-0 w-72 bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <img
                  src="https://images.pexels.com/photos/33210166/pexels-photo-33210166.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Turf"
                  className="w-full h-36 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Gulshan Sports Hub</h4>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Icons.Star className="w-3.5 h-3.5" /> 4.8
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Icons.Pin className="w-3 h-3" /> Gulshan-2, Dhaka
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-600">৳3,000<span className="text-xs font-normal text-slate-400">/hr</span></span>
                    <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Book</span>
                  </div>
                </div>
              </motion.div>

              {/* Smaller card */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-10 left-0 w-56 bg-white/95 backdrop-blur rounded-2xl shadow-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 grid place-items-center text-2xl">⚽</div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Booking Confirmed!</div>
                    <div className="text-xs text-emerald-600 font-medium">Mirpur Champions Field</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Icons.Calendar className="w-3.5 h-3.5" /> Today, 6:00 PM — 2hrs
                </div>
              </motion.div>

              {/* Badge */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
                className="absolute top-0 left-10 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2"
              >
                <Icons.Bolt className="w-5 h-5" />
                <div>
                  <div className="text-xs font-bold">Instant Booking</div>
                  <div className="text-[10px] text-white/80">No waiting</div>
                </div>
              </motion.div>

              {/* Rating badge */}
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 0.8 }}
                className="absolute bottom-32 right-4 bg-white/95 backdrop-blur rounded-2xl shadow-lg px-4 py-3"
              >
                <div className="flex gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => <Icons.Star key={i} className="w-4 h-4" />)}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-medium">4.9 avg rating</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" className="w-full h-16 fill-white">
          <path d="M0,60L60,55C120,50,240,40,360,38C480,36,600,42,720,48C840,54,960,60,1080,58C1200,56,1320,46,1380,41L1440,36L1440,100L0,100Z" />
        </svg>
      </div>
    </section>
  );
}
