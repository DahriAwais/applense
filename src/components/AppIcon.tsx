import { useState } from "react";

interface AppIconProps {
  src: string;
  title: string;
  className?: string;
}

export default function AppIcon({ src, title, className = "w-14 h-14" }: AppIconProps) {
  const [tryCount, setTryCount] = useState(0); // 0 = primary (clearbit), 1 = backup (google favicon), 2 = initials
  const [isLoading, setIsLoading] = useState(true);

  // Clean initials matching brand representation
  const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, "");
  const words = cleanTitle.trim().split(/\s+/).filter(Boolean);
  const initials = words.length > 0 
    ? (words[0][0] + (words[1] ? words[1][0] : "")).toUpperCase() 
    : "AP";

  const getDomain = () => {
    try {
      if (src.includes("clearbit.com/")) {
        return src.split("clearbit.com/")[1];
      }
      const urlObj = new URL(src);
      return urlObj.hostname;
    } catch {
      const mapping: Record<string, string> = {
        "google one": "one.google.com",
        "tiktok": "tiktok.com",
        "chatgpt": "openai.com",
        "capcut": "capcut.com",
        "claude": "anthropic.com",
        "discord": "discord.com",
        "facebook": "facebook.com",
        "snapchat": "snapchat.com",
        "instagram": "instagram.com",
        "notion": "notion.so",
        "spotify": "spotify.com",
        "duolingo": "duolingo.com",
        "canva": "canva.com",
        "tinder": "tinder.com",
        "netflix": "netflix.com",
        "airbnb": "airbnb.com",
        "zoom": "zoom.us",
        "slack": "slack.com",
        "uber": "uber.com",
        "headspace": "headspace.com",
        "calm": "calm.com",
        "adobe lightroom": "adobe.com",
        "strava": "strava.com",
        "figma": "figma.com",
        "robinhood": "robinhood.com",
        "duet display": "duetdisplay.com",
        "x - twitter": "x.com",
        "youtube": "youtube.com",
        "whatsapp": "whatsapp.com",
        "telegram": "telegram.org",
        "pinterest": "pinterest.com",
        "google drive": "drive.google.com",
        "microsoft teams": "teams.microsoft.com",
        "roblox": "roblox.com",
        "github": "github.com",
      };
      
      const key = title.toLowerCase();
      const matched = Object.keys(mapping).find(k => key.includes(k));
      return matched ? mapping[matched] : "google.com";
    }
  };

  // Color map for highly distinct corporate setups
  const getBrandPalette = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("notion")) return { bg: "bg-zinc-950", text: "text-zinc-100", border: "border-zinc-800" };
    if (lowerName.includes("spotify")) return { bg: "bg-[#1DB954]", text: "text-black", border: "border-[#1ed760]" };
    if (lowerName.includes("duolingo")) return { bg: "bg-[#58CC02]", text: "text-white", border: "border-[#46a302]" };
    if (lowerName.includes("procreate")) return { bg: "bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400", text: "text-white", border: "border-pink-300" };
    if (lowerName.includes("canva")) return { bg: "bg-indigo-650", text: "text-white", border: "border-indigo-400" };
    if (lowerName.includes("wordle") || lowerName.includes("nytimes")) return { bg: "bg-zinc-900", text: "text-white", border: "border-zinc-800" };
    if (lowerName.includes("minecraft")) return { bg: "bg-emerald-950", text: "text-amber-500", border: "border-stone-700" };
    if (lowerName.includes("tinder")) return { bg: "bg-gradient-to-tr from-rose-500 to-orange-400", text: "text-white", border: "border-rose-400" };
    if (lowerName.includes("netflix")) return { bg: "bg-red-950", text: "text-[#E50914]", border: "border-red-900" };
    if (lowerName.includes("airbnb")) return { bg: "bg-[#FF5A5F]", text: "text-white", border: "border-[#FF5A5F]" };
    if (lowerName.includes("zoom")) return { bg: "bg-blue-600", text: "text-white", border: "border-blue-500" };
    if (lowerName.includes("slack")) return { bg: "bg-[#4A154B]", text: "text-white", border: "border-[#611f69]" };
    if (lowerName.includes("discord")) return { bg: "bg-[#5865F2]", text: "text-white", border: "border-[#404eed]" };
    if (lowerName.includes("uber")) return { bg: "bg-black", text: "text-white", border: "border-zinc-800" };
    if (lowerName.includes("tiktok")) return { bg: "bg-stone-900", text: "text-[#25F4EE]", border: "border-stone-950" };
    if (lowerName.includes("headspace")) return { bg: "bg-orange-500", text: "text-white", border: "border-orange-400" };
    if (lowerName.includes("calm")) return { bg: "bg-sky-400", text: "text-white", border: "border-sky-300" };
    if (lowerName.includes("adobe") || lowerName.includes("lightroom")) return { bg: "bg-red-650", text: "text-white", border: "border-red-500" };
    if (lowerName.includes("strava")) return { bg: "bg-orange-600", text: "text-white", border: "border-orange-500" };
    if (lowerName.includes("figma")) return { bg: "bg-zinc-900", text: "text-orange-500", border: "border-stone-700" };
    if (lowerName.includes("robinhood")) return { bg: "bg-[#00C805]", text: "text-black", border: "border-emerald-500" };
    if (lowerName.includes("duet")) return { bg: "bg-sky-500", text: "text-white", border: "border-sky-450" };
    if (lowerName.includes("google") || lowerName.includes("drive")) return { bg: "bg-blue-600", text: "text-white", border: "border-blue-500" };
    if (lowerName.includes("microsoft") || lowerName.includes("teams")) return { bg: "bg-indigo-700", text: "text-white", border: "border-indigo-650" };
    if (lowerName.includes("roblox")) return { bg: "bg-red-700", text: "text-white", border: "border-red-600" };
    if (lowerName.includes("github")) return { bg: "bg-[#24292e]", text: "text-white", border: "border-zinc-700" };
    if (lowerName.includes("capcut")) return { bg: "bg-indigo-900", text: "text-[#00F2FE]", border: "border-indigo-950" };

    return { bg: "bg-gradient-to-br from-indigo-500 to-purple-650", text: "text-white", border: "border-indigo-400" };
  };

  const palette = getBrandPalette(title);
  const domain = getDomain();

  const handleImageError = () => {
    if (tryCount === 0) {
      // Transition to backup
      setTryCount(1);
    } else {
      // Transition to initials fallback
      setTryCount(2);
    }
  };

  const currentImgSrc = tryCount === 0 
    ? src 
    : tryCount === 1 
      ? `https://www.google.com/s2/favicons?sz=128&domain=${domain}`
      : "";

  return (
    <div className={`relative shrink-0 select-none overflow-hidden rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${className} ${palette.bg} ${palette.border} shadow-sm`}>
      {/* Actual Image Attempt */}
      {tryCount < 2 && (
        <img
          src={currentImgSrc}
          alt={title}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoading(false)}
          onError={handleImageError}
          className={`absolute inset-0 w-full h-full object-cover rounded-2xl bg-white transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        />
      )}

      {/* SVG Pattern or Initials fallback */}
      {(tryCount === 2 || isLoading) && (
        <span className={`text-base font-extrabold tracking-wider font-mono select-none pointer-events-none uppercase ${palette.text}`}>
          {initials}
        </span>
      )}
    </div>
  );
}
