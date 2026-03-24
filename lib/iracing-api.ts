import crypto from "crypto";
import type {
  Category,
  DriverSearchResult,
  DriverData,
  CategoryStats,
  RecentRace,
  ChartDataPoint,
} from "./types";
import {
  searchMockDrivers,
  getMockDriverData,
} from "./mock-data";

// ---------------------------------------------------------------------------
// OAuth2 Password Limited Grant – iRacing Data API
// ---------------------------------------------------------------------------

const OAUTH_URL = "https://oauth.iracing.com/oauth2/token";
const DATA_URL = "https://members-ng.iracing.com";

// Token storage (module-level singleton in the Node process)
let accessToken: string | null = null;
let tokenExpiresAt = 0;
let refreshTokenValue: string | null = null;

/**
 * Secret masking per iRacing spec:
 * Base64( SHA-256( secret + lowercase(identifier) ) )
 */
function maskSecret(secret: string, identifier: string): string {
  return crypto
    .createHash("sha256")
    .update(secret + identifier.toLowerCase())
    .digest("base64");
}

async function authenticate(): Promise<void> {
  const clientId = process.env.IRACING_CLIENT_ID!;
  const clientSecret = process.env.IRACING_CLIENT_SECRET!;
  const email = process.env.IRACING_EMAIL!;
  const password = process.env.IRACING_PASSWORD!;

  const maskedSecret = maskSecret(clientSecret, clientId);
  const maskedPassword = maskSecret(password, email);

  const body = new URLSearchParams({
    grant_type: "password_limited",
    client_id: clientId,
    client_secret: maskedSecret,
    username: email,
    password: maskedPassword,
    scope: "iracing.auth",
  });

  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OAuth auth failed: ${res.status} – ${text}`);
  }

  const data = await res.json();
  accessToken = data.access_token;
  refreshTokenValue = data.refresh_token || null;
  tokenExpiresAt = Date.now() + (data.expires_in - 30) * 1000;
}

async function refreshAuth(): Promise<void> {
  if (!refreshTokenValue) return authenticate();

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshTokenValue,
    client_id: process.env.IRACING_CLIENT_ID!,
    client_secret: maskSecret(
      process.env.IRACING_CLIENT_SECRET!,
      process.env.IRACING_CLIENT_ID!,
    ),
  });

  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) return authenticate(); // fallback to full auth

  const data = await res.json();
  accessToken = data.access_token;
  refreshTokenValue = data.refresh_token || refreshTokenValue;
  tokenExpiresAt = Date.now() + (data.expires_in - 30) * 1000;
}

async function ensureAuth(): Promise<void> {
  if (!accessToken || Date.now() >= tokenExpiresAt) {
    if (refreshTokenValue) await refreshAuth();
    else await authenticate();
  }
}

/**
 * Authenticated fetch against the iRacing Data API.
 * Automatically follows S3 redirect links.
 */
async function iracingFetch<T>(path: string): Promise<T> {
  await ensureAuth();

  let res = await fetch(`${DATA_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // Retry once on 401
  if (res.status === 401) {
    await authenticate();
    res = await fetch(`${DATA_URL}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  if (!res.ok) {
    throw new Error(`iRacing API error: ${res.status} on ${path}`);
  }

  const json = await res.json();

  // The Data API returns { link: "https://...s3..." } for large payloads
  if (json.link) {
    const dataRes = await fetch(json.link);
    if (!dataRes.ok) throw new Error(`S3 fetch failed: ${dataRes.status}`);
    return dataRes.json();
  }

  return json as T;
}

// ---------------------------------------------------------------------------
// iRacing category IDs
// ---------------------------------------------------------------------------

const CATEGORY_IDS: Record<Category, number> = {
  road: 2,
  oval: 1,
  dirt_road: 4,
  dirt_oval: 3,
};

const CATEGORY_FROM_ID: Record<number, Category> = {
  1: "oval",
  2: "road",
  3: "dirt_oval",
  4: "dirt_road",
};

// ---------------------------------------------------------------------------
// Live helpers – transform raw API responses to our types
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

function parseLicense(raw: any): string {
  if (!raw) return "R 0.00";
  const classLetter =
    raw.group_name?.charAt(0) ??
    ["R", "D", "C", "B", "A", "P", "W"][raw.group_id] ??
    "R";
  const sr =
    typeof raw.safety_rating === "number"
      ? raw.safety_rating.toFixed(2)
      : "0.00";
  return `${classLetter} ${sr}`;
}

function buildCategoryStats(
  career: any[],
  memberInfo: any,
): CategoryStats[] {
  const stats: CategoryStats[] = [];

  for (const [cat, catId] of Object.entries(CATEGORY_IDS)) {
    const careerCat = career?.find((c: any) => c.category_id === catId);
    const license = memberInfo?.licenses?.find(
      (l: any) => l.category_id === catId,
    );

    stats.push({
      category: cat as Category,
      iRating: license?.irating ?? 0,
      safetyRating: license?.safety_rating ?? 0,
      license: parseLicense(license),
      starts: careerCat?.starts ?? 0,
      wins: careerCat?.wins ?? 0,
      top5: careerCat?.top5 ?? 0,
      avgFinish: careerCat?.avg_finish ?? 0,
      incidents: careerCat?.incidents ?? 0,
      lapsLed: careerCat?.laps_led ?? 0,
    });
  }

  return stats;
}

function buildRecentRaces(raw: any[]): RecentRace[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 20).map((r: any) => ({
    sessionId: r.subsession_id ?? r.session_id ?? 0,
    seriesName: r.series_name ?? "Unknown Series",
    trackName: r.track?.track_name ?? r.track_name ?? "Unknown Track",
    date: r.session_start_time ?? r.start_time ?? "",
    startPosition: r.start_position ?? 0,
    finishPosition: r.finish_position ?? 0,
    incidents: r.incidents ?? 0,
    iRatingChange: r.newi_rating != null && r.oldi_rating != null
      ? r.newi_rating - r.oldi_rating
      : 0,
    category: CATEGORY_FROM_ID[r.category_id] ?? "road",
  }));
}

function buildChartData(
  rawChartMap: Record<Category, any>,
): Record<Category, ChartDataPoint[]> {
  const result = {} as Record<Category, ChartDataPoint[]>;

  for (const cat of Object.keys(CATEGORY_IDS) as Category[]) {
    const raw = rawChartMap[cat];
    if (Array.isArray(raw?.data)) {
      result[cat] = raw.data.map((p: any) => ({
        date: p.when ?? p.x ?? "",
        value: p.value ?? p.y ?? 0,
      }));
    } else {
      result[cat] = [];
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Live API calls
// ---------------------------------------------------------------------------

async function getMemberProfile(custId: number) {
  return iracingFetch<any>(`/data/member/profile?cust_id=${custId}`);
}

async function getMemberSummary(custId: number) {
  return iracingFetch<any>(`/data/stats/member_summary?cust_id=${custId}`);
}

async function getMemberCareer(custId: number) {
  return iracingFetch<any>(`/data/stats/member_career?cust_id=${custId}`);
}

async function getMemberRecentRaces(custId: number) {
  return iracingFetch<any>(`/data/stats/member_recent_races?cust_id=${custId}`);
}

async function getChartData(custId: number, categoryId: number) {
  return iracingFetch<any>(
    `/data/member/chart_data?cust_id=${custId}&chart_type=1&category_id=${categoryId}`,
  );
}

// ---------------------------------------------------------------------------
// Public exports – mock vs live mode switch
// ---------------------------------------------------------------------------

const useMock = process.env.USE_MOCK_DATA !== "false";

export async function searchDrivers(
  term: string,
): Promise<DriverSearchResult[]> {
  if (useMock) {
    return searchMockDrivers(term);
  }

  // Live: use the iRacing lookup endpoint
  const data = await iracingFetch<any>(
    `/data/lookup/drivers?search_term=${encodeURIComponent(term)}&league_id=0`,
  );

  if (!Array.isArray(data)) return [];

  return data.map((d: any) => ({
    custId: d.cust_id,
    displayName: d.display_name ?? `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim(),
  }));
}

