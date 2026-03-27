import React, { useRef, useEffect, useState } from "react";
import { parseMarkdown } from "../utils/helpers";
import { QUICK_PROMPTS } from "../config";

export default function ChatPanel({ messages, loading, onSend, onClear, finData, selectedCountry }) {
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submit = () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");

    let context = "";
    if (finData) {
      context = `Live market data: BTC $${finData.btc?.price?.toLocaleString()}, ETH $${finData.eth?.price?.toLocaleString()}, Gold $${finData.gold?.price}/oz, Oil $${finData.oil?.price}/bbl, S&P500 ${finData.sp500?.price?.toLocaleString()}.`;
    }
    if (selectedCountry) {
      context += ` Currently analyzing: ${selectedCountry.name || selectedCountry}.`;
    }
    onSend(msg, context);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 14px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: loading ? "#ff8c00" : "var(--accent)",
            boxShadow: `0 0 8px ${loading ? "#ff8c00" : "var(--accent)"}`,
            transition: "all 0.3s",
          }} className={loading ? "blink" : ""} />
          <span className="display" style={{ fontSize: 11, letterSpacing: 1, color: "var(--accent)" }}>
            GEOINT AI
          </span>
          <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1 }}>
            {loading ? "ANALYZING..." : "ONLINE · GROQ LLM"}
          </span>
        </div>
        <button onClick={onClear} style={{
          background: "transparent", border: "none",
          color: "var(--text-dim)", fontSize: 11,
          fontFamily: "var(--font-mono)", letterSpacing: 1,
          transition: "color 0.2s",
        }}
          onMouseEnter={e => e.target.style.color = "var(--red)"}
          onMouseLeave={e => e.target.style.color = "var(--text-dim)"}
        >
          CLEAR
        </button>
      </div>

      {/* Quick prompts */}
      <div style={{
        padding: "8px 10px",
        borderBottom: "1px solid var(--border)",
        display: "flex", flexWrap: "wrap", gap: 5,
        flexShrink: 0,
      }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p.label} onClick={() => {
            if (loading) return;
            setInput(p.q);
            setTimeout(() => {
              let ctx = "";
              if (finData) ctx = `Live data: BTC $${finData.btc?.price?.toLocaleString()}, Gold $${finData.gold?.price}/oz, Oil $${finData.oil?.price}/bbl.`;
              onSend(p.q, ctx);
              setInput("");
            }, 50);
          }} style={{
            background: "var(--bg-card2)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "3px 9px",
            fontSize: 11,
            color: "var(--text-muted)",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text-muted)"; }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} className="animate-up" style={{
            display: "flex",
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            gap: 8, alignItems: "flex-start",
          }}>
            {/* Avatar */}
            <div style={{
              width: 26, height: 26, borderRadius: 4, flexShrink: 0,
              background: msg.role === "user" ? "var(--purple-dim)" : "var(--accent-dim)",
              border: `1px solid ${msg.role === "user" ? "var(--purple)" : "var(--accent)"}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: msg.role === "user" ? "var(--purple)" : "var(--accent)",
            }} className="mono">
              {msg.role === "user" ? "U" : "AI"}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: "88%",
              padding: "9px 12px",
              borderRadius: msg.role === "user" ? "8px 2px 8px 8px" : "2px 8px 8px 8px",
              background: msg.role === "user" ? "var(--purple-dim)" : "var(--bg-card2)",
              border: `1px solid ${msg.role === "user" ? "rgba(123,104,238,0.2)" : "var(--border)"}`,
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--text)",
            }}>
              <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{
              width: 26, height: 26, borderRadius: 4, flexShrink: 0,
              background: "var(--accent-dim)", border: "1px solid rgba(0,245,196,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: "var(--accent)",
            }} className="mono">AI</div>
            <div style={{
              padding: "10px 14px",
              background: "var(--bg-card2)",
              border: "1px solid var(--border)",
              borderRadius: "2px 8px 8px 8px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div className="spinner" />
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                Analyzing intelligence...
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 12px",
        borderTop: "1px solid var(--border)",
        display: "flex", gap: 8, flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && submit()}
          placeholder="Ask about any country, conflict, or market..."
          disabled={loading}
          style={{
            flex: 1,
            background: "var(--bg-card2)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "8px 12px",
            color: "var(--text)",
            fontSize: 13,
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "var(--accent)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        <button onClick={submit} disabled={loading || !input.trim()} style={{
          background: input.trim() && !loading ? "var(--accent)" : "var(--bg-card2)",
          border: `1px solid ${input.trim() && !loading ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 6,
          padding: "8px 14px",
          color: input.trim() && !loading ? "#000" : "var(--text-muted)",
          fontWeight: 700, fontSize: 12, letterSpacing: 1,
          transition: "all 0.2s",
          fontFamily: "var(--font-mono)",
          flexShrink: 0,
        }}>
          {loading ? <span className="spinner" /> : "SEND"}
        </button>
      </div>
    </div>
  );
}
