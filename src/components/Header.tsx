import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "./Icons";
import BrandLogo from "./BrandLogo";

type HeaderProps = {
  mode?: "overlay" | "solid";
};

export default function Header({ mode = "overlay" }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = ["Home", "Turfs", "How it works", "Pricing", "Contact"];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        mode === "solid" || scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-slate-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between">
        <a href="#" className="flex items-center shrink-0">
          <BrandLogo
            className="w-[132px] h-9 sm:w-[148px] sm:h-10"
            imageClassName={mode === "solid" || scrolled ? "" : "drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]"}
          />
          <span className="sr-only">TurfBD</span>
        </a>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
              className={`hover:text-emerald-500 transition relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-emerald-500 after:transition-all hover:after:w-full ${
                mode === "solid" || scrolled ? "text-slate-700" : "text-white/90"
              }`}
            >
              {l}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <a
            href="#access"
            className={`text-sm font-semibold rounded-full border px-4 py-2 transition ${
              mode === "solid" || scrolled
                ? "border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
                : "border-white/25 text-white/90 hover:border-white hover:text-white"
            }`}
          >
            Login
          </a>
          <a
            href="#book"
            className="text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all hover:-translate-y-0.5"
          >
            Book Now
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className={`lg:hidden p-2 rounded-lg ${mode === "solid" || scrolled ? "text-slate-700" : "text-white"}`}
        >
          {open ? <Icons.Close className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-5 py-5 flex flex-col gap-3 text-slate-800 font-medium">
              {links.map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setOpen(false)}
                  className="py-2 border-b border-slate-50 hover:text-emerald-600 transition"
                >
                  {l}
                </a>
              ))}
              <a
                href="#access"
                onClick={() => setOpen(false)}
                className="py-2 border-b border-slate-50 hover:text-emerald-600 transition"
              >
                Login
              </a>
              <a
                href="#book"
                onClick={() => setOpen(false)}
                className="mt-2 text-center bg-emerald-600 text-white px-5 py-3 rounded-full font-bold shadow-lg"
              >
                Book Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
