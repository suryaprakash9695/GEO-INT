import React, { useState } from "react";
import { CONFIG } from "../config";

export default function DebugPanel({ onClose }) {
  const [result, setResult] = useState("");
  const [testing, setTesting] = useState(false);

  const testGroq = async () => {
    setTesting(true);
    setResult("Testing...");

    const key = CONFIG.GROQ_API_KEY;
    if (!key || key === "YOUR_GROQ_API_KEY" || key.trim() === "") {
      setResult("❌ KEY NOT LOADED\n\nThe .env file key is not reaching the app.\n\nKey value: '" + key + "'\n\nFix: Make sure .env has no spaces around = and restart npm run dev");
      setTesting(false);
      return;
    }

    setResult(`✅ Key loaded: ${key.slice(0, 8)}...${key.slice(-4)}\n\nTesting API connection...`);

    // Try proxy first
    try {
      const res = await fetch("/api/groq/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 30,
          messages: [{ role: "user", content: "Say: GEOINT OK" }],
        }),
      });
      const txt = await res.text();
      if (res.ok) {
        const json = JSON.parse(txt);
        setResult(`✅ KEY LOADED: ${key.slice(0,8)}...\n✅ PROXY WORKING\n✅ GROQ RESPONDING\n\nResponse: "${json.choices?.[0]?.message?.content}"\n\n🎉 Everything is working! Close this and try chatting.`);
      } else {
        setResult(`✅ Key loaded: ${key.slice(0,8)}...\n✅ Proxy reached\n❌ Groq error ${res.status}:\n${txt}\n\nIf 401: Wrong API key\nIf 429: Rate limited, wait 1 min`);
      }
    } catch (err) {
      // Try direct (no proxy)
      setResult(`✅ Key: ${key.slice(0,8)}...\n❌ Proxy failed: ${err.message}\n\nTrying direct connection...`);
      try {
        const res2 = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            max_tokens: 30,
            messages: [{ role: "user", content: "Say: OK" }],
          }),
        });
        const txt2 = await res2.text();
        if (res2.ok) {
          setResult(`✅ Key: ${key.slice(0,8)}...\n⚠️ Proxy failed but direct works\n✅ Groq API is fine\n\nFix: Restart npm run dev (proxy needs restart)`);
        } else {
          setResult(`✅ Key: ${key.slice(0,8)}...\n❌ Both proxy and direct failed\nStatus: ${res2.status}\n${txt2}`);
        }
      } catch (err2) {
        setResult(`✅ Key: ${key.slice(0,8)}...\n❌ All connections failed\nError: ${err2.message}\n\nCheck your internet connection.`);
      }
    }
    setTesting(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999,
    }}>
      <div style={{
        background: "#0a0e1c", border: "1px solid #00f5c4",
        borderRadius: 10, padding: 24, width: 480, maxWidth: "90vw",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ color: "#00f5c4", fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>
            🔧 API DEBUG PANEL
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: 18, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ marginBottom: 12, padding: "8px 12px", background: "#070a14", borderRadius: 6, fontFamily: "monospace", fontSize: 11, color: "#888" }}>
          <div>Key in .env: <span style={{ color: CONFIG.GROQ_API_KEY && CONFIG.GROQ_API_KEY !== "YOUR_GROQ_API_KEY" ? "#00f5c4" : "#ff3b3b" }}>
            {CONFIG.GROQ_API_KEY ? CONFIG.GROQ_API_KEY.slice(0, 12) + "..." : "NOT FOUND"}
          </span></div>
          <div style={{ marginTop: 4 }}>Model: <span style={{ color: "#7b68ee" }}>llama-3.3-70b-versatile</span></div>
        </div>

        <button onClick={testGroq} disabled={testing} style={{
          width: "100%", padding: "10px 0", marginBottom: 12,
          background: testing ? "#333" : "#00f5c4", border: "none", borderRadius: 6,
          color: "#000", fontWeight: 700, fontSize: 13, cursor: testing ? "not-allowed" : "pointer",
          fontFamily: "monospace",
        }}>
          {testing ? "TESTING..." : "▶ RUN CONNECTION TEST"}
        </button>

        {result && (
          <pre style={{
            background: "#070a14", border: "1px solid #1a2035",
            borderRadius: 6, padding: 12, fontFamily: "monospace",
            fontSize: 11, color: "#ccc", whiteSpace: "pre-wrap",
            maxHeight: 200, overflowY: "auto",
          }}>{result}</pre>
        )}

        <div style={{ marginTop: 14, padding: "10px 12px", background: "#070a14", borderRadius: 6 }}>
          <div style={{ color: "#555", fontFamily: "monospace", fontSize: 10, marginBottom: 6 }}>MANUAL FIX STEPS:</div>
          {[
            "1. Open the .env file in project root",
            "2. Make sure it looks exactly like:",
            "   VITE_GROQ_API_KEY=gsk_xxxx (no quotes, no spaces)",
            "3. Press Ctrl+C in terminal to stop server",
            "4. Run: npm run dev",
            "5. Click 'Run Connection Test' above",
          ].map((s, i) => (
            <div key={i} style={{ color: i === 1 ? "#888" : "#555", fontFamily: "monospace", fontSize: 10, marginBottom: 2 }}>{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
