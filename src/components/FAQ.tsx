import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "./Icons";

const faqs = [
  {
    q: "How do I book a turf on TurfBD?",
    a: "Simply search for a turf, select your date, time, and duration, then pay using bKash, Nagad, Rocket, or card. You'll receive instant confirmation via SMS.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept bKash, Nagad, Rocket, Visa, Mastercard, and DBBL Nexus cards. All payments are secured with 256-bit encryption.",
  },
  {
    q: "Can I cancel or reschedule my booking?",
    a: "Yes! You can cancel up to 4 hours before your slot for a full refund. Rescheduling is free and can be done up to 2 hours before the slot.",
  },
  {
    q: "What if it rains during my booking?",
    a: "Our turfs have drainage systems, but if the ground is unplayable, you'll get a free reschedule or full refund. Indoor turfs are rain-proof!",
  },
  {
    q: "Do I need to bring my own equipment?",
    a: "Basic equipment like balls and bibs are provided at most turfs. Shoes (turf shoes recommended) need to be brought by players. Pro members get free equipment rental.",
  },
  {
    q: "Is TurfBD available outside Dhaka?",
    a: "Yes! We have turfs in Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Comilla, Gazipur, Rangpur and more cities are being added every month.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-semibold text-slate-900 pr-4 group-hover:text-emerald-600 transition">
          {q}
        </span>
        <span
          className={`w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-100 grid place-items-center shrink-0 transition-all ${
            open ? "bg-emerald-100 rotate-180" : ""
          }`}
        >
          <Icons.ChevronDown className="w-4 h-4 text-slate-600" />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-slate-600 leading-relaxed text-sm">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="py-24 bg-slate-50/50">
      <div className="max-w-3xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            ❓ FAQ
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 mt-3">
            Everything you need to know about TurfBD.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm"
        >
          {faqs.map((f) => (
            <FAQItem key={f.q} {...f} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <p className="text-slate-500 text-sm">
            Still have questions?{" "}
            <a href="#contact" className="text-emerald-600 font-semibold hover:underline">
              Contact our support team →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
