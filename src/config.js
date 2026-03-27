// ── API CONFIGURATION ──────────────────────────────────────────────────
// Users: Replace these with your actual API keys
// Get Groq key: https://console.groq.com
// Get NewsAPI key: https://newsapi.org
// CoinGecko: free tier (no key needed for basic endpoints)

export const CONFIG = {
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY || "YOUR_GROQ_API_KEY",
  NEWS_API_KEY: import.meta.env.VITE_NEWS_API_KEY || "YOUR_NEWSAPI_KEY",
  GROQ_MODEL: "llama-3.3-70b-versatile",
  REFRESH_INTERVAL: 30000, // 30 seconds
};

// ── CONFLICT BASELINE (pre-seeded intelligence data) ──────────────────
export const CONFLICT_BASELINE = {
  // High Conflict
  RU: "conflict", UA: "conflict", PS: "conflict", IL: "conflict",
  SY: "conflict", YE: "conflict", SD: "conflict", ML: "conflict",
  BF: "conflict", SO: "conflict", AF: "conflict", MM: "conflict",
  CD: "conflict", CF: "conflict", SS: "conflict", IQ: "conflict",
  LY: "conflict", NI: "conflict", MX: "conflict",
  // Elevated Risk
  IR: "medium", KP: "medium", PK: "medium", VE: "medium",
  ET: "medium", NG: "medium", BI: "medium", CM: "medium",
  TD: "medium", HT: "medium", TN: "medium", EG: "medium",
  SA: "medium", TR: "medium", RS: "medium", GE: "medium",
  AZ: "medium", LB: "medium", KZ: "medium",
  // Stable
  US: "stable", CA: "stable", GB: "stable", DE: "stable",
  FR: "stable", JP: "stable", AU: "stable", CN: "stable",
  IN: "stable", BR: "stable", KR: "stable", SG: "stable",
  NZ: "stable", NO: "stable", SE: "stable", DK: "stable",
  FI: "stable", CH: "stable", NL: "stable", AT: "stable",
};

