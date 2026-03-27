import React, { useState, useEffect } from "react";
import { CONFIG, COUNTRY_PROFILES, CONFLICT_BASELINE } from "../config";
import { riskLabel, conflictColor } from "../utils/helpers";

export default function CountryPanel({ isoCode, countryData, conflictLevel, finData, onChatAbout }) {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiNews, setAiNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const profile = COUNTRY_PROFILES[isoCode];
  const level = conflictLevel || CONFLICT_BASELINE[isoCode] || "stable";

  // Reset on country change
  useEffect(() => {
    setAnalysis(null);
    setAiNews([]);
    setActiveTab("overview");
    if (isoCode) fetchAINews();
  }, [isoCode]);

  const fetchAINews = async () => {
    if (!isoCode) return;
    setNewsLoading(true);
    const name = profile?.name || countryData?.name || isoCode;
    try {
      const res = await fetch(import.meta.env.DEV ? "/api/groq/openai/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CONFIG.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: CONFIG.GROQ_MODEL,
          max_tokens: 400,
          messages: [{
            role: "user",
            content: `Give me 5 recent news headlines about ${name} (late 2024 / early 2025), focusing on geopolitics, economy, security, or conflict. 
Respond ONLY as valid JSON (no markdown, no extra text):
{"news":[{"title":"headline","source":"outlet","category":"politics|economy|security|conflict|diplomacy"},...]}`
          }]
        })
      });
      const json = await res.json();
      const text = json.choices?.[0]?.message?.content || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiNews(parsed.news || []);
    } catch {
      setAiNews([{ title: `Intelligence feed for ${name} loading...`, source: "GEOINT", category: "intelligence" }]);
    } finally {
      setNewsLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!isoCode || analyzing) return;
    setAnalyzing(true);
    const name = profile?.name || countryData?.name || isoCode;
    const ctx = `GDP: ${profile?.gdp || countryData?.gdp || "N/A"}, Pop: ${profile?.pop || countryData?.population || "N/A"}, Region: ${profile?.region || countryData?.region || "N/A"}. Current conflict level: ${level}. Markets: BTC $${finData?.btc?.price?.toLocaleString()}, Oil $${finData?.oil?.price}/bbl, Gold $${finData?.gold?.price}/oz.`;

    try {
      const res = await fetch(import.meta.env.DEV ? "/api/groq/openai/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CONFIG.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: CONFIG.GROQ_MODEL,
          max_tokens: 600,
          messages: [{
            role: "user",
            content: `Provide a structured geopolitical risk analysis for ${name}. Context: ${ctx}
Respond ONLY as valid JSON:
{"risk_score":45,"risk_level":"Medium","political_summary":"2 sentences about political situation","economic_outlook":"1 sentence","security_threat":"1 sentence","key_risks":["risk1","risk2","risk3"],"opportunities":["opp1","opp2"],"outlook":"Positive|Neutral|Negative","forecast_12m":"1 sentence about next 12 months"}`
          }]
        })
      });
      const json = await res.json();
      const text = json.choices?.[0]?.message?.content || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      setAnalysis(JSON.parse(clean));
    } catch {
      setAnalysis({ risk_score: 50, risk_level: "Medium", political_summary: "Analysis pending. Configure Groq API key.", economic_outlook: "Data loading.", security_threat: "Unknown.", key_risks: [], opportunities: [], outlook: "Neutral", forecast_12m: "Insufficient data." });
    } finally {
      setAnalyzing(false);
    }
  };

  if (!isoCode) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌍</div>
        <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.7 }}>
          Click any country on the<br />map to view intelligence data
        </div>
      </div>
    );
  }

  const name = profile?.name || countryData?.name || isoCode;
  const flag = profile?.flag || countryData?.flag || "🏳️";
  const levelColor = conflictColor(level, 1);
  const levelText = level === "conflict" ? "ACTIVE CONFLICT" : level === "medium" ? "ELEVATED RISK" : "STABLE";
  const risk = analysis ? riskLabel(analysis.risk_score) : null;

  const catColor = {
    conflict: "#ff3b3b", security: "#ff8c00", politics: "#7b68ee",
    economy: "#00f5c4", diplomacy: "#4da6ff", intelligence: "var(--text-muted)"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Country header */}
      <div style={{
        padding: "12px 14px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-card2)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          {countryData?.flagUrl ? (
            <img src={countryData.flagUrl} alt={name} style={{ width: 36, height: 24, objectFit: "cover", borderRadius: 2, border: "1px solid var(--border)" }} />
          ) : (
            <span style={{ fontSize: 28 }}>{flag}</span>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{name}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
              {countryData?.subregion || profile?.region} · ISO {isoCode}
            </div>
          </div>
          <div style={{
            marginLeft: "auto",
            padding: "3px 8px",
            borderRadius: 4,
            background: `${levelColor}18`,
            border: `1px solid ${levelColor}44`,
            fontSize: 10, fontWeight: 700, letterSpacing: 1,
            color: levelColor, fontFamily: "var(--font-mono)",
            flexShrink: 0,
          }}>
            {levelText}
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            ["Capital", countryData?.capital || profile?.capital],
            ["Population", countryData?.population || profile?.pop],
            ["Area", countryData?.area ? `${countryData.area} km²` : null],
            ["GDP", profile?.gdp],
            ["Currency", countryData?.currencies || null],
            ["Languages", countryData?.languages || null],
          ].filter(([, v]) => v).slice(0, 6).map(([k, v]) => (
            <div key={k} style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 4, padding: "5px 8px",
            }}>
              <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1 }} className="mono">{k.toUpperCase()}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--text)", fontWeight: 600, marginTop: 1 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0,
      }}>
        {["overview", "news", "analysis"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            flex: 1, padding: "8px 0",
            fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
            background: "transparent", border: "none",
            color: activeTab === t ? "var(--accent)" : "var(--text-muted)",
            borderBottom: activeTab === t ? "2px solid var(--accent)" : "2px solid transparent",
            marginBottom: -1, transition: "all 0.2s",
          }}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            {/* Borders */}
            {countryData?.borders?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, marginBottom: 6 }}>BORDER COUNTRIES</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {countryData.borders.map(b => (
                    <span key={b} className="mono" style={{
                      fontSize: 10, padding: "2px 7px",
                      background: "var(--bg-card2)", border: "1px solid var(--border)",
                      borderRadius: 3, color: "var(--text-muted)",
                    }}>{b}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Military info */}
            {profile?.military && (
              <div style={{
                padding: "8px 10px",
                background: "var(--bg-card2)", border: "1px solid var(--border)",
                borderRadius: 6, marginBottom: 12,
              }}>
                <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", marginBottom: 4, letterSpacing: 1 }}>MILITARY STATUS</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{profile.military}</div>
              </div>
            )}

            {/* Timezones */}
            {countryData?.timezones?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, marginBottom: 4 }}>TIMEZONES</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{countryData.timezones.slice(0, 3).join(", ")}</div>
              </div>
            )}

            {/* Action buttons */}
            <button onClick={() => onChatAbout(name, isoCode)} style={{
              width: "100%", padding: "9px 0",
              background: "var(--accent-dim)", border: "1px solid rgba(0,245,196,0.3)",
              borderRadius: 6, color: "var(--accent)",
              fontWeight: 700, fontSize: 12, letterSpacing: 1, fontFamily: "var(--font-mono)",
              transition: "all 0.2s", marginBottom: 6,
            }}
              onMouseEnter={e => e.target.style.background = "rgba(0,245,196,0.2)"}
              onMouseLeave={e => e.target.style.background = "var(--accent-dim)"}
            >
              ◈ ASK AI ABOUT {name.toUpperCase()}
            </button>
          </div>
        )}

        {/* NEWS TAB */}
        {activeTab === "news" && (
          <div>
            {newsLoading ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div className="spinner" style={{ margin: "0 auto 8px" }} />
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Loading intelligence feed...</div>
              </div>
            ) : aiNews.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 12 }}>
                No news loaded. Configure API key.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {aiNews.map((item, i) => (
                  <div key={i} style={{
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 9, padding: "1px 6px", borderRadius: 3,
                        background: `${catColor[item.category] || "#666"}18`,
                        color: catColor[item.category] || "var(--text-muted)",
                        fontFamily: "var(--font-mono)", letterSpacing: 1, fontWeight: 700,
                      }}>
                        {(item.category || "intel").toUpperCase()}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 13, lineHeight: 1.4, color: "var(--text)",
                      marginBottom: 4, cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                      onClick={() => {
                        onChatAbout(`Tell me more about this news from ${name}: "${item.title}"`, isoCode);
                      }}
                      onMouseEnter={e => e.target.style.color = "var(--accent)"}
                      onMouseLeave={e => e.target.style.color = "var(--text)"}
                    >
                      {item.title}
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--text-dim)" }}>
                      ◈ {item.source}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={fetchAINews} style={{
              width: "100%", padding: "8px 0", marginTop: 10,
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: 6, color: "var(--text-muted)",
              fontSize: 11, letterSpacing: 1, fontFamily: "var(--font-mono)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => e.target.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.target.style.borderColor = "var(--border)"}
            >
              ↺ REFRESH FEED
            </button>
          </div>
        )}

        {/* ANALYSIS TAB */}
        {activeTab === "analysis" && (
          <div>
            {!analysis && !analyzing && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
                  Run AI-powered geopolitical risk analysis for {name}
                </div>
                <button onClick={runAnalysis} style={{
                  padding: "10px 24px",
                  background: "var(--purple-dim)", border: "1px solid rgba(123,104,238,0.4)",
                  borderRadius: 6, color: "var(--purple)",
                  fontWeight: 700, fontSize: 12, letterSpacing: 1, fontFamily: "var(--font-mono)",
                  transition: "all 0.2s",
                }}>
                  ▶ RUN ANALYSIS
                </button>
              </div>
            )}

            {analyzing && (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div className="spinner" style={{ margin: "0 auto 8px", width: 20, height: 20 }} />
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  Processing intelligence for {name}...
                </div>
              </div>
            )}

            {analysis && (
              <div className="animate-up">
                {/* Risk score */}
                <div style={{
                  background: "var(--bg-card2)", border: `1px solid ${riskLabel(analysis.risk_score).color}33`,
                  borderRadius: 8, padding: "12px", marginBottom: 12,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1 }}>RISK SCORE</span>
                    <span style={{
                      padding: "3px 10px", borderRadius: 4,
                      background: `${riskLabel(analysis.risk_score).bg}`,
                      color: riskLabel(analysis.risk_score).color,
                      fontSize: 11, fontWeight: 800, letterSpacing: 1, fontFamily: "var(--font-mono)",
                    }}>
                      {riskLabel(analysis.risk_score).label}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{
                      flex: 1, height: 6, background: "var(--bg-card)", borderRadius: 3, overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${analysis.risk_score}%`,
                        background: riskLabel(analysis.risk_score).color,
                        borderRadius: 3, transition: "width 1s ease",
                      }} />
                    </div>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: riskLabel(analysis.risk_score).color }}>
                      {analysis.risk_score}/100
                    </span>
                  </div>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: 11, color: "var(--text-muted)",
                  }}>
                    <span>Outlook: <span style={{ color: analysis.outlook === "Positive" ? "var(--accent)" : analysis.outlook === "Negative" ? "var(--red)" : "var(--yellow)" }}>{analysis.outlook}</span></span>
                  </div>
                </div>

                {/* Summaries */}
                {[
                  { label: "POLITICAL", text: analysis.political_summary },
                  { label: "ECONOMIC", text: analysis.economic_outlook },
                  { label: "SECURITY", text: analysis.security_threat },
                  { label: "12-MONTH FORECAST", text: analysis.forecast_12m },
                ].map(s => (
                  <div key={s.label} style={{ marginBottom: 10 }}>
                    <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{s.text}</div>
                  </div>
                ))}

                {/* Key risks */}
                {analysis.key_risks?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, marginBottom: 6 }}>KEY RISKS</div>
                    {analysis.key_risks.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "flex-start" }}>
                        <span style={{ color: "var(--red)", fontSize: 10, marginTop: 2 }}>▸</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{r}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Opportunities */}
                {analysis.opportunities?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div className="mono" style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: 1, marginBottom: 6 }}>OPPORTUNITIES</div>
                    {analysis.opportunities.map((o, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "flex-start" }}>
                        <span style={{ color: "var(--accent)", fontSize: 10, marginTop: 2 }}>▸</span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{o}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={runAnalysis} style={{
                  width: "100%", padding: "8px 0", marginTop: 6,
                  background: "transparent", border: "1px solid var(--border)",
                  borderRadius: 6, color: "var(--text-muted)",
                  fontSize: 11, letterSpacing: 1, fontFamily: "var(--font-mono)",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => e.target.style.borderColor = "var(--purple)"}
                  onMouseLeave={e => e.target.style.borderColor = "var(--border)"}
                >
                  ↺ RE-ANALYZE
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
