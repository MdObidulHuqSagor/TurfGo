

import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-300 pt-20 pb-8 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        {/* Newsletter */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-8 lg:p-12 -mt-32 mb-16 relative shadow-2xl shadow-emerald-900/30">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-black text-white">
                Get ৳500 off your first booking! 🎉
              </h3>
              <p className="text-emerald-50/80 mt-2">
                Subscribe to our newsletter for exclusive deals and new turf alerts.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 outline-none text-white placeholder:text-white/50 focus:bg-white/20 transition"
              />
              <button className="bg-white text-emerald-700 font-bold px-6 py-3.5 rounded-xl hover:bg-emerald-50 transition shadow-lg whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Footer grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-flex items-center">
              <BrandLogo className="w-[148px] h-10" />
              <span className="sr-only">TurfBD</span>
            </a>
            <p className="mt-4 text-sm text-slate-400 max-w-xs leading-relaxed">
              Bangladesh's #1 turf booking platform. Find, compare and book the best football grounds across Dhaka, Chittagong, Sylhet & beyond.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { name: "Facebook", letter: "f" },
                { name: "Instagram", letter: "i" },
                { name: "YouTube", letter: "y" },
                { name: "TikTok", letter: "t" },
              ].map((s) => (
                <a
                  key={s.name}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-emerald-600 grid place-items-center transition-all hover:-translate-y-0.5"
                  aria-label={s.name}
                >
                  <span className="text-xs font-bold uppercase">{s.letter}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { t: "Company", l: ["About Us", "Careers", "Blog", "Press Kit"] },
            { t: "Support", l: ["Help Center", "Safety Guide", "Cancellation Policy", "Contact Us"] },
            { t: "Legal", l: ["Terms of Service", "Privacy Policy", "Cookie Policy", "Refund Policy"] },
          ].map((col) => (
            <div key={col.t}>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">{col.t}</h4>
              <ul className="space-y-3 text-sm">
                {col.l.map((x) => (
                  <li key={x}>
                    <a href="#" className="text-slate-400 hover:text-emerald-400 transition">
                      {x}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-slate-500">
          <p>© 2026 TurfBD Technologies Ltd. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <BrandLogo className="w-12 h-4" />
            <span>in</span>
            <span className="text-lg">🇧🇩</span>
            <span>Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
