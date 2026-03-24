import type {
  Category,
  DriverSearchResult,
  DriverData,
  DriverProfile,
  CategoryStats,
  RecentRace,
  ChartDataPoint,
  LeaderboardEntry,
  LeaderboardResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Deterministic pseudo-random number generator (simple mulberry32)
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRng(seed: number) {
  const next = mulberry32(seed);
  return {
    /** Float in [0, 1) */
    random: next,
    /** Integer in [min, max] inclusive */
    int(min: number, max: number) {
      return Math.floor(next() * (max - min + 1)) + min;
    },
    /** Float in [min, max) */
    float(min: number, max: number) {
      return next() * (max - min) + min;
    },
    /** Pick one element from an array */
    pick<T>(arr: T[]): T {
      return arr[Math.floor(next() * arr.length)];
    },
  };
}

// ---------------------------------------------------------------------------
// Name pools
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  "Aiden", "Alejandro", "Alex", "Andre", "Antonio", "Ben", "Brandon",
  "Bruno", "Carlos", "Chad", "Charles", "Chris", "Christian", "Cole",
  "Connor", "Dale", "Daniel", "Danny", "David", "Diego", "Dillon",
  "Dominik", "Dylan", "Eduardo", "Elijah", "Erik", "Ethan", "Felipe",
  "Fernando", "Gabriel", "Garrett", "George", "Giovanni", "Greg",
  "Gustavo", "Hans", "Harrison", "Henrik", "Hugo", "Hunter", "Isaac",
  "Jack", "Jacob", "Jake", "James", "Jared", "Jason", "Jayden",
  "Jesse", "Jimmy", "Joey", "Johan", "John", "Jordan", "Jorge",
  "Jose", "Joshua", "Juan", "Julian", "Justin", "Kalle", "Karl",
  "Keegan", "Keith", "Kevin", "Kyle", "Lance", "Lando", "Lars",
  "Leo", "Lewis", "Liam", "Logan", "Lorenzo", "Lucas", "Luis",
  "Luke", "Marco", "Marcus", "Mario", "Mark", "Martin", "Mateo",
  "Matt", "Max", "Michael", "Miguel", "Nico", "Noah", "Oliver",
  "Oscar", "Owen", "Pablo", "Patrick", "Pedro", "Rafael", "Randy",
  "Raphael", "Ricardo", "Riley", "Robert", "Ross", "Ryan", "Sam",
  "Santiago", "Scott", "Sebastian", "Shane", "Stefan", "Takumi",
  "Tanner", "Thomas", "Tim", "Tobias", "Tony", "Travis", "Trevor",
  "Tyler", "Victor", "Vince", "William", "Wyatt", "Xavier", "Yuki",
  "Zach",
];

const LAST_NAMES = [
  "Alonso", "Anderson", "Bailey", "Baker", "Barrichello", "Bell",
  "Bennett", "Berg", "Bianchi", "Bishop", "Black", "Bottas", "Brooks",
  "Brown", "Burton", "Campbell", "Carter", "Clark", "Cole", "Collins",
  "Cooper", "Cruz", "Davidson", "Davis", "Dixon", "Duval", "Edwards",
  "Eriksson", "Evans", "Fernandez", "Fischer", "Fisher", "Foster",
  "Garcia", "Gonzalez", "Gordon", "Grant", "Gray", "Green", "Grosjean",
  "Hamilton", "Hansen", "Harper", "Harris", "Hart", "Hartley",
  "Henderson", "Hernandez", "Hill", "Hoffman", "Hughes", "Hunter",
  "Jackson", "Jensen", "Johnson", "Jones", "King", "Klein", "Knight",
  "Kovalainen", "Lambert", "Larsson", "Lee", "Lewis", "Lopez",
  "Martinez", "Mason", "Matsuda", "Meyer", "Miller", "Mitchell",
  "Monroe", "Moore", "Morgan", "Morris", "Mueller", "Murphy", "Murray",
  "Nakamura", "Nelson", "Norris", "O'Brien", "Olsen", "Palmer",
  "Parker", "Patel", "Patterson", "Perez", "Perry", "Peters",
  "Petersen", "Phillips", "Price", "Quinn", "Raikkonen", "Reed",
  "Reynolds", "Richardson", "Riley", "Rivera", "Robinson", "Rodriguez",
  "Rossi", "Russell", "Sainz", "Sanchez", "Santos", "Sato",
  "Schmidt", "Schneider", "Scott", "Silva", "Smith", "Spengler",
  "Stewart", "Sullivan", "Suzuki", "Taylor", "Thomas", "Thompson",
  "Turner", "Vandoorne", "Verstappen", "Wagner", "Walker", "Ward",
  "Watson", "Weber", "White", "Williams", "Wilson", "Wood", "Wright",
  "Young", "Zimmerman",
];

