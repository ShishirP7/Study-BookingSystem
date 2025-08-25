"use client";

import React from "react";
import Image from "next/image";

/* ---------------- helpers ---------------- */
function useLocalStorageState(key, initialValue) {
  // 1) render the same on server and first client render
  const [state, setState] = React.useState(initialValue);
  // 2) after mount, read from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setState(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  // 3) persist on change
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

/* ---------------- demo data ---------------- */
const BOOKING_ROOM_IMGS = [
  "https://images.unsplash.com/photo-1681161528302-373fb9e2a787?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop",
];

const READING_ROOMS = [
  { id: "read-1", name: "Reading Room A", time: "6:00 AM – 10:00 PM", priceNpr: 120, rows: 5, cols: 8, img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop" },
  { id: "read-2", name: "Reading Room B", time: "6:00 AM – 10:00 PM", priceNpr: 120, rows: 5, cols: 8, img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop" },
  { id: "read-3", name: "Quiet Zone", time: "7:00 AM – 9:00 PM", priceNpr: 150, rows: 6, cols: 7, img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop" },
  { id: "read-4", name: "Window Bay", time: "7:00 AM – 9:00 PM", priceNpr: 140, rows: 6, cols: 7, img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop" },
  { id: "read-5", name: "Reference Nook", time: "8:00 AM – 8:00 PM", priceNpr: 110, rows: 5, cols: 6, img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop" },
  { id: "read-6", name: "Group Study", time: "8:00 AM – 8:00 PM", priceNpr: 130, rows: 5, cols: 6, img: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop" },
  { id: "read-7", name: "Evening Hall", time: "2:00 PM – 10:00 PM", priceNpr: 100, rows: 5, cols: 6, img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop" },
];

const NMCLE_CLASSES = [
  { id: "nm-1", name: "Physiology – Morning Batch", time: "7:00 – 9:00 AM", priceNpr: 300, rows: 6, cols: 10, img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop" },
  { id: "nm-2", name: "Pharmacology – Afternoon", time: "1:00 – 3:00 PM", priceNpr: 320, rows: 6, cols: 10, img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop" },
  { id: "nm-3", name: "Anatomy – Evening", time: "5:00 – 7:00 PM", priceNpr: 350, rows: 6, cols: 10, img: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop" },
];

/* ================= PAGE ================= */
export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 space-y-24">
        <Hero />
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
    <header className="fixed inset-x-0 top-0 z-50 bg-neutral-900/70 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="font-extrabold tracking-wide">StudyHub</div>
        <nav className="hidden md:flex gap-6 text-sm">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="hover:text-pink-400">{label}</a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative rounded-3xl overflow-hidden bg-neutral-900 ring-1 ring-white/10">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1754451493214-a1f022532a61?q=80&w=1920&auto=format&fit=crop)",
          filter: "brightness(0.55)",
        }}
      />
      <div className="relative px-8 py-20 md:py-28 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold">Book • Study • Succeed</h1>
        <p className="mt-4 max-w-3xl mx-auto text-white/80">
          Pictures of rooms, a 2D seat map, payments, memberships & reminders — plus classes, mock tests, and a blog.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <a href="#booking" className="px-5 py-2.5 rounded-md bg-pink-500 hover:bg-pink-600 font-semibold">Book a Seat</a>
          <a href="#classes" className="px-5 py-2.5 rounded-md bg-white/10 hover:bg-white/20 font-semibold">See Classes</a>
        </div>
      </div>
    </section>
  );
}

/* ================= BOOKING SYSTEM ================= */
// function BookingSystem() {
//   const rows = 6, cols = 8;
//   const [seats, setSeats] = useLocalStorageState("seats", Array.from({ length: rows * cols }, () => 0));
//   const [customer, setCustomer] = useLocalStorageState("customer", {
//     name: "", phone: "", education: "", address: "",
//     membershipStart: "", membershipEnd: "", renewalDate: "",
//   });
//   const [payment, setPayment] = useLocalStorageState("payment", { plan: "Monthly", amount: "", due: "" });

//   const toggleSeat = (i) => setSeats((prev) => {
//     const copy = [...prev]; copy[i] = copy[i] === 1 ? 0 : 1; return copy;
//   });

//   // compute renewal banner only once client has values (prevents SSR/client date mismatch)
//   const [showRenewal, setShowRenewal] = React.useState(false);
//   const [daysToRenewal, setDaysToRenewal] = React.useState(null);
//   React.useEffect(() => {
//     if (!customer.renewalDate) { setDaysToRenewal(null); setShowRenewal(false); return; }
//     const diff = Math.ceil((new Date(customer.renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
//     setDaysToRenewal(diff);
//     setShowRenewal(true);
//   }, [customer.renewalDate]);

//   return (
//     <section id="booking" className="space-y-10">
//       <h2 className="text-2xl md:text-3xl font-extrabold">Booking System</h2>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//         {BOOKING_ROOM_IMGS.map((src, i) => (
//           <div key={i} className="aspect-video rounded-xl overflow-hidden ring-1 ring-white/10">
//             <img className="h-full w-full object-cover" src={src} alt={`Room ${i + 1}`} />
//           </div>
//         ))}
//       </div>

//       <div className="grid lg:grid-cols-2 gap-8">
//         <div className="rounded-2xl p-6 bg-neutral-900 ring-1 ring-white/10">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-bold text-lg">Seat Map</h3>
//             <div className="flex items-center gap-3 text-sm">
//               <span className="inline-flex items-center gap-2"><Dot className="bg-emerald-500" /> Available</span>
//               <span className="inline-flex items-center gap-2"><Dot className="bg-pink-500" /> Booked</span>
//             </div>
//           </div>
//           <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
//             {Array.from({ length: rows * cols }).map((_, i) => {
//               const booked = seats[i] === 1;
//               return (
//                 <button
//                   key={i}
//                   onClick={() => toggleSeat(i)}
//                   className={`aspect-square rounded-md text-xs font-semibold grid place-items-center ${booked ? "bg-pink-500" : "bg-emerald-600"} hover:opacity-90`}
//                 >
//                   {i + 1}
//                 </button>
//               );
//             })}
//           </div>
//           <div className="mt-4 text-sm text-white/80">
//             Selected seats: {seats.reduce((a, b) => a + (b === 1 ? 1 : 0), 0)}
//           </div>
//         </div>

//         <div className="space-y-6">
//           <div className="rounded-2xl p-6 bg-neutral-900 ring-1 ring-white/10">
//             <h3 className="font-bold text-lg mb-4">Customer Details</h3>
//             <div className="grid md:grid-cols-2 gap-4">
//               <Input label="Name" value={customer.name} onChange={(v)=>setCustomer({...customer,name:v})} />
//               <Input label="Phone" value={customer.phone} onChange={(v)=>setCustomer({...customer,phone:v})} />
//               <Input label="Education" value={customer.education} onChange={(v)=>setCustomer({...customer,education:v})} />
//               <Input label="Address" value={customer.address} onChange={(v)=>setCustomer({...customer,address:v})} />
//               <Input type="date" label="Membership Start" value={customer.membershipStart} onChange={(v)=>setCustomer({...customer,membershipStart:v})} />
//               <Input type="date" label="Membership End" value={customer.membershipEnd} onChange={(v)=>setCustomer({...customer,membershipEnd:v})} />
//               <Input type="date" label="Renewal Date" value={customer.renewalDate} onChange={(v)=>setCustomer({...customer,renewalDate:v})} />
//             </div>
//           </div>

//           <div className="rounded-2xl p-6 bg-neutral-900 ring-1 ring-white/10">
//             <h3 className="font-bold text-lg mb-4">Payments</h3>
//             <div className="grid md:grid-cols-3 gap-4">
//               <Select label="Plan" options={["Monthly","Quarterly","Yearly"]} value={payment.plan} onChange={(v)=>setPayment({...payment,plan:v})} />
//               <Input label="Amount" placeholder="e.g., 1999" value={payment.amount} onChange={(v)=>setPayment({...payment,amount:v})} />
//               <Input type="date" label="Payment Due" value={payment.due} onChange={(v)=>setPayment({...payment,due:v})} />
//             </div>
//           </div>

//           {showRenewal && (
//             <div className={`rounded-xl p-4 text-sm ${daysToRenewal <= 7 ? "bg-amber-500/20 text-amber-200" : "bg-emerald-600/20 text-emerald-200"}`}>
//               {daysToRenewal < 0 ? "Membership renewal date has passed." : `Membership renews in ${daysToRenewal} day${daysToRenewal === 1 ? "" : "s"}.`}
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }

/* ================= CLASSES ================= */
function Classes() {
  const [tab, setTab] = React.useState("reading");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [activeClass, setActiveClass] = React.useState(null);
  const items = tab === "reading" ? READING_ROOMS : NMCLE_CLASSES;

  return (
    <section id="classes" className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold">Classes</h2>
        <div className="inline-flex rounded-lg bg-neutral-900 ring-1 ring-white/10 p-1">
          <button onClick={() => setTab("reading")} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab === "reading" ? "bg-pink-500" : "hover:bg-white/10"}`}>Reading room</button>
          <button onClick={() => setTab("nmcle")} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab === "nmcle" ? "bg-pink-500" : "hover:bg-white/10"}`}>NMCLÉ classes</button>
        </div>
      </div>

      <p className="text-white/70 text-sm">Click <span className="text-pink-400 font-semibold">Book now</span> to open the seat map and payment for that class.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((cls) => (
          <ClassCard key={cls.id} cls={cls} onBook={() => { setActiveClass(cls); setSheetOpen(true); }} />
        ))}
      </div>

      {sheetOpen && activeClass && <BookingPanel cls={activeClass} onClose={() => setSheetOpen(false)} />}
    </section>
  );
}

function ClassCard({ cls, onBook }) {
  const total = cls.rows * cls.cols;
  const booked = useBookedCount(cls.id, total);
  const available = total - booked;

  return (
    <div className="overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-white/10">
      <div className="aspect-[16/9]">
        <img src={cls.img} alt={cls.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold">{cls.name}</div>
            <div className="text-sm text-white/60">{cls.time}</div>
          </div>
          <div className="text-right">
            <div className="text-pink-400 font-semibold">Rs {cls.priceNpr}</div>
            <div className="text-xs text-white/60">per seat</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-white/70 pt-2">
          <span>Slots available</span>
          <span className={`font-semibold ${available > 0 ? "text-emerald-300" : "text-rose-300"}`}>{available} / {total}</span>
        </div>
        <div className="pt-3">
          <button onClick={onBook} className="w-full px-4 py-2 rounded-md bg-pink-500 hover:bg-pink-600 font-semibold">Book now</button>
        </div>
      </div>
    </div>
  );
}

function BookingPanel({ cls, onClose }) {
  const totalSeats = cls.rows * cls.cols;
  const [seats, setSeats] = useLocalStorageState(`seats_${cls.id}`, Array.from({ length: totalSeats }, () => 0));
  const [selected, setSelected] = React.useState([]);
  const [customer, setCustomer] = useLocalStorageState(`cust_${cls.id}`, { name: "", phone: "", email: "" });

  const toggleSeat = (i) => {
    if (seats[i] === 1) return;
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  const confirmBooking = () => {
    if (!customer.name || !customer.phone || selected.length === 0) return;
    const updated = [...seats];
    selected.forEach((i) => (updated[i] = 1));
    setSeats(updated);
    setSelected([]);
    alert("Booked! (saved to your browser storage for this demo)");
  };

  const bookedCount = seats.filter((x) => x === 1).length;
  const available = totalSeats - bookedCount;
  const totalPrice = selected.length * cls.priceNpr;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-3xl bg-neutral-950 ring-1 ring-white/10 p-6 overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-bold">{cls.name}</div>
            <div className="text-sm text-white/60">{cls.time}</div>
          </div>
        <button onClick={onClose} className="text-white/70 hover:text-white">Close</button>
        </div>

        <div className="mt-4 grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl p-4 bg-neutral-900 ring-1 ring-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Seat map</div>
              <div className="flex items-center gap-3 text-xs">
                <LegendDot color="bg-emerald-500" label="Available" />
                <LegendDot color="bg-pink-500" label="Booked" />
                <LegendDot color="bg-yellow-400" label="Selected" />
              </div>
            </div>

            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cls.cols}, minmax(0,1fr))` }}>
              {Array.from({ length: totalSeats }).map((_, i) => {
                const isBooked = seats[i] === 1;
                const isSelected = selected.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleSeat(i)}
                    disabled={isBooked}
                    className={`aspect-square rounded-md text-xs font-semibold grid place-items-center ${isBooked ? "bg-pink-500 cursor-not-allowed" : isSelected ? "bg-yellow-400 text-black" : "bg-emerald-600 hover:opacity-90"}`}
                    title={isBooked ? "Already booked" : "Toggle seat"}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 text-sm text-white/80">Available: {available} / {totalSeats} • Selected: {selected.length}</div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl p-4 bg-neutral-900 ring-1 ring-white/10">
              <div className="font-semibold mb-3">Your details</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input label="Full name" value={customer.name} onChange={(v)=>setCustomer({...customer,name:v})} />
                <Input label="Phone" value={customer.phone} onChange={(v)=>setCustomer({...customer,phone:v})} />
                <Input label="Email (optional)" value={customer.email} onChange={(v)=>setCustomer({...customer,email:v})} />
              </div>
            </div>

            <div className="rounded-xl p-4 bg-neutral-900 ring-1 ring-white/10">
              <div className="font-semibold mb-3">Payment</div>
              <div className="flex items-center justify-between">
                <div className="text-white/75 text-sm">Rs {cls.priceNpr} × {selected.length} seat{selected.length === 1 ? "" : "s"}</div>
                <div className="text-lg font-bold">Total: Rs {totalPrice}</div>
              </div>
              <div className="mt-3 text-xs text-white/50">(Demo only — connect to your payment gateway/API.)</div>
              <div className="mt-4 flex gap-2">
                <button onClick={confirmBooking} disabled={selected.length === 0 || !customer.name || !customer.phone} className="px-4 py-2 rounded-md bg-pink-500 hover:bg-pink-600 font-semibold disabled:opacity-50">Confirm & Book</button>
                <button onClick={onClose} className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15">Cancel</button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden">
              <img src={cls.img} alt={cls.name} className="w-full h-44 object-cover" />
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
      <p className="text-white/70 text-sm">Swap these with your Google Drive images (sorted by room numbers).</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-white/10">
            <img className="w-full h-full object-cover hover:scale-105 transition" alt={`Gallery ${i+1}`} src={`https://picsum.photos/seed/room${i}/800/600`} />
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
      <p className="text-white/80">Placeholder for your script. Send it and we’ll drop it here.</p>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-extrabold">Contact for reservations</h2>
      <div className="space-y-1 text-white/85">
        <div>Sano Kharibot, Shantinagar</div>
        <a className="text-pink-400 hover:underline" href="tel:+9779861408529">9861408529</a>
      </div>
      <div className="mt-4">
        <a href="#booking" className="px-5 py-2.5 rounded-md bg-pink-500 hover:bg-pink-600 font-semibold">Book now</a>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="space-y-8">
      <h2 className="text-2xl md:text-3xl font-extrabold">Our services</h2>

      <ServiceCard title="Reading room" media={<img className="w-full h-full object-cover" src="https://picsum.photos/id/1048/1200/700" alt="Reading room" />}>
        <p>Calm space for focused study. Flexible seats, quiet environment, and access to the library.</p>
      </ServiceCard>

      <ServiceCard
        title="NMCLÉ classes"
        media={
          <div className="w-full h-full flex items-center justify-center bg-neutral-900">
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

      <ServiceCard title="Mock tests" media={<img className="w-full h-full object-cover" src="https://picsum.photos/id/1015/1200/700" alt="Mock test" />}>
        <div className="space-y-3 leading-7">
          <p>Timed tests with instant scoring and analytics.</p>
          <div className="rounded-lg bg-neutral-900 ring-1 ring-white/10 p-4">
            <div className="font-semibold mb-1">Sample mock test</div>
            <p className="text-sm text-white/75">Link a Google Form or your own test system.</p>
            <a className="mt-3 inline-block px-4 py-2 rounded-md bg-pink-500 hover:bg-pink-600 font-semibold" href="#">Try sample</a>
          </div>
          <div>
            <div className="font-semibold">Subscription details</div>
            <p className="text-sm text-white/75">Monthly / Quarterly / Yearly with student discounts.</p>
          </div>
        </div>
      </ServiceCard>
    </section>
  );
}

function ServiceCard({ title, media, children }) {
  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 bg-neutral-950">
      <div className="grid md:grid-cols-2">
        <div className="aspect-video md:aspect-auto md:h-full">{media}</div>
        <div className="p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold mb-4">{title}</h3>
          <div className="text-white/85">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ================= BLOGS ================= */
function Blogs() {
  // Start empty for SSR parity; load posts after mount
  const [posts, setPosts] = useLocalStorageState("posts", []);
  const [draft, setDraft] = React.useState({ title: "", content: "" });

  const addPost = () => {
    if (!draft.title.trim() || !draft.content.trim()) return;
    const id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
    setPosts([{ id, ...draft, createdAt: new Date().toISOString() }, ...posts]);
    setDraft({ title: "", content: "" });
  };

  const removePost = (id) => setPosts(posts.filter((p) => p.id !== id));

  return (
    <section id="blogs" className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-extrabold">Blog</h2>

      <div className="rounded-2xl p-6 bg-neutral-900 ring-1 ring-white/10">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Title" value={draft.title} onChange={(v)=>setDraft({...draft,title:v})} />
          <div className="md:col-span-2">
            <Textarea label="Content" rows={5} value={draft.content} onChange={(v)=>setDraft({...draft,content:v})} />
          </div>
        </div>
        <div className="mt-4">
          <button onClick={addPost} className="px-4 py-2 rounded-md bg-pink-500 hover:bg-pink-600 font-semibold">Publish</button>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-white/70">No posts yet. Write your first blog above.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {posts.map((p) => (
            <article key={p.id} className="rounded-xl p-5 bg-neutral-900 ring-1 ring-white/10">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-lg font-bold">{p.title}</h4>
                <button onClick={() => removePost(p.id)} className="text-sm text-white/60 hover:text-white">Remove</button>
              </div>
              {/* Rendered only on client after posts load, so locale formatting is safe */}
              <div className="text-xs text-white/50 mt-1">{new Date(p.createdAt).toLocaleString()}</div>
              <p className="mt-3 text-white/85 whitespace-pre-wrap">{p.content}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/* ================= FOOTER & UI ================= */
function Footer() {
  return (
    <footer className="py-10 text-center text-white/60">
      © {new Date().getFullYear()} StudyHub • All rights reserved.
    </footer>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <div className="text-sm mb-1 text-white/70">{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-neutral-800 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
      />
    </label>
  );
}
function Textarea({ label, value, onChange, rows = 4 }) {
  return (
    <label className="block">
      <div className="text-sm mb-1 text-white/70">{label}</div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-neutral-800 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
      />
    </label>
  );
}
function Select({ label, value, onChange, options = [] }) {
  return (
    <label className="block">
      <div className="text-sm mb-1 text-white/70">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-neutral-800 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
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
    setCount(loadLS(`seats_${classId}`, Array.from({ length: total }, () => 0)).filter((x) => x === 1).length);
  }, [classId, total]);
  return count;
}
