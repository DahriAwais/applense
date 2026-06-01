export interface SearchedApp {
  id: string;
  appId: string;
  title: string;
  icon: string;
  developer: string;
  price: number;
  priceText: string;
  score: number;
  scoreText: string;
  genre: string;
  screenshots: string[];
  store: "play" | "apple";
  estimatedDownloads?: number;
  url: string;
  defaultModel?: "freemium" | "paid" | "ads";
}

export interface AppDetails extends SearchedApp {
  developerUrl?: string;
  reviewsCount: number;
  description: string;
  size: string;
  version: string;
  released: string;
  updated: string;
  installsText: string;
  derivedDownloads: number;
  monthlyDownloads: number;
}

export interface RevenueCalculation {
  model: "freemium" | "paid" | "ads";
  monthlyDownloads: number;
  conversionRate: number; // For subscription / freemium: converted payers percentage (e.g., 2 = 2%)
  arpu: number; // monthly premium fee or ad impressions per user
  appPrice: number; // for paid model
  adEcpm: number; // for ad model
  viewsPerUser: number; // average ads watched per active user per month
  storeCut: number; // percentage of cut, e.g. 15 for 15%, 30 for 30%
}
