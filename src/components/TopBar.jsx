import React, { useState, useEffect } from "react";
import { formatPrice, formatChange } from "../utils/helpers";

const ASSETS = [
  { key: "btc", label: "BTC", color: "#f7931a", prefix: "$" },
  { key: "eth", label: "ETH", color: "#627eea", prefix: "$" },
  { key: "sol", label: "SOL", color: "#9945ff", prefix: "$" },
  { key: "gold", label: "XAU", color: "#ffd700", prefix: "$" },
  { key: "oil", label: "WTI", color: "#ff8c00", prefix: "$" },
  { key: "sp500", label: "SPX", color: "#00f5c4", prefix: "" },
  { key: "dxy", label: "DXY", color: "#4da6ff", prefix: "" },
];

const FX_PAIRS = [
  { label: "EUR/USD", key: "eur" },
  { label: "GBP/USD", key: "gbp" },
  { label: "USD/JPY", key: "jpy" },
  { label: "USD/INR", key: "inr" },
];

export default function TopBar({ finData, prevData, lastUpdate, refetch }) {
  const [tick, setTick] = useState(0);
  const [nextRefresh, setNextRefresh] = useState(30);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!lastUpdate) return;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
      setNextRefresh(Math.max(0, 30 - elapsed));
    }, 1000);
    return () => clearInterval(id);
  }, [lastUpdate]);

  const now = new Date();
  const utcStr = now.toUTCString().slice(0, 25);

  return (
    <div style={{
      height: 48,
      background: "var(--bg-card)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: 0,
      overflow: "hidden",
      position: "relative",
      zIndex: 10,
    }}>
      {/* Brand */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "0 16px", borderRight: "1px solid var(--border)",
        flexShrink: 0, height: "100%",
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--accent)",
          boxShadow: "0 0 10px var(--accent)",
          animation: "blink 2s ease-in-out infinite",
        }} />
        <span className="display" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", letterSpacing: 2 }}>
          GEOINT
        </span>
      </div>

      {/* Asset tickers */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, overflow: "hidden", flex: 1 }}>
        {ASSETS.map(a => {
          const d = finData?.[a.key];
          const p = prevData?.[a.key];
          if (!d) return null;
          const price = typeof d === "object" ? d.price : d;
          const change = typeof d === "object" ? d.change : null;
          const prevPrice = typeof p === "object" ? p?.price : p;
          const chg = formatChange(change);
          const flash = prevPrice && price !== prevPrice;

          return (
            <div key={a.key} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 12px", borderRight: "1px solid var(--border)",
              height: "100%", flexShrink: 0,
              transition: "background 0.3s",
              background: flash ? "rgba(255,255,255,0.03)" : "transparent",
            }}>
              <span className="mono" style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 1 }}>{a.label}</span>
              <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: a.color }}>
                {a.prefix}{price?.toLocaleString(undefined, { maximumFractionDigits: a.key === "sol" || a.key === "eth" ? 1 : 0 })}
              </span>
              {change !== null && (
                <span className="mono" style={{ fontSize: 10, color: chg.color }}>{chg.text}</span>
              )}
            </div>
          );
        })}

        {/* FX rates */}
        {FX_PAIRS.map(fx => {
          const val = finData?.[fx.key];
          if (!val) return null;
          return (
            <div key={fx.key} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 12px", borderRight: "1px solid var(--border)",
              height: "100%", flexShrink: 0,
            }}>
              <span className="mono" style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 1 }}>{fx.label}</span>
              <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
                {Number(val).toFixed(fx.key === "jpy" || fx.key === "inr" ? 2 : 4)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Right side: time + refresh */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 14px", flexShrink: 0,
        borderLeft: "1px solid var(--border)", height: "100%",
      }}>
        <div style={{ textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1 }}>
            {utcStr} UTC
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)" }}>
            REFRESH IN {nextRefresh}s
          </div>
        </div>
        <button onClick={refetch} style={{
          background: "transparent", border: "1px solid var(--border)",
          borderRadius: 4, padding: "3px 8px", color: "var(--text-muted)",
          fontSize: 10, letterSpacing: 1, fontFamily: "var(--font-mono)",
          transition: "all 0.2s",
        }}
          onMouseEnter={e => e.target.style.borderColor = "var(--accent)"}
          onMouseLeave={e => e.target.style.borderColor = "var(--border)"}
        >
          ↺ SYNC
        </button>
      </div>
    </div>
  );
}
