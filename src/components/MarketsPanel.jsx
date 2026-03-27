import React, { useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatChange } from "../utils/helpers";

function generateHistory(basePrice, points = 20, volatility = 0.015) {
  const data = [];
  let price = basePrice * (1 - 0.05);
  for (let i = 0; i < points; i++) {
    price = price * (1 + (Math.random() - 0.5) * volatility * 2);
    data.push({ t: i, price: +price.toFixed(2) });
  }
  // End close to current
  data.push({ t: points, price: basePrice });
  return data;
}

function MiniChart({ data, color, positive }) {
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone" dataKey="price"
          stroke={color} strokeWidth={1.5}
          fill={`url(#grad-${color.replace("#", "")})`}
          dot={false} isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const ASSETS_CONFIG = [
  { key: "btc", label: "BITCOIN", sym: "BTC", color: "#f7931a", decimals: 0 },
  { key: "eth", label: "ETHEREUM", sym: "ETH", color: "#627eea", decimals: 0 },
  { key: "sol", label: "SOLANA", sym: "SOL", color: "#9945ff", decimals: 2 },
  { key: "gold", label: "GOLD", sym: "XAU", color: "#ffd700", decimals: 2, unit: "/oz" },
  { key: "oil", label: "CRUDE OIL", sym: "WTI", color: "#ff8c00", decimals: 2, unit: "/bbl" },
  { key: "sp500", label: "S&P 500", sym: "SPX", color: "#00f5c4", decimals: 0 },
];

export default function MarketsPanel({ finData }) {
  const [histories, setHistories] = useState({});

  // Generate spark histories on mount or when data changes
  useEffect(() => {
    if (!finData) return;
    const h = {};
    ASSETS_CONFIG.forEach(a => {
      const d = finData[a.key];
      const price = typeof d === "object" ? d?.price : d;
      if (price) h[a.key] = generateHistory(price);
    });
    setHistories(h);
  }, [finData?.btc?.price]); // only regenerate on btc change (debounce)

  if (!finData) return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <div className="spinner" style={{ margin: "0 auto 8px" }} />
      <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Loading market data...</div>
    </div>
  );

  return (
    <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 2 }}>
        LIVE MARKETS · AUTO-REFRESH 30s
      </div>

      {ASSETS_CONFIG.map(a => {
        const raw = finData[a.key];
        const price = typeof raw === "object" ? raw?.price : raw;
        const change = typeof raw === "object" ? raw?.change : null;
        const chg = formatChange(change);
        const hist = histories[a.key];

        return (
          <div key={a.key} style={{
            background: "var(--bg-card2)",
            border: "1px solid var(--border)",
            borderRadius: 8, padding: "10px 12px",
            transition: "border-color 0.3s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = a.color + "44"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div>
                <span className="mono" style={{ fontSize: 10, color: a.color, fontWeight: 700, letterSpacing: 1 }}>{a.sym}</span>
                <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)", marginLeft: 6 }}>{a.label}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                  ${price?.toLocaleString(undefined, { minimumFractionDigits: a.decimals, maximumFractionDigits: a.decimals })}
                  {a.unit && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{a.unit}</span>}
                </div>
                {change !== null && (
                  <div className="mono" style={{ fontSize: 11, color: chg.color }}>{chg.text}</div>
                )}
              </div>
            </div>
            {hist && <MiniChart data={hist} color={a.color} />}
          </div>
        );
      })}

      {/* FX rates */}
      <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 2, marginTop: 4 }}>
        FX RATES · USD BASE
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          { label: "EUR/USD", key: "eur", color: "#4da6ff" },
          { label: "GBP/USD", key: "gbp", color: "#9966cc" },
          { label: "USD/JPY", key: "jpy", color: "#ff6688" },
          { label: "USD/INR", key: "inr", color: "#ffaa44" },
          { label: "USD/CNY", key: "cny", color: "#ff4444" },
        ].map(fx => (
          <div key={fx.key} style={{
            background: "var(--bg-card2)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "7px 10px",
          }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1 }}>{fx.label}</div>
            <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: fx.color, marginTop: 2 }}>
              {Number(finData[fx.key]).toFixed(fx.key === "jpy" || fx.key === "inr" ? 2 : 4)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
