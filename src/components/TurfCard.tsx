import { motion } from "framer-motion";
import * as Icons from "./Icons";
import type { Turf } from "../data/turfs";

export default function TurfCard({
  t,
  onBook,
  index = 0,
}: {
  t: Turf;
  onBook: (t: Turf) => void;
  index?: number;
}) {
  const discount = Math.round(((t.originalPrice - t.price) / t.originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 border border-slate-100 hover:border-emerald-200"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={t.image}
          alt={t.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Rating */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
          <Icons.Star className="w-3.5 h-3.5 text-amber-500" />
          {t.rating}{" "}
          <span className="text-slate-400 font-medium">({t.reviews})</span>
        </div>

        {/* Size badge */}
        <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-emerald-600/30">
          {t.size}
        </div>

        {/* Discount */}
        {discount > 0 && t.available && (
          <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
            {discount}% OFF
          </div>
        )}

        {/* Featured */}
        {t.featured && t.available && (
          <div className="absolute bottom-3 right-3 bg-amber-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Icons.Trophy className="w-3 h-3" /> Featured
          </div>
        )}

        {/* Unavailable overlay */}
        {!t.available && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] grid place-items-center">
            <span className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-xl">
              Fully Booked Today
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[17px] font-bold text-slate-900 group-hover:text-emerald-700 transition">
              {t.name}
            </h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <Icons.Pin className="w-3.5 h-3.5 shrink-0" /> {t.location}
            </p>
          </div>
          <button className="w-9 h-9 rounded-full border border-slate-200 grid place-items-center text-slate-400 hover:text-red-500 hover:border-red-200 transition shrink-0">
            <Icons.Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Surface */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {t.surface}
        </div>

        {/* Amenities */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {t.amenities.slice(0, 4).map((a) => (
            <span
              key={a}
              className="text-[11px] bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full font-medium border border-slate-100"
            >
              {a}
            </span>
          ))}
          {t.amenities.length > 4 && (
            <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-medium border border-emerald-100">
              +{t.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* Price & book */}
        <div className="mt-5 flex items-end justify-between pt-4 border-t border-slate-50">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">৳{t.price}</span>
              {t.originalPrice > t.price && (
                <span className="text-sm text-slate-400 line-through">৳{t.originalPrice}</span>
              )}
            </div>
            <span className="text-xs text-slate-500">per hour</span>
          </div>
          <button
            disabled={!t.available}
            onClick={() => onBook(t)}
            className="bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-300 shadow-lg shadow-slate-900/10 hover:shadow-emerald-600/30 hover:-translate-y-0.5"
          >
            {t.available ? "Book Slot →" : "Unavailable"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
