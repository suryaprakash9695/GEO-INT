// Maps TopoJSON numeric IDs → ISO alpha-2 codes
export const NUM_TO_ISO2 = {
  4:"AF",8:"AL",12:"DZ",24:"AO",32:"AR",36:"AU",40:"AT",50:"BD",56:"BE",68:"BO",
  76:"BR",100:"BG",104:"MM",116:"KH",120:"CM",124:"CA",140:"CF",152:"CL",156:"CN",
  170:"CO",178:"CG",180:"CD",188:"CR",191:"HR",192:"CU",196:"CY",203:"CZ",204:"BJ",
  208:"DK",214:"DO",218:"EC",818:"EG",222:"SV",246:"FI",250:"FR",266:"GA",
  276:"DE",288:"GH",320:"GT",324:"GN",332:"HT",340:"HN",348:"HU",356:"IN",
  360:"ID",364:"IR",368:"IQ",372:"IE",376:"IL",380:"IT",388:"JM",392:"JP",
  400:"JO",404:"KE",408:"KP",410:"KR",414:"KW",418:"LA",422:"LB",430:"LR",
  434:"LY",504:"MA",454:"MW",458:"MY",484:"MX",528:"NL",540:"NC",558:"NI",
  562:"NE",566:"NG",578:"NO",586:"PK",591:"PA",598:"PG",600:"PY",604:"PE",
  608:"PH",616:"PL",620:"PT",630:"PR",634:"QA",642:"RO",643:"RU",646:"RW",
  682:"SA",686:"SN",694:"SL",706:"SO",710:"ZA",724:"ES",144:"LK",729:"SD",
  752:"SE",756:"CH",760:"SY",762:"TJ",764:"TH",800:"UG",804:"UA",784:"AE",
  826:"GB",840:"US",858:"UY",860:"UZ",862:"VE",704:"VN",887:"YE",894:"ZM",
  716:"ZW",246:"FI",792:"TR",012:"DZ",288:"GH",496:"MN",
  275:"PS", // Palestine
};

export function getISO2(numericId) {
  return NUM_TO_ISO2[+numericId] || null;
}

export function formatPrice(val, decimals = 2) {
  if (!val && val !== 0) return "—";
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1000) return `$${val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  return `$${Number(val).toFixed(decimals)}`;
}

export function formatChange(val) {
  if (!val && val !== 0) return { text: "—", color: "var(--text-muted)" };
  const fixed = Number(val).toFixed(2);
  const color = val > 0 ? "var(--accent)" : val < 0 ? "var(--red)" : "var(--text-muted)";
  const text = val > 0 ? `+${fixed}%` : `${fixed}%`;
  return { text, color };
}

export function timeAgo(date) {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function conflictColor(level, alpha = 1) {
  if (level === "conflict") return `rgba(255,59,59,${alpha})`;
  if (level === "medium") return `rgba(255,140,0,${alpha})`;
  if (level === "stable") return `rgba(0,245,196,${alpha})`;
  return `rgba(40,55,90,${alpha})`;
}

export function conflictFill(level) {
  if (level === "conflict") return "#2a0808";
  if (level === "medium") return "#1e1400";
  if (level === "stable") return "#001f18";
  return "#0e1428";
}

export function riskLabel(score) {
  if (score >= 75) return { label: "CRITICAL", color: "#ff3b3b", bg: "rgba(255,59,59,0.12)" };
  if (score >= 50) return { label: "HIGH", color: "#ff8c00", bg: "rgba(255,140,0,0.12)" };
  if (score >= 25) return { label: "MEDIUM", color: "#ffd700", bg: "rgba(255,215,0,0.1)" };
  return { label: "LOW", color: "#00f5c4", bg: "rgba(0,245,196,0.12)" };
}

export function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text)">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="font-family:var(--font-mono);font-size:0.85em;background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px">$1</code>')
    .replace(/\n/g, '<br>');
}
