import { motion } from "framer-motion";
import * as Icons from "./Icons";

const reviews = [
  {
    name: "Rafiq Ahmed",
    role: "Captain, Gulshan FC",
    content: "TurfBD made scheduling our weekly matches in Dhaka super easy. The Bashundhara Arena turf is FIFA quality — amazing experience!",
    initials: "RA",
    stars: 5,
  },
  {
    name: "Tasnim Islam",
    role: "Weekend Player, Chittagong",
    content: "I love how I can book a slot in 30 seconds with bKash. No more phone calls! The turfs are always clean and well-maintained.",
    initials: "TI",
    stars: 5,
  },
  {
    name: "Kamal Hossain",
    role: "Football Coach, Uttara",
    content: "We run all our coaching sessions through TurfBD. The pricing is transparent, booking is fast, and customer support is top-notch.",
    initials: "KH",
    stars: 5,
  },
  {
    name: "Farhan Shahriar",
    role: "Team Manager, Dhanmondi",
    content: "Best turf booking platform in Bangladesh. The team management feature is brilliant — I can split payments among 14 players easily.",
    initials: "FS",
    stars: 5,
  },
  {
    name: "Nusrat Jahan",
    role: "Student, NSU",
    content: "Affordable and convenient! Found a great turf near our university. The floodlights are perfect for evening games after class.",
    initials: "NJ",
    stars: 4,
  },
  {
    name: "Imran Khan",
    role: "Corporate League Organizer",
    content: "Organized our entire corporate football league through TurfBD. Booked 30+ slots across Dhaka — smooth as butter!",
    initials: "IK",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-emerald-50/30 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            ⭐ Player Reviews
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900">
            Loved by <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">50,000+</span> Players
          </h2>
          <p className="text-slate-600 mt-3 text-lg">
            See what Bangladeshi footballers are saying about TurfBD.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(r.stars)].map((_, i) => (
                  <Icons.Star key={i} className="w-4 h-4 text-amber-500" />
                ))}
                {r.stars < 5 && (
                  <Icons.StarHalf className="w-4 h-4 text-amber-500" />
                )}
              </div>

              <p className="text-slate-700 leading-relaxed text-[15px]">
                "{r.content}"
              </p>

              <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 grid place-items-center text-white font-bold text-sm shadow-md">
                  {r.initials}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