// ── COUNTRY PROFILES ──────────────────────────────────────────────────
export const COUNTRY_PROFILES = {
  US: { name: "United States", capital: "Washington D.C.", pop: "331M", gdp: "$25.5T", flag: "🇺🇸", region: "Americas", currency: "USD", military: "World's largest defense budget ($886B)" },
  CN: { name: "China", capital: "Beijing", pop: "1.41B", gdp: "$17.7T", flag: "🇨🇳", region: "Asia-Pacific", currency: "CNY", military: "2nd largest ($293B)" },
  RU: { name: "Russia", capital: "Moscow", pop: "145M", gdp: "$1.8T", flag: "🇷🇺", region: "Eurasia", currency: "RUB", military: "Nuclear superpower" },
  DE: { name: "Germany", capital: "Berlin", pop: "84M", gdp: "$4.1T", flag: "🇩🇪", region: "Europe", currency: "EUR", military: "NATO member" },
  GB: { name: "United Kingdom", capital: "London", pop: "68M", gdp: "$3.1T", flag: "🇬🇧", region: "Europe", currency: "GBP", military: "P5 nuclear state" },
  FR: { name: "France", capital: "Paris", pop: "68M", gdp: "$2.9T", flag: "🇫🇷", region: "Europe", currency: "EUR", military: "P5 nuclear state" },
  IN: { name: "India", capital: "New Delhi", pop: "1.43B", gdp: "$3.5T", flag: "🇮🇳", region: "South Asia", currency: "INR", military: "Nuclear state" },
  UA: { name: "Ukraine", capital: "Kyiv", pop: "44M", gdp: "$200B", flag: "🇺🇦", region: "Eastern Europe", currency: "UAH", military: "Active conflict with Russia" },
  IL: { name: "Israel", capital: "Jerusalem", pop: "9.7M", gdp: "$522B", flag: "🇮🇱", region: "Middle East", currency: "ILS", military: "Nuclear-capable" },
  IR: { name: "Iran", capital: "Tehran", pop: "87M", gdp: "$367B", flag: "🇮🇷", region: "Middle East", currency: "IRR", military: "Nuclear program" },
  KP: { name: "North Korea", capital: "Pyongyang", pop: "26M", gdp: "$18B", flag: "🇰🇵", region: "East Asia", currency: "KPW", military: "Nuclear armed state" },
  PS: { name: "Palestine", capital: "Ramallah", pop: "5.4M", gdp: "$18B", flag: "🇵🇸", region: "Middle East", currency: "ILS", military: "Active conflict zone" },
  SY: { name: "Syria", capital: "Damascus", pop: "22M", gdp: "$11B", flag: "🇸🇾", region: "Middle East", currency: "SYP", military: "Civil war ongoing" },
  YE: { name: "Yemen", capital: "Sana'a", pop: "34M", gdp: "$21B", flag: "🇾🇪", region: "Middle East", currency: "YER", military: "Humanitarian crisis" },
  AF: { name: "Afghanistan", capital: "Kabul", pop: "40M", gdp: "$15B", flag: "🇦🇫", region: "South Asia", currency: "AFN", military: "Taliban controlled" },
  PK: { name: "Pakistan", capital: "Islamabad", pop: "231M", gdp: "$376B", flag: "🇵🇰", region: "South Asia", currency: "PKR", military: "Nuclear state" },
  SA: { name: "Saudi Arabia", capital: "Riyadh", pop: "35M", gdp: "$1.1T", flag: "🇸🇦", region: "Middle East", currency: "SAR", military: "Regional power" },
  BR: { name: "Brazil", capital: "Brasília", pop: "215M", gdp: "$1.9T", flag: "🇧🇷", region: "South America", currency: "BRL", military: "Regional power" },
  JP: { name: "Japan", capital: "Tokyo", pop: "125M", gdp: "$4.2T", flag: "🇯🇵", region: "East Asia", currency: "JPY", military: "Self-Defense Forces" },
  KR: { name: "South Korea", capital: "Seoul", pop: "52M", gdp: "$1.7T", flag: "🇰🇷", region: "East Asia", currency: "KRW", military: "NATO partner" },
  AU: { name: "Australia", capital: "Canberra", pop: "26M", gdp: "$1.7T", flag: "🇦🇺", region: "Oceania", currency: "AUD", military: "AUKUS member" },
  TR: { name: "Turkey", capital: "Ankara", pop: "85M", gdp: "$906B", flag: "🇹🇷", region: "Middle East/Europe", currency: "TRY", military: "NATO's 2nd largest army" },
  ZA: { name: "South Africa", capital: "Pretoria", pop: "60M", gdp: "$406B", flag: "🇿🇦", region: "Africa", currency: "ZAR", military: "Regional power" },
  NG: { name: "Nigeria", capital: "Abuja", pop: "223M", gdp: "$440B", flag: "🇳🇬", region: "West Africa", currency: "NGN", military: "Active insurgency" },
  EG: { name: "Egypt", capital: "Cairo", pop: "105M", gdp: "$476B", flag: "🇪🇬", region: "North Africa", currency: "EGP", military: "Regional power" },
  ET: { name: "Ethiopia", capital: "Addis Ababa", pop: "125M", gdp: "$126B", flag: "🇪🇹", region: "East Africa", currency: "ETB", military: "Post-Tigray" },
  SD: { name: "Sudan", capital: "Khartoum", pop: "46M", gdp: "$52B", flag: "🇸🇩", region: "East Africa", currency: "SDG", military: "Civil war" },
  MM: { name: "Myanmar", capital: "Naypyidaw", pop: "55M", gdp: "$65B", flag: "🇲🇲", region: "Southeast Asia", currency: "MMK", military: "Military junta" },
  VE: { name: "Venezuela", capital: "Caracas", pop: "29M", gdp: "$50B", flag: "🇻🇪", region: "South America", currency: "VES", military: "Political crisis" },
  MX: { name: "Mexico", capital: "Mexico City", pop: "130M", gdp: "$1.3T", flag: "🇲🇽", region: "North America", currency: "MXN", military: "Cartel conflict" },
};

// ── QUICK CHAT PROMPTS ──────────────────────────────────────────────────
export const QUICK_PROMPTS = [
  { label: "Ukraine War", q: "Latest situation in the Ukraine-Russia war?" },
  { label: "Gaza Crisis", q: "Current situation in Gaza and Middle East?" },
  { label: "China-Taiwan", q: "China-Taiwan tensions status and risk of conflict?" },
  { label: "Oil Prices", q: "What's driving oil prices and outlook?" },
  { label: "Bitcoin Outlook", q: "Bitcoin price analysis and geopolitical factors?" },
  { label: "North Korea", q: "Latest North Korea nuclear/missile threats?" },
  { label: "Stable Regions", q: "Which regions are most geopolitically stable?" },
  { label: "Dollar Index", q: "US Dollar strength and global impact?" },
];
