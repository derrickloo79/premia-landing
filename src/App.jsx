import { useState, useEffect, useRef } from "react";

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(val);

const formatPct = (val) => `${val.toFixed(2)}%`;

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 2 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const duration = 600;
    cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    rafRef.current = requestAnimationFrame(function step(ts) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = to;
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <span>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  );
}

function NumberField({ label, value, onChange, min, max, step, prefix, suffix, sublabel, stepper, allowEmpty }) {
  const [raw, setRaw] = useState(value === null ? "" : String(value));
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) {
      setRaw(value === null ? "" : String(value));
    }
  }, [value]);

  const commit = (rawStr) => {
    if (rawStr === "") {
      if (allowEmpty) { onChange(null); return; }
      const safe = value ?? min;
      setRaw(String(safe));
      onChange(safe);
      return;
    }
    const parsed = parseFloat(rawStr);
    if (isNaN(parsed)) {
      setRaw(value === null ? "" : String(value));
    } else {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
      setRaw(String(clamped));
    }
  };

  return (
    <div className="input-group">
      <div className="input-field-row">
        <div className="input-field-label">
          <span className="input-label">{label}</span>
          {sublabel && <span className="input-sublabel">{sublabel}</span>}
        </div>
        <div className="number-field-wrap">
          {stepper && (
            <button className="stepper-btn" onClick={() => {
              const v = Math.max(min, (value ?? min) - step);
              onChange(v); setRaw(String(v));
            }}>−</button>
          )}
          {prefix && <span className="input-affix">{prefix}</span>}
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={raw}
            onChange={(e) => {
              const v = e.target.value;
              setRaw(v);
              if (v === "" && allowEmpty) { onChange(null); return; }
              const parsed = parseFloat(v);
              if (!isNaN(parsed)) onChange(parsed);
            }}
            onFocus={() => { focusedRef.current = true; }}
            onBlur={(e) => { focusedRef.current = false; commit(e.target.value); }}
            className="num-input"
            placeholder={allowEmpty ? "—" : undefined}
          />
          {suffix && <span className="input-affix input-affix-suffix">{suffix}</span>}
          {stepper && (
            <button className="stepper-btn stepper-plus" onClick={() => {
              const v = Math.min(max, (value ?? min) + step);
              onChange(v); setRaw(String(v));
            }}>+</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, large }) {
  return (
    <div className={`stat-card ${accent ? "accent" : ""} ${large ? "large" : ""}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
        <div className="nav-inner">
          <div className="nav-logo">
            <span className="logo-mark">◈</span>
            <span className="logo-text">Premia</span>
          </div>
          <div className="nav-links nav-desktop">
            <a href="#calculator" className="nav-link">Calculator</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="https://tally.so/r/EkxMRX" target="_blank"  className="nav-cta">Get Started</a>
          </div>
          <button className="nav-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <span className="ham-line" />
            <span className="ham-line" />
            <span className="ham-line" />
          </button>
        </div>
      </nav>

      <div className={`drawer-backdrop ${drawerOpen ? "open" : ""}`} onClick={closeDrawer} />

      <div className={`drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="nav-logo">
            <span className="logo-mark">◈</span>
            <span className="logo-text">Premia</span>
          </div>
          <button className="drawer-close" onClick={closeDrawer} aria-label="Close menu">✕</button>
        </div>
        <div className="drawer-divider" />
        <nav className="drawer-nav">
          <a href="#calculator" className="drawer-link" onClick={closeDrawer}>
            <span className="drawer-link-icon">◎</span> Calculator
          </a>
          <a href="#features" className="drawer-link" onClick={closeDrawer}>
            <span className="drawer-link-icon">⊕</span> Features
          </a>
        </nav>
        <div className="drawer-footer">
          <a href="#" className="btn-primary drawer-cta" onClick={closeDrawer}>Get Started →</a>
          <p className="drawer-footnote">Track every premium you earn.</p>
        </div>
      </div>
    </>
  );
}

export default function App() {
  // Calculator state
  const [strategy, setStrategy] = useState("csp");
  const [premium, setPremium] = useState(0.50);
  const [strike, setStrike] = useState(50.0);
  const [contracts, setContracts] = useState(1);
  const [daysHeld, setDaysHeld] = useState(30);
  const [closingPremium, setClosingPremium] = useState(null);

  const cp = closingPremium ?? 0;
  const hasRequired = premium !== null && strike !== null && daysHeld !== null;
  const collateral = hasRequired ? strike * 100 * contracts : 0;
  const grossPremium = hasRequired ? premium * 100 * contracts : 0;
  const closingCost = hasRequired ? cp * 100 * contracts : 0;
  const netPremium = grossPremium - closingCost;
  const roi = hasRequired && collateral > 0 ? (netPremium / collateral) * 100 : 0;
  const thirtyDayRoi = hasRequired && daysHeld > 0 ? (roi / daysHeld) * 30 : 0;
  const breakeven = hasRequired ? (strategy === "csp" ? strike - premium + cp : strike + premium - cp) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0b0d;
          --surface: #111318;
          --surface-2: #191c24;
          --border: rgba(255,255,255,0.07);
          --border-strong: rgba(255,255,255,0.13);
          --text: #e8eaf0;
          --text-muted: #6b7280;
          --text-dim: #9ca3af;
          --gold: #c9a84c;
          --gold-light: #e8c97e;
          --gold-dim: rgba(201,168,76,0.15);
          --green: #4ade80;
          --green-dim: rgba(74,222,128,0.1);
          --red: #f87171;
          --accent: #c9a84c;
          --font-display: 'DM Serif Display', serif;
          --font-body: 'DM Sans', sans-serif;
          --font-mono: 'DM Mono', monospace;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          font-weight: 300;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }
        p { font-size: 1.125rem; }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 1.5rem 0;
          transition: all 0.3s ease;
        }
        .nav-scrolled {
          background: rgba(10,11,13,0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 1rem 0;
        }
        .nav-inner {
          max-width: 1100px; margin: 0 auto; padding: 0 2rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo { display: flex; align-items: center; gap: 0.6rem; }
        .logo-mark { color: var(--gold); font-size: 1.2rem; }
        .logo-text { font-family: var(--font-display); font-size: 1.4rem; letter-spacing: 0.02em; }
        .nav-links { display: flex; align-items: center; gap: 2rem; }
        .nav-link {
          color: var(--text-dim); font-size: 0.875rem; text-decoration: none;
          letter-spacing: 0.05em; text-transform: uppercase; font-weight: 400;
          transition: color 0.2s;
        }
        .nav-link:hover { color: var(--text); }
        .nav-cta {
          background: var(--gold); color: #0a0b0d;
          padding: 0.5rem 1.25rem; border-radius: 4px;
          font-size: 0.8rem; font-weight: 500; text-decoration: none;
          letter-spacing: 0.06em; text-transform: uppercase;
          transition: background 0.2s, transform 0.1s;
        }
        .nav-cta:hover { background: var(--gold-light); transform: translateY(-1px); }

        /* Hamburger — mobile only */
        .nav-hamburger {
          display: none; flex-direction: column; justify-content: center; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 4px;
          width: 36px; height: 36px;
        }
        .ham-line {
          display: block; width: 22px; height: 1.5px;
          background: var(--text); border-radius: 2px;
          transition: all 0.2s;
        }
        .nav-hamburger:hover .ham-line { background: var(--gold); }

        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex; }
        }

        /* Backdrop */
        .drawer-backdrop {
          position: fixed; inset: 0; z-index: 199;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .drawer-backdrop.open { opacity: 1; pointer-events: all; }

        /* Drawer */
        .drawer {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 200;
          width: min(320px, 85vw);
          background: var(--surface);
          border-left: 1px solid var(--border-strong);
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: -20px 0 60px rgba(0,0,0,0.5);
        }
        .drawer.open { transform: translateX(0); }

        .drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 1.5rem 1.25rem;
        }
        .drawer-close {
          background: none; border: 1px solid var(--border); color: var(--text-muted);
          width: 32px; height: 32px; border-radius: 4px; cursor: pointer;
          font-size: 0.75rem; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .drawer-close:hover { color: var(--text); border-color: var(--border-strong); background: var(--surface-2); }

        .drawer-divider { height: 1px; background: var(--border); margin: 0 1.5rem; }

        .drawer-nav {
          display: flex; flex-direction: column; padding: 1.5rem;
          gap: 0.25rem; flex: 1;
        }
        .drawer-link {
          display: flex; align-items: center; gap: 0.85rem;
          padding: 0.85rem 1rem; border-radius: 6px;
          color: var(--text-dim); text-decoration: none;
          font-size: 0.9rem; font-weight: 400; letter-spacing: 0.04em;
          transition: all 0.15s;
          border: 1px solid transparent;
        }
        .drawer-link:hover {
          color: var(--text); background: var(--surface-2);
          border-color: var(--border);
        }
        .drawer-link-icon { color: var(--gold); font-size: 0.85rem; width: 16px; text-align: center; }

        .drawer-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 1rem;
        }
        .drawer-cta { display: block; text-align: center; padding: 0.85rem 1.5rem; }
        .drawer-footnote {
          font-family: var(--font-mono); font-size: 0.65rem;
          color: var(--text-muted); text-align: center; letter-spacing: 0.08em;
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column; justify-content: center;
          padding: 8rem 2rem 4rem;
          position: relative; overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 60% 50% at 70% 50%, rgba(201,168,76,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 20% 80%, rgba(74,222,128,0.03) 0%, transparent 60%);
        }
        .hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }
        .hero-inner {
          max-width: 1100px; margin: 0 auto; width: 100%;
          position: relative; z-index: 1;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-family: var(--font-mono); font-size: 0.75rem;
          color: var(--gold); letter-spacing: 0.15em; text-transform: uppercase;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(201,168,76,0.25);
          padding: 0.3rem 0.8rem; border-radius: 2px;
          background: var(--gold-dim);
        }
        .hero-title {
          font-family: var(--font-display); font-size: clamp(3rem, 7vw, 5.5rem);
          line-height: 1.05; letter-spacing: -0.01em;
          margin-bottom: 1.5rem;
        }
        .hero-title em { font-style: italic; color: var(--gold); }
        .hero-sub {
          font-size: 1.125rem; color: var(--text-dim); font-weight: 300;
          max-width: 480px; line-height: 1.7; margin-bottom: 2.5rem;
        }
        .hero-actions { display: flex; gap: 1rem; align-items: center; }
        .btn-primary {
          background: var(--gold); color: #0a0b0d;
          padding: 0.8rem 2rem; border-radius: 4px; border: none; cursor: pointer;
          font-family: var(--font-body); font-size: 0.875rem; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none;
          transition: all 0.2s; display: inline-block;
        }
        .btn-primary:hover { background: var(--gold-light); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,168,76,0.2); }
        .btn-ghost {
          color: var(--text-dim); font-size: 0.875rem; text-decoration: none; text-transform: uppercase; letter-spacing: 0.03em; display: flex; align-items: center; gap: 0.4rem;
          transition: color 0.2s;
        }
        .btn-ghost:hover { color: var(--text); }
        .hero-ticker {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          display: flex; flex-direction: column; gap: 0.75rem;
          opacity: 0.5;
        }
        .ticker-item {
          font-family: var(--font-mono); font-size: 0.7rem;
          color: var(--text-dim); text-align: right;
          letter-spacing: 0.08em;
        }
        .ticker-up { color: var(--green); }
        .ticker-down { color: var(--red); }

        /* SECTION */
        section {
          padding: 6rem 2rem;
        }
        .section-inner {
          max-width: 1100px; margin: 0 auto;
        }
        .section-label {
          font-family: var(--font-mono); font-size: 0.75rem;
          color: var(--gold); letter-spacing: 0.2em; text-transform: uppercase;
          margin-bottom: 0.75rem; display: block;
        }
        .section-title {
          font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1.1; margin-bottom: 1rem;
        }
        .section-sub {
          color: var(--text-dim);  max-width: 480px; margin-bottom: 3rem;
        }

        /* CALCULATOR */
        #calculator { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .calc-layout {
          display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;
          align-items: start;
        }
        @media (max-width: 768px) { .calc-layout { grid-template-columns: 1fr; } .hero-ticker { display: none; } }

        /* Strategy toggle */
        .strategy-toggle {
          display: flex; background: var(--bg);
          border: 1px solid var(--border); border-radius: 6px;
          padding: 4px; margin-bottom: 2rem; width: fit-content;
        }
        .strategy-btn {
          padding: 0.5rem 1.5rem; border-radius: 4px; border: none; cursor: pointer;
          font-family: var(--font-body); font-size: 0.8rem; font-weight: 400;
          letter-spacing: 0.05em; text-transform: uppercase;
          background: transparent; color: var(--text-muted);
          transition: all 0.2s;
        }
        .strategy-btn.active {
          background: var(--gold-dim); color: var(--gold);
          border: 1px solid rgba(201,168,76,0.25);
        }

        /* Inputs */
        .input-group { margin-bottom: 1.6rem; }
        .input-field-row { display: flex; align-items: center; gap: 1rem; }
        .input-field-label { flex: 0 0 50%; display: flex; flex-direction: column; gap: 0.15rem; }
        .input-field-row .number-field-wrap { flex: 1; min-width: 0; margin-top: 0; }
        .input-label {
          display: block; font-size: 1rem; font-weight: 400; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--text-dim);
        }
        .input-sublabel { font-size: 0.875rem; color: var(--text-muted); display: block; }
        .number-field-wrap {
          display: flex; align-items: stretch;
          background: var(--bg); border: 1px solid var(--border-strong);
          border-radius: 4px; overflow: hidden;
          transition: border-color 0.2s;
        }
        .number-field-wrap:focus-within { border-color: rgba(201,168,76,0.4); }
        .num-input {
          flex: 1; min-width: 0; background: transparent; border: none; outline: none;
          color: var(--text); font-family: var(--font-mono); font-size: 0.95rem;
          padding: 0.6rem 0.75rem;
          -moz-appearance: textfield;
        }
        .num-input::-webkit-outer-spin-button,
        .num-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .input-affix {
          font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);
          padding: 0 0.6rem; background: var(--surface-2);
          border-right: 1px solid var(--border);
          display: flex; align-items: center; white-space: nowrap;
        }
        .input-affix-suffix { border-right: none; border-left: 1px solid var(--border); }
        .stepper-btn {
          background: var(--surface-2); border: none; cursor: pointer;
          color: var(--text-dim); font-size: 1.1rem; font-weight: 300;
          padding: 0 0.9rem; transition: all 0.15s;
          display: flex; align-items: center; line-height: 1;
        }
        .stepper-btn:first-child { border-right: 1px solid var(--border); }
        .stepper-plus { border-left: 1px solid var(--border); }
        .stepper-btn:hover { background: var(--gold-dim); color: var(--gold); }

        /* Results */
        .results-panel {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px; padding: 1.6rem;
          position: sticky; top: 6rem;
        }
        .results-header {
          font-family: var(--font-mono); font-size: 0.75rem;
          color: var(--text-muted); letter-spacing: 0.15em; text-transform: uppercase;
          padding-bottom: 1rem; /* margin-bottom: 1.5rem; */
          border-bottom: 1px solid var(--border);
        }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); border-radius: 4px; overflow: hidden; margin-bottom: 1px; }
        .stat-card {
          background: var(--surface); padding: 1rem 1rem;
          display: flex; flex-direction: column; gap: 0.35rem;
        }
        .stat-card.accent { background: var(--gold-dim); }
        .stat-card.large { grid-column: span 2; }
        .stat-label {
          font-family: var(--font-mono); font-size: 0.75rem;
          color: var(--text-muted); letter-spacing: 0.12em; text-transform: uppercase;
        }
        .stat-value {
          font-family: var(--font-mono); font-size: 1.05rem;
          color: var(--text); font-weight: 500;
        }
        .stat-card.accent .stat-value { color: var(--gold); font-size: 1.5rem; }
        .stat-card.large .stat-value { font-size: 1.3rem; }

        .roi-big {
          text-align: center; padding: 1.2rem 0;
          border-bottom: 1px solid var(--border); margin-bottom: 1.5rem;
        }
        .roi-num {
          font-family: var(--font-display); font-size: 3.5rem;
          color: var(--gold); line-height: 1; display: block;
        }
        .roi-label {
          font-family: var(--font-mono); font-size: 0.75rem;
          color: var(--text-muted); letter-spacing: 0.2em; text-transform: uppercase;
          margin-top: 0.35rem; display: block;
        }

        .divider { height: 1px; background: var(--border); margin: 1.5rem 0 1rem; }

        /* FEATURES */
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
          background: var(--border); border-radius: 8px; overflow: hidden;
          margin-top: 3rem;
        }
        @media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } }
        .feature-card {
          background: var(--surface); padding: 1.6rem;
          transition: background 0.2s;
        }
        .feature-card:hover { background: var(--surface-2); }
        .feature-icon {
          font-size: 1.5rem; margin-bottom: 1rem; display: block;
        }
        .feature-title {
          font-family: var(--font-display); font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .feature-body { color: var(--text-dim); line-height: 1.7; }

        /* FOOTER */
        footer {
          border-top: 1px solid var(--border); padding: 2rem;
          text-align: center;
        }
        .footer-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-logo { font-family: var(--font-display); font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; }
        .footer-copy { font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); }
        @media (max-width: 768px) {
          .footer-inner { flex-direction: column; gap: 0.75rem; text-align: center; }
        }

        /* Mobile overrides */
        @media (max-width: 768px) {
          .hero-inner { text-align: center; }
          .hero-eyebrow { margin-left: auto; margin-right: auto; }
          .hero-sub { margin-left: auto; margin-right: auto; }
          .hero-actions { flex-direction: column; align-items: center; }

          #calculator .section-label,
          #calculator .section-title,
          #calculator .section-sub { text-align: center; }
          #calculator .section-sub { margin-left: auto; margin-right: auto; }
          .strategy-toggle { margin-left: auto; margin-right: auto; }

          #features .section-label,
          #features .section-title { text-align: center; }
        }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.7s 0.15s ease forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease forwards; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.7s 0.45s ease forwards; opacity: 0; }
      `}</style>

      <Nav />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="fade-up">
            <div className="hero-eyebrow">
              <span>◈</span> Premium Income Tracker
            </div>
          </div>
          <h1 className="hero-title fade-up-2">
            Track every<br /><em>premium</em> you earn.
          </h1>
          <p className="hero-sub fade-up-3">
            Purpose-built for covered call and cash-secured put sellers. Log trades, measure ROI, and optimize your income strategy.
          </p>
          <div className="hero-actions fade-up-4">
            <a href="#calculator" className="btn-primary">Try the Calculator</a>
            <a href="https://tally.so/r/EkxMRX" target="_blank" className="btn-ghost">Sign up free →</a>
          </div>

          <div className="hero-ticker">
            {[
              { sym: "SPY", strike: "445P", exp: "Mar 21", prem: "+$2.80", dir: "up" },
              { sym: "AAPL", strike: "170C", exp: "Mar 28", prem: "+$1.45", dir: "up" },
              { sym: "NVDA", strike: "780P", exp: "Apr 4", prem: "+$6.20", dir: "up" },
              { sym: "QQQ", strike: "370P", exp: "Mar 21", prem: "+$3.10", dir: "up" },
            ].map((t) => (
              <div key={t.sym} className="ticker-item">
                <div>{t.sym} {t.strike} · {t.exp}</div>
                <div className={`ticker-${t.dir}`}>{t.prem}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calculator">
        <div className="section-inner">
          <span className="section-label">// roi calculator</span>
          <h2 className="section-title">See your returns<br />before you trade.</h2>
          <p className="section-sub">Dial in premium, strike, and duration to instantly see your net ROI and annualized return.</p>

          <div className="calc-layout">
            {/* Inputs */}
            <div>
              <div className="strategy-toggle">
                <button className={`strategy-btn ${strategy === "csp" ? "active" : ""}`} onClick={() => setStrategy("csp")}>
                  Sell Put
                </button>
                <button className={`strategy-btn ${strategy === "cc" ? "active" : ""}`} onClick={() => setStrategy("cc")}>
                  Sell Call
                </button>
              </div>

              <NumberField
                label="Premium Received"
                value={premium}
                onChange={setPremium}
                min={0.01} max={10} step={0.01}
                prefix="$"
                sublabel="Per-share premium collected at open"
                allowEmpty
              />
              <NumberField
                label="Strike Price"
                value={strike}
                onChange={setStrike}
                min={1} max={1000} step={0.5}
                prefix="$"
                sublabel={strategy === "csp" ? "You're obligated to buy at this price" : "You're obligated to sell at this price"}
                allowEmpty
              />
              <NumberField
                label="Contracts"
                value={contracts}
                onChange={setContracts}
                min={1} max={50} step={1}
                stepper
              />
              <NumberField
                label="Days Held"
                value={daysHeld}
                onChange={setDaysHeld}
                min={1} max={180} step={1}
                suffix="days"
                sublabel="Used to calculate annualized ROI"
                allowEmpty
              />
              <NumberField
                label="Closing Premium (optional)"
                value={closingPremium}
                onChange={setClosingPremium}
                min={0} max={10} step={0.01}
                prefix="$"
                sublabel="Cost to buy back the contract early"
                allowEmpty
              />
            </div>

            {/* Results */}
            <div>
              <div className="results-panel">
                <div className="results-header">Live Results · {strategy === "csp" ? "Cash-Secured Put" : "Covered Call"}</div>

                <div className="roi-big">
                  <span className="roi-num">
                    <AnimatedNumber value={roi} suffix="%" />
                  </span>
                  <span className="roi-label">Net ROI</span>
                </div>

                <div className="stat-grid">
                  <div className="stat-card accent large">
                    <span className="stat-label">30-Day ROI</span>
                    <span className="stat-value">
                      <AnimatedNumber value={thirtyDayRoi} suffix="%" />
                    </span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Net Premium</span>
                    <span className="stat-value">
                      <AnimatedNumber value={netPremium} prefix="$" />
                    </span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Gross Premium</span>
                    <span className="stat-value">
                      <AnimatedNumber value={grossPremium} prefix="$" />
                    </span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Collateral Required</span>
                    <span className="stat-value">
                      <AnimatedNumber value={collateral} prefix="$" decimals={0} />
                    </span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Breakeven Price</span>
                    <span className="stat-value">
                      <AnimatedNumber value={breakeven} prefix="$" />
                    </span>
                  </div>
                </div>

                <div className="divider" />
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
                  ROI = Net Premium ÷ (Strike × 100 × Contracts)<br />
                  30-Day ROI = ROI ÷ Days × 30
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="section-inner">
          <span className="section-label">// what you get</span>
          <h2 className="section-title">Everything a premium<br />seller needs.</h2>

          <div className="features-grid">
            {[
              { icon: "◈", title: "Trade Journal", body: "Log every CSP and covered call. Track open date, expiry, strike, premium, and outcome in one clean interface." },
              { icon: "⟁", title: "ROI Analytics", body: "See total premium collected, win rate, average ROI, and annualized returns — per trade, per ticker, or overall." },
              { icon: "⊕", title: "Close & Assign", body: "Mark trades as closed early, expired worthless, or assigned. Closing premium is factored into your net ROI automatically." },
              { icon: "◎", title: "Income Calendar", body: "Visualize monthly premium income over time. See which months and strategies earned the most." },
              { icon: "⊘", title: "Multi-Account", body: "Track trades across multiple brokerage accounts. Perfect for keeping taxable and retirement accounts separate." },
              { icon: "⋈", title: "Secure & Private", body: "Your trade data is encrypted and private. No third-party data sharing, ever. Export anytime." },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon" style={{ color: "var(--gold)" }}>{f.icon}</span>
                <div className="feature-title">{f.title}</div>
                <p className="feature-body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
        <div className="section-inner" style={{ textAlign: "center" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <span className="section-label" style={{ justifyContent: "center", display: "block" }}>// start tracking</span>
            <h2 className="section-title">Ready to trade with<br /><em style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontStyle: "italic" }}>intention</em>?</h2>
            <p style={{ color: "var(--text-dim)", marginBottom: "2rem" }}>Join income investors who track every premium with precision.</p>
            <a href="https://tally.so/r/EkxMRX" target="_blank" className="btn-primary" style={{ fontSize: "0.9rem", padding: "0.9rem 2.5rem" }}>Create Free Account →</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="footer-logo">
            <span style={{ color: "var(--gold)" }}>◈</span> Premia
          </div>
          <div className="footer-copy">© 2026 Premia · Built for premium sellers</div>
        </div>
      </footer>
    </>
  );
}
