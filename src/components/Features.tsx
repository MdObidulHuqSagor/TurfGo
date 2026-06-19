import { motion } from "framer-motion";
import * as Icons from "./Icons";

const features = [
  {
    icon: <Icons.Shield className="w-6 h-6" />,
    title: "Verified Turfs",
    desc: "Every ground is inspected for surface quality, safety, and cleanliness before listing.",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: <Icons.Bolt className="w-6 h-6" />,
    title: "Instant Booking",
    desc: "No waiting. Get instant confirmation with booking details via SMS and email.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: <Icons.CreditCard className="w-6 h-6" />,
    title: "bKash & Nagad Pay",
    desc: "Pay with bKash, Nagad, Rocket, or any Visa/Mastercard. Fully secure & encrypted.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: <Icons.Phone className="w-6 h-6" />,
    title: "24/7 Support",
    desc: "Our team speaks Bangla & English. We're always available via call, chat or WhatsApp.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: <Icons.Gift className="w-6 h-6" />,
    title: "Best Price Promise",
    desc: "Find a lower price? We'll match it and give you ৳200 off on your next booking.",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    icon: <Icons.Users className="w-6 h-6" />,
    title: "Team Management",
    desc: "Create teams, invite friends, and manage your squad. Split payments easily.",
    gradient: "from-teal-500 to-cyan-500",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-green-500/5 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-500/3 blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Why TurfBD
          </span>
          <h2 className="text-3xl lg:text-4xl font-black">
            Built for <span className="text-emerald-400">Bangladeshi</span> Players
          </h2>
          <p className="text-slate-400 mt-3 text-lg">
            Everything you need for a seamless turf experience — from discovery to gameplay.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-6 hover:bg-white/[0.07] hover:border-emerald-500/20 transition-all duration-500 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} grid place-items-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-lg text-white">{f.title}</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