const CLUBS = [
  "Centropolis", "Carolina", "Connecticut", "DE-AT-CH", "Florida",
  "Georgia", "Great Plains", "Hispanoamerica", "Illinois", "Indiana",
  "International", "Michigan", "Mid-South", "MidWest", "New England",
  "New Jersey", "New York", "Northwest", "Ohio", "Pennsylvania",
  "Scandinavia", "SoCal", "South America", "Texas", "UK and Ireland",
  "Virginias", "West",
];

const COUNTRY_CODES = [
  "US", "US", "US", "US", "US", "US",
  "GB", "GB", "DE", "DE", "BR", "BR",
  "NL", "FI", "ES", "MX", "FR", "IT",
  "AU", "JP", "CA", "SE", "NO", "PT",
  "AR", "CL", "BE", "AT", "NZ", "PL",
];

const ROAD_SERIES = [
  "VRS GT Sprint Series",
  "IMSA Hagerty SportsCar Championship",
  "Ferrari GT3 Challenge",
  "Porsche Cup by Coach Dave Academy",
  "GT3 Fanatec Challenge",
  "Formula A - Grand Prix Series",
  "iRacing Formula 4",
  "Production Car Sim-Lab Challenge",
  "Global Mazda MX-5 Fanatec Cup",
  "Radical Racing Challenge",
  "LMP2 Prototype Challenge",
  "GT4 Falken Tyre Challenge",
  "Formula C - FIA F3",
  "Touring Car Turn Racing Challenge",
  "ESS European Sprint Series",
];

const OVAL_SERIES = [
  "NASCAR Cup Series",
  "NASCAR Xfinity Series",
  "NASCAR Truck Series",
  "ARCA Menards Series",
  "Gen 4 Cup Fixed",
  "Late Model Stock Tour",
  "Street Stock Fanatec Series",
  "Super Late Model Series",
  "IndyCar Series - Oval",
  "Silver Crown Series",
  "Legends Series",
  "Carburetor Cup",
];

const DIRT_ROAD_SERIES = [
  "iRacing Rallycross Series",
  "Pro 2 Lite Off Road Racing Series",
  "Pro 4 Off Road Racing Series",
  "Dirt Road Pro Truck Series",
  "Lucas Oil Off Road Series",
];

const DIRT_OVAL_SERIES = [
  "World of Outlaws Sprint Car Series",
  "DIRTcar 358 Modified Series",
  "USAC Sprint Car Series",
  "DIRTcar Pro Late Model Series",
  "Dirt Legends Series",
  "DIRTcar Limited Late Model Series",
  "Dirt Midget Cup",
  "Sprint Car Cup",
];

const ROAD_TRACKS = [
  "Spa-Francorchamps", "Monza", "Suzuka", "Nurburgring GP",
  "Silverstone", "Watkins Glen", "Road America", "Laguna Seca",
  "Circuit of the Americas", "Barcelona", "Imola", "Mount Panorama",
  "Interlagos", "Brands Hatch", "Hockenheimring", "Hungaroring",
  "Sebring", "Daytona Road Course", "Long Beach", "Red Bull Ring",
  "Zandvoort", "Snetterton", "Oulton Park", "Donington Park",
  "Phillip Island", "Fuji Speedway", "Okayama", "Tsukuba",
];

const OVAL_TRACKS = [
  "Daytona International Speedway", "Talladega Superspeedway",
  "Charlotte Motor Speedway", "Texas Motor Speedway",
  "Bristol Motor Speedway", "Martinsville Speedway",
  "Richmond Raceway", "Las Vegas Motor Speedway",
  "Kansas Speedway", "Michigan International Speedway",
  "Indianapolis Motor Speedway", "Pocono Raceway",
  "Atlanta Motor Speedway", "Darlington Raceway",
  "Dover Motor Speedway", "Phoenix Raceway",
  "Homestead-Miami Speedway", "Auto Club Speedway",
  "Iowa Speedway", "New Hampshire Motor Speedway",
];

