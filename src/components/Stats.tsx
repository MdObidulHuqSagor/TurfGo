import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import * as Icons from "./Icons";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = target;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  { icon: <Icons.MapPin2 className="w-6 h-6" />, value: 500, suffix: "+", label: "Turfs Listed", color: "text-emerald-500" },
  { icon: <Icons.Users className="w-6 h-6" />, value: 50000, suffix: "+", label: "Active Players", color: "text-blue-500" },
  { icon: <Icons.Calendar className="w-6 h-6" />, value: 120000, suffix: "+", label: "Bookings Made", color: "text-purple-500" },
  { icon: <Icons.Star className="w-6 h-6" />, value: 4.8, suffix: "★", label: "Average Rating", color: "text-amber-500" },
];

export default function Stats() {
  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 ${s.color} mb-3`}>
                {s.icon}
              </div>
              <div className="text-3xl lg:text-4xl font-black text-slate-900">
                {s.value === 4.8 ? (
                  <span>4.8 <span className="text-amber-500">★</span></span>
                ) : (
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                )}
              </div>
              <div className="text-sm text-slate-500 mt-1 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
