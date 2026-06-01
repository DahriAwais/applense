import { 
  DollarSign, 
  HelpCircle, 
  Percent, 
  Sliders, 
  Zap, 
  Briefcase,
  Award
} from "lucide-react";
import { AppDetails } from "../types";

interface RevenueCalculatorProps {
  app: AppDetails;
  model: "freemium" | "paid" | "ads";
  setModel: (m: "freemium" | "paid" | "ads") => void;
  totalDownloads: number;
  setTotalDownloads: (v: number) => void;
  monthlyDownloads: number;
  conversionRate: number;
  setConversionRate: (v: number) => void;
  arpu: number;
  setArpu: (v: number) => void;
  appPrice: number;
  setAppPrice: (v: number) => void;
  adEcpm: number;
  setAdEcpm: (v: number) => void;
  adsPerUser: number; // Daily Impressions
  setAdsPerUser: (v: number) => void;
  activeUserRatio: number;
  setActiveUserRatio: (v: number) => void;
}

export default function RevenueCalculator({ 
  app,
  model,
  setModel,
  totalDownloads,
  setTotalDownloads,
  monthlyDownloads,
  conversionRate,
  setConversionRate,
  arpu,
  setArpu,
  appPrice,
  setAppPrice,
  adEcpm,
  setAdEcpm,
  adsPerUser,
  setAdsPerUser,
  activeUserRatio,
  setActiveUserRatio
}: RevenueCalculatorProps) {

  // Presets trigger
  const applyPreset = (type: "micro-saas" | "indie-game" | "advertised") => {
    if (type === "micro-saas") {
      setModel("freemium");
      setConversionRate(2.0); // Safe 2% industry standard
      setArpu(9.99);
    } else if (type === "indie-game") {
      setModel("paid");
      setAppPrice(4.99);
    } else if (type === "advertised") {
       setModel("ads");
       setAdEcpm(2.50);
       setAdsPerUser(3); // 3 daily impressions
       setActiveUserRatio(30); // 30% active user ratio
    }
  };

  return (
    <div className="p-7 bg-white border border-zinc-200 rounded-3xl shadow-md space-y-7" id="simulator">
      
      {/* Widget Header with enhanced size */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 font-display uppercase tracking-wider">Simulation Console Details</h3>
            <p className="text-xs font-mono text-zinc-400">Tweak parameters below to dynamically recalculate statistics at the top</p>
          </div>
        </div>
        
        <span className="text-xs font-mono bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full font-bold">
          Configurator Active
        </span>
      </div>

      {/* Model Selector tabs using elegant pill encapsulation */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-black text-zinc-450 uppercase tracking-widest font-mono">
          Monetization Model Structure
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-zinc-100 rounded-full border border-zinc-200">
          {[
            { id: "freemium", label: "Freemium SaaS" },
            { id: "paid", label: "Paid Premium" },
            { id: "ads", label: "Ad-Supported" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setModel(tab.id as any);
              }}
              className={`py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                model === tab.id
                  ? "bg-white text-zinc-900 shadow-md border border-zinc-200/50 scale-[1.02]"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Sliders Block */}
      <div className="space-y-5">
        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
          <Sliders className="h-4 w-4 text-zinc-400" />
          Active Simulators
        </h4>

        {/* 1. Total Downloads Simulated Slider */}
        <div className="space-y-3 p-5 rounded-2xl border transition-all bg-zinc-50/50 border-zinc-200">
          <div className="flex justify-between items-center text-xs font-mono flex-wrap gap-2">
            <span className="text-zinc-650 font-bold flex items-center gap-1.5">
              🚀 Total Downloads Simulated
            </span>
            <span className="text-indigo-600 font-black text-base">
              {totalDownloads.toLocaleString()} downloads
            </span>
          </div>
          
          <input
            type="range"
            min="1000"
            max="1500000000"
            step="100000"
            value={totalDownloads}
            onChange={(e) => setTotalDownloads(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer h-2 rounded-full bg-zinc-200"
          />
          
          <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-bold flex-wrap gap-2">
            <span>1,000</span>
            <span className="bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded text-indigo-700 font-black">
              Derived Runway Rate: {monthlyDownloads.toLocaleString()} installs/month
            </span>
            <span>1.5 Billion</span>
          </div>
        </div>

        {/* 2. Freemium-specific settings */}
        {model === "freemium" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl p-5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-650 font-bold">Subscription Conversion</span>
                <span className="text-indigo-600 font-black text-base">{conversionRate.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-2 rounded-full bg-zinc-200"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-bold">
                <span>0.5% (Conservative)</span>
                <span className="text-indigo-600 font-bold">Saferside target: 2.0%</span>
                <span>5.0% (Aggressive)</span>
              </div>
            </div>

            <div className="space-y-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl p-5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-650 font-bold">Average Subscription Rate ($/mo)</span>
                <span className="text-indigo-600 font-black text-base">${arpu.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.99"
                max="49.99"
                step="1"
                value={arpu}
                onChange={(e) => setArpu(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-2 rounded-full bg-zinc-200"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-bold">
                <span>$0.99</span>
                <span>Average: $9.99</span>
                <span>$49.99</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Paid App settings */}
        {model === "paid" && (
          <div className="space-y-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl p-5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-650 font-bold">Upfront Price ($ / download)</span>
              <span className="text-indigo-600 font-black text-base">${appPrice.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.99"
              max="24.99"
              step="0.50"
              value={appPrice}
              onChange={(e) => setAppPrice(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 rounded-full bg-zinc-200"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-bold">
              <span>$0.99</span>
              <span>Default model price: ${app.price.toFixed(2)}</span>
              <span>$24.99</span>
            </div>
          </div>
        )}

        {/* 4. Ad-Supported settings (Updated with explicit user formula fields) */}
        {model === "ads" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Active User Ratio */}
              <div className="space-y-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl p-5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-650 font-bold">Active User Ratio</span>
                  <span className="text-indigo-600 font-black text-base">{activeUserRatio}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={activeUserRatio}
                  onChange={(e) => setActiveUserRatio(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-2 rounded-full bg-zinc-200"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-bold">
                  <span>5%</span>
                  <span>Standard: 30%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Daily Impressions */}
              <div className="space-y-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl p-5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-650 font-bold">Daily Impressions</span>
                  <span className="text-indigo-600 font-black text-base">{adsPerUser} per user</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={adsPerUser}
                  onChange={(e) => setAdsPerUser(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-2 rounded-full bg-zinc-200"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-bold">
                  <span>1 view</span>
                  <span>Average: 3 views</span>
                  <span>15 views</span>
                </div>
              </div>

              {/* Average eCPM */}
              <div className="space-y-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl p-5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-650 font-bold">Average eCPM ($)</span>
                  <span className="text-indigo-600 font-black text-base">${adEcpm.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="15.00"
                  step="0.10"
                  value={adEcpm}
                  onChange={(e) => setAdEcpm(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-2 rounded-full bg-zinc-200"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-bold">
                  <span>$0.50</span>
                  <span>Mid: $2.50</span>
                  <span>$15.00</span>
                </div>
              </div>

            </div>

            {/* Formula display box */}
            <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-2xl text-[11px] font-mono text-indigo-850 space-y-1">
              <span className="font-extrabold uppercase text-indigo-700">📐 ACTIVE FORMULA:</span>
              <p>Estimated Monthly Ad Revenue = (Monthly Downloads * Active User Ratio * Daily Impressions * Average eCPM) / 1,000</p>
              <p className="text-zinc-450 font-bold">Current computation: ({monthlyDownloads.toLocaleString()} * {activeUserRatio}% * {adsPerUser} daily impressions * ${adEcpm.toFixed(2)}) / 1,000</p>
            </div>
          </div>
        )}

      </div>

      {/* Preset Fast Actions */}
      <div className="space-y-3 pt-2">
        <label className="text-[11px] font-black text-zinc-450 uppercase tracking-widest font-mono">
          Quick Preset Blueprints
        </label>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => applyPreset("micro-saas")}
            className="px-4 py-2 rounded-full bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-xs font-bold text-zinc-650 transition-all flex items-center gap-1.5 font-mono shadow-2xs cursor-pointer active:scale-95"
          >
            <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
            Standard Freemium App
          </button>
          <button
            type="button"
            onClick={() => applyPreset("indie-game")}
            className="px-4 py-2 rounded-full bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-xs font-bold text-zinc-650 transition-all flex items-center gap-1.5 font-mono shadow-2xs cursor-pointer active:scale-95"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Indie Premium Game
          </button>
          <button
            type="button"
            onClick={() => applyPreset("advertised")}
            className="px-4 py-2 rounded-full bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-xs font-bold text-zinc-650 transition-all flex items-center gap-1.5 font-mono shadow-2xs cursor-pointer active:scale-95"
          >
            <Award className="h-3.5 w-3.5 text-emerald-500" />
            Ad-supported Free Utility
          </button>
        </div>
      </div>

    </div>
  );
}
