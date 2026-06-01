import React, { useState } from "react";
import { Search, Apple, Play, AlertCircle, RefreshCw } from "lucide-react";
import { SearchedApp } from "../types";
import { motion } from "motion/react";
import AppIcon from "./AppIcon";

interface SearchPanelProps {
  onSelectApp: (appId: string, store: "play" | "apple") => void;
  selectedAppId: string | null;
}

export default function SearchPanel({ onSelectApp, selectedAppId }: SearchPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState<"all" | "play" | "apple">("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchedApp[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent, directTerm?: string, forceStore?: "all" | "play" | "apple") => {
    if (e) e.preventDefault();
    const termToSearch = (directTerm !== undefined ? directTerm : searchTerm).trim();
    if (!termToSearch) return;

    // Synchronize input value if launched from recommendation click
    if (directTerm !== undefined) {
      setSearchTerm(directTerm);
    }

    setLoading(true);
    setError(null);

    const activeStore = forceStore || storeFilter;

    try {
      const response = await fetch(`/api/search?term=${encodeURIComponent(termToSearch)}&store=${activeStore}`);
      if (!response.ok) {
        throw new Error("Failed to search app stores");
      }
      const data = await response.json();
      setResults(data.results || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  };

  // Perform a default initial search with a highly generic, premium app category so the list remains populated with standard options,
  // but without pre-filling "todo" in the search input element, giving the user complete ownership of their input.
  React.useEffect(() => {
    handleSearch(undefined, "music");
  }, []);

  const handleStoreChange = (newStore: "all" | "play" | "apple") => {
    setStoreFilter(newStore);
    if (searchTerm.trim() || results.length > 0) {
      handleSearch(undefined, searchTerm.trim() || undefined, newStore);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Search Header panel */}
      <div className="p-5 border-b border-zinc-200 bg-zinc-50/70 backdrop-blur-sm">
        <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-display mb-3">
          App Store Discovery Engine
        </h2>
        <form onSubmit={(e) => handleSearch(e)} className="space-y-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search apps (e.g. Flight, Tasks)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-100 border border-transparent text-zinc-800 placeholder-zinc-400 rounded-full py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-400 transition-all font-sans"
            />
          </div>

          {/* Store Toggles styled in a geometric capsule pill */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-full border border-zinc-200">
            {(["all", "play", "apple"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => handleStoreChange(filter)}
                className={`py-1.5 text-[10px] font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  storeFilter === filter
                    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/50"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {filter === "all" && "All Stores"}
                {filter === "play" && (
                  <>
                    <Play className="h-2.5 w-2.5 text-emerald-500 fill-emerald-500/10" />
                    Android
                  </>
                )}
                {filter === "apple" && (
                  <>
                    <Apple className="h-2.5 w-2.5 text-indigo-600" />
                    iOS
                  </>
                )}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-100 disabled:text-zinc-400 text-white font-bold text-xs rounded-full transition-all tracking-wider uppercase flex items-center justify-center gap-1.5 font-display shadow-md shadow-indigo-100 border border-transparent hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Retrieving Metadata...
              </>
            ) : (
              "Match & Analyze App"
            )}
          </button>
        </form>
      </div>

      {/* Results Workspace */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Popular Category Suggestion Pills */}
        <div className="space-y-1.5 bg-zinc-50 border border-zinc-150 p-3 rounded-2xl">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono block">
            🚀 Popular SaaS Preset Queries
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { query: "notion", label: "Notion" },
              { query: "spotify", label: "Spotify" },
              { query: "scanner", label: "Scanner" },
              { query: "vpn", label: "VPN" },
              { query: "habits", label: "Habits" },
              { query: "billing", label: "Billing" }
            ].map((tag) => (
              <button
                key={tag.query}
                type="button"
                onClick={() => handleSearch(undefined, tag.query)}
                className="px-2.5 py-1 rounded-full bg-white border border-zinc-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-[10px] font-bold text-zinc-650 transition-all font-sans cursor-pointer whitespace-nowrap active:scale-95"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {loading && results.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Querying App Stores API...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>Network Lookup Failure</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-sans">{error}</p>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="py-12 border border-dashed border-zinc-250 rounded-2xl text-center space-y-4 p-4">
            <div>
              <p className="text-sm font-semibold text-zinc-700">No Apps Displayed</p>
              <p className="text-[11px] text-zinc-400 font-mono mt-1">Please type an app name or choose a category below:</p>
            </div>
            
            <div className="flex flex-col gap-1.5 max-w-[200px] mx-auto pt-2">
              {[
                { query: "fitness", label: "🏋️ Fitness Coach" },
                { query: "budget", label: "💰 Budget & Finance" },
                { query: "todo", label: "📝 Todo Lists" },
                { query: "editor", label: "✂️ Video Editor" }
              ].map((rec) => (
                <button
                  key={rec.query}
                  type="button"
                  onClick={() => handleSearch(undefined, rec.query)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-zinc-50 hover:bg-indigo-50 hover:text-indigo-600 border border-zinc-200 text-xs font-semibold text-zinc-700 transition-all cursor-pointer"
                >
                  {rec.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {results.map((app) => {
          const isSelected = selectedAppId === app.appId;
          return (
            <motion.div
              layoutId={`card-${app.appId}`}
              key={`${app.store}-${app.appId}`}
              onClick={() => onSelectApp(app.appId, app.store)}
              className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex gap-4 group relative overflow-hidden ${
                isSelected
                  ? "bg-indigo-50/80 border-indigo-200 hover:bg-indigo-50 shadow-xs"
                  : "bg-white border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50"
              }`}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Highlight bar */}
              {isSelected && (
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-indigo-600" />
              )}

              {/* App Icon using AppIcon component */}
              <div className="relative shrink-0">
                <AppIcon
                  src={app.icon}
                  title={app.title}
                  className="w-16 h-16"
                />

                {/* Store badge overlay inside Geometric capsule */}
                <div className="absolute -bottom-1 -right-1 p-1 bg-white border border-zinc-200 rounded-md shadow-md">
                  {app.store === "play" ? (
                    <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/10" />
                  ) : (
                    <Apple className="h-3.5 w-3.5 text-indigo-600" />
                  )}
                </div>
              </div>

              {/* app description info upscaled */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <h3 className={`text-sm font-black truncate transition-colors leading-snug ${
                    isSelected ? "text-indigo-950" : "text-zinc-800 group-hover:text-indigo-600"
                  }`}>
                    {app.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium truncate">
                    by {app.developer}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-500">
                    {app.genre}
                  </span>
                  
                  <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-2xs">
                    {app.priceText}
                  </span>

                  {app.score > 0 && (
                    <span className="text-[10px] font-extrabold font-mono text-amber-500 flex items-center gap-0.5 ml-auto">
                      ★ {app.scoreText}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
