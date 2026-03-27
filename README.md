# 🌐 GEOINT — Global AI Geopolitics Intelligence Dashboard

<div align="center">

![GEOINT Banner](https://img.shields.io/badge/GEOINT-AI%20Intelligence%20Dashboard-00f5c4?style=for-the-badge&logo=globe&logoColor=black)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=for-the-badge&logo=vite&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3-f55036?style=for-the-badge&logo=meta&logoColor=white)
![D3](https://img.shields.io/badge/D3.js-World%20Map-f9a03c?style=for-the-badge&logo=d3dotjs&logoColor=black)

**A real-time geopolitical intelligence dashboard powered by AI, live financial data, and an interactive world map.**

[Features](#-features) · [Demo](#-screenshots) · [Quick Start](#-quick-start) · [API Keys](#-api-keys) · [Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

### 🗺️ Interactive World Map
- Full country boundaries using **TopoJSON + D3.js** (180+ countries)
- Color-coded conflict status — 🔴 Active Conflict · 🟠 Elevated Risk · 🟢 Stable
- **Animated pulse rings** on active conflict zones (Ukraine, Gaza, Sudan, etc.)
- Hover over any country for instant intel tooltip (flag, capital, GDP, military status)
- Zoom & pan with mouse scroll or buttons
- Click any country to open full intelligence report

### 🤖 AI Intelligence Chat
- Powered by **Groq LLaMA-3.3-70b** (ultra-fast, free tier)
- Context-aware — knows current market prices and selected country
- Multi-turn conversation with full history
- Quick-prompt chips: Ukraine War, Gaza, China-Taiwan, Oil, Bitcoin, and more
- Markdown rendering with bold, code, bullet support

### 💹 Live Financial Dashboard
- **Crypto:** BTC, ETH, SOL, XRP, ADA with 24h % change
- **Commodities:** Gold (XAU), WTI Crude Oil
- **Indices:** S&P 500, DXY (Dollar Index)
- **FX Rates:** EUR/USD, GBP/USD, USD/JPY, USD/INR, USD/CNY
- Mini sparkline charts per asset
- Auto-refreshes every **30 seconds**

### 🌍 Country Intelligence Panel
- Live data from **REST Countries API** — flag, capital, population, area, languages, currencies, borders
- AI-generated **recent news headlines** per country (5 headlines with category tags)
- **Risk Analysis Engine** — score 0–100, political summary, economic outlook, security threat
- 12-month geopolitical forecast
- Key risks & opportunities breakdown

### 📰 Intelligence Feed
- AI-generated headlines per country tagged by category: `CONFLICT` `SECURITY` `POLITICS` `ECONOMY` `DIPLOMACY`
- Click any headline to instantly deep-dive with AI

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/geoint-dashboard.git
cd geoint-dashboard

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your API keys (see below)

# 4. Start development server
npm run dev
```

Open **http://localhost:5173** 🎉

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🔑 API Keys

All APIs have **free tiers** — no credit card needed.

| API | Used For | Get Key | Required? |
|-----|----------|---------|-----------|
| **Groq** | AI chat, country analysis, news | [console.groq.com](https://console.groq.com) | ✅ Yes |
| **NewsData.io** | Live news articles | [newsdata.io](https://newsdata.io) | Optional |
| **CoinGecko** | Crypto prices (BTC, ETH, SOL...) | No key needed | Auto |
| **REST Countries** | Country data, flags, borders | No key needed | Auto |
| **Open Exchange Rates** | FX rates (EUR, JPY, INR...) | No key needed | Auto |

### Setup `.env` file

```env
VITE_GROQ_API_KEY=gsk_your_groq_key_here
VITE_NEWS_API_KEY=pub_your_newsdata_key_here
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore` by default.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18, Vite 5 |
| **Map** | D3.js, TopoJSON, world-atlas |
| **Charts** | Recharts |
| **AI** | Groq API (LLaMA-3.3-70b-versatile) |
| **Financial Data** | CoinGecko API, Open Exchange Rates |
| **Country Data** | REST Countries API v3 |
| **Styling** | Pure CSS with CSS Variables |
| **Fonts** | Orbitron, Rajdhani, JetBrains Mono |

---

## 📁 Project Structure

```
geoint/
├── src/
│   ├── components/
│   │   ├── TopBar.jsx          # Live financial ticker bar
│   │   ├── WorldMap.jsx        # D3 + TopoJSON interactive map
│   │   ├── ChatPanel.jsx       # Groq AI chat interface
│   │   ├── CountryPanel.jsx    # Country intel + risk analysis
│   │   ├── MarketsPanel.jsx    # Financial charts & FX rates
│   │   └── DebugPanel.jsx      # API connection debugger
│   ├── hooks/
│   │   └── useLiveData.js      # All live API data hooks
│   ├── utils/
│   │   └── helpers.js          # Formatting & utility functions
│   ├── config.js               # API config & country profiles
│   ├── App.jsx                 # Main layout & state
│   └── index.css               # Global dark theme styles
├── .env                        # Your API keys (not committed)
├── .env.example                # Template for API keys
├── vite.config.js              # Vite + API proxy config
└── package.json
```

---

## 🎨 Design System

```
Background:   #04060f  (Deep Space)
Cards:        #0a0e1c  (Dark Navy)
Accent:       #00f5c4  (Neon Teal)
Purple:       #7b68ee  (Selection)
Danger:       #ff3b3b  (Conflict)
Warning:      #ff8c00  (Risk)
```

**Fonts:** Orbitron (display) · Rajdhani (UI) · JetBrains Mono (data)

---

## 🗺️ Conflict Status Legend

| Color | Status | Description |
|-------|--------|-------------|
| 🔴 Red | Active Conflict | Ongoing armed conflict or war |
| 🟠 Orange | Elevated Risk | Political instability or tensions |
| 🟢 Green | Stable | No active conflict |
| 🟣 Purple | Selected | Currently selected country |

---

## 📦 Deployment

### Deploy to Vercel (Recommended — Free)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add environment variables in Vercel dashboard:
   - `VITE_GROQ_API_KEY`
   - `VITE_NEWS_API_KEY`
4. Click **Deploy** — live in ~2 minutes ✅

### Deploy to Netlify

```bash
npm run build
# Upload the dist/ folder to netlify.com/drop
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use, modify and distribute.

---

<div align="center">

Built with ❤️ using React + D3 + Groq AI

⭐ **Star this repo if you found it useful!**

</div>