export async function getDriverData(
  custId: number,
): Promise<DriverData | null> {
  if (useMock) {
    return getMockDriverData(custId);
  }

  // Live: fetch everything in parallel
  const [
    profileResult,
    summaryResult,
    careerResult,
    recentResult,
    chartRoadResult,
    chartOvalResult,
    chartDirtRoadResult,
    chartDirtOvalResult,
  ] = await Promise.allSettled([
    getMemberProfile(custId),
    getMemberSummary(custId),
    getMemberCareer(custId),
    getMemberRecentRaces(custId),
    getChartData(custId, CATEGORY_IDS.road),
    getChartData(custId, CATEGORY_IDS.oval),
    getChartData(custId, CATEGORY_IDS.dirt_road),
    getChartData(custId, CATEGORY_IDS.dirt_oval),
  ]);

  const profile =
    profileResult.status === "fulfilled" ? profileResult.value : null;
  if (!profile) return null;

  const summary =
    summaryResult.status === "fulfilled" ? summaryResult.value : null;
  const career =
    careerResult.status === "fulfilled" ? careerResult.value : null;
  const recent =
    recentResult.status === "fulfilled" ? recentResult.value : null;

  const chartRaw = {
    road:
      chartRoadResult.status === "fulfilled" ? chartRoadResult.value : null,
    oval:
      chartOvalResult.status === "fulfilled" ? chartOvalResult.value : null,
    dirt_road:
      chartDirtRoadResult.status === "fulfilled"
        ? chartDirtRoadResult.value
        : null,
    dirt_oval:
      chartDirtOvalResult.status === "fulfilled"
        ? chartDirtOvalResult.value
        : null,
  };

  const memberInfo = profile.members?.[0] ?? profile;

  return {
    profile: {
      custId: memberInfo.cust_id ?? custId,
      displayName:
        memberInfo.display_name ??
        `${memberInfo.first_name ?? ""} ${memberInfo.last_name ?? ""}`.trim(),
      memberSince: memberInfo.member_since ?? "",
      clubName: memberInfo.club_name ?? "",
      countryCode: memberInfo.country_code ?? memberInfo.country ?? "",
    },
    stats: buildCategoryStats(
      Array.isArray(career?.stats) ? career.stats : career ?? [],
      memberInfo,
    ),
    recentRaces: buildRecentRaces(
      Array.isArray(recent?.races) ? recent.races : recent ?? [],
    ),
    chartData: buildChartData(chartRaw),
  };
}
