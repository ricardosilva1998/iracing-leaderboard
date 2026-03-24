export type Category = "road" | "oval" | "dirt_road" | "dirt_oval";

export interface DriverSearchResult {
  custId: number;
  displayName: string;
}

export interface DriverProfile {
  custId: number;
  displayName: string;
  memberSince: string;
  clubName: string;
  countryCode: string;
}

export interface CategoryStats {
  category: Category;
  iRating: number;
  safetyRating: number;
  license: string;
  starts: number;
  wins: number;
  top5: number;
  avgFinish: number;
  incidents: number;
  lapsLed: number;
}

export interface RecentRace {
  sessionId: number;
  seriesName: string;
  trackName: string;
  date: string;
  startPosition: number;
  finishPosition: number;
  incidents: number;
  iRatingChange: number;
  category: Category;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface DriverData {
  profile: DriverProfile;
  stats: CategoryStats[];
  recentRaces: RecentRace[];
  chartData: Record<Category, ChartDataPoint[]>;
}

export interface LeaderboardEntry {
  custId: number;
  displayName: string;
  iRating: number;
  safetyRating: number;
  license: string;
  countryCode: string;
}

export interface LeaderboardResponse {
  drivers: LeaderboardEntry[];
  total: number;
}
