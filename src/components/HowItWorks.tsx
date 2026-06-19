import { motion } from "framer-motion";
import * as Icons from "./Icons";

const steps = [
  {
    icon: <Icons.Search className="w-7 h-7" />,
    emoji: "🔍",
    title: "Search Turfs",
    desc: "Browse by location, price, or rating. Filter turfs near you in Dhaka, Chittagong & beyond.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: <Icons.Calendar className="w-7 h-7" />,
    emoji: "📅",
    title: "Pick Your Slot",
    desc: "Choose your date, time & duration. See real-time availability — no phone calls needed.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: <Icons.CreditCard className="w-7 h-7" />,
    emoji: "💳",
    title: "Pay Securely",
    desc: "Pay instantly via bKash, Nagad, Rocket or card. Receive instant confirmation on SMS.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: <Icons.Trophy className="w-7 h-7" />,
    emoji: "⚽",
    title: "Play & Enjoy!",
    desc: "Show your booking QR, lace up your boots, and enjoy the game with your squad!",
    color: "from-amber-500 to-orange-500",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      {/* BG pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900">
            Book Your Turf in{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              4 Easy Steps
            </span>
          </h2>
          <p className="text-slate-600 mt-3 text-lg">
            From finding a turf to playing on it — it takes less than 60 seconds.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative group"
            >
              {/* Connector line */}
              {i < 3 && (
                <div className="hidden lg:block absolute top-14 left-full w-full h-0.5 bg-gradient-to-r from-emerald-200 to-transparent z-0" style={{ width: "calc(100% - 3rem)" }} />
              )}

              <div className="relative bg-white rounded-3xl p-7 border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 group-hover:-translate-y-2 z-10">
                {/* Step number */}
                <div className="absolute -top-4 -right-2 w-9 h-9 rounded-full bg-slate-900 text-white grid place-items-center font-black text-sm shadow-lg">
                  {i + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} grid place-items-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{s.emoji}</span>
                </div>

                <h3 className="font-bold text-lg text-slate-900">{s.title}</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
