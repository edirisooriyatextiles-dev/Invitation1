"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

/* ===== Configurable details ===== */
const C = {
  shop: "Edirisooriya Textiles",
  contactPerson: "Yasiru Dilshan",
  start: "2026-10-30T06:35:00",
  end: "2026-10-30T20:00:00",
  salesStart: "2026-10-30T08:51:00",
  address: "Edirisooriya Textiles",
  mapUrl: "https://maps.app.goo.gl/3Xwv1k4fLvc3zG526",
  phone: "94774757189",
  phoneShow: "+94 77 475 7189",
  ribbon: "6:35 AM — Auspicious Inauguration & Milk Boiling (Facing South / දකුණ බලා)",
  firstSale: "8:51 AM — Commencement of Sales & Business (Facing North / උතුරු දිශාව බලා)"
};

const startDate = new Date(C.start);
const endDate = new Date(C.end);

function SplitWords({ text }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i} className="w">
          <i style={{ "--i": i }}>{w}</i>
        </span>
      ))}
    </>
  );
}

// Synthesize an auspicious ceremonial harp & chime flourish via Web Audio API
const playCeremonialChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Auspicious pentatonic resonant harmonics: C5, E5, G5, B5, C6, E6, G6
    const notes = [
      { f: 523.25, t: 0.0, d: 2.0 },  // C5
      { f: 659.25, t: 0.12, d: 2.0 }, // E5
      { f: 783.99, t: 0.24, d: 2.2 }, // G5
      { f: 987.77, t: 0.36, d: 2.4 }, // B5
      { f: 1046.50, t: 0.50, d: 2.6 },// C6
      { f: 1318.51, t: 0.65, d: 2.8 },// E6
      { f: 1567.98, t: 0.82, d: 3.2 } // G6
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, ctx.currentTime + t);

      gain.gain.setValueAtTime(0, ctx.currentTime + t);
      gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + d);
    });
  } catch (err) {
    console.log("Audio chime note:", err);
  }
};

