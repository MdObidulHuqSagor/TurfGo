import { useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import TurfsSection from "./components/TurfsSection";
import HowItWorks from "./components/HowItWorks";
import CitiesSection from "./components/CitiesSection";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import AdminDashboard from "./components/AdminDashboard";
import AccessPortal from "./components/AccessPortal";
import CustomerSignup from "./components/CustomerSignup";
import type { Turf } from "./data/turfs";

export default function App() {
  const [filter, setFilter] = useState({ q: "", city: "All Cities" });
  const [booking, setBooking] = useState<Turf | null>(null);
  const [view, setView] = useState<"home" | "access" | "signup" | "dashboard">("home");

  useEffect(() => {
    const resolve = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "access") return "access";
      if (hash === "customer") return "access";
      if (hash === "signup") return "signup";
      if (hash === "dashboard" || hash === "admin") return "dashboard";
      return "home";
    };

    const handler = () => setView(resolve());
    handler();
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  if (view === "access") {
    return (
      <AccessPortal
        onLogin={() => {
          setView("dashboard");
        }}
      />
    );
  }

  if (view === "signup") {
    return <CustomerSignup onBack={() => setView("access")} />;
  }

  if (view === "dashboard") {
    return <AdminDashboard onBack={() => setView("home")} />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Header />
      <Hero onSearch={(q, city) => setFilter({ q, city })} />
      <Stats />
      <TurfsSection filter={filter} onBook={setBooking} />
      <HowItWorks />
      <CitiesSection />
      <Features />
      <Testimonials />
      <CTA />
      <FAQ />
      <div className="h-32" /> {/* Spacer for newsletter overlap */}
      <Footer />
      {booking && <BookingModal turf={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}
