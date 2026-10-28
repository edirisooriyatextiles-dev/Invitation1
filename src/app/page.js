"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

/* ===== Configurable details ===== */
const C = {
  shop: "Edirisooriya Textiles",
  start: "2026-10-30T06:35:00",
  end: "2026-10-30T18:00:00",
  address: "No. 00, Main Street, Your Town",
  phone: "94770000000",
  phoneShow: "+94 77 000 0000",
  ribbon: "6:35 AM, at the auspicious time",
  offers: [
    "New arrivals in sarees, dress materials, shirting and suiting",
    "Opening day discounts on every purchase",
    "A free gift for the first 100 customers",
    "Fabric matching and tailoring advice from our team"
  ]
};

const startDate = new Date(C.start);
const endDate = new Date(C.end);

function SplitWords({ text }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i} className="w">
          <i style={{ "--i": i }}>{w}</i>{" "}
        </span>
      ))}
    </>
  );
}

export default function Home() {
  const [guests, setGuests] = useState("1");
  const [introState, setIntroState] = useState("idle"); // idle | open | gone
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Countdown state
  const [counts, setCounts] = useState(["0", "0", "0", "0"]);
  const [tickAnim, setTickAnim] = useState([false, false, false, false]);

  const bigdayRef = useRef(null);
  const heroRef = useRef(null);
  const progRef = useRef(null);

  const tm = (d) =>
    d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });

  const dateStr = startDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const weekdayStr = startDate.toLocaleDateString("en-GB", { weekday: "long" });
  const monthStr = startDate.toLocaleDateString("en-GB", { month: "long" });
  const bigDayNum = startDate.getDate();
  const yearStr = `${startDate.getFullYear()}, ${tm(startDate)}`;
  const whenStr = `${dateStr}, ${tm(startDate)} to ${tm(endDate)}`;

  // Formatting for Google Calendar dates
  const formatCalDate = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const calHref = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    C.shop + " grand opening"
  )}&dates=${formatCalDate(startDate)}/${formatCalDate(endDate)}&location=${encodeURIComponent(
    C.address
  )}`;

  const waHref = `https://wa.me/${C.phone}?text=${encodeURIComponent(
    `Hello! I will attend the grand opening of ${C.shop} on ${dateStr}. Guests: ${guests}.`
  )}`;

  const handleShare = (e) => {
    e.preventDefault();
    const data = {
      title: C.shop,
      text: `You’re invited to the grand opening of ${C.shop} on ${dateStr}.`,
      url: typeof window !== "undefined" ? window.location.href : ""
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share(data).catch(() => {});
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(data.text + " " + data.url)}`,
        "_blank"
      );
    }
  };

  // Begin transition
  const begin = useCallback(() => {
    setIntroState((prev) => {
      if (prev !== "idle") return prev;
      return "open";
    });

    setTimeout(() => {
      document.body.classList.remove("lock");
      document.body.classList.add("live");
      setHeroRevealed(true);
    }, 800);

    setTimeout(() => {
      setIntroState("gone");
    }, 2200);
  }, []);

  // Setup client listeners, countdown, and scroll handling
  useEffect(() => {
    document.body.classList.add("lock");

    // Auto begin after delay
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(begin, prefersReduced ? 200 : 3800);

    // Countdown tick
    const updateCountdown = () => {
      const now = new Date();
      const diff = startDate.getTime() - now.getTime();
      if (diff <= 0) {
        setIsExpired(true);
        return;
      }

      const d = Math.floor(diff / 864e5);
      const h = Math.floor(diff / 36e5) % 24;
      const m = Math.floor(diff / 6e4) % 60;
      const s = Math.floor(diff / 1e3) % 60;

      const newVals = [String(d), String(h), String(m), String(s)];

      setCounts((prev) => {
        const anims = [false, false, false, false];
        newVals.forEach((v, idx) => {
          if (prev[idx] !== v) {
            anims[idx] = true;
          }
        });
        setTickAnim(anims);
        return newVals;
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    // Intersection observer for reveals
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    const revealElements = document.querySelectorAll(".rv:not(.hero *), .sp:not(.hero *)");
    revealElements.forEach((el) => io.observe(el));

    // Scroll-linked motion (prog, hero, bigday)
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const vh = window.innerHeight;
        const max = document.documentElement.scrollHeight - vh;

        if (progRef.current) {
          progRef.current.style.setProperty("--sc", max > 0 ? (window.scrollY / max).toFixed(3) : "0");
        }

        if (heroRef.current) {
          heroRef.current.style.setProperty("--hp", Math.min(1, window.scrollY / vh).toFixed(3));
        }

        if (bigdayRef.current) {
          const section = bigdayRef.current.closest("section");
          if (section) {
            const r = section.getBoundingClientRect();
            bigdayRef.current.style.setProperty(
              "--sp",
              Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height))).toFixed(3)
            );
          }
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.body.classList.remove("lock");
    };
  }, [begin]);

  return (
    <>
      {/* Cinematic Vignette, Bars, and Progress Line */}
      <div className="vig" aria-hidden="true"></div>
      <div className="bar t" aria-hidden="true"></div>
      <div className="bar b" aria-hidden="true"></div>
      <div className="prog" id="prog" ref={progRef} aria-hidden="true"></div>

      {/* Intro Curtain Screen */}
      <div
        id="intro"
        className={`${introState === "open" ? "open" : ""} ${
          introState === "gone" ? "gone" : ""
        }`}
      >
        <div className="cur l"></div>
        <div className="cur r"></div>
        <div className="stage">
          <Image
            src="/logo.png"
            alt={C.shop}
            width={260}
            height={65}
            priority
            style={{ width: "min(260px, 62vw)", height: "auto" }}
          />
          <i></i>
          <p>You are invited</p>
        </div>
        <button id="skip" onClick={begin}>
          Skip intro
        </button>
      </div>

      {/* Hero Section */}
      <header className="scene hero" id="top" ref={heroRef}>
        <div className="wrap">
          <div className={`logo rv ${heroRevealed ? "in" : ""}`}>
            <Image
              src="/logo.png"
              alt={`${C.shop}: fibres, fabrics, fashion`}
              width={240}
              height={60}
              priority
              style={{ width: "min(240px, 58vw)", height: "auto" }}
            />
          </div>
          <h1 className={`sp ${heroRevealed ? "in" : ""}`} id="shop">
            <SplitWords text={C.shop} />
          </h1>
          <p className={`lead rv ${heroRevealed ? "in" : ""}`}>
            Join us for our grand opening.
          </p>
          <a
            className={`btn main rv ${heroRevealed ? "in" : ""}`}
            href="#rsvp"
          >
            Reserve your place
          </a>
        </div>
        <svg
          className="thread"
          viewBox="0 0 1000 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 40 C150 0 250 70 400 30 S650 10 760 38 S920 55 1000 20" />
        </svg>
      </header>

      {/* Date & Key Information */}
      <section className="scene">
        <div className="wrap">
          <div className="date">
            <div id="bigday" ref={bigdayRef} data-par aria-hidden="true">
              {bigDayNum}
            </div>
            <h2 className="sp rv" id="dm">
              {weekdayStr} {monthStr}
              <span>{yearStr}</span>
            </h2>
          </div>
          <div className="facts">
            <div className="rv">
              <b>When</b>
              <p id="when">{whenStr}</p>
            </div>
            <div className="rv">
              <b>Where</b>
              <p id="where">{C.address}</p>
            </div>
            <div className="rv">
              <b>Ribbon cutting</b>
              <p id="rib">{C.ribbon}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="scene">
        <div className="wrap">
          <h2 className="h2 sp">
            <SplitWords text="The doors open in" />
          </h2>
          {!isExpired ? (
            <div className="count rv" id="count">
              {["days", "hours", "minutes", "seconds"].map((unit, idx) => (
                <div key={unit}>
                  <b className={tickAnim[idx] ? "tk" : ""}>{counts[idx]}</b>
                  <span>{unit}</span>
                </div>
              ))}
            </div>
          ) : null}
          <p className="cnote rv" id="countnote">
            {isExpired ? "We are open. Come and visit us." : "Until the ribbon is cut"}
          </p>
        </div>
      </section>

      {/* Highlights / Offers Section */}
      <section className="scene">
        <div className="wrap">
          <h2 className="h2 sp">
            <SplitWords text="What’s waiting inside" />
          </h2>
          <ul className="list" id="offers">
            {C.offers.map((offer, idx) => (
              <li key={idx} className="rv">
                {offer}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RSVP Section */}
      <section className="scene" id="rsvp">
        <div className="wrap">
          <h2 className="h2 sp">
            <SplitWords text="Be there for the first day" />
          </h2>
          <div className="rsvp rv">
            <div>
              <label htmlFor="guests">Guests</label>
              <select
                id="guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5+">5+</option>
              </select>
            </div>
            <div className="acts">
              <a
                className="btn main"
                id="wa"
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reply on WhatsApp
              </a>
              <a
                className="btn alt"
                id="cal"
                href={calHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Add to calendar
              </a>
              <a className="btn alt" id="share" href="#" onClick={handleShare}>
                Share invitation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <h2 id="fshop">{C.shop}</h2>
        <p id="faddr">{C.address}</p>
        <p id="fphone">{C.phoneShow}</p>
        <p>Fibres • Fabrics • Fashion</p>
      </footer>
    </>
  );
}
