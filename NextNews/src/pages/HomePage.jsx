// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { Search, Globe, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../LanguageContext";

const BASE = "http://localhost:5000";

const CATEGORY_DEFS = {
  Technology:    { cls: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",    keywords: ["tech", "ai", "software", "apple", "google", "microsoft", "chip", "robot", "cyber", "data", "app", "digital", "computer", "startup", "nvidia", "openai", "meta", "crypto", "bitcoin", "blockchain", "cloud", "hack", "phone", "gadget", "internet"] },
  Politics:      { cls: "bg-purple-500/10 text-purple-400 border border-purple-500/20", keywords: ["trump", "biden", "election", "congress", "senate", "politi", "democrat", "republican", "government", "law", "vote", "white house", "supreme court", "parliament", "legislation", "governor", "mayor", "nato", "sanction"] },
  Sports:        { cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", keywords: ["nfl", "nba", "mlb", "soccer", "football", "basketball", "cricket", "tennis", "athlete", "championship", "playoff", "coach", "draft", "game", "match", "tournament", "olympic", "league", "team", "player", "score", "sport"] },
  Business:      { cls: "bg-amber-500/10 text-amber-400 border border-amber-500/20",   keywords: ["stock", "market", "economy", "trade", "invest", "bank", "finance", "revenue", "profit", "ceo", "company", "billion", "million", "deal", "merger", "ipo", "wall street", "tariff", "inflation", "fed", "gdp"] },
  World:         { cls: "bg-blue-500/10 text-blue-400 border border-blue-500/20",      keywords: ["war", "ukraine", "russia", "china", "iran", "gaza", "israel", "europe", "asia", "africa", "military", "missile", "conflict", "peace", "refugee", "un ", "united nations", "geopolit", "diplomat", "foreign"] },
  Entertainment: { cls: "bg-pink-500/10 text-pink-400 border border-pink-500/20",     keywords: ["movie", "film", "music", "celebrity", "award", "oscar", "grammy", "album", "concert", "hollywood", "netflix", "disney", "streaming", "tv show", "actor", "singer", "box office"] },
  Science:       { cls: "bg-teal-500/10 text-teal-400 border border-teal-500/20",     keywords: ["space", "nasa", "climate", "research", "study", "scientist", "discovery", "planet", "ocean", "species", "vaccine", "medical", "health", "disease", "hospital", "cancer", "drug", "fda"] },
};

const DEFAULT_TAG = { label: "General", cls: "bg-red-500/10 text-red-400 border border-red-500/20" };

function classifyTitle(title) {
  if (!title) return DEFAULT_TAG;
  const lower = title.toLowerCase();
  for (const [label, { cls, keywords }] of Object.entries(CATEGORY_DEFS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { label, cls };
    }
  }
  return DEFAULT_TAG;
}

const SIDEBAR_CATEGORIES = [
  "All News", "Technology", "Bandnology", "Categories", "Marketing", "Desnitteries",
];

const languages = [
  "English", "Hindi", "Tamil", "Telugu", "Kannada",
  "Malayalam", "Bengali", "Marathi", "Punjabi",
  "Gujarati", "Odia", "Urdu",
];

const Homepage = () => {
  const { language, setLanguage, t } = useLanguage();
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  // Search State
  const [q, setQ] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState("");
  const isRTL = language === "urdu";

  const fetchTrendingNews = async (lang = language) => {
    setLoadingTrending(true);
    try {
      const response = await axios.get(`${BASE}/extract_top_trending_news?language=${lang}`);
      // Ensure we have exactly 12 items as requested
      let data = response.data || [];
      if (data.length < 12 && data.length > 0) {
          const originalData = [...data];
          while(data.length < 12) {
              data = [...data, ...originalData];
          }
      }
      setFeaturedNews(data.slice(0, 12));
    } catch (error) { 
      console.error("Error fetching trending news:", error); 
    } finally { 
      setLoadingTrending(false); 
    }
  };

  useEffect(() => { fetchTrendingNews(language); }, [language]);

  const handleSearch = async () => {
    if (!q.trim()) return;

    setLoadingSearch(true);
    setSearchError("");
    setSummaries([]);

    try {
      await axios.post(`${BASE}/scrape`, { q, language });
      const res = await axios.post(`${BASE}/summarize_news`, { language });
      setSummaries(res.data.summaries || []);

      setTimeout(() => {
        document.getElementById("summaries-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error in search pipeline:", error);
      setSearchError(error.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] pb-20" dir={isRTL ? "rtl" : "ltr"}>
      


      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-10 sm:py-14">

        {/* ── Header & Search ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 anim-fade-up">
          <div>
            <h1 className="text-[28px] sm:text-[34px] lg:text-[40px] font-medium text-white/70 leading-[1.2]">
              Welcome, <span className="font-semibold text-white">Naman</span>,
              <br />
              <span className="font-semibold text-white">Today's Top Curated Stories</span>
            </h1>
          </div>

          {/* Search Bar matching dark theme */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative shrink-0">
              <Globe className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-white/25`} />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full sm:w-44 py-2.5 ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} rounded-lg bg-[#131318] text-white/60 text-sm border border-white/[0.06] appearance-none focus:outline-none focus:border-cyan-500/40 cursor-pointer`}
              >
                {languages.map((l) => <option key={l} value={l.toLowerCase()} className="bg-[#131318]">{l}</option>)}
              </select>
            </div>
            <div className="relative flex-1 sm:w-64">
              <Search className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-white/25`} />
              <input 
                type="text" 
                placeholder={t("searchPlaceholder")} 
                value={q}
                onChange={(e) => setQ(e.target.value)} 
                onKeyDown={handleKeyDown}
                className={`w-full py-2.5 ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} rounded-lg bg-[#131318] text-white text-sm border border-white/[0.06] focus:outline-none focus:border-cyan-500/40 placeholder-white/20`} 
              />
            </div>
            <button 
              onClick={handleSearch} 
              disabled={loadingSearch}
              className="btn-accent flex items-center justify-center gap-2 whitespace-nowrap !bg-blue-500 hover:!bg-blue-600 !text-white"
            >
              {loadingSearch ? <><Loader2 className="w-4 h-4 animate-spin"/>Searching…</> : "Search"}
            </button>
          </div>
        </div>

        {searchError && <p className="text-red-400 text-sm mb-5">{searchError}</p>}

        {/* ── Search Summaries ── */}
        {summaries.length > 0 && (
          <div id="summaries-section" className="mb-10 anim-fade-up">
            <h2 className="text-lg font-semibold text-white/70 mb-5">Results for "{q}"</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {summaries.map((item, i) => (
                <div key={i} className="card p-6 bg-[#131318]/90 border-white/[0.05]">
                  <h3 className="text-[17px] font-semibold text-cyan-400 mb-3 line-clamp-2">{item.title}</h3>
                  <p className="text-[14px] text-white/50 leading-relaxed mb-5">{item.summary}</p>
                  <button className="w-full py-2 bg-[#1e1e25] hover:bg-[#2a2a35] text-white text-[13px] font-medium rounded-lg transition-colors border border-white/[0.05]">
                    Read Summary
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Main Layout: Grid + Sidebar ── */}
        <div className="flex flex-col xl:flex-row gap-8 lg:gap-12 anim-fade-up-1">

          {/* Feed Grid (Left side) */}
          <div className="flex-1 min-w-0">
            {loadingTrending ? (
              <div className="card flex items-center justify-center gap-3 py-28 text-white/30 text-base">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading Feed...
              </div>
            ) : featuredNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {featuredNews.map((news, i) => {

                  return (
                    <Link key={i} to={`/news/${i}`} state={{ news }}>
                      <div className="card p-6 h-full flex flex-col cursor-pointer group bg-[#131318]/90 border-white/[0.05] hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all">
                        
                        {/* Source Row */}
                        <div className="flex items-center gap-2.5 mb-4">
                          <span className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {(news.source || "C")[0].toUpperCase()}
                          </span>
                          <span className="text-xs text-white/50 truncate font-medium">{news.source || "CNN"}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-[17px] font-semibold text-white group-hover:text-blue-400 line-clamp-3 leading-[1.4] mb-4 transition-colors">
                          {news.title}
                        </h3>

                        {/* Bottom Row */}
                        <div className="mt-auto">
                           
                           <button className="w-full py-2.5 bg-[#1e1e25] group-hover:bg-[#2a2a35] text-white text-[13px] font-medium rounded-lg transition-colors border border-white/[0.05]">
                             Read Summary
                           </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="card py-28 text-center text-white/30 text-base">No trending news available.</div>
            )}
          </div>

          {/* ── Sidebar (Right side) ── */}
          <div className="w-full xl:w-72 shrink-0 mt-8 xl:mt-0 xl:pl-4 flex flex-col">
            <Link 
              to="/demo/anchor" 
              className="relative group overflow-hidden rounded-2xl p-[1px] w-full"
            >
              {/* Animated glowing border effect */}
              <span className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 opacity-70 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></span>
              
              {/* Inner card content */}
              <div className="relative bg-[#0e0e12]/95 backdrop-blur-xl h-full rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4 border border-white/10 group-hover:bg-[#0e0e12]/80 transition-colors duration-500 z-10">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.6)]">
                  <span className="text-3xl">🎙️</span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                  AI Anchor
                </h3>
                
                <p className="text-sm text-cyan-100/70 leading-relaxed max-w-[200px]">
                  Experience the news delivered live by our next-gen digital presenter.
                </p>

                <div className="mt-4 px-5 py-2.5 rounded-xl bg-cyan-500 text-black text-sm font-semibold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/25 flex items-center gap-2">
                  Launch Studio
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;