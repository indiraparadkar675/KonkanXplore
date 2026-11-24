import { useState } from "react";
import axios from "axios";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Compass,
  MapPin,
  Menu,
  Sparkles,
  Star,
  Users,
  Wallet,
  X,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const destinations = [
  {
    name: "Tarkarli",
    subtitle: "Turquoise waters & adventure",
    image:
      "/images/tarkarli.jpg",
    tag: "ADVENTURE",
  },
  {
    name: "Devbag",
    subtitle: "Where the sea meets serenity",
    image:
      "/images/devbag.jpg",
    tag: "SERENITY",
  },
  {
    name: "Malvan",
    subtitle: "Heritage, beaches & seafood",
    image:
      "/images/malvan.jpg",
    tag: "CULTURE",
  },
];

const experiences = [
  ["Scuba Diving", "Tarkarli", "₹800+", "🤿"],
  ["Dolphin Watching", "Devbag", "₹300+", "🐬"],
  ["Kayaking", "Devbag", "₹300+", "◈"],
  ["Sunset Boat Ride", "Malvan", "₹300+", "⌁"],
];

function App() {
  const [menu, setMenu] = useState(false);

  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState("");
  const [savedTrips, setSavedTrips] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");

  const [form, setForm] = useState({
    destination: "Malvan",
    days: "2",
    travelers: "2",
    budget: "5000",
    style: "Couple",
  });

  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================
  // GENERATE REAL AI JOURNEY
  // =========================================

  const generate = async (e) => {
    e.preventDefault();

    setLoading(true);
    setGenerated(false);
    setAiResult(null);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/plan`,
        {
          destination: form.destination,
          budget: Number(form.budget),
          duration_days: Number(form.days),
          group_size: Number(form.travelers),
          traveler_type: form.style.toLowerCase(),
          interests: ["beach"],
          walking_level: "low",
        }
      );

      console.log(
        "🌴 KONKANXPLORE AI RESPONSE:",
        response.data
      );

      if (response.data.success) {
        setAiResult(response.data);
        setGenerated(true);

        setTimeout(() => {
          document
            .getElementById("journey")
            ?.scrollIntoView({
              behavior: "smooth",
            });
        }, 150);
      } else {
        setError(
          response.data.error ||
            "AI planner could not create your journey."
        );
      }
    } catch (error) {
      console.error("❌ API ERROR:", error);

      setError(
        "Could not connect to KonkanXplore AI backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveTrip = async () => {
    setSaveMessage("");
    try {
      await axios.post(`${API_BASE_URL}/api/trips`, {
        request: {
          destination: form.destination,
          budget: Number(form.budget),
          duration_days: Number(form.days),
          group_size: Number(form.travelers),
          traveler_type: form.style.toLowerCase(),
          interests: ["beach"],
          walking_level: "low",
        },
        result: aiResult,
      });
      setSaveMessage("Itinerary saved on this device.");
    } catch {
      setSaveMessage("Could not save this itinerary. Check that the API is running.");
    }
  };

  const loadSavedTrips = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/trips`);
      setSavedTrips(response.data);
    } catch {
      setError("Could not load saved itineraries. Check that the API is running.");
    }
  };

  const openSavedTrip = (trip) => {
    setForm({
      destination: trip.request.destination || "Malvan",
      days: String(trip.request.duration_days),
      travelers: String(trip.request.group_size),
      budget: String(trip.request.budget),
      style: trip.request.traveler_type.charAt(0).toUpperCase() + trip.request.traveler_type.slice(1),
    });
    setAiResult(trip.result);
    setGenerated(true);
    document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" });
  };

  // =========================================
  // SAFE DATA HELPERS
  // =========================================

  const budgetResult =
    aiResult?.budget_result || {};

  const plannedActivities =
    aiResult?.planned_activities || [];

  const candidateActivities =
    aiResult?.activities || [];

  const criticResult =
    aiResult?.critic_result || {};

  const totalBudget =
    budgetResult.total_budget ??
    Number(form.budget);

  const accommodation =
    budgetResult.accommodation ??
    budgetResult.accommodation_cost ??
    0;

  const food =
    budgetResult.food ??
    budgetResult.food_cost ??
    0;

  const activityCost =
    budgetResult.activities ??
    budgetResult.activity_cost ??
    0;

  const transport =
    budgetResult.transport ??
    budgetResult.transport_cost ??
    0;

  const totalExpense =
    budgetResult.total_expense ?? 0;

  const remainingBudget =
    budgetResult.remaining_budget ??
    totalBudget - totalExpense;

  return (
    <main className="min-h-screen bg-[#faf9f5] text-[#173238]">

      {/* =========================================
          NAVBAR
      ========================================= */}

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#062f38]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">

          <a href="#" className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c69c]/40 bg-[#d9c69c]/10 text-[#e9d7ac]">
              <Compass size={20} />
            </div>

            <div>
              <div className="text-lg font-semibold tracking-wide text-white">
                Konkan
                <span className="text-[#e5c98b]">
                  Xplore
                </span>
              </div>

              <div className="text-[8px] tracking-[0.32em] text-white/50">
                TRAVEL INTELLIGENCE
              </div>
            </div>

          </a>

          <div className="hidden items-center gap-9 md:flex">

            {[
              "Discover",
              "Plan a Journey",
              "About",
            ].map((item) => (
              <a
                key={item}
                href={
                  item === "Plan a Journey"
                    ? "#planner"
                    : item === "About"
                    ? "#about"
                    : "#discover"
                }
                className="text-sm text-white/70 transition hover:text-[#e5c98b]"
              >
                {item}
              </a>
            ))}

            <a
              href="#planner"
              className="rounded-full border border-[#e5c98b]/50 px-5 py-2 text-sm text-[#f3dfad] transition hover:bg-[#e5c98b] hover:text-[#173238]"
            >
              Start Exploring
            </a>

          </div>

          <button
            className="text-white md:hidden"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>

        </div>

        {menu && (
          <div className="border-t border-white/10 bg-[#062f38] px-6 py-5 md:hidden">
            <div className="flex flex-col gap-5 text-white/80">

              <a
                href="#discover"
                onClick={() => setMenu(false)}
              >
                Discover
              </a>

              <a
                href="#planner"
                onClick={() => setMenu(false)}
              >
                Plan a Journey
              </a>

              <a
                href="#about"
                onClick={() => setMenu(false)}
              >
                About
              </a>

            </div>
          </div>
        )}
      </nav>

      {/* =========================================
          HERO
      ========================================= */}

      <section className="relative min-h-screen overflow-hidden bg-[#062f38]">

        <img
          src={destinations[0].image}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
          alt="Konkan coast"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#062f38] via-[#062f38]/75 to-[#062f38]/20" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#062f38] via-transparent to-[#062f38]/40" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-20 pt-32 md:px-8">

          <div className="grid w-full items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">

            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >

              <div className="mb-7 flex items-center gap-3 text-xs tracking-[0.3em] text-[#e5c98b]">
                <span>✦</span>
                INTELLIGENT TRAVEL FOR KONKAN
                <span>✦</span>
              </div>

              <h1 className="max-w-4xl font-serif text-6xl leading-[.94] text-white md:text-8xl">
                Your journey.
                <span className="block italic text-[#e5c98b]">
                  Your Konkan.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-8 text-white/65 md:text-lg">
                Discover hidden beaches, coastal adventures and authentic
                local experiences — intelligently crafted around your budget,
                interests and travel style.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">

                <a
                  href="#planner"
                  className="group flex items-center gap-3 rounded-full bg-[#e5c98b] px-7 py-4 text-sm font-semibold text-[#173238] transition hover:bg-[#f2dda9]"
                >
                  Create my journey

                  <ArrowUpRight
                    size={17}
                    className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </a>

                <a
                  href="#discover"
                  className="flex items-center gap-2 rounded-full border border-white/25 px-7 py-4 text-sm text-white/80 backdrop-blur transition hover:border-white/50 hover:text-white"
                >
                  Explore destinations
                </a>

              </div>

              <div className="mt-12 flex items-center gap-7 text-white/50">

                <div>
                  <strong className="block text-xl text-white">
                    50+
                  </strong>
                  <span className="text-xs">
                    Destinations
                  </span>
                </div>

                <div className="h-8 w-px bg-white/15" />

                <div>
                  <strong className="block text-xl text-white">
                    10+
                  </strong>
                  <span className="text-xs">
                    Experiences
                  </span>
                </div>

                <div className="h-8 w-px bg-white/15" />

                <div>
                  <strong className="block text-xl text-white">
                    AI
                  </strong>
                  <span className="text-xs">
                    Personalized
                  </span>
                </div>

              </div>

            </motion.div>

            {/* FLOATING TRIP CARD */}

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="hidden lg:block"
            >

              <div className="relative ml-auto max-w-sm">

                <div className="overflow-hidden rounded-[32px] border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-xl">

                  <div className="relative h-[470px] overflow-hidden rounded-[25px]">

                    <img
                      src={destinations[0].image}
                      className="h-full w-full object-cover"
                      alt="Konkan beach"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#062f38] via-transparent to-transparent" />

                    <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[10px] tracking-[0.2em] text-white backdrop-blur-md">
                      MAHARASHTRA · INDIA
                    </div>

                    <div className="absolute bottom-7 left-7 right-7">

                      <p className="text-xs tracking-[0.25em] text-[#e5c98b]">
                        A COASTAL ESCAPE
                      </p>

                      <h2 className="mt-2 font-serif text-5xl italic text-white">
                        Malvan
                      </h2>

                      <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4 text-xs text-white/70">
                        <span>02 DAYS</span>
                        <span>02 TRAVELERS</span>
                        <span>₹5,000</span>
                      </div>

                    </div>

                  </div>

                </div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="absolute -left-16 top-20 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl"
                >

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-[#edf8f7] p-3 text-[#087e8b]">
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        AI Insight
                      </p>

                      <p className="text-sm font-semibold text-[#173238]">
                        Journey optimized
                      </p>
                    </div>

                  </div>

                </motion.div>

              </div>

            </motion.div>

          </div>

        </div>

        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-white/40">

          <div className="flex flex-col items-center gap-2">

            <span className="text-[9px] tracking-[.3em]">
              SCROLL TO EXPLORE
            </span>

            <div className="h-10 w-px bg-gradient-to-b from-[#e5c98b] to-transparent" />

          </div>

        </div>

      </section>

      {/* =========================================
          INTRO
      ========================================= */}

      <section className="px-6 py-24 md:px-8 md:py-32">

        <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[.8fr_1.2fr]">

          <div>

            <p className="text-xs font-semibold tracking-[.3em] text-[#087e8b]">
              ✦ THE KONKAN EXPERIENCE
            </p>

            <h2 className="mt-5 max-w-lg font-serif text-5xl leading-tight text-[#173238] md:text-6xl">
              More than a destination.
              <span className="block italic text-[#087e8b]">
                A feeling.
              </span>
            </h2>

          </div>

          <div className="flex items-end">

            <p className="max-w-2xl text-lg leading-9 text-[#173238]/60">
              KonkanXplore combines local tourism knowledge with intelligent
              planning to help you discover the coastline in a way that feels
              personal, authentic and effortless.
            </p>

          </div>

        </div>

      </section>

      {/* =========================================
          DESTINATIONS
      ========================================= */}

      <section
        id="discover"
        className="bg-[#f1eee6] px-6 py-24 md:px-8"
      >

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <p className="text-xs font-semibold tracking-[.3em] text-[#087e8b]">
                DESTINATIONS
              </p>

              <h2 className="mt-3 font-serif text-5xl text-[#173238]">
                Places worth getting lost in.
              </h2>

            </div>

            <span className="text-sm text-[#173238]/50">
              Discover the Konkan coast ✦
            </span>

          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {destinations.map((place, index) => (

              <motion.div
                key={place.name}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -8,
                }}
                className="group relative h-[470px] overflow-hidden rounded-[30px]"
              >

                <img
                  src={place.image}
                  alt={place.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />

                <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[9px] tracking-[.25em] text-white backdrop-blur-md">
                  {place.tag}
                </div>

                <div className="absolute bottom-7 left-7 right-7 text-white">

                  <div className="mb-2 flex items-center gap-2 text-xs text-white/65">
                    <MapPin size={13} />
                    KONKAN COAST
                  </div>

                  <h3 className="font-serif text-4xl italic">
                    {place.name}
                  </h3>

                  <p className="mt-2 text-sm text-white/70">
                    {place.subtitle}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs text-[#e5c98b]">
                    Explore
                    <ArrowUpRight size={14} />
                  </div>

                </div>

              </motion.div>

            ))}

          </div>

        </div>

      </section>

      {/* =========================================
          PLANNER
      ========================================= */}

      <section
        id="planner"
        className="px-6 py-24 md:px-8 md:py-32"
      >

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 text-center">

            <p className="text-xs font-semibold tracking-[.3em] text-[#087e8b]">
              ✦ INTELLIGENT PLANNING
            </p>

            <h2 className="mt-4 font-serif text-5xl text-[#173238] md:text-6xl">
              Tell us how you want to travel.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-[#173238]/55">
              Our agents transform your preferences into a personalized
              Konkan journey.
            </p>

          </div>

          <form
            onSubmit={generate}
            className="rounded-[35px] border border-[#173238]/10 bg-white p-6 shadow-[0_25px_80px_rgba(23,50,56,.08)] md:p-10"
          >

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              <Field
                icon={<MapPin size={18} />}
                label="Destination"
                name="destination"
                value={form.destination}
                onChange={change}
                options={[
                  "Malvan",
                  "Tarkarli",
                  "Devbag",
                  "Sindhudurg",
                ]}
              />

              <Field
                icon={<CalendarDays size={18} />}
                label="Duration"
                name="days"
                value={form.days}
                onChange={change}
                options={[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                ]}
              />

              <Field
                icon={<Users size={18} />}
                label="Travelers"
                name="travelers"
                value={form.travelers}
                onChange={change}
                type="number"
              />

              <Field
                icon={<Wallet size={18} />}
                label="Total budget"
                name="budget"
                value={form.budget}
                onChange={change}
                type="number"
              />

              <Field
                icon={<Compass size={18} />}
                label="Travel style"
                name="style"
                value={form.style}
                onChange={change}
                options={[
                  "Solo",
                  "Couple",
                  "Family",
                  "Friends",
                ]}
              />

              <div className="flex items-end">

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl bg-[#073b44] text-sm font-semibold text-white transition hover:bg-[#087e8b] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <Sparkles
                    size={18}
                    className={
                      loading
                        ? "animate-pulse"
                        : ""
                    }
                  />

                  {loading
                    ? "Creating your journey..."
                    : "Generate Journey"}

                  <ArrowUpRight size={17} />

                </button>

              </div>

            </div>

          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={loadSavedTrips} className="rounded-full border border-[#173238]/15 px-5 py-3 text-sm text-[#173238] transition hover:border-[#087e8b] hover:text-[#087e8b]">
              View saved journeys
            </button>
          </div>
          {savedTrips.length > 0 && (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {savedTrips.map((trip) => (
                <button key={trip.id} type="button" onClick={() => openSavedTrip(trip)} className="rounded-2xl border border-[#173238]/10 bg-white p-4 text-left transition hover:border-[#087e8b]">
                  <span className="block font-semibold">{trip.request.duration_days}-day Konkan journey</span>
                  <span className="mt-1 block text-xs text-[#173238]/50">{new Date(trip.created_at).toLocaleString()} · ₹{trip.request.budget}</span>
                </button>
              ))}
            </div>
          )}

        </div>

      </section>

      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <section className="bg-[#f7f5ef] px-6 pb-16 md:px-8">

          <div className="mx-auto max-w-4xl rounded-[25px] border border-red-200 bg-white p-7 text-center shadow-sm">

            <div className="text-2xl">
              ⚠️
            </div>

            <h3 className="mt-3 text-lg font-semibold text-red-600">
              Journey generation failed
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#173238]/60">
              {error}
            </p>

          </div>

        </section>
      )}

      {/* =========================================
          AI LOADING
      ========================================= */}

      {loading && (
        <section className="bg-[#f7f5ef] px-6 py-24 md:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#073b44] text-[#e5c98b] shadow-xl">

              <Sparkles
                size={30}
                className="animate-pulse"
              />

            </div>

            <p className="mt-8 text-xs tracking-[.3em] text-[#087e8b]">
              ✦ KONKANXPLORE AI
            </p>

            <h2 className="mt-4 font-serif text-4xl text-[#173238] md:text-5xl">
              Crafting your journey...
            </h2>

            <p className="mt-4 text-[#173238]/50">
              Profile → Activities → Planner → Budget → Critic
            </p>

            <div className="mx-auto mt-8 h-1 max-w-md overflow-hidden rounded-full bg-[#173238]/10">

              <div className="h-full w-1/2 animate-pulse rounded-full bg-[#087e8b]" />

            </div>

          </div>

        </section>
      )}

      {/* =========================================
          AI AGENTS
      ========================================= */}

      <section className="bg-[#073b44] px-6 py-24 text-white md:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]">

            <div>

              <p className="text-xs tracking-[.3em] text-[#e5c98b]">
                THE INTELLIGENCE
              </p>

              <h2 className="mt-5 font-serif text-5xl leading-tight md:text-6xl">
                Five minds.
                <span className="block italic text-[#e5c98b]">
                  One journey.
                </span>
              </h2>

              <p className="mt-6 max-w-md leading-8 text-white/55">
                KonkanXplore uses specialized AI agents that work together to
                understand, plan, optimize and refine your trip.
              </p>

            </div>

            <div className="grid gap-px overflow-hidden rounded-[30px] border border-white/10 bg-white/10 sm:grid-cols-2">

              {[
                [
                  "01",
                  "Profile Agent",
                  "Understands your travel personality.",
                ],
                [
                  "02",
                  "Activity Agent",
                  "Discovers experiences matching you.",
                ],
                [
                  "03",
                  "Planner Agent",
                  "Builds your day-by-day journey.",
                ],
                [
                  "04",
                  "Budget Agent",
                  "Keeps your spending optimized.",
                ],
                [
                  "05",
                  "Critic Agent",
                  "Reviews and improves the plan.",
                ],
              ].map(([num, title, desc]) => (

                <div
                  key={num}
                  className="group bg-[#073b44] p-7 transition hover:bg-white/[.07]"
                >

                  <div className="flex items-start justify-between">

                    <span className="text-xs text-[#e5c98b]">
                      {num}
                    </span>

                    <span className="text-white/20 transition group-hover:text-[#e5c98b]">
                      ✦
                    </span>

                  </div>

                  <h3 className="mt-10 font-serif text-2xl">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/45">
                    {desc}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          REAL GENERATED JOURNEY
      ========================================= */}

      {generated && aiResult && (

        <section
          id="journey"
          className="bg-[#f7f5ef] px-6 py-24 md:px-8"
        >

          <div className="mx-auto max-w-7xl">

            {/* HEADER */}

            <div className="mb-12">

              <p className="text-xs tracking-[.3em] text-[#087e8b]">
                ✦ YOUR PERSONALIZED JOURNEY
              </p>

              <h2 className="mt-4 font-serif text-5xl text-[#173238]">
                {form.days}-day{" "}
                {form.destination} escape.
              </h2>

              <p className="mt-3 text-sm text-[#173238]/50">
                {form.travelers} travelers · ₹
                {form.budget} · {form.style}
              </p>

            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={saveTrip} className="rounded-full bg-[#073b44] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087e8b]">
                Save itinerary
              </button>
              {saveMessage && <span className="text-sm text-[#087e8b]">{saveMessage}</span>}
            </div>

            {/* BUDGET CARDS */}

            <div className="grid gap-6 md:grid-cols-4">

              <InfoCard
                title="Total Budget"
                value={`₹${totalBudget}`}
              />

              <InfoCard
                title="Accommodation"
                value={`₹${accommodation}`}
              />

              <InfoCard
                title="Activities"
                value={`₹${activityCost}`}
              />

              <InfoCard
                title="Total Expense"
                value={`₹${totalExpense}`}
              />

            </div>

            {/* DETAILED BUDGET */}

            <div className="mt-6 rounded-[30px] border border-[#173238]/10 bg-white p-7">

              <div className="grid gap-5 md:grid-cols-4">

                <BudgetItem
                  title="Accommodation"
                  value={accommodation}
                />

                <BudgetItem
                  title="Food"
                  value={food}
                />

                <BudgetItem
                  title="Activities"
                  value={activityCost}
                />

                <BudgetItem
                  title="Transport"
                  value={transport}
                />

              </div>

              <div className="mt-7 flex flex-col justify-between gap-5 border-t border-[#173238]/10 pt-6 md:flex-row md:items-center">

                <div>

                  <p className="text-xs uppercase tracking-[.2em] text-[#173238]/40">
                    Budget Status
                  </p>

                  <p className="mt-2 text-lg font-semibold text-[#173238]">

                    {remainingBudget >= 0
                      ? "✓ Within Budget"
                      : "⚠ Budget Exceeded"}

                  </p>

                </div>

                <div className="text-left md:text-right">

                  <p className="text-xs text-[#173238]/40">
                    {remainingBudget >= 0
                      ? "Remaining Budget"
                      : "Exceeded By"}
                  </p>

                  <p
                    className={`mt-1 font-serif text-3xl ${
                      remainingBudget >= 0
                        ? "text-[#087e8b]"
                        : "text-red-600"
                    }`}
                  >
                    ₹
                    {Math.abs(
                      remainingBudget
                    )}
                  </p>

                </div>

              </div>

            </div>

            {/* PLANNER */}

            <div className="mt-12">

              <div className="mb-7">

                <p className="text-xs tracking-[.25em] text-[#087e8b]">
                  ✦ PLANNER AGENT
                </p>

                <h3 className="mt-2 font-serif text-4xl text-[#173238]">
                  Final planned experiences
                </h3>

                <p className="mt-2 text-sm text-[#173238]/50">
                  {plannedActivities.length} activities selected from{" "}
                  {candidateActivities.length} candidates.
                </p>

              </div>

              {plannedActivities.length > 0 ? (

                <div className="grid gap-5 md:grid-cols-2">

                  {plannedActivities.map(
                    (activity, index) => {

                      const cost =
                        activity?.estimated_cost_inr ||
                        {};

                      const location =
                        Array.isArray(
                          activity?.location
                        )
                          ? activity.location.join(
                              ", "
                            )
                          : activity?.location;

                      return (

                        <motion.div
                          key={`${activity?.name || "activity"}-${index}`}
                          initial={{
                            opacity: 0,
                            y: 15,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: index * 0.08,
                          }}
                          className="group rounded-[28px] border border-[#173238]/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"
                        >

                          <div className="flex items-start justify-between">

                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf8f7] text-sm font-semibold text-[#087e8b]">
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </span>

                            <span className="text-xl text-[#e5c98b]">
                              ✦
                            </span>

                          </div>

                          <h4 className="mt-6 font-serif text-2xl text-[#173238]">
                            {activity?.name ||
                              "Experience"}
                          </h4>

                          {location && (
                            <p className="mt-3 flex items-center gap-2 text-xs text-[#173238]/50">
                              <MapPin size={13} />
                              {location}
                            </p>
                          )}

                          <div className="mt-6 flex flex-wrap items-center gap-3">

                            <span className="rounded-full bg-[#f7f5ef] px-4 py-2 text-xs text-[#087e8b]">
                              ₹{cost?.min ?? 0}
                              {cost?.max
                                ? ` - ₹${cost.max}`
                                : "+"}
                            </span>

                            {activity?.duration_minutes && (
                              <span className="rounded-full bg-[#f7f5ef] px-4 py-2 text-xs text-[#173238]/50">
                                ⏱{" "}
                                {
                                  activity.duration_minutes
                                }{" "}
                                min
                              </span>
                            )}

                            {activity?.difficulty && (
                              <span className="rounded-full bg-[#f7f5ef] px-4 py-2 text-xs text-[#173238]/50">
                                {activity.difficulty}
                              </span>
                            )}

                          </div>

                        </motion.div>

                      );
                    }
                  )}

                </div>

              ) : (

                <div className="rounded-[25px] border border-[#173238]/10 bg-white p-8 text-center">

                  <p className="text-[#173238]/50">
                    No final activities were returned by the Planner Agent.
                  </p>

                </div>

              )}

            </div>

            {/* CANDIDATE ACTIVITIES */}

            {candidateActivities.length > 0 && (

              <div className="mt-12">

                <div className="mb-6">

                  <p className="text-xs tracking-[.25em] text-[#087e8b]">
                    ✦ ACTIVITY AGENT
                  </p>

                  <h3 className="mt-2 font-serif text-3xl text-[#173238]">
                    Candidate experiences discovered
                  </h3>

                </div>

                <div className="flex flex-wrap gap-3">

                  {candidateActivities.map(
                    (activity, index) => (

                      <span
                        key={`${activity?.name || "candidate"}-${index}`}
                        className="rounded-full border border-[#173238]/10 bg-white px-5 py-3 text-sm text-[#173238]/70"
                      >
                        {activity?.name ||
                          "Experience"}
                      </span>

                    )
                  )}

                </div>

              </div>

            )}

            {/* CRITIC */}

            <div className="mt-12 rounded-[30px] bg-[#073b44] p-7 text-white md:p-9">

              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                <div>

                  <p className="text-xs tracking-[.25em] text-[#e5c98b]">
                    ✦ CRITIC AGENT
                  </p>

                  <h3 className="mt-3 font-serif text-3xl">
                    AI Plan Review
                  </h3>

                </div>

                <div
                  className={`h-fit rounded-full px-5 py-2 text-xs font-semibold ${
                    criticResult?.status ===
                    "APPROVED"
                      ? "bg-emerald-400/20 text-emerald-300"
                      : "bg-[#e5c98b]/15 text-[#e5c98b]"
                  }`}
                >
                  {criticResult?.status ||
                    "REVIEWED"}
                </div>

              </div>

              {criticResult?.issues?.length >
                0 && (

                <div className="mt-8">

                  <p className="text-xs uppercase tracking-[.2em] text-white/40">
                    Issues Found
                  </p>

                  <div className="mt-4 space-y-2">

                    {criticResult.issues.map(
                      (issue, index) => (

                        <div
                          key={index}
                          className="rounded-2xl bg-white/5 p-4 text-sm text-white/70"
                        >
                          ⚠ {issue}
                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

              {criticResult?.suggestions
                ?.length > 0 && (

                <div className="mt-8">

                  <p className="text-xs uppercase tracking-[.2em] text-white/40">
                    AI Suggestions
                  </p>

                  <div className="mt-4 space-y-2">

                    {criticResult.suggestions.map(
                      (suggestion, index) => (

                        <div
                          key={index}
                          className="text-sm leading-6 text-white/65"
                        >
                          ✦ {suggestion}
                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

              {!criticResult?.issues
                ?.length && (

                <p className="mt-7 text-sm text-emerald-300">
                  ✓ No major issues found. Your journey is ready.
                </p>

              )}

            </div>

          </div>

        </section>

      )}

      {/* =========================================
          EXPERIENCES
      ========================================= */}

      <section className="px-6 py-24 md:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-10 flex items-end justify-between">

            <div>

              <p className="text-xs tracking-[.3em] text-[#087e8b]">
                EXPERIENCES
              </p>

              <h2 className="mt-3 font-serif text-5xl text-[#173238]">
                Make it memorable.
              </h2>

            </div>

            <div className="hidden items-center gap-1 text-[#e5c98b] md:flex">

              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />
              <Star size={14} fill="currentColor" />

            </div>

          </div>

          <div className="grid overflow-hidden rounded-[30px] border border-[#173238]/10 bg-white md:grid-cols-4">

            {experiences.map(
              ([name, location, price, symbol]) => (

                <div
                  key={name}
                  className="group border-b border-[#173238]/10 p-7 transition hover:bg-[#073b44] hover:text-white md:border-b-0 md:border-r last:border-r-0"
                >

                  <div className="text-2xl text-[#087e8b] group-hover:text-[#e5c98b]">
                    {symbol}
                  </div>

                  <h3 className="mt-10 font-serif text-2xl">
                    {name}
                  </h3>

                  <div className="mt-3 flex items-center gap-1 text-xs opacity-50">
                    <MapPin size={12} />
                    {location}
                  </div>

                  <div className="mt-8 flex items-center justify-between text-sm">

                    <span>{price}</span>

                    <ArrowUpRight size={17} />

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

      {/* =========================================
          FOOTER
      ========================================= */}

      <footer
        id="about"
        className="bg-[#062f38] px-6 py-14 text-white md:px-8"
      >

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-7 md:flex-row md:items-end">

          <div>

            <div className="text-xl">
              Konkan
              <span className="text-[#e5c98b]">
                Xplore
              </span>
            </div>

            <p className="mt-2 max-w-sm text-sm leading-6 text-white/40">
              Intelligent tourism experiences for the Konkan coast.
            </p>

          </div>

          <div className="text-xs tracking-wide text-white/30">
            © 2026 KONKANXPLORE · BUILT FOR THE KONKAN
          </div>

        </div>

      </footer>

    </main>
  );
}

// =========================================
// FIELD COMPONENT
// =========================================

function Field({
  icon,
  label,
  name,
  value,
  onChange,
  type = "select",
  options = [],
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#173238]/50">
        {label}
      </span>

      <div className="relative">

        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#087e8b]">
          {icon}
        </span>

        {type === "select" ? (

          <select
            name={name}
            value={value}
            onChange={onChange}
            className="h-[54px] w-full appearance-none rounded-2xl border border-[#173238]/10 bg-[#faf9f5] px-12 text-sm font-medium outline-none transition focus:border-[#087e8b] focus:ring-4 focus:ring-[#087e8b]/10"
          >

            {options.map((item) => (

              <option
                key={item}
                value={item}
              >
                {name === "days"
                  ? `${item} ${
                      item === "1"
                        ? "Day"
                        : "Days"
                    }`
                  : item}
              </option>

            ))}

          </select>

        ) : (

          <input
            name={name}
            type={type}
            min={
              name === "travelers"
                ? 1
                : name === "budget"
                ? 100
                : undefined
            }
            value={value}
            onChange={onChange}
            className="h-[54px] w-full rounded-2xl border border-[#173238]/10 bg-[#faf9f5] px-12 text-sm font-medium outline-none focus:border-[#087e8b] focus:ring-4 focus:ring-[#087e8b]/10"
          />

        )}

      </div>

    </label>
  );
}

// =========================================
// INFO CARD
// =========================================

function InfoCard({
  title,
  value,
}) {
  return (
    <div className="rounded-[25px] border border-[#173238]/10 bg-white p-6">

      <p className="text-xs uppercase tracking-wider text-[#173238]/40">
        {title}
      </p>

      <p className="mt-3 font-serif text-3xl text-[#173238]">
        {value}
      </p>

    </div>
  );
}

// =========================================
// BUDGET ITEM
// =========================================

function BudgetItem({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl bg-[#f7f5ef] p-5">

      <p className="text-xs uppercase tracking-wider text-[#173238]/40">
        {title}
      </p>

      <p className="mt-2 text-xl font-semibold text-[#173238]">
        ₹{value}
      </p>

    </div>
  );
}

export default App;
