import { motion } from "framer-motion";
import * as Icons from "./Icons";

const popularCities = [
  { name: "Dhaka", turfs: 180, emoji: "🏙️", color: "from-emerald-400 to-green-500" },
  { name: "Chittagong", turfs: 85, emoji: "⛰️", color: "from-blue-400 to-indigo-500" },
  { name: "Sylhet", turfs: 42, emoji: "🌿", color: "from-teal-400 to-emerald-500" },
  { name: "Rajshahi", turfs: 35, emoji: "🌾", color: "from-amber-400 to-orange-500" },
  { name: "Khulna", turfs: 28, emoji: "🌊", color: "from-cyan-400 to-blue-500" },
  { name: "Comilla", turfs: 22, emoji: "🏟️", color: "from-purple-400 to-pink-500" },
  { name: "Gazipur", turfs: 40, emoji: "🏭", color: "from-rose-400 to-red-500" },
  { name: "Rangpur", turfs: 18, emoji: "🌻", color: "from-lime-400 to-green-500" },
];

export default function CitiesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            🇧🇩 All Over Bangladesh
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900">
            Turfs in Your{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              City
            </span>
          </h2>
          <p className="text-slate-600 mt-3 text-lg">
            We're expanding across Bangladesh. Find quality turfs in your city.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularCities.map((c, i) => (
            <motion.a
              key={c.name}
              href="#turfs"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative bg-white rounded-2xl p-5 border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${c.color} opacity-10 group-hover:opacity-20 transition-opacity blur-lg`} />
              <div className="relative">
                <div className="text-3xl mb-3">{c.emoji}</div>
                <h3 className="font-bold text-slate-900 text-lg">{c.name}</h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                  <Icons.Pin className="w-3 h-3" />
                  {c.turfs} turfs
                </p>
                <div className="mt-3 text-emerald-600 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <Icons.ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
