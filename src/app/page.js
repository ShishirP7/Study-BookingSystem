"use client";

import React from "react";
import Image from "next/image";

/* ================= API helpers ================= */
const API_BASE =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.NEXT_PUBLIC_API_BASE) ||
  "http://localhost:4000/api";

async function apiFetch(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Request failed: ${res.status}`);
  }
  return res.json();
}

/** Fetcher hook with reload() and abort support */
function useServerData(path) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(Boolean(path));
  const [error, setError] = React.useState(null);
  const [bump, setBump] = React.useState(0);

  const reload = React.useCallback(() => setBump((n) => n + 1), []);
  React.useEffect(() => {
    if (!path) return;
    let alive = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    apiFetch(path, { headers: {}, method: "GET", signal: controller.signal })
      .then((json) => {
        if (!alive) return;
        setData(json);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e);
        setData(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
      controller.abort();
    };
  }, [path, bump]);
  return { data, loading, error, reload };
}

/** Show skeleton for a grace period when there's no data, then flip to empty state */
function useGraceSkeleton(trigger, ms = 5000) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    if (trigger) {
      setShow(true);
      const t = setTimeout(() => setShow(false), ms);
      return () => clearTimeout(t);
    } else {
      setShow(false);
    }
  }, [trigger, ms]);
  return show;
}

/* ================ optional LS helpers (for demo seat map) ================ */
function useLocalStorageState(key, initialValue) {
  const [state, setState] = React.useState(initialValue);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setState(JSON.parse(raw));
    } catch {}
  }, [key]);
  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

const loadLS = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

/* ================= PAGE ================= */
export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 space-y-24">
        <Hero />
        {/* BookingSystem (your older demo) can stay commented out */}
        {/* <BookingSystem /> */}
        <Classes />
        <Gallery />
        <About />
        <Contact />
        <Services />
        <Blogs />
        <Footer />
      </main>
    </div>
  );
}

/* ================= NAV & HERO ================= */
function TopNav() {
  const links = [
    ["Booking", "#booking"],
    ["Classes", "#classes"],
    ["Gallery", "#gallery"],
    ["About", "#about"],
    ["Contact", "#contact"],
    ["Services", "#services"],
    ["Blog", "#blogs"],
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur border-b border-black/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="font-extrabold tracking-wide">StudyHub</div>
        <nav className="hidden md:flex gap-6 text-sm">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="hover:text-[#F4C986]">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative rounded-3xl overflow-hidden bg-white ring-1 ring-black/10">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1754451493214-a1f022532a61?q=80&w=1920&auto=format&fit=crop)",
          filter: "brightness(0.55)",
        }}
      />
      <div className="relative px-8 py-20 md:py-28 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-extrabold">
          Book • Study • Succeed
        </h1>
        <p className="mt-4 max-w-3xl mx-auto">
          Pictures of rooms, a 2D seat map, payments, memberships & reminders —
          plus classes, mock tests, and a blog.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <a
            href="#booking"
            className="px-5 py-2.5 rounded-md bg-[#F4C986] text-black font-semibold hover:brightness-95"
          >
            Book a Seat
          </a>
          <a
            href="#classes"
            className="px-5 py-2.5 rounded-md bg-white/10 hover:bg-white/20 font-semibold"
          >
            See Classes
          </a>
        </div>
      </div>
    </section>
  );
}

/* ================= CLASSES (wired to backend) ================= */
function Classes() {
  const [tab, setTab] = React.useState("reading");

  // reading rooms from /rooms?category=reading
  const {
    data: readingRooms,
    loading: loadingRooms,
    error: roomsError,
  } = useServerData("/rooms?category=reading");

  // nmcle classes from /classes?category=nmcle
  const {
    data: nmcleClasses,
    loading: loadingNmcle,
    error: nmcleError,
  } = useServerData("/classes?category=nmcle");

  const itemsRaw = tab === "reading" ? readingRooms : nmcleClasses;
  const isLoading = tab === "reading" ? loadingRooms : loadingNmcle;
  const apiError = tab === "reading" ? roomsError : nmcleError;

  const hasData = Array.isArray(itemsRaw) && itemsRaw.length > 0;
  const noData = !isLoading && (!hasData || !!apiError);
  const showGrace = useGraceSkeleton(noData, 5000);

  const items = hasData ? itemsRaw.map(normalizeClass) : [];

  return (
    <section id="classes" className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold">Classes</h2>
        <div className="inline-flex rounded-lg bg-white ring-1 ring-black/10 p-1">
          <button
            onClick={() => setTab("reading")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              tab === "reading"
                ? "bg-[#F4C986] text-black"
                : "hover:bg-black/5"
            }`}
          >
            Reading room
          </button>
          <button
            onClick={() => setTab("nmcle")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              tab === "nmcle" ? "bg-[#F4C986] text-black" : "hover:bg-black/5"
            }`}
          >
            NMCLÉ classes
          </button>
        </div>
      </div>

      <p className="text-black text-sm">
        Click <span className="text-[#F4C986] font-semibold">Book now</span> to
        open the seat map and payment for that class.
      </p>

      {isLoading || showGrace ? (
        <GridSkeleton />
      ) : noData ? (
        <EmptyState
          title="No data yet"
          subtitle="Add rooms/classes in the backend to see them here."
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      )}
    </section>
  );
}

function normalizeClass(c = {}) {
  const id =
    c._id ||
    c.id ||
    (typeof c.name === "string"
      ? c.name.toLowerCase().replace(/\s+/g, "-")
      : "item");
  const rows = Number(c.rows || 6);
  const cols = Number(c.cols || 10);
  return {
    id,
    name: c.name || "Untitled",
    time: c.time || c.schedule || "—",
    priceNpr: Number(c.priceNpr || c.price || 0),
    rows,
    cols,
    img:
      c.img ||
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop",
  };
}

function ClassCard({ cls }) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const total = cls.rows * cls.cols;
  const booked = useBookedCount(cls.id, total);
  const available = total - booked;

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
      <div className="aspect-[16/9]">
        <img
          src={cls.img}
          alt={cls.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold">{cls.name}</div>
            <div className="text-sm text-black/70">{cls.time}</div>
          </div>
          <div className="text-right">
            <div className="text-[#F4C986] font-semibold">
              Rs {cls.priceNpr}
            </div>
            <div className="text-xs text-black/60">per seat</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-black pt-2">
          <span>Slots available</span>
          <span
            className={`font-semibold ${
              available > 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {available} / {total}
          </span>
        </div>
        <div className="pt-3">
          <button
            onClick={() => setSheetOpen(true)}
            className="w-full px-4 py-2 rounded-md bg-[#F4C986] text-black font-semibold hover:brightness-95"
          >
            Book now
          </button>
        </div>
      </div>

      {sheetOpen && (
        <BookingPanel cls={cls} onClose={() => setSheetOpen(false)} />
      )}
    </div>
  );
}

