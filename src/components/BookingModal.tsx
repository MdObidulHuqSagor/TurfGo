import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "./Icons";
import type { Turf } from "../data/turfs";
import { timeSlots } from "../data/turfs";

export default function BookingModal({
  turf,
  onClose,
}: {
  turf: Turf | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("06:00 PM");
  const [hours, setHours] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState("bkash");
  const [submitted, setSubmitted] = useState(false);

  if (!turf) return null;

  const total = turf.price * hours;
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      setSubmitted(true);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSubmitted(false);
    setDate("");
    setTime("06:00 PM");
    setHours(1);
    setName("");
    setPhone("");
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header image */}
          <div className="relative h-44">
            <img src={turf.image} alt={turf.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur grid place-items-center hover:bg-white transition"
            >
              <Icons.Close className="w-5 h-5 text-slate-800" />
            </button>
            <div className="absolute bottom-4 left-5 right-5">
              <h3 className="text-xl font-black text-white">{turf.name}</h3>
              <p className="text-sm text-white/80 flex items-center gap-1 mt-1">
                <Icons.Pin className="w-3.5 h-3.5" /> {turf.location}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-white/20 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Icons.Star className="w-3 h-3 text-amber-400" /> {turf.rating}
                </span>
                <span className="bg-white/20 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {turf.size}
                </span>
                <span className="bg-white/20 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {turf.surface}
                </span>
              </div>
            </div>
          </div>

          {/* Steps indicator */}
          {!submitted && (
            <div className="px-6 pt-5 flex items-center gap-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold transition ${
                      step >= s
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {step > s ? <Icons.Check className="w-4 h-4" /> : s}
                  </div>
                  <span className={`text-xs font-semibold ${step >= s ? "text-slate-800" : "text-slate-400"}`}>
                    {s === 1 ? "Slot & Details" : "Payment"}
                  </span>
                  {s < 2 && <div className={`flex-1 h-0.5 rounded ${step > 1 ? "bg-emerald-500" : "bg-slate-100"}`} />}
                </div>
              ))}
            </div>
          )}

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto mb-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                  <Icons.Check className="w-10 h-10" />
                </motion.div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Booking Confirmed! 🎉</h3>
              <p className="text-slate-600 mt-3 leading-relaxed">
                Your slot at <strong>{turf.name}</strong> on <strong>{date}</strong> at{" "}
                <strong>{time}</strong> for <strong>{hours}h</strong> has been confirmed.
              </p>
              <div className="mt-4 bg-emerald-50 rounded-2xl p-4 text-left">
                <div className="text-xs font-bold text-emerald-700 uppercase mb-2">Booking Summary</div>
                <div className="space-y-1 text-sm text-slate-700">
                  <div className="flex justify-between"><span>Amount Paid</span><span className="font-bold">৳{total}</span></div>
                  <div className="flex justify-between"><span>Payment</span><span className="font-bold capitalize">{payment}</span></div>
                  <div className="flex justify-between"><span>Booking ID</span><span className="font-bold">TBD-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span></div>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                Confirmation sent to {phone}
              </p>
              <button
                onClick={handleClose}
                className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-full transition shadow-lg"
              >
                Done ✓
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Full Name
                      </label>
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1.5 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition text-sm"
                        placeholder="আপনার নাম"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Phone
                      </label>
                      <input
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1.5 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition text-sm"
                        placeholder="+880 1XXX XXXXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Date</label>
                    <input
                      required
                      type="date"
                      min={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-1.5 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Time Slot
                      </label>
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="mt-1.5 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-white text-sm"
                      >
                        {timeSlots.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Duration
                      </label>
                      <select
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="mt-1.5 w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 bg-white text-sm"
                      >
                        {[1, 1.5, 2, 3].map((h) => (
                          <option key={h} value={h}>
                            {h} hour{h > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Payment methods */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3 block">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "bkash", name: "bKash", color: "bg-pink-600" },
                        { id: "nagad", name: "Nagad", color: "bg-orange-500" },
                        { id: "rocket", name: "Rocket", color: "bg-purple-600" },
                        { id: "card", name: "Card", color: "bg-blue-600" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPayment(m.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                            payment === m.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span className={`w-8 h-8 rounded-lg ${m.color} text-white grid place-items-center text-xs font-black`}>
                            {m.name[0]}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">{m.name}</span>
                          {payment === m.id && (
                            <Icons.Check className="w-4 h-4 text-emerald-600 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Price summary */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 flex items-center justify-between border border-emerald-100">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Total Payable</div>
                  <div className="text-3xl font-black text-emerald-700">৳{total}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">
                    ৳{turf.price} × {hours}h
                  </div>
                  {turf.originalPrice > turf.price && (
                    <div className="text-xs text-red-500 font-semibold line-through">
                      ৳{turf.originalPrice * hours}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3.5 rounded-full transition text-sm"
                  >
                    ← Back
                  </button>
                )}
                <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-full shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition text-sm">
                  {step === 1 ? "Continue to Payment →" : `Pay ৳${total} Now`}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
