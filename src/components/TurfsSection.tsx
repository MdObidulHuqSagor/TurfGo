import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import TurfCard from "./TurfCard";
import { turfs, cities, type Turf } from "../data/turfs";
import * as Icons from "./Icons";

export default function TurfsSection({
  filter,
  onBook,
}: {
  filter: { q: string; city: string };
  onBook: (t: Turf) => void;
}) {
  const [selectedCity, setSelectedCity] = useState(filter.city);
  const [sortBy, setSortBy] = useState("popular");

  const activeCity = filter.city !== "All Cities" ? filter.city : selectedCity;

  const filtered = useMemo(() => {
    let result = turfs.filter((t) => {
      const matchQ =
        !filter.q ||
        t.name.toLowerCase().includes(filter.q.toLowerCase()) ||
        t.location.toLowerCase().includes(filter.q.toLowerCase());
      const matchC = activeCity === "All Cities" || t.city === activeCity;
      return matchQ && matchC;
    });

    switch (sortBy) {
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default:
        result = [...result].sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [filter, activeCity, sortBy]);

  return (
    <section id="turfs" className="py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Featured Turfs
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900">
            Popular Grounds Across{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Bangladesh
            </span>
          </h2>
          <p className="text-slate-600 mt-3 text-lg">
            Verified pitches with premium surfaces, floodlights, and top-notch amenities.
          </p>
        </motion.div>

        {/* Filters row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          {/* City tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
            {cities.slice(0, 7).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCity(c)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCity === c
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl border border-slate-100"
          >
            <div className="text-5xl mb-4">🏟️</div>
            <h3 className="text-xl font-bold text-slate-800">No turfs found</h3>
            <p className="text-slate-500 mt-2">
              Try a different city or search keyword.
            </p>
            <button
              onClick={() => setSelectedCity("All Cities")}
              className="mt-4 text-emerald-600 font-semibold hover:underline"
            >
              Show all turfs
            </button>
          </motion.div>
        ) : (
          <>
            <div className="text-sm text-slate-500 mb-4">
              Showing <span className="font-bold text-slate-700">{filtered.length}</span> turfs
              {activeCity !== "All Cities" && (
                <> in <span className="font-bold text-emerald-600">{activeCity}</span></>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((t, i) => (
                <TurfCard key={t.id} t={t} onBook={onBook} index={i} />
              ))}
            </div>
          </>
        )}

        {/* Load more */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <button className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-bold px-8 py-3 rounded-full transition hover:-translate-y-0.5 shadow-sm">
            <Icons.ArrowRight className="w-4 h-4" />
            View All Turfs
          </button>
        </motion.div>
      </div>
    </section>
  );
}