/* -------------------- Booking Panel (local demo seat map) -------------------- */
function BookingPanel({ cls, onClose }) {
  const totalSeats = cls.rows * cls.cols;
  const [seats, setSeats] = useLocalStorageState(
    `seats_${cls.id}`,
    Array.from({ length: totalSeats }, () => 0)
  );
  const [selected, setSelected] = React.useState([]);
  const [customer, setCustomer] = useLocalStorageState(`cust_${cls.id}`, {
    name: "",
    phone: "",
    email: "",
  });

  const toggleSeat = (i) => {
    if (seats[i] === 1) return;
    setSelected((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const confirmBooking = () => {
    if (!customer.name || !customer.phone || selected.length === 0) return;
    const updated = [...seats];
    selected.forEach((i) => (updated[i] = 1));
    setSeats(updated);
    setSelected([]);
    alert("Booked! (demo: saved in your browser storage)");
  };

  const bookedCount = seats.filter((x) => x === 1).length;
  const available = totalSeats - bookedCount;
  const totalPrice = selected.length * cls.priceNpr;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-3xl bg-white ring-1 ring-black/10 p-6 overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-bold">{cls.name}</div>
            <div className="text-sm text-black/70">{cls.time}</div>
          </div>
          <button
            onClick={onClose}
            className="text-black/70 hover:text-black"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl p-4 bg-white ring-1 ring-black/10">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Seat map</div>
              <div className="flex items-center gap-3 text-xs">
                <LegendDot color="bg-emerald-500" label="Available" />
                <LegendDot color="bg-rose-500" label="Booked" />
                <LegendDot color="bg-yellow-400" label="Selected" />
              </div>
            </div>

            <div
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${cls.cols}, minmax(0,1fr))`,
              }}
            >
              {Array.from({ length: totalSeats }).map((_, i) => {
                const isBooked = seats[i] === 1;
                const isSelected = selected.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleSeat(i)}
                    disabled={isBooked}
                    className={`aspect-square rounded-md text-xs font-semibold grid place-items-center ${
                      isBooked
                        ? "bg-rose-500 cursor-not-allowed"
                        : isSelected
                        ? "bg-yellow-400 text-black"
                        : "bg-emerald-600 hover:opacity-90 text-white"
                    }`}
                    title={isBooked ? "Already booked" : "Toggle seat"}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 text-sm text-black">
              Available: {available} / {totalSeats} • Selected:{" "}
              {selected.length}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl p-4 bg-white ring-1 ring-black/10">
              <div className="font-semibold mb-3">Your details</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Full name"
                  value={customer.name}
                  onChange={(v) => setCustomer({ ...customer, name: v })}
                />
                <Input
                  label="Phone"
                  value={customer.phone}
                  onChange={(v) => setCustomer({ ...customer, phone: v })}
                />
                <Input
                  label="Email (optional)"
                  value={customer.email}
                  onChange={(v) => setCustomer({ ...customer, email: v })}
                />
              </div>
            </div>

            <div className="rounded-xl p-4 bg-white ring-1 ring-black/10">
              <div className="font-semibold mb-3">Payment</div>
              <div className="flex items-center justify-between">
                <div className="text-black text-sm">
                  Rs {cls.priceNpr} × {selected.length} seat
                  {selected.length === 1 ? "" : "s"}
                </div>
                <div className="text-lg font-bold">Total: Rs {totalPrice}</div>
              </div>
              <div className="mt-3 text-xs text-black/70">
                (Demo only — connect to your payment gateway/API.)
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={confirmBooking}
                  disabled={
                    selected.length === 0 || !customer.name || !customer.phone
                  }
                  className="px-4 py-2 rounded-md bg-[#F4C986] text-black font-semibold hover:brightness-95 disabled:opacity-50"
                >
                  Confirm & Book
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-black/5 hover:bg-black/10"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden">
              <img
                src={cls.img}
                alt={cls.name}
                className="w-full h-44 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= OTHER SECTIONS ================= */
function Gallery() {
  return (
    <section id="gallery" className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-extrabold">Gallery</h2>
      <p className="text-black text-sm">
        Swap these with your Google Drive images (sorted by room numbers).
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-black/10"
          >
            <img
              className="w-full h-full object-cover hover:scale-105 transition"
              alt={`Gallery ${i + 1}`}
              src={`https://picsum.photos/seed/room${i}/800/600`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-extrabold">About us</h2>
      <p className="text-black">
        Placeholder for your script. Send it and we’ll drop it here.
      </p>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-extrabold">
        Contact for reservations
      </h2>
      <div className="space-y-1 text-black">
        <div>Sano Kharibot, Shantinagar</div>
        <a className="text-[#F4C986] hover:brightness-95" href="tel:+9779861408529">
          9861408529
        </a>
      </div>
      <div className="mt-4">
        <a
          href="#booking"
          className="px-5 py-2.5 rounded-md bg-[#F4C986] text-black font-semibold hover:brightness-95"
        >
          Book now
        </a>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="space-y-8">
      <h2 className="text-2xl md:text-3xl font-extrabold">Our services</h2>

      <ServiceCard
        title="Reading room"
        media={
          <img
            className="w-full h-full object-cover"
            src="https://picsum.photos/id/1048/1200/700"
            alt="Reading room"
          />
        }
      >
        <p>
          Calm space for focused study. Flexible seats, quiet environment, and
          access to the library.
        </p>
      </ServiceCard>

      <ServiceCard
        title="NMCLÉ classes"
        media={
          <div className="w-full h-full flex items-center justify-center bg-white">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Demo class"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        }
      >
        <ul className="list-disc pl-6 leading-7">
          <li>Regular & weekend batches</li>
          <li>Demo class video, testimonials and syllabus details</li>
        </ul>
      </ServiceCard>

      <ServiceCard
        title="Mock tests"
        media={
          <img
            className="w-full h-full object-cover"
            src="https://picsum.photos/id/1015/1200/700"
            alt="Mock test"
          />
        }
      >
        <div className="space-y-3 leading-7">
          <p>Timed tests with instant scoring and analytics.</p>
          <div className="rounded-lg bg-white ring-1 ring-black/10 p-4">
            <div className="font-semibold mb-1">Sample mock test</div>
            <p className="text-sm">Link a Google Form or your own test system.</p>
            <a
              className="mt-3 inline-block px-4 py-2 rounded-md bg-[#F4C986] font-semibold hover:brightness-95"
              href="#"
            >
              Try sample
            </a>
          </div>
          <div>
            <div className="font-semibold">Subscription details</div>
            <p className="text-sm">Monthly / Quarterly / Yearly with student discounts.</p>
          </div>
        </div>
      </ServiceCard>
    </section>
  );
}

function ServiceCard({ title, media, children }) {
  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-black/10">
      <div className="grid md:grid-cols-2">
        <div className="aspect-video md:aspect-auto md:h-full">{media}</div>
        <div className="p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold mb-4">{title}</h3>
          <div className="text-black">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ================= BLOGS (wired to backend + skeleton > empty) ================= */
function Blogs() {
  const { data, loading, error, reload } = useServerData("/blogs");
  const posts = Array.isArray(data) ? data : [];
  const hasData = posts.length > 0;
  const noData = !loading && (!hasData || !!error);
  const showGrace = useGraceSkeleton(noData, 5000);

  const [draft, setDraft] = React.useState({ title: "", content: "" });
  const [posting, setPosting] = React.useState(false);

  const addPost = async () => {
    if (!draft.title.trim() || !draft.content.trim()) return;
    try {
      setPosting(true);
      await apiFetch("/blogs", {
        method: "POST",
        body: JSON.stringify(draft),
      });
      setDraft({ title: "", content: "" });
      reload(); // re-fetch list without page refresh
    } catch (e) {
      alert(`Failed to publish: ${e.message}`);
    } finally {
      setPosting(false);
    }
  };

  return (
    <section id="blogs" className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-extrabold">Blog</h2>

      <div className="rounded-2xl p-6 bg-white ring-1 ring-black/10">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Title"
            value={draft.title}
            onChange={(v) => setDraft({ ...draft, title: v })}
          />
          <div className="md:col-span-2">
            <Textarea
              label="Content"
              rows={5}
              value={draft.content}
              onChange={(v) => setDraft({ ...draft, content: v })}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={addPost}
            disabled={posting}
            className="px-4 py-2 rounded-md bg-[#F4C986] text-black font-semibold hover:brightness-95 disabled:opacity-50"
          >
            {posting ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {loading || showGrace ? (
        <CardSkeleton count={2} />
      ) : noData ? (
        <EmptyState
          title="No posts yet"
          subtitle="Write your first blog above."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {posts.map((p) => (
            <article
              key={p._id}
              className="rounded-xl p-5 bg-white ring-1 ring-black/10"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-lg font-bold">{p.title}</h4>
              </div>
              <div className="text-xs text-black/60 mt-1">
                {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
              </div>
              <p className="mt-3 whitespace-pre-wrap">{p.content}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/* ================= FOOTER & UI BITS ================= */
function Footer() {
  return (
    <footer className="py-10 text-center text-black/70">
      © {new Date().getFullYear()} StudyHub • All rights reserved.
    </footer>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <div className="text-sm mb-1 text-black">{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[#F4C986] px-3 py-2 outline-none focus:ring-2 focus:ring-[#F4C986]"
      />
    </label>
  );
}
function Textarea({ label, value, onChange, rows = 4 }) {
  return (
    <label className="block">
      <div className="text-sm mb-1 text-black">{label}</div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[#F4C986] px-3 py-2 outline-none focus:ring-2 focus:ring-[#F4C986]"
      />
    </label>
  );
}
function Select({ label, value, onChange, options = [] }) {
  return (
    <label className="block">
      <div className="text-sm mb-1 text-black">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[#F4C986] px-3 py-2 outline-none focus:ring-2 focus:ring-[#F4C986]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
function Dot({ className = "" }) {
  return <span className={`inline-block h-3 w-3 rounded-full ${className}`} />;
}
function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-3 w-3 rounded-full ${color}`} />
      {label}
    </span>
  );
}
function useBookedCount(classId, total) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    setCount(
      loadLS(
        `seats_${classId}`,
        Array.from({ length: total }, () => 0)
      ).filter((x) => x === 1).length
    );
  }, [classId, total]);
  return count;
}

/* ================= Skeletons & Empty ================= */
function GridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/10 animate-pulse"
        >
          <div className="aspect-[16/9] bg-black/10" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-black/10 rounded w-2/3" />
            <div className="h-3 bg-black/10 rounded w-1/3" />
            <div className="h-8 bg-black/10 rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
function CardSkeleton({ count = 2 }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-5 bg-white ring-1 ring-black/10 animate-pulse"
        >
          <div className="h-5 bg-black/10 rounded w-1/3" />
          <div className="h-3 bg-black/10 rounded w-1/4 mt-2" />
          <div className="h-24 bg-black/10 rounded w-full mt-3" />
        </div>
      ))}
    </div>
  );
}
function EmptyState({ title, subtitle }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/20 p-10 text-center">
      <div className="text-xl font-semibold">{title}</div>
      <div className="text-black/60 mt-1">{subtitle}</div>
    </div>
  );
}