const DIRT_ROAD_TRACKS = [
  "Crandon International Raceway", "Wild West Motorsports Park",
  "Wild Horse Pass Motorsports Park", "Bark River International Raceway",
  "Lucas Oil Raceway - Off Road", "Daytona Rallycross",
  "Phoenix Raceway - Rallycross", "Atlanta Motor Speedway - Rallycross",
];

const DIRT_OVAL_TRACKS = [
  "Knoxville Raceway", "Eldora Speedway", "Williams Grove Speedway",
  "Volusia Speedway Park", "Cedar Lake Speedway", "Kokomo Speedway",
  "Limaland Motorsports Park", "Lernerville Speedway",
  "The Dirt Track at Charlotte", "Fairbury Speedway",
  "Weedsport Speedway", "Port Royal Speedway",
  "Lanier National Speedway - Dirt", "USA International Speedway - Dirt",
];

// ---------------------------------------------------------------------------
// Driver generation
// ---------------------------------------------------------------------------

const DRIVER_COUNT = 150;
const BASE_CUST_ID = 100000;

interface InternalDriver {
  custId: number;
  displayName: string;
  memberSince: string;
  clubName: string;
  countryCode: string;
  /** 0 = road-focused, 1 = oval-focused, 2 = dirt_road, 3 = dirt_oval, 4 = allrounder */
  specialty: number;
  /** Base skill 0-1 (higher = more talented) */
  skill: number;
}

