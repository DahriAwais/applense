import { useState, useEffect } from "react";
import AppDashboard from "./components/AppDashboard";
import RevenueCalculator from "./components/RevenueCalculator";
import AppIcon from "./components/AppIcon";
import { AppDetails } from "./types";
import { TRENDING_APPS, computeAppHomeStats } from "./data/trendingApps";
import { 
  Sparkles, 
  ArrowLeft,
  Flame,
  Globe,
  Search,
  RefreshCw,
  AlertCircle,
  Play,
  TrendingUp,
  Sliders,
  DollarSign,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function calculateAgeInMonths(released: string): number {
  try {
    if (!released || released === "N/A" || released === "varies") return 36;
    // Replace format characters like backslashes if any
    const releasedDate = new Date(released.replace(/\\/g, ""));
    if (isNaN(releasedDate.getTime())) return 36;
    const currentDate = new Date("2026-06-01");
    const diffYears = currentDate.getFullYear() - releasedDate.getFullYear();
    const diffMonths = currentDate.getMonth() - releasedDate.getMonth();
    const totalMonths = (diffYears * 12) + diffMonths;
    return Math.max(6, totalMonths);
  } catch {
    return 36;
  }
}

export function estimateMonthlyDownloads_Layer1(reviewsCount: number, genre: string, released: string, baseMonthlyDownloads?: number): number {
  const genreLower = (genre || "").toLowerCase();
  const isGamingOrEntertainment = 
    genreLower.includes("game") || 
    genreLower.includes("gaming") || 
    genreLower.includes("entertainment") || 
    genreLower.includes("play");
  const multiplier = isGamingOrEntertainment ? 45 : 70;
  const ageMonths = calculateAgeInMonths(released);
  const calculated = Math.round((reviewsCount * multiplier) / ageMonths);
  // Guarantee a safe lower and upper bound, avoiding weird zeroes or giant anomalies
  return Math.min(10000000, Math.max(150, calculated));
}

function generateLocalSimulatedApp(id: string, store: "play" | "apple"): AppDetails {
  const cleanId = id.trim();
  const parts = cleanId.split(".");
  let calculatedTitle = store === "apple" ? "iOS App Utility" : "Android App Utility";
  let calculatedDev = "Indie Developer";
  
  if (parts.length >= 2) {
    const rawDev = parts[parts.length - 2];
    const rawApp = parts[parts.length - 1];
    calculatedTitle = rawApp.charAt(0).toUpperCase() + rawApp.slice(1);
    calculatedDev = rawDev.charAt(0).toUpperCase() + rawDev.slice(1) + " Labs";
  } else if (/^\d+$/.test(cleanId)) {
    calculatedTitle = `iOS App #${cleanId}`;
    calculatedDev = "Apple Indie Creator";
  }

  let hash = 0;
  for (let i = 0; i < cleanId.length; i++) {
    hash = cleanId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const posHash = Math.abs(hash);
  
  const score = 3.8 + (posHash % 13) / 10;
  const isPaid = posHash % 12 === 0;
  const price = isPaid ? [0.99, 1.99, 2.99, 4.99, 9.99][posHash % 5] : 0;
  
  const seedDownloads = [10000, 50000, 100000, 500000, 1000000, 5000000, 10000000][posHash % 7];
  const derivedDownloads = seedDownloads;
  const monthlyDownloads = Math.max(150, Math.floor(derivedDownloads / 36));
  const reviewsCount = Math.floor(derivedDownloads * 0.02);

  const genres = ["Productivity", "Finance", "Social", "Lifestyle", "Utility", "Business", "Education"];
  const genre = genres[posHash % genres.length];

  return {
    id: cleanId,
    appId: cleanId,
    title: calculatedTitle,
    icon: `https://images.unsplash.com/photo-${[
      "1563986768609-322da13575f3",
      "1611162617213-7d7a39e9b1d7",
      "1612036782180-6f0b6cd846fe",
      "1581291518633-83b4ebd1d83e"
    ][posHash % 4]}?auto=format&fit=crop&w=128&h=128&q=80`,
    developer: calculatedDev,
    price: price,
    priceText: price === 0 ? "Free" : `$${price}`,
    score: score,
    scoreText: score.toFixed(1),
    reviewsCount: reviewsCount,
    description: `A highly-performant App Store & Play Store analytics proxy mock. Built precisely for micro-SaaS calculations and unit economics modeling. Extends beautiful interactive tools for indie developers.`,
    genre: genre,
    screenshots: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&h=400&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&h=400&q=80"
    ],
    store: store,
    size: `${(25 + (posHash % 45))} MB`,
    version: `1.${posHash % 10}.${posHash % 99}`,
    released: `Jan ${1 + (posHash % 28)}, 2021`,
    updated: `May ${1 + (posHash % 28)}, 2026`,
    installsText: `${(derivedDownloads / 1000).toFixed(0)}k+`,
    derivedDownloads,
    monthlyDownloads,
    url: store === "apple" 
      ? `https://apps.apple.com/us/app/id${posHash % 100050}`
      : `https://play.google.com/store/apps/details?id=${cleanId}`
  };
}

export default function App() {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<"play" | "apple">("play");
  const [activeApp, setActiveApp] = useState<AppDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Play Store home ranking filter state
  const [rankingFilter, setRankingFilter] = useState<"free" | "grossing" | "paid">("grossing");

  // Search autocomplete state
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Lifted revenue simulation state
  const [model, setModel] = useState<"freemium" | "paid" | "ads">("freemium");
  const [totalDownloads, setTotalDownloads] = useState<number>(100000);
  const [conversionRate, setConversionRate] = useState<number>(2.0);
  const [arpu, setArpu] = useState<number>(9.99);
  const [appPrice, setAppPrice] = useState<number>(2.99);
  const [adEcpm, setAdEcpm] = useState<number>(2.50);
  const [adsPerUser, setAdsPerUser] = useState<number>(3); // Daily Impressions (standard)
  const [activeUserRatio, setActiveUserRatio] = useState<number>(30); // 30% Active User Ratio

  // Real-time character-by-character search lookup
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const durationDebounce = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?term=${encodeURIComponent(searchTerm)}&store=all`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        } else {
          // Client-side local search fallback
          const term = searchTerm.toLowerCase();
          const filtered = TRENDING_APPS.filter(app => 
            (app.title || "").toLowerCase().includes(term) ||
            (app.developer || "").toLowerCase().includes(term) ||
            (app.appId || "").toLowerCase().includes(term)
          );
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error("Instant autocomplete failed, using local search fallback:", err);
        const term = searchTerm.toLowerCase();
        const filtered = TRENDING_APPS.filter(app => 
          (app.title || "").toLowerCase().includes(term) ||
          (app.developer || "").toLowerCase().includes(term) ||
          (app.appId || "").toLowerCase().includes(term)
        );
        setSearchResults(filtered);
      } finally {
        setSearchLoading(false);
      }
    }, 200); // Fast 200ms debounce for pristine letter-by-letter reaction

    return () => clearTimeout(durationDebounce);
  }, [searchTerm]);

  // Dynamically compute derived monthlyDownloads based on totalDownloads and age of the app!
  const ageMonths = activeApp ? calculateAgeInMonths(activeApp.released) : 36;
  const monthlyDownloads = Math.max(1, Math.round(totalDownloads / ageMonths));

  // Synchronize dynamic parameters when active App loads/toggles
  useEffect(() => {
    if (activeApp) {
      const initialTotal = activeApp.derivedDownloads || activeApp.estimatedDownloads || 100000;
      setTotalDownloads(initialTotal);
      setAppPrice(activeApp.price > 0 ? activeApp.price : 2.99);
      
      // Determine default model
      let defaultModel: "freemium" | "paid" | "ads" = "ads";
      if (activeApp.defaultModel) {
        defaultModel = activeApp.defaultModel;
      } else if (activeApp.price > 0) {
        defaultModel = "paid";
      } else {
        const titleLower = (activeApp.title || "").toLowerCase();
        const isFamousFreemium = 
          titleLower.includes("spotify") ||
          titleLower.includes("chatgpt") ||
          titleLower.includes("canva") ||
          titleLower.includes("discord") ||
          titleLower.includes("zoom") ||
          titleLower.includes("slack") ||
          titleLower.includes("notion") ||
          titleLower.includes("capcut") ||
          titleLower.includes("headspace") ||
          titleLower.includes("calm") ||
          titleLower.includes("duolingo") ||
          titleLower.includes("duingo") ||
          titleLower.includes("duet display") ||
          titleLower.includes("lightroom");
          
        if (isFamousFreemium) {
          defaultModel = "freemium";
        }
      }

      setModel(defaultModel);
      setConversionRate(defaultModel === "paid" ? 100 : 2.0); // 2.0% safe side conversion default for subscriptions
      setArpu(9.99); // default subscription SaaS fee
      setAdEcpm(2.50); // eCPM target default is $2.50
      setAdsPerUser(3); // 3 daily impressions
      setActiveUserRatio(30); // 30% active user ratio
    }
  }, [activeApp]);

  // Financial Estimates Calculations via 3-Layer Estimation Framework
  let grossRevenue = 0;

  if (activeApp) {
    if (model === "freemium") {
      // Case B style with average subscription conversion: (Monthly Downloads * Conversion Rate * Subscription Price) / 100
      grossRevenue = (monthlyDownloads * conversionRate * arpu) / 100;
    } else if (model === "paid") {
      // Case B physical transaction model: Monthly Downloads * Upfront Price
      grossRevenue = monthlyDownloads * appPrice;
    } else if (model === "ads") {
      // Ad-Supported Model: (Monthly Downloads * Active User Ratio * Daily Impressions * Average eCPM) / 1,000
      grossRevenue = (monthlyDownloads * activeUserRatio * adsPerUser * adEcpm) / 1000;
    }
  }

  const annualRunRate = grossRevenue * 12;

  // Load selected app details
  useEffect(() => {
    async function fetchAppDetails() {
      if (!selectedAppId) {
        setActiveApp(null);
        return;
      }

      setDetailsLoading(true);
      setDetailsError(null);

      try {
        const url = `/api/details?id=${encodeURIComponent(selectedAppId)}&store=${selectedStore}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error("Unable to retrieve details for this app. Please search or select another.");
        }
        
        const data = await res.json();
        
        // Merge with static trending apps if it matches to preserve standard indicators,
        // but prioritize live store screenshots, descriptions, and ratings!
        const staticMatched = TRENDING_APPS.find(
          (t) => t.appId?.toLowerCase() === selectedAppId.toLowerCase() || t.id?.toLowerCase() === selectedAppId.toLowerCase()
        );
        
        if (staticMatched) {
          setActiveApp({
            ...staticMatched,
            ...data,
            // Keep static downloads & released indicators to guarantee identical alignment with homepage & search list views!
            derivedDownloads: staticMatched.derivedDownloads || data.derivedDownloads,
            released: staticMatched.released || data.released,
            // Prioritize live store screenshots for accurate representation
            screenshots: data.screenshots && data.screenshots.length > 0 ? data.screenshots : staticMatched.screenshots,
          });
        } else {
          setActiveApp(data);
        }
      } catch (err: any) {
        console.warn("Express backend details API lookup missed. Activating high-fidelity client-side lookup:", err);
        // Fallback gracefully to TRENDING_APPS or generateLocalSimulatedApp if network lookup fails for any reason,
        // ensuring the app NEVER fails to render on Serverless platforms like Vercel!
        const staticMatched = TRENDING_APPS.find(
          (t) => t.appId?.toLowerCase() === selectedAppId.toLowerCase() || t.id?.toLowerCase() === selectedAppId.toLowerCase()
        );
        if (staticMatched) {
          setActiveApp(staticMatched);
        } else {
          const simulated = generateLocalSimulatedApp(selectedAppId, selectedStore);
          setActiveApp(simulated);
        }
      } finally {
        setDetailsLoading(false);
      }
    }

    fetchAppDetails();
  }, [selectedAppId, selectedStore]);

  const handleAppSelect = (appId: string, store: "play" | "apple") => {
    setSelectedStore(store);
    setSelectedAppId(appId);
    setIsSearchFocused(false); // Unfocus search bar on app selection
    setSearchTerm(""); // Reset search input
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative">
      
      {/* Top persistent premium header banner */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            
            {/* Logo Brand */}
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => { setSelectedAppId(null); setActiveApp(null); }}
            >
              <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden group">
                {/* Handcrafted precise glowing SVG camera / telescope lens */}
                <svg className="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {/* Glowing telescope dot indicator */}
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-zinc-900 font-display flex items-center gap-1.5 uppercase leading-none">
                  Applense
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded-full normal-case tracking-normal">
                    PRO
                  </span>
                </span>
                <p className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest font-mono mt-1">SaaS Metric Simulator</p>
              </div>
            </div>

            {/* Quick telemetry */}
            <div className="flex items-center gap-5">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">LIVE METRIC ENGINE</span>
                <span className="text-[11px] font-bold text-zinc-800 flex items-center gap-1.5 justify-end uppercase font-mono">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  iTunes & Gplay Active
                </span>
              </div>
              <div className="px-4 py-2 rounded-full border border-indigo-150 bg-indigo-50/50 text-[11px] font-black text-indigo-700 font-mono">
                USD ($) ESTIMATES
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container Dashboard split layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Interactive Full-Screen Blur Backdrop */}
        {isSearchFocused && (
          <div 
            className="fixed inset-0 bg-zinc-950/20 backdrop-blur-md z-40 transition-all duration-300"
            onClick={() => setIsSearchFocused(false)}
          />
        )}

        {/* Global Search Interface Container - Beautiful, Centered Sleek rounded box */}
        <div className={`relative max-w-2xl mx-auto ${isSearchFocused ? 'z-50' : 'z-20'}`}>
          <div className="relative flex items-center bg-white shadow-md hover:shadow-lg border border-zinc-200 rounded-full px-5 py-3.5 focus-within:ring-4 focus-within:ring-indigo-500/15 focus-within:border-indigo-400 transition-all">
            <Search className="h-5 w-5 text-indigo-500 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search Play Store & App Store apps character-by-character..."
              value={searchTerm}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-zinc-800 placeholder-zinc-400 font-medium font-sans focus:placeholder-zinc-300"
            />
            {searchLoading ? (
              <RefreshCw className="h-4 w-4 text-indigo-600 animate-spin mr-1" />
            ) : searchTerm ? (
              <button 
                onClick={() => { setSearchTerm(""); setSearchResults([]); }}
                className="text-[10px] font-mono hover:text-indigo-600 bg-zinc-100 hover:bg-indigo-50 px-2.5 py-1 rounded-full text-zinc-500 font-bold transition-all transition-colors"
              >
                CLEAR
              </button>
            ) : null}
          </div>

          {/* Autocomplete Drop Down list */}
          {isSearchFocused && (searchTerm.trim().length > 0 || searchResults.length > 0) && (
            <div className="absolute left-0 right-0 mt-3 bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden max-h-[440px] overflow-y-auto z-50">
              <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex justify-between items-center text-[9px] font-black uppercase tracking-widest font-mono text-zinc-400">
                <span>Real-time Matches ({searchResults.length})</span>
                <span>Click directly to simulate economics</span>
              </div>
              
              {searchLoading && searchResults.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                  <p className="text-xs text-zinc-400 font-mono">Syncing parameters as you type...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                  {searchResults.map((app) => {
                    const matchedTrending = TRENDING_APPS.find(
                      (t) => t.appId?.toLowerCase() === app.appId?.toLowerCase() || t.id?.toLowerCase() === app.id?.toLowerCase()
                    );
                    const appData = matchedTrending ? { ...matchedTrending } : { ...app };
                    const stats = computeAppHomeStats(appData);
                    return (
                      <div
                        key={`${app.store}-${app.appId}`}
                        onClick={() => handleAppSelect(app.appId, app.store)}
                        className="p-4 hover:bg-indigo-50/60 flex gap-4 items-center cursor-pointer transition-colors group"
                      >
                        <AppIcon src={app.icon} title={app.title} className="w-12 h-12" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-zinc-800 truncate group-hover:text-indigo-600 transition-colors">
                            {app.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 truncate">by {app.developer || "Creator"}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-black font-mono text-indigo-700 bg-indigo-50 px-1.5 rounded uppercase">
                              {app.genre || "Utility"}
                            </span>
                            <span className="text-[9px] font-bold text-zinc-450 font-mono">
                              ⭐ {app.score > 0 ? app.scoreText : "4.0"}
                            </span>
                          </div>
                        </div>

                        {/* Fast estimates column */}
                        <div className="text-right shrink-0 font-mono text-[11px] space-y-0.5 pl-2 border-l border-zinc-100">
                          <p className="font-black text-zinc-900">${stats.monthlyRevenue.toLocaleString()}/mo</p>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded leading-none inline-block ${
                            app.store === "play" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-indigo-50 text-indigo-700 border border-indigo-150"
                          }`}>
                            {app.store === "play" ? "ANDROID" : "IOS"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-400 text-xs font-medium font-mono">
                  No instant apps matched "{searchTerm}" yet. Keep typing!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Main Workspace routing */}
        <AnimatePresence mode="wait">
          {!selectedAppId ? (
                       /* Curated beautiful home grid discovery view */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
              key="discover-board"
            >
              {/* Grand intro hero cards banner */}
              <div className="text-center max-w-3xl mx-auto space-y-4 pt-1 pb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-200 text-indigo-700 text-xs font-black rounded-full font-mono shadow-3xs uppercase">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-600" />
                  <span>Google Play Market Dynamics & SaaS Economics Sandbox</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-zinc-900 leading-[1.12]">
                  Explore Market Metrics & <br />
                  <span className="text-indigo-600 underline decoration-indigo-400/80 decoration-2">SaaS Revenue Estimations</span>
                </h1>
                <p className="text-zinc-550 font-medium text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                  Select a trending storefront application below, or type in our sleek search input to analyze custom metrics.
                </p>
              </div>

              {/* Discovery Market Board header block */}
              <div className="space-y-5 bg-white border border-zinc-250 p-6 md:p-8 rounded-[32px] shadow-sm">
                
                {/* Header title and interactive tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                      <h2 className="text-lg font-black text-zinc-900 tracking-tight font-display">
                        {rankingFilter === "free" ? "Top free apps" : rankingFilter === "paid" ? "Top paid apps" : "Top grossing apps"}
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-400 font-bold">Based on live Play Store market installations & pricing parameters</p>
                  </div>
                  
                  {/* Pills Tabs Container directly matching modern Google Play Store design */}
                  <div className="flex items-center gap-2 p-1 bg-zinc-50 border border-zinc-200/60 rounded-full self-start sm:self-center">
                    {[
                      { id: "free", label: "Top free" },
                      { id: "grossing", label: "Top grossing" },
                      { id: "paid", label: "Top paid" }
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        onClick={() => setRankingFilter(pill.id as any)}
                        className={`px-4.5 py-1.5 text-xs font-black rounded-full transition-all duration-200 cursor-pointer ${
                          rankingFilter === pill.id
                            ? "bg-[#E6F4EA] text-[#137333] font-bold"
                            : "bg-transparent text-zinc-500 hover:text-zinc-800"
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Left-to-right swipe carousel instruction */}
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 font-mono">
                  <span className="uppercase tracking-widest">Store charts ranking</span>
                  <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Swipe or Scroll Right to view more ranking metrics →
                  </span>
                </div>

                {/* Horizontal Column Slide Rank Carousel */}
                {(() => {
                  const filteredApps = TRENDING_APPS.filter(app => {
                    if (rankingFilter === "free") {
                      return app.price === 0;
                    } else if (rankingFilter === "paid") {
                      return app.price > 0;
                    }
                    return true; 
                  }).sort((a, b) => {
                    const bStats = computeAppHomeStats(b);
                    const aStats = computeAppHomeStats(a);
                    if (rankingFilter === "free") {
                      return bStats.monthlyDownloads - aStats.monthlyDownloads;
                    }
                    return bStats.monthlyRevenue - aStats.monthlyRevenue;
                  });

                  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
                    const result: T[][] = [];
                    for (let i = 0; i < arr.length; i += size) {
                      result.push(arr.slice(i, i + size));
                    }
                    return result;
                  };

                  const appChunks = chunkArray(filteredApps, 3);

                  if (filteredApps.length === 0) {
                    return (
                      <div className="py-12 text-center text-zinc-400 text-sm font-semibold">
                        No applications match this filter currently.
                      </div>
                    );
                  }

                  return (
                    <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth scrollbar-none scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {appChunks.map((chunk, chunkIdx) => (
                        <div 
                          key={chunkIdx} 
                          className="flex flex-col gap-6 w-[290px] sm:w-[340px] md:w-[380px] shrink-0 snap-start border-r border-zinc-100 last:border-none pr-6 last:pr-0"
                        >
                          {chunk.map((app, appIdx) => {
                            const stats = computeAppHomeStats(app);
                            const rankIndex = chunkIdx * 3 + appIdx + 1;
                            const isApple = app.store === "apple";
                            return (
                              <div
                                key={app.id}
                                onClick={() => handleAppSelect(app.id, app.store || "play")}
                                className="flex items-center gap-4 group cursor-pointer hover:bg-zinc-50 p-2 rounded-2xl transition-all duration-300 relative"
                              >
                                {/* Rank indicator with large stylish spacing */}
                                <span className="w-6 font-display font-black text-sm text-zinc-400 text-center shrink-0 group-hover:text-emerald-600 transition-colors">
                                  {rankIndex}
                                </span>

                                {/* App circular-rounded launcher icon */}
                                <div className="shrink-0 relative group-hover:scale-[1.05] transition-transform duration-300">
                                  <AppIcon 
                                    src={app.icon} 
                                    title={app.title} 
                                    className="w-14 h-14 rounded-2xl border border-zinc-200/80 shadow-3xs" 
                                  />
                                </div>

                                {/* App text parameters */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-black text-zinc-900 group-hover:text-[#137333] transition-colors truncate">
                                    {app.title}
                                  </h3>
                                  <p className="text-[11px] text-zinc-400 font-bold truncate mt-0.5">
                                    {app.developer}
                                  </p>

                                  {/* Stats row with star and estimated SaaS revenue */}
                                  <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono flex-wrap">
                                    <span className="text-zinc-500 font-bold flex items-center">
                                      {app.scoreText} <span className="text-[9px] text-amber-500 ml-0.5">★</span>
                                    </span>
                                    <span className="text-zinc-350">•</span>
                                    <span className="text-zinc-400">
                                      {app.price === 0 ? "Free" : `$${app.price}`}
                                    </span>
                                    <span className="text-zinc-350">•</span>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded leading-none inline-block ${
                                      isApple ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    }`}>
                                      {isApple ? "iOS" : "Android"}
                                    </span>
                                    <span className="text-zinc-350">•</span>
                                    <span className="text-[#137333] font-black text-xs">
                                      ${stats.monthlyRevenue.toLocaleString()}/mo Est.
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  );
                })()}

              </div>
            </motion.div>

          ) : (

            /* In-depth details analyzer view screen with interactive slide controls */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-7"
              key="details-workspace"
            >
              
              {/* Back navigation tab bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedAppId(null);
                    setActiveApp(null);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-900 font-black text-xs rounded-full transition-all tracking-wider uppercase font-display cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  ← Return to Discover Board
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">ACTIVE ANALYZER:</span>
                  <span className="text-[10px] font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-full uppercase">
                    {activeApp ? activeApp.title.substring(0, 20) : "Loading..."}
                  </span>
                </div>
              </div>

              {detailsLoading && !activeApp ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-12 bg-white border border-zinc-200 rounded-3xl shadow-xs">
                  <div className="relative mb-4">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-500/10 border-t-indigo-600 animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 animate-pulse" />
                  </div>
                  <h3 className="text-zinc-800 text-sm font-black font-display uppercase tracking-wider">Compiling platform parameters...</h3>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">Loading real-time scrapers and iOS Adaptations</p>
                </div>
              ) : detailsError ? (
                <div className="p-8 bg-red-50 border border-red-150 rounded-3xl text-center space-y-4">
                  <div className="flex items-center gap-2 justify-center text-red-600 font-bold text-xs font-mono">
                    <AlertCircle className="h-5 w-5" />
                    <span>Dossier Acquisition Error</span>
                  </div>
                  <p className="text-xs text-zinc-650 font-mono">{detailsError}</p>
                  <button
                    onClick={() => { setSelectedAppId(null); setActiveApp(null); }}
                    className="px-4 py-2 bg-red-100 text-red-700 font-bold text-xs rounded-full hover:bg-red-200 transition-colors"
                  >
                    Back to Safety
                  </button>
                </div>
              ) : activeApp ? (
                <div className="space-y-6">
                  
                  {/* Top Status alert */}
                  <div className="p-3.5 bg-white border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-zinc-50 border border-zinc-200">
                        <Flame className="h-3.5 w-3.5 text-indigo-600 animate-bounce" />
                      </span>
                      <p className="text-xs text-zinc-650 leading-none">
                        Analyzing <span className="font-extrabold text-zinc-955">{activeApp.title}</span>. Adjust sliders below to dynamically recalculate statistics instantly.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Standard Store Range:</span>
                      <span className="text-[10px] font-mono text-indigo-700 font-black bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {activeApp.installsText} Installs
                      </span>
                    </div>
                  </div>

                  {/* App Overview metadata page layout */}
                  <AppDashboard 
                    app={activeApp} 
                    loading={detailsLoading} 
                    grossRevenue={grossRevenue}
                    annualRunRate={annualRunRate}
                    monthlyDownloads={monthlyDownloads}
                    model={model}
                    conversionRate={conversionRate}
                    arpu={arpu}
                    appPrice={appPrice}
                    adEcpm={adEcpm}
                    activeUserRatio={activeUserRatio}
                    adsPerUser={adsPerUser}
                  />

                  {/* Dynamic Revenue parameters slider console */}
                  <RevenueCalculator 
                    app={activeApp} 
                    model={model}
                    setModel={setModel}
                    totalDownloads={totalDownloads}
                    setTotalDownloads={setTotalDownloads}
                    monthlyDownloads={monthlyDownloads}
                    conversionRate={conversionRate}
                    setConversionRate={setConversionRate}
                    arpu={arpu}
                    setArpu={setArpu}
                    appPrice={appPrice}
                    setAppPrice={setAppPrice}
                    adEcpm={adEcpm}
                    setAdEcpm={setAdEcpm}
                    adsPerUser={adsPerUser}
                    setAdsPerUser={setAdsPerUser}
                    activeUserRatio={activeUserRatio}
                    setActiveUserRatio={setActiveUserRatio}
                  />

                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Structured multi-column footer */}
      <footer className="border-t border-zinc-200 bg-white mt-12 shadow-inner font-sans" id="disclaimer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 text-left col-span-12">
            
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="text-base font-black tracking-tight text-zinc-900 uppercase">
                  Applense
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                Applense delivers simulated, live scraping-assisted estimates of App Store & Play Store applications. We model unit economics specifically for Indie Hackers.
              </p>
              <div className="flex gap-2">
                <span className="text-[10px] bg-zinc-50 border border-zinc-200 text-zinc-500 font-mono px-2 py-0.5 rounded">
                  Node v18+
                </span>
                <span className="text-[10px] bg-indigo-50 border border-indigo-155 text-indigo-600 font-mono px-2 py-0.5 rounded font-black">
                  Scrapers Operational
                </span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="text-[10px] font-black tracking-widest uppercase text-zinc-400 font-mono">
                Platforms
              </h4>
              <ul className="space-y-2 text-xs font-bold text-zinc-650">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Google Play Store Docs</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Android Platform Data</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">SaaS Math Metrics</a></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="text-[10px] font-black tracking-widest uppercase text-zinc-400 font-mono">
                Unit Economics
              </h4>
              <ul className="space-y-2 text-xs font-bold text-zinc-650">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Freemium SaaS</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Premium Ad-supported</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Platform Store Tax</a></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
              <h4 className="text-[10px] font-black tracking-widest uppercase text-zinc-400 font-mono flex items-center gap-1">
                ⚠️ Platform Disclaimer
              </h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                All metrics, monthly active users, downloads estimation indices, category variables and revenue run rates are dynamic statistical projections. They representing estimated modeling indices and do not denote official developer filings.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-extrabold flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-zinc-400" />
                  SANDBOX LEDGERS ACTIVE
                </span>
              </div>
            </div>

          </div>

          <div className="border-t border-zinc-200 mt-10 pt-6 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[11px] text-zinc-450">
            <p className="font-semibold">
              &copy; {new Date().getFullYear()} Applense Studio. Proposing dynamic financial estimation modeling indicators.
            </p>
            <div className="flex items-center gap-4">
              <span className="font-extrabold tracking-wider bg-zinc-100 border border-zinc-200 text-zinc-500 px-2 py-0.5 rounded text-[10px]">
                VERSION 2.0.0
              </span>
              <span className="text-zinc-350">|</span>
              <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
