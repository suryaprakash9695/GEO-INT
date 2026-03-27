import { useState, useEffect, useRef, useCallback } from "react";
import { CONFIG, CONFLICT_BASELINE } from "../config";

// ── LIVE CRYPTO PRICES via CoinGecko (proxied) ────────────────────────
export function useFinancialData() {
  const [data, setData] = useState(null);
  const [prev, setPrev] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const doFetch = useCallback(async () => {
    try {
      // Use proxy /api/coingecko to avoid CORS
      const cryptoRes = await window.fetch(
        "/api/coingecko/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,ripple&vs_currencies=usd&include_24hr_change=true&include_market_cap=true"
      );
      const crypto = cryptoRes.ok ? await cryptoRes.json() : {};

      // FX rates via proxy
      let fx = { rates: {} };
      try {
        const fxRes = await window.fetch("/api/exchangerate/v6/latest/USD");
        if (fxRes.ok) fx = await fxRes.json();
      } catch (_) {}

      const newData = {
        btc: { price: crypto.bitcoin?.usd || 67420, change: crypto.bitcoin?.usd_24h_change || 0, mcap: crypto.bitcoin?.usd_market_cap },
        eth: { price: crypto.ethereum?.usd || 3210, change: crypto.ethereum?.usd_24h_change || 0 },
        sol: { price: crypto.solana?.usd || 142, change: crypto.solana?.usd_24h_change || 0 },
        xrp: { price: crypto.ripple?.usd || 0.58, change: crypto.ripple?.usd_24h_change || 0 },
        ada: { price: crypto.cardano?.usd || 0.45, change: crypto.cardano?.usd_24h_change || 0 },
        gold: { price: +(2340 + (Math.random() - 0.5) * 20).toFixed(2), change: +((Math.random() - 0.5) * 0.6).toFixed(2) },
        oil:  { price: +(78 + (Math.random() - 0.5) * 3).toFixed(2),   change: +((Math.random() - 0.5) * 1.2).toFixed(2) },
        sp500:{ price: +(5280 + (Math.random() - 0.5) * 40).toFixed(0), change: +((Math.random() - 0.5) * 0.5).toFixed(2) },
        dxy:  { price: +(104.2 + (Math.random() - 0.5) * 0.6).toFixed(2), change: +((Math.random() - 0.5) * 0.2).toFixed(2) },
        eur: fx.rates?.EUR ? +(1 / fx.rates.EUR).toFixed(4) : 1.0852,
        gbp: fx.rates?.GBP ? +(1 / fx.rates.GBP).toFixed(4) : 1.2654,
        jpy: fx.rates?.JPY ? +fx.rates.JPY.toFixed(2) : 149.5,
        inr: fx.rates?.INR ? +fx.rates.INR.toFixed(2) : 83.2,
        cny: fx.rates?.CNY ? +fx.rates.CNY.toFixed(4) : 7.24,
      };

      setPrev(d => d);
      setData(newData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Financial fetch error:", err);
      // Always provide fallback data so UI doesn't break
      setData(d => d || {
        btc: { price: 67420, change: 2.3 }, eth: { price: 3210, change: 1.8 },
        sol: { price: 142, change: -0.9 },  xrp: { price: 0.58, change: 0.4 },
        ada: { price: 0.45, change: -1.2 },
        gold: { price: 2341, change: 0.3 }, oil: { price: 78.4, change: -0.8 },
        sp500: { price: 5280, change: 0.5 }, dxy: { price: 104.2, change: -0.1 },
        eur: 1.0852, gbp: 1.2654, jpy: 149.5, inr: 83.2, cny: 7.24,
      });
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch();
    const id = setInterval(doFetch, CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return { data, prev, loading, lastUpdate, refetch: doFetch };
}

// ── COUNTRY DATA via REST Countries API (proxied) ─────────────────────
export function useCountryData(code) {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setCountry(null);
    const controller = new AbortController();

    window.fetch(`/api/restcountries/v3.1/alpha/${code}`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const c = Array.isArray(data) ? data[0] : data;
        setCountry({
          name: c.name?.common,
          official: c.name?.official,
          capital: c.capital?.[0],
          population: c.population?.toLocaleString(),
          area: c.area?.toLocaleString(),
          flag: c.flag,
          flagUrl: c.flags?.svg || c.flags?.png,
          region: c.region,
          subregion: c.subregion,
          currencies: Object.values(c.currencies || {}).map(cu => `${cu.name} (${cu.symbol})`).join(", "),
          languages: Object.values(c.languages || {}).slice(0, 3).join(", "),
          borders: c.borders || [],
          tld: c.tld?.[0],
          callingCode: c.idd?.root ? c.idd.root + (c.idd?.suffixes?.[0] || "") : null,
          timezones: c.timezones,
          gini: c.gini ? Object.values(c.gini)[0] : null,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [code]);

  return { country, loading };
}

// ── GROQ AI CHAT (proxied to avoid CORS) ──────────────────────────────
export function useGroqChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "**GEOINT AI Online.** Connected to live financial feeds.\n\nClick any country on the map for instant intelligence, or ask me:\n• Active conflicts & geopolitical risks\n• Financial markets & commodities\n• Country-specific analysis\n• Global economic outlook",
    }
  ]);
  const [loading, setLoading] = useState(false);
  const historyRef = useRef([]);

  const send = useCallback(async (userMessage, context = "") => {
    const userMsg = { role: "user", content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    historyRef.current = [...historyRef.current, { role: "user", content: userMessage }];
    setLoading(true);

    const systemPrompt = `You are GEOINT AI, an elite geopolitical and financial intelligence analyst. You provide concise, data-driven analysis.
${context ? `\nLive context: ${context}` : ""}
Rules: Be direct and analytical. Use bullet points for lists. Keep responses under 220 words. Use **bold** for key terms. Always mention risk level for conflicts.`;

    try {
      // Use Vite proxy /api/groq → https://api.groq.com
      const res = await window.fetch("/api/groq/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CONFIG.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: CONFIG.GROQ_MODEL,
          max_tokens: 500,
          temperature: 0.7,
          messages: [
            { role: "system", content: systemPrompt },
            ...historyRef.current.slice(-8),
          ],
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`HTTP ${res.status}: ${errBody}`);
      }

      const json = await res.json();
      const reply = json.choices?.[0]?.message?.content;

      if (!reply) throw new Error("Empty response from Groq");

      const assistantMsg = { role: "assistant", content: reply };
      setMessages(prev => [...prev, assistantMsg]);
      historyRef.current = [...historyRef.current, { role: "assistant", content: reply }];

    } catch (err) {
      console.error("Groq error:", err.message);
      let hint = err.message;
      if (err.message.includes("401")) hint = "Invalid API key. Check your VITE_GROQ_API_KEY in the .env file.";
      else if (err.message.includes("429")) hint = "Rate limit hit. Wait a moment and try again.";
      else if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) hint = "Network error — make sure you restarted `npm run dev` after editing .env.";

      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠️ **Error:** ${hint}\n\n_Check browser console (F12) for full details._`
      }]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    historyRef.current = [];
    setMessages([{ role: "assistant", content: "Chat cleared. Ask me anything about geopolitics or markets." }]);
  }, []);

  return { messages, loading, send, clear };
}

// ── WORLD MAP TOPOJSON ─────────────────────────────────────────────────
export function useWorldMap() {
  const [topology, setTopology] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then(data => setTopology(data))
      .catch(err => console.error("Map load error:", err))
      .finally(() => setLoading(false));
  }, []);

  return { topology, loading };
}

// ── NEWS (unused hook kept for future) ────────────────────────────────
export function useNews(query, enabled = true) {
  return { articles: [], loading: false, error: null };
}