export default function Home() {
  const [introState, setIntroState] = useState("idle"); // idle | open | gone
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Countdown state
  const [counts, setCounts] = useState(["0", "0", "0", "0"]);
  const [tickAnim, setTickAnim] = useState([false, false, false, false]);

  const bigdayRef = useRef(null);
  const heroRef = useRef(null);
  const progRef = useRef(null);
  const bgmAudioRef = useRef(null);
  const fadeTimerRef = useRef(null);

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
  const whenStr = `${dateStr}, ${tm(startDate)} onwards`;

  // Formatting for Google Calendar dates
  const formatCalDate = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const calHref = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    C.shop + " — Grand Opening Ceremony"
  )}&dates=${formatCalDate(startDate)}/${formatCalDate(endDate)}&details=${encodeURIComponent(
    `Grand Opening of ${C.shop}\n\nAuspicious Times (ශුභ මුහුර්ත):\n• 6:35 AM: Inaugural Opening & Traditional Milk Boiling (කිරි ඉතිරවීම) - Facing South\n• 8:51 AM: Commencement of Commercial Sales & First Transactions (මුල් ගනුදෙනුව) - Facing North\n\nContact: ${C.contactPerson} (${C.phoneShow})\nLocation: ${C.mapUrl}`
  )}&location=${encodeURIComponent(C.mapUrl)}`;

  const waHref = `https://wa.me/${C.phone}?text=${encodeURIComponent(
    `Hello ${C.contactPerson}! I would like to inquire about the grand opening of ${C.shop} on ${dateStr}.`
  )}`;

  // Share handler
  const handleShare = (e) => {
    e.preventDefault();
    const data = {
      title: `${C.shop} — Grand Opening`,
      text: `You’re invited to the grand opening of ${C.shop} on ${dateStr}. Contact: ${C.contactPerson} (${C.phoneShow})`,
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

  // Start calm classical music with smooth fade-in
  const startClassicalMusic = useCallback(() => {
    if (!bgmAudioRef.current) return;
    try {
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      bgmAudioRef.current.volume = 0;
      const playPromise = bgmAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsMusicPlaying(true);
            let currentVol = 0;
            fadeTimerRef.current = setInterval(() => {
              currentVol += 0.02;
              if (currentVol >= 0.38) {
                currentVol = 0.38;
                if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
              }
              if (bgmAudioRef.current) bgmAudioRef.current.volume = currentVol;
            }, 80);
          })
          .catch((err) => {
            console.log("Music waiting for interaction:", err);
          });
      }
    } catch (err) {
      console.log("Audio error:", err);
    }
  }, []);

  // Toggle classical music play / pause
  const toggleMusic = () => {
    if (!bgmAudioRef.current) return;
    if (isMusicPlaying) {
      // Smooth fade out
      let currentVol = bgmAudioRef.current.volume;
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = setInterval(() => {
        currentVol -= 0.04;
        if (currentVol <= 0.02) {
          if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
          if (bgmAudioRef.current) {
            bgmAudioRef.current.pause();
            bgmAudioRef.current.volume = 0;
          }
          setIsMusicPlaying(false);
        } else {
          if (bgmAudioRef.current) bgmAudioRef.current.volume = currentVol;
        }
      }, 50);
    } else {
      startClassicalMusic();
    }
  };

  // Begin transition
  const begin = useCallback(() => {
    setIntroState((prev) => {
      if (prev !== "idle") return prev;
      return "open";
    });

    // Play auspicious ceremonial chime flourish
    playCeremonialChime();

    // Start classical background music with smooth fade-in
    startClassicalMusic();

    setTimeout(() => {
      document.body.classList.remove("lock");
      document.body.classList.add("live");
      setHeroRevealed(true);
    }, 800);

    setTimeout(() => {
      setIntroState("gone");
    }, 2200);
  }, [startClassicalMusic]);

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
      {/* Background Classical Audio Element */}
      <audio
        ref={bgmAudioRef}
        src="/audio/classical-bgm.mp3"
        loop
        preload="auto"
      />

      {/* Floating Audio Controller */}
      <button
        className="music-btn"
        onClick={toggleMusic}
        title={isMusicPlaying ? "Mute Background Music" : "Play Classical Music"}
        aria-label="Toggle Classical Music"
      >
        <span className={`music-bars ${isMusicPlaying ? "active" : ""}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span>{isMusicPlaying ? "Music: On" : "Music: Off"}</span>
      </button>

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
          <p>You are cordially invited</p>
          <button className="intro-enter-btn" onClick={begin}>
            <span>Open Invitation ✦</span>
          </button>
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
            Join us for our auspicious grand opening ceremony.
          </p>
          <a
            className={`btn main rv ${heroRevealed ? "in" : ""}`}
            href="#schedule"
          >
            View Auspicious Times
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

      {/* Date & Auspicious Times (සුභ මුහුර්ත) Section */}
      <section className="scene" id="schedule">
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
              <b>Date & Auspicious Day</b>
              <p id="when">
                {whenStr}
                <span style={{ display: "block", color: "var(--mute)", fontSize: "0.9rem", marginTop: "4px" }}>
                  2026 ඔක්තෝබර් මස 30 වන සිකුරාදා
                </span>
              </p>
            </div>
            <div className="rv">
              <b>Auspicious Opening & Milk Boiling (සුභ මුහුර්තය)</b>
              <p id="rib">
                {C.ribbon}
                <span style={{ display: "block", color: "var(--mute)", fontSize: "0.9rem", marginTop: "4px" }}>
                  පෙ.ව. 6.35 — ආයතන වහලක් යටදී කිරි ඉතිරවීම යහපති (දකුණ බලා)
                </span>
              </p>
            </div>
            <div className="rv">
              <b>Commercial Sales Inauguration (අලවි කටයුතු)</b>
              <p>
                {C.firstSale}
                <span style={{ display: "block", color: "var(--mute)", fontSize: "0.9rem", marginTop: "4px" }}>
                  පෙ.ව. 8.51 — උතුරු දිශාව බලා ව්‍යාපාරයේ මුල් අලවි කටයුතු ඇරඹීම
                </span>
              </p>
            </div>
            <div className="rv">
              <b>Location & Directions</b>
              <p id="where">
                {C.address}
                <a
                  href={C.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--gold)",
                    marginTop: "6px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px"
                  }}
                >
                  📍 Open in Google Maps
                </a>
              </p>
            </div>
            <div className="rv">
              <b>Inquiries & Contact Person</b>
              <p>
                <span style={{ fontWeight: 600, color: "var(--ink)", display: "block" }}>
                  {C.contactPerson}
                </span>
                <a
                  href={`tel:${C.phoneShow.replace(/\s+/g, "")}`}
                  style={{ color: "var(--gold)", textDecoration: "none" }}
                >
                  {C.phoneShow}
                </a>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="acts rv" style={{ marginTop: "2.5rem" }}>
            <a
              className="btn main"
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Inquire on WhatsApp
            </a>
            <a
              className="btn alt"
              href={calHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Add to Calendar
            </a>
            <a
              className="btn alt"
              href={C.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Google Maps
            </a>
            <a className="btn alt" href="#" onClick={handleShare}>
              Share Invitation
            </a>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="scene">
        <div className="wrap">
          <h2 className="h2 sp">
            <SplitWords text="The door opening." />
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
            {isExpired
              ? "We are now officially open. Welcome to Edirisooriya Textiles!"
              : "Until the auspicious ribbon is cut (6:35 AM)"}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="logo" style={{ marginBottom: "1.2rem" }}>
          <Image
            src="/logo.png"
            alt={C.shop}
            width={220}
            height={55}
            style={{ width: "min(220px, 52vw)", height: "auto" }}
          />
        </div>
        <h2 id="fshop">{C.shop}</h2>
        <p>
          <a
            href={C.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--mute)", textDecoration: "none" }}
          >
            📍 {C.address} — View Location on Google Maps
          </a>
        </p>
        <p>
          Contact: <strong>{C.contactPerson}</strong> •{" "}
          <a
            href={`tel:${C.phoneShow.replace(/\s+/g, "")}`}
            style={{ color: "var(--gold)", textDecoration: "none" }}
          >
            {C.phoneShow}
          </a>
        </p>
        <p style={{ marginTop: "12px", letterSpacing: "0.08em", fontSize: "0.95rem" }}>
          Fibres • Fabrics • Fashion
        </p>
      </footer>
    </>
  );
}