function generateDrivers(): InternalDriver[] {
  const drivers: InternalDriver[] = [];
  const usedNames = new Set<string>();
  const rng = seededRng(42);

  for (let i = 0; i < DRIVER_COUNT; i++) {
    const custId = BASE_CUST_ID + i;
    let name: string;
    do {
      name = `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    // Skill distribution: mostly mid-range, few elites, some rookies
    let skill: number;
    const roll = rng.random();
    if (roll < 0.03) {
      // top elite (3%)
      skill = rng.float(0.88, 1.0);
    } else if (roll < 0.12) {
      // very good (9%)
      skill = rng.float(0.72, 0.88);
    } else if (roll < 0.35) {
      // above average (23%)
      skill = rng.float(0.50, 0.72);
    } else if (roll < 0.75) {
      // average (40%)
      skill = rng.float(0.25, 0.50);
    } else {
      // below average / rookies (25%)
      skill = rng.float(0.0, 0.25);
    }

    const memberYear = rng.int(2008, 2025);
    const memberMonth = rng.int(1, 12);
    const memberSince = `${memberYear}-${String(memberMonth).padStart(2, "0")}-01`;

    drivers.push({
      custId,
      displayName: name,
      memberSince,
      clubName: rng.pick(CLUBS),
      countryCode: rng.pick(COUNTRY_CODES),
      specialty: rng.int(0, 4),
      skill,
    });
  }

  return drivers;
}

const ALL_DRIVERS = generateDrivers();

// ---------------------------------------------------------------------------
// Stat derivation helpers
// ---------------------------------------------------------------------------

function skillToIRating(skill: number, isFocus: boolean, rng: ReturnType<typeof seededRng>): number {
  // Base curve: skill 0->~1000, 0.5->~2500, 1.0->~11000
  const base = 800 + skill * skill * 10200;
  const jitter = rng.float(-200, 200);
  const focusBonus = isFocus ? rng.float(200, 600) : rng.float(-400, 0);
  return Math.max(600, Math.round(base + jitter + focusBonus));
}

function iRatingToSR(iRating: number, rng: ReturnType<typeof seededRng>): number {
  // Higher iRating drivers tend to have higher SR
  const base = Math.min(4.99, 1.5 + (iRating / 10000) * 3.0 + rng.float(-0.5, 0.8));
  return Math.round(Math.max(1.0, Math.min(4.99, base)) * 100) / 100;
}

function srToLicense(sr: number, iRating: number): string {
  if (iRating >= 6000 && sr >= 3.0) return "Pro";
  if (sr >= 4.0) return "A";
  if (sr >= 3.0) return "B";
  if (sr >= 2.0) return "C";
  if (sr >= 1.5) return "D";
  return "R";
}

function isFocusCategory(driver: InternalDriver, cat: Category): boolean {
  const map: Record<number, Category[]> = {
    0: ["road"],
    1: ["oval"],
    2: ["dirt_road"],
    3: ["dirt_oval"],
    4: ["road", "oval", "dirt_road", "dirt_oval"],
  };
  return map[driver.specialty].includes(cat);
}

const CATEGORIES: Category[] = ["road", "oval", "dirt_road", "dirt_oval"];

function getDriverCategoryIRating(driver: InternalDriver, cat: Category): number {
  const rng = seededRng(driver.custId * 7 + CATEGORIES.indexOf(cat) * 1000);
  return skillToIRating(driver.skill, isFocusCategory(driver, cat), rng);
}

function getDriverCategorySR(driver: InternalDriver, cat: Category): number {
  const ir = getDriverCategoryIRating(driver, cat);
  const rng = seededRng(driver.custId * 13 + CATEGORIES.indexOf(cat) * 2000);
  return iRatingToSR(ir, rng);
}

function getDriverCategoryLicense(driver: InternalDriver, cat: Category): string {
  return srToLicense(
    getDriverCategorySR(driver, cat),
    getDriverCategoryIRating(driver, cat),
  );
}

// ---------------------------------------------------------------------------
// Full driver data generation
// ---------------------------------------------------------------------------

function buildCategoryStats(driver: InternalDriver, cat: Category): CategoryStats {
  const rng = seededRng(driver.custId * 31 + CATEGORIES.indexOf(cat) * 500);
  const iRating = getDriverCategoryIRating(driver, cat);
  const sr = getDriverCategorySR(driver, cat);
  const license = getDriverCategoryLicense(driver, cat);
  const focus = isFocusCategory(driver, cat);

  const starts = focus
    ? rng.int(100, 2000)
    : rng.int(10, 400);

  const winRate = Math.max(0, (iRating - 1500) / 15000);
  const wins = Math.round(starts * winRate * rng.float(0.5, 1.5));
  const top5Rate = winRate * 3 + 0.05;
  const top5 = Math.max(wins, Math.round(starts * top5Rate * rng.float(0.6, 1.2)));

  const avgFinish = Math.max(
    3,
    Math.round((25 - (iRating / 12000) * 18 + rng.float(-2, 2)) * 10) / 10,
  );

  const incidentRate = Math.max(0.5, 5 - sr);
  const incidents = Math.round(starts * incidentRate * rng.float(0.8, 1.3));
  const lapsLed = Math.round(wins * rng.int(3, 20) + starts * winRate * rng.float(0, 5));

  return {
    category: cat,
    iRating,
    safetyRating: sr,
    license,
    starts,
    wins,
    top5,
    avgFinish,
    incidents,
    lapsLed,
  };
}

function seriesForCategory(cat: Category): string[] {
  switch (cat) {
    case "road": return ROAD_SERIES;
    case "oval": return OVAL_SERIES;
    case "dirt_road": return DIRT_ROAD_SERIES;
    case "dirt_oval": return DIRT_OVAL_SERIES;
  }
}

function tracksForCategory(cat: Category): string[] {
  switch (cat) {
    case "road": return ROAD_TRACKS;
    case "oval": return OVAL_TRACKS;
    case "dirt_road": return DIRT_ROAD_TRACKS;
    case "dirt_oval": return DIRT_OVAL_TRACKS;
  }
}

function buildRecentRaces(driver: InternalDriver): RecentRace[] {
  const rng = seededRng(driver.custId * 47);
  const races: RecentRace[] = [];
  const now = new Date("2026-03-24");

  for (let i = 0; i < 20; i++) {
    const daysAgo = i * rng.int(1, 5) + i;
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const cat = rng.pick(CATEGORIES);
    const iRating = getDriverCategoryIRating(driver, cat);

    const startPos = rng.int(1, 30);
    const delta = rng.int(-8, 8);
    const finishPos = Math.max(1, Math.min(35, startPos + delta - Math.round(driver.skill * 4)));

    const iRatingChange = Math.round(
      (startPos - finishPos) * rng.float(5, 20) + rng.float(-30, 30),
    );

    races.push({
      sessionId: 70000000 + driver.custId * 100 + i,
      seriesName: rng.pick(seriesForCategory(cat)),
      trackName: rng.pick(tracksForCategory(cat)),
      date: date.toISOString().slice(0, 10),
      startPosition: startPos,
      finishPosition: finishPos,
      incidents: rng.int(0, Math.max(1, Math.round(8 - driver.skill * 6))),
      iRatingChange,
      category: cat,
    });
  }

  return races.sort((a, b) => b.date.localeCompare(a.date));
}

function buildChartData(driver: InternalDriver): Record<Category, ChartDataPoint[]> {
  const result = {} as Record<Category, ChartDataPoint[]>;

  for (const cat of CATEGORIES) {
    const rng = seededRng(driver.custId * 61 + CATEGORIES.indexOf(cat) * 3000);
    const currentIR = getDriverCategoryIRating(driver, cat);
    const points: ChartDataPoint[] = [];

    // Work backwards from current iRating — 52 weekly points
    const now = new Date("2026-03-24");
    let ir = currentIR;

    // Generate backwards then reverse so chart goes chronologically
    const raw: { date: string; value: number }[] = [];
    for (let w = 0; w < 52; w++) {
      const date = new Date(now);
      date.setDate(date.getDate() - w * 7);
      raw.push({ date: date.toISOString().slice(0, 10), value: Math.round(ir) });

      // Go backwards: undo a weekly change
      const weeklyChange = rng.float(-120, 100) + driver.skill * 15;
      ir = Math.max(600, ir - weeklyChange);
    }

    result[cat] = raw.reverse();
  }

  return result;
}

function buildDriverData(driver: InternalDriver): DriverData {
  const profile: DriverProfile = {
    custId: driver.custId,
    displayName: driver.displayName,
    memberSince: driver.memberSince,
    clubName: driver.clubName,
    countryCode: driver.countryCode,
  };

  const stats = CATEGORIES.map((cat) => buildCategoryStats(driver, cat));
  const recentRaces = buildRecentRaces(driver);
  const chartData = buildChartData(driver);

  return { profile, stats, recentRaces, chartData };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getMockDrivers(): DriverSearchResult[] {
  return ALL_DRIVERS.map((d) => ({
    custId: d.custId,
    displayName: d.displayName,
  }));
}

export function searchMockDrivers(term: string): DriverSearchResult[] {
  const lower = term.toLowerCase().trim();
  if (!lower) return [];

  return ALL_DRIVERS.filter((d) => {
    return (
      d.displayName.toLowerCase().includes(lower) ||
      String(d.custId).includes(lower)
    );
  }).map((d) => ({
    custId: d.custId,
    displayName: d.displayName,
  }));
}

export function getMockDriverData(custId: number): DriverData | null {
  const driver = ALL_DRIVERS.find((d) => d.custId === custId);
  if (!driver) return null;
  return buildDriverData(driver);
}

export function getMockLeaderboard(
  category: Category,
  limit: number,
  offset: number,
): LeaderboardResponse {
  // Build leaderboard entries for all drivers in this category
  const entries: LeaderboardEntry[] = ALL_DRIVERS.map((d) => {
    const ir = getDriverCategoryIRating(d, category);
    const sr = getDriverCategorySR(d, category);
    const license = getDriverCategoryLicense(d, category);
    return {
      custId: d.custId,
      displayName: d.displayName,
      iRating: ir,
      safetyRating: sr,
      license,
      countryCode: d.countryCode,
    };
  });

  // Sort by iRating descending
  entries.sort((a, b) => b.iRating - a.iRating);

  return {
    drivers: entries.slice(offset, offset + limit),
    total: entries.length,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers exposed for the seed script
// ---------------------------------------------------------------------------

export function _getAllDriversForSeed() {
  return ALL_DRIVERS.map((d) => ({
    custId: d.custId,
    displayName: d.displayName,
    memberSince: d.memberSince,
    clubName: d.clubName,
    countryCode: d.countryCode,
    iRatingRoad: getDriverCategoryIRating(d, "road"),
    iRatingOval: getDriverCategoryIRating(d, "oval"),
    iRatingDirtRoad: getDriverCategoryIRating(d, "dirt_road"),
    iRatingDirtOval: getDriverCategoryIRating(d, "dirt_oval"),
    srRoad: getDriverCategorySR(d, "road"),
    srOval: getDriverCategorySR(d, "oval"),
    srDirtRoad: getDriverCategorySR(d, "dirt_road"),
    srDirtOval: getDriverCategorySR(d, "dirt_oval"),
    licenseRoad: getDriverCategoryLicense(d, "road"),
    licenseOval: getDriverCategoryLicense(d, "oval"),
    licenseDirtRoad: getDriverCategoryLicense(d, "dirt_road"),
    licenseDirtOval: getDriverCategoryLicense(d, "dirt_oval"),
  }));
}
