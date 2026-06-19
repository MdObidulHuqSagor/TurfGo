import { motion } from "framer-motion";
import * as Icons from "./Icons";

export default function CTA() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/33210167/pexels-photo-33210167.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent" />

      {/* Floating orbs */}
      <div className="absolute top-20 right-20 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-60 h-60 rounded-full bg-green-300/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold text-white mb-5">
              🎯 Start Playing Today
            </span>
            <h2 className="text-3xl lg:text-5xl font-black leading-tight text-white">
              Ready to hit the
              <br />
              <span className="text-emerald-300">pitch? Book now!</span>
            </h2>
            <p className="mt-5 text-emerald-50/80 text-lg max-w-lg leading-relaxed">
              Join 50,000+ Bangladeshi players booking premium turfs every day. Download the TurfBD app for exclusive offers and ৳500 off your first booking!
            </p>

            {/* App badges */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#"
                className="bg-black hover:bg-slate-800 transition px-5 py-3 rounded-2xl flex items-center gap-3 shadow-lg hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="text-left text-white">
                  <div className="text-[10px] opacity-70">Download on the</div>
                  <div className="font-bold text-sm -mt-0.5">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="bg-black hover:bg-slate-800 transition px-5 py-3 rounded-2xl flex items-center gap-3 shadow-lg hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
                  <path d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l9.3-9.7L3.6 2.3zm10.8 9.1l2.5-2.6L5.3 2c-.4-.2-.8-.3-1.2-.1l9.3 9.5zm0 1.2l-9.3 9.5c.4.2.8.1 1.2-.1l11.6-6.8-2.5-2.6zm6.6-2.4l-2.7-1.6-2.8 2.9 2.8 2.9 2.7-1.6c.7-.4 1.1-1 1.1-1.3 0-.3-.4-.9-1.1-1.3z" />
                </svg>
                <div className="text-left text-white">
                  <div className="text-[10px] opacity-70">Get it on</div>
                  <div className="font-bold text-sm -mt-0.5">Google Play</div>
                </div>
              </a>
            </div>

            {/* Trust */}
            <div className="mt-8 flex items-center gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <Icons.Check className="w-4 h-4 text-emerald-300" />
                Free to download
              </div>
              <div className="flex items-center gap-2">
                <Icons.Check className="w-4 h-4 text-emerald-300" />
                ৳500 welcome bonus
              </div>
            </div>
          </motion.div>

          {/* Right - Pricing cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">Membership Plans</h3>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-bold">
                  Save up to 30%
                </span>
              </div>

              <div className="space-y-4">
                {/* Casual */}
                <div className="rounded-2xl p-5 border-2 border-slate-200 hover:border-emerald-300 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Casual Player</div>
                      <div className="text-sm text-slate-500">Pay as you play</div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900">Free</span>
                    </div>
                  </div>
                  <ul className="mt-4 grid grid-cols-2 gap-2">
                    {["All turfs access", "bKash / Nagad pay", "Email support", "Basic booking"].map((x) => (
                      <li key={x} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Icons.Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro */}
                <div className="rounded-2xl p-5 border-2 border-emerald-500 bg-emerald-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    POPULAR
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Pro Player</div>
                      <div className="text-sm text-slate-500">Monthly subscription</div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-700">৳799</span>
                      <span className="text-xs text-slate-500">/mo</span>
                    </div>
                  </div>
                  <ul className="mt-4 grid grid-cols-2 gap-2">
                    {[
                      "Everything in Casual",
                      "15% off all bookings",
                      "Priority slots",
                      "Free jersey rental",
                      "Team management",
                      "24/7 phone support",
                    ].map((x) => (
                      <li key={x} className="text-xs text-slate-700 flex items-center gap-1.5">
                        <Icons.Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {x}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-600/30 text-sm">
                    Start Free Trial →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
