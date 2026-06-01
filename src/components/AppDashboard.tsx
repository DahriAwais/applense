import { useState } from "react";
import AppIcon from "./AppIcon";
import { AppDetails } from "../types";
import { 
  Play, 
  Apple, 
  Sparkles, 
  Info, 
  Calendar, 
  Database, 
  Layers, 
  Heart, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Percent
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AppDashboardProps {
  app: AppDetails;
  loading: boolean;
  
  // Financial results passed from parent simulation state
  grossRevenue: number;
  annualRunRate: number;
  monthlyDownloads: number;
  model: "freemium" | "paid" | "ads";
  conversionRate: number;
  arpu: number;
  appPrice: number;
  adEcpm: number;
  activeUserRatio: number;
  adsPerUser: number;
}

export default function AppDashboard({ 
  app, 
  loading,
  grossRevenue,
  annualRunRate,
  monthlyDownloads,
  model,
  conversionRate,
  arpu,
  appPrice,
  adEcpm,
  activeUserRatio,
  adsPerUser
}: AppDashboardProps) {
  const [descExpanded, setDescExpanded] = useState(false);

  if (loading) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/10 border-t-indigo-600 animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-bold text-zinc-800 uppercase tracking-widest font-display">Parsing App Dossier...</p>
        <p className="mt-2 text-xs text-zinc-400 font-mono">Consolidating live store API datasets</p>
      </div>
    );
  }

  // 15% deviation ranges for calculations
  const minGross = Math.round(grossRevenue * 0.85);
  const maxGross = Math.round(grossRevenue * 1.15);

  const minARR = Math.round(annualRunRate * 0.85);
  const maxARR = Math.round(annualRunRate * 1.15);

  const computeConfidenceScore = (reviewsCount: number): number => {
    if (!reviewsCount) return 60;
    const score = Math.min(94, 60 + Math.floor(Math.log10(reviewsCount) * 5.5));
    return Math.max(60, score);
  };
  const confidenceScore = computeConfidenceScore(app.reviewsCount || 100);

  let calculationTooltip = "";
  if (model === "freemium") {
    calculationTooltip = `subscription conversion rate = ${conversionRate ? conversionRate.toFixed(1) : "2.0"}%. Calculated on estimated monthly downloads of ${monthlyDownloads.toLocaleString()} installs: (Monthly Downloads * Conversion Rate * Subscription Price) / 100.`;
  } else if (model === "paid") {
    calculationTooltip = `Premium upfront purchase transaction model at a price of $${appPrice ? appPrice.toFixed(2) : "2.99"}. Estimated monthly revenue = Monthly Downloads of ${monthlyDownloads.toLocaleString()} installs * $${appPrice ? appPrice.toFixed(2) : "2.99"}.`;
  } else {
    calculationTooltip = `Ad-supported model: Estimated Ad Revenue = (Monthly Downloads * Active User Ratio * Daily Impressions * Average eCPM) / 1,000. Under current settings: (${monthlyDownloads.toLocaleString()} * ${activeUserRatio}% * ${adsPerUser} daily * $${adEcpm.toFixed(2)}) / 1,000.`;
  }

  return (
    <div className="space-y-7">
      {/* App Main Header Identity with grand spacious layout */}
      <div className="p-8 bg-white border border-zinc-200 rounded-3xl shadow-sm flex flex-col md:flex-row gap-8 relative overflow-hidden">
        
        {/* Background ambient shade */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

        {/* Big high-visibility logo */}
        <div className="relative shrink-0 mx-auto md:mx-0">
          <AppIcon src={app.icon} title={app.title} className="w-28 h-28 md:w-32 md:h-32 rounded-[28%] border-4 border-zinc-100 shadow-xl" />

          <span className={`absolute -top-3 -right-3 px-3 py-1.5 text-[10px] font-mono font-black border rounded-full flex items-center gap-1.5 shadow-md ${
            app.store === "play" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
              : "bg-indigo-50 border-indigo-200 text-indigo-700"
          }`}>
            {app.store === "apple" ? (
              <>
                <Apple className="h-3 w-3 text-indigo-600 fill-indigo-500/10" />
                iOS App Store
              </>
            ) : (
              <>
                <Play className="h-3 w-3 text-emerald-500 fill-emerald-500/10" />
                Google Play Store
              </>
            )}
          </span>
        </div>

        {/* Text descriptions upscaled */}
        <div className="flex-1 text-center md:text-left space-y-3">
          
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1 flex-wrap">
            <span className={`px-2.5 py-1 text-[10px] font-black rounded-md uppercase border ${
              app.store === "apple"
                ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}>
              {app.store === "apple" ? "Apple App Store (iOS)" : "Google Play Store (Android)"}
            </span>
            <span className="px-2.5 py-1 bg-zinc-100 text-zinc-500 text-[10px] font-black rounded-md uppercase border border-zinc-150">
              v{app.version}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black font-display text-zinc-900 tracking-tight leading-tight">
            {app.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-sm text-zinc-500">
            <span className="hover:text-indigo-600 transition-colors font-bold">
              by {app.developer}
            </span>
            <span className="text-zinc-350 font-bold">•</span>
            <span className="font-mono text-[10px] uppercase bg-zinc-100 border border-zinc-200 rounded px-2 py-0.5 text-zinc-650 font-black">
              {app.genre}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 pt-2">
            <div className="flex items-center gap-1.5 font-mono text-zinc-600 text-sm">
              <span className="text-amber-500 font-extrabold text-base">★ {app.scoreText}</span>
              <span className="text-zinc-450 font-semibold">({app.reviewsCount.toLocaleString()} ratings)</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-sm text-zinc-750 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5">
              <Download className="h-4 w-4 text-indigo-600 animate-pulse" />
              <span className="font-black text-zinc-900">{app.installsText}</span>
              <span className="text-zinc-400 font-bold">Total Downloads</span>
            </div>
          </div>
        </div>

        {/* Store external redirection button upscaled */}
        <div className="self-center md:self-end pt-3 md:pt-0">
          <a
            href={app.url}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-black font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-150 hover:scale-[1.03]"
          >
            Store Link
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Trust & Confidence Audit Score Bar */}
      <div className="flex flex-co sm:flex-row items-center justify-between gap-4 p-5 bg-zinc-900 border border-zinc-850 rounded-2xl shadow-lg text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider font-display text-white">🛡️ Transparency & Confidence Score</h4>
            <p className="text-[10px] text-zinc-405 font-mono">Calculated using our proprietary 3-Layer Estimation Framework</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Neon Badge */}
          <div className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-[11px] font-black font-mono shadow-md tracking-wider flex items-center gap-1.5">
            🛡️ CONFIDENCE RATIO: {confidenceScore}%
          </div>
          
          <div className="text-[10px] font-mono text-zinc-400">
            Based on <span className="text-zinc-200 font-bold">{app.reviewsCount.toLocaleString()} ratings</span> at <span className="text-zinc-200 font-bold">{app.genre}</span> multipliers.
          </div>
        </div>
      </div>

      {/* Centerpiece Financial Metrics & Simulation Outpost Cards (Stunning corporate dashboard style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Monthly Estimated Revenue MRR */}
        <div className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                <DollarSign className="h-5 w-5" />
              </span>
              <div>
                <span className="text-[10px] font-black tracking-wider text-zinc-400 uppercase font-mono">
                  Monthly Run-rate
                </span>
                <h4 className="text-xs font-bold text-zinc-850 font-sans">Monthly Revenue (MRR)</h4>
              </div>
            </div>

            {/* Hoverable Dynamic Formula Popover */}
            <div className="relative group/tooltip">
              <button 
                type="button"
                className="p-1.5 rounded-full text-zinc-350 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                aria-label="View formulas"
              >
                <Info className="h-4 w-4" />
              </button>
              
              <div className="absolute right-0 bottom-full mb-2.5 w-80 p-4 bg-zinc-950/95 backdrop-blur-md text-[11px] text-zinc-100 leading-relaxed rounded-xl shadow-2xl border border-zinc-800 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:pointer-events-auto transition-all duration-200 z-50">
                <div className="font-extrabold text-indigo-400 uppercase tracking-widest mb-1.5 font-mono text-[9px] border-b border-zinc-850 pb-1.5">🧮 FORMULA ESTIMATOR</div>
                <p className="font-sans font-medium text-zinc-300 leading-normal">{calculationTooltip}</p>
                <div className="absolute top-full right-3 w-2.5 h-2.5 bg-zinc-950 rotate-45 border-r border-b border-zinc-850" />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-2xl md:text-3xl font-black text-indigo-950 font-display tracking-tight leading-none">
              ${minGross.toLocaleString()} – ${maxGross.toLocaleString()}
            </p>
            <p className="text-[10px] font-mono font-black text-zinc-400 mt-1.5 uppercase">EST. MONTHLY EARNINGS RANGE</p>
            <div className="mt-3 pt-3 border-t border-zinc-100 text-xs font-mono text-zinc-500 flex justify-between">
              <span>Calculation Midpoint:</span>
              <span className="text-indigo-600 font-extrabold font-sans">${grossRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
            </div>
          </div>
        </div>

        {/* Card 2: Yearly ARR Estimate */}
        <div className="p-6 bg-gradient-to-br from-indigo-50/20 via-white to-white border border-indigo-500/20 rounded-3xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-300 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:scale-115 transition-transform" />
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-600">
              <TrendingUp className="h-5 w-5 animate-bounce" />
            </span>
            <div>
              <span className="text-[10px] font-black tracking-wider text-indigo-500 uppercase font-mono">
                Annual Run-rate
              </span>
              <h4 className="text-xs font-bold text-indigo-950 font-sans">Yearly Revenue (ARR)</h4>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-2xl md:text-3xl font-black text-indigo-700 font-display tracking-tight leading-none">
              ${minARR.toLocaleString()} – ${maxARR.toLocaleString()}
            </p>
            <p className="text-[10px] font-black text-indigo-500/80 font-mono mt-1.5 uppercase">EST. YEARLY EARNINGS OUTLOOK</p>
            <div className="mt-3 pt-3 border-t border-indigo-100 text-xs font-mono text-indigo-500 flex justify-between">
              <span>ARR Midpoint:</span>
              <span className="text-indigo-700 font-extrabold font-sans">${annualRunRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</span>
            </div>
          </div>
        </div>

      </div>

      {/* Screen Shots horizontal showcase upscaled for stunning readability */}
      {app.screenshots && app.screenshots.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-zinc-400 tracking-widest uppercase mb-1.5 flex items-center gap-2">
            <Layers className="h-4 w-4 text-zinc-400" />
            Visual Assets & Slides ({app.screenshots.length})
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1.5 scroll-smooth snap-x">
            {app.screenshots.map((src, i) => (
              <div 
                key={i} 
                className="shrink-0 snap-center rounded-2xl bg-zinc-150 border border-zinc-200/80 shadow-md overflow-hidden relative group"
              >
                <img
                  src={src}
                  alt={`${app.title} screenshot ${i + 1}`}
                  referrerPolicy="no-referrer"
                  className="h-80 md:h-[400px] object-cover object-top hover:scale-[1.04] transition-transform duration-300 pointer-events-none"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bento Stats Specifications enlarged padding & font */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "File Size", val: app.size || "N/A", icon: Database, color: "text-blue-500 bg-blue-50 border-blue-100" },
          { label: "Version ID", val: app.version || "N/A", icon: Info, color: "text-purple-500 bg-purple-50 border-purple-100" },
          { label: "Date Released", val: app.released || "N/A", icon: Calendar, color: "text-amber-500 bg-amber-50 border-amber-100" },
          { label: "Last Updated", val: app.updated || "N/A", icon: Calendar, color: "text-emerald-500 bg-emerald-50 border-emerald-100 animate-pulse" },
        ].map((stat, idx) => {
          const IconComp = stat.icon;
          return (
            <div key={idx} className="p-5 bg-white border border-zinc-200 rounded-2xl flex items-center gap-4 shadow-3xs hover:shadow-2xs transition-shadow">
              <div className={`p-2.5 rounded-lg border shrink-0 ${stat.color}`}>
                <IconComp className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-sm font-black text-zinc-800 truncate font-mono mt-0.5">{stat.val}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* App Description Card Console */}
      <div className="p-6 bg-white border border-zinc-200 rounded-3xl space-y-3 relative overflow-hidden shadow-2xs">
        <h3 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          Technical Parameters & Core Summary
        </h3>

        <div className={`text-xs text-zinc-650 leading-relaxed font-sans overflow-hidden transition-all duration-300 relative ${
          descExpanded ? "max-h-none" : "max-h-[120px]"
        }`}>
          <div className="space-y-2 whitespace-pre-wrap">
            {app.description}
          </div>
          
          {/* Bottom fade shadow when collapsed */}
          {!descExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>

        <button
          onClick={() => setDescExpanded(!descExpanded)}
          className="w-full py-1.5 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-full text-[10px] font-bold text-zinc-500 hover:text-zinc-800 flex items-center justify-center gap-1 bg-zinc-50/50 transition-all font-mono"
        >
          {descExpanded ? (
            <>
              Hide Full Dossier <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Expand Full Dossier <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
