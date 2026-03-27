/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useEffect } from "react";
import "./index.css";

import TopBar from "./components/TopBar";
import WorldMap from "./components/WorldMap";
import ChatPanel from "./components/ChatPanel";
import CountryPanel from "./components/CountryPanel";
import MarketsPanel from "./components/MarketsPanel";
import DebugPanel from "./components/DebugPanel";

import { useFinancialData, useWorldMap, useCountryData, useGroqChat } from "./hooks/useLiveData";
import { CONFLICT_BASELINE, COUNTRY_PROFILES, CONFIG } from "./config";

const SIDEBAR_TABS = [
  { id: "chat", label: "AI INTEL" },
  { id: "country", label: "COUNTRY" },
  { id: "markets", label: "MARKETS" },
];

export default function App() {
  const { data: finData, prev: prevFin, loading: finLoading, lastUpdate, refetch } = useFinancialData();
  const { topology, loading: mapLoading } = useWorldMap();
  const { messages, loading: chatLoading, send, clear } = useGroqChat();

  const [selectedISO, setSelectedISO] = useState(null);
  const [conflictData, setConflictData] = useState({});
  const [sidebarTab, setSidebarTab] = useState("chat");
  const [rightTab, setRightTab] = useState("country");
  const [showDebug, setShowDebug] = useState(false);

  // Auto-show debug if key looks missing
  const keyOk = CONFIG.GROQ_API_KEY && CONFIG.GROQ_API_KEY !== "YOUR_GROQ_API_KEY" && CONFIG.GROQ_API_KEY.length > 10;

  const { country: liveCountryData } = useCountryData(selectedISO);

  const handleCountryClick = useCallback((iso2) => {
    setSelectedISO(iso2);
    setSidebarTab("country");
    setRightTab("country");
  }, []);

  return (
    <div style={{
      display: "grid",
      gridTemplateRows: "48px 1fr",
      height: "100vh", width: "100vw", overflow: "hidden",
      background: "var(--bg-deep)",
    }}>
      {/* TOP BAR */}
      <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
        <TopBar finData={finData} prevData={prevFin} lastUpdate={lastUpdate} refetch={refetch} />
        {/* Debug button always visible */}
        {/* <button
          onClick={() => setShowDebug(true)}
          style={{
            position: "absolute", right: 100, top: "50%", transform: "translateY(-50%)",
            background: keyOk ? "transparent" : "rgba(255,59,59,0.15)",
            border: `1px solid ${keyOk ? "#1a2035" : "#ff3b3b"}`,
            borderRadius: 4, padding: "3px 10px",
            color: keyOk ? "#333" : "#ff3b3b",
            fontSize: 10, fontFamily: "monospace", cursor: "pointer",
            letterSpacing: 1, zIndex: 20,
          }}
        >
          {keyOk ? "🔧 DEBUG" : "⚠️ FIX API KEY"}
        </button> */}
      </div>

      {/* MAIN */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr 280px",
        overflow: "hidden", height: "100%",
      }}>
        {/* LEFT SIDEBAR */}
        <div style={{
          background: "var(--bg-card)", borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            {SIDEBAR_TABS.map(t => (
              <button key={t.id} onClick={() => setSidebarTab(t.id)} style={{
                flex: 1, padding: "9px 0",
                fontSize: 9, fontWeight: 700, letterSpacing: 1,
                background: "transparent", border: "none",
                color: sidebarTab === t.id ? "var(--accent)" : "var(--text-muted)",
                borderBottom: sidebarTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1, transition: "all 0.2s", fontFamily: "var(--font-mono)",
              }}>{t.label}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            {sidebarTab === "chat" && (
              <ChatPanel
                messages={messages} loading={chatLoading}
                onSend={send} onClear={clear}
                finData={finData}
                selectedCountry={selectedISO ? COUNTRY_PROFILES[selectedISO] : null}
              />
            )}
            {sidebarTab === "country" && (
              <div style={{ height: "100%", overflow: "hidden" }}>
                <CountryPanel
                  isoCode={selectedISO} countryData={liveCountryData}
                  conflictLevel={conflictData[selectedISO] || CONFLICT_BASELINE[selectedISO]}
                  finData={finData}
                  onChatAbout={(name) => {
                    setSidebarTab("chat");
                    const ctx = finData ? `BTC $${finData.btc?.price?.toLocaleString()}, Oil $${finData.oil?.price}/bbl.` : "";
                    send(`Geopolitical analysis: ${name}`, ctx);
                  }}
                />
              </div>
            )}
            {sidebarTab === "markets" && (
              <div style={{ height: "100%", overflowY: "auto" }}>
                <MarketsPanel finData={finData} />
              </div>
            )}
          </div>
        </div>

        {/* CENTER MAP */}
        <div style={{ position: "relative", overflow: "hidden", background: "var(--bg-deep)" }}>
          {mapLoading && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "var(--bg-deep)", zIndex: 10,
            }}>
              <div className="spinner" style={{ width: 28, height: 28, marginBottom: 12 }} />
              <div className="mono" style={{ color: "var(--text-muted)", fontSize: 12, letterSpacing: 2 }}>
                LOADING WORLD ATLAS...
              </div>
            </div>
          )}
          {topology && (
            <WorldMap
              topology={topology}
              conflictData={{ ...CONFLICT_BASELINE, ...conflictData }}
              selectedISO={selectedISO}
              onCountryClick={handleCountryClick}
            />
          )}
          {/* Ticker */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: 26, background: "rgba(7,10,20,0.95)",
            borderTop: "1px solid var(--border)",
            overflow: "hidden", display: "flex", alignItems: "center",
          }}>
            <div style={{
              display: "flex", gap: 32, whiteSpace: "nowrap",
              animation: "ticker 50s linear infinite",
            }}>
              {finData && [
                `BTC $${finData.btc?.price?.toLocaleString()}`,
                `ETH $${finData.eth?.price?.toLocaleString()}`,
                `GOLD $${finData.gold?.price}/oz`,
                `OIL $${finData.oil?.price}/bbl`,
                `S&P ${finData.sp500?.price?.toLocaleString()}`,
                `EUR/USD ${finData.eur}`,
                `USD/JPY ${finData.jpy}`,
                `CONFLICT ZONES: ${Object.values(CONFLICT_BASELINE).filter(v=>v==="conflict").length} ACTIVE`,
                `GEOINT AI INTELLIGENCE DASHBOARD · LIVE DATA`,
                `BTC $${finData.btc?.price?.toLocaleString()}`,
                `ETH $${finData.eth?.price?.toLocaleString()}`,
                `GOLD $${finData.gold?.price}/oz`,
              ].map((item, i) => (
                <span key={i} className="mono" style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: 1 }}>
                  ◈ {item}
                </span>
              ))}
            </div>
          </div>
          <style>{`@keyframes ticker { from { transform: translateX(100%); } to { transform: translateX(-200%); } }`}</style>
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          background: "var(--bg-card)", borderLeft: "1px solid var(--border)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            {[{ id: "country", label: "INTEL" }, { id: "markets", label: "MARKETS" }].map(t => (
              <button key={t.id} onClick={() => setRightTab(t.id)} style={{
                flex: 1, padding: "9px 0",
                fontSize: 9, fontWeight: 700, letterSpacing: 1,
                background: "transparent", border: "none",
                color: rightTab === t.id ? "var(--accent)" : "var(--text-muted)",
                borderBottom: rightTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1, transition: "all 0.2s", fontFamily: "var(--font-mono)",
              }}>{t.label}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            {rightTab === "country" && (
              <CountryPanel
                isoCode={selectedISO} countryData={liveCountryData}
                conflictLevel={conflictData[selectedISO] || CONFLICT_BASELINE[selectedISO]}
                finData={finData}
                onChatAbout={(name) => {
                  setSidebarTab("chat");
                  const ctx = finData ? `Markets: BTC $${finData.btc?.price?.toLocaleString()}, Oil $${finData.oil?.price}/bbl.` : "";
                  send(`Tell me about the geopolitical situation in ${name}`, ctx);
                }}
              />
            )}
            {rightTab === "markets" && (
              <div style={{ height: "100%", overflowY: "auto" }}>
                <MarketsPanel finData={finData} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Debug overlay */}
      {showDebug && <DebugPanel onClose={() => setShowDebug(false)} />}
    </div>
  );
}
