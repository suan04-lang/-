export type DrinkCategory = 'soju' | 'beer' | 'wine' | 'whiskey' | 'makgeolli' | 'highball' | 'cocktail' | 'custom';

export type DrinkReason =
  | 'friends' // 친구와 약속 👥
  | 'stress' // 스트레스 해소 ⚡
  | 'celebration' // 기념일 / 축하 🎉
  | 'gathering' // 회식 / 모임 🏢
  | 'habit' // 습관 / 혼술 🛋️
  | 'refresh' // 기분 전환 / 휴식 🌿
  | 'other'; // 기타 / 직접입력 ✍️

export interface DrinkPreset {
  id: string;
  name: string;
  category: DrinkCategory;
  volumeMl: number;
  abv: number; // Percentage, e.g., 16.0 for 16%
  unitName: string; // 잔, 병, 캔, 샷, etc.
  iconName: string;
  color: string;
  accentBg: string;
  textColor: string;
  calories: number;
  description: string;
}

export interface DrinkLogItem {
  id: string;
  category: DrinkCategory;
  name: string;
  volumeMl: number;
  abv: number;
  alcoholGrams: number; // volumeMl * (abv/100) * 0.8
  sojuEquivalentGlasses: number; // pure alcohol / ~6.4g
  calories: number;
  timestamp: number; // Epoch ms
  note?: string;
  reason?: DrinkReason;
  reasonText?: string;
}

export interface DrinkingGoal {
  id?: string;
  dateKey?: string; // YYYY-MM-DD
  maxGlassesPerSession?: number; // e.g. 2 glasses or half of regular
  targetDaysPerWeek?: number;
  targetGlasses?: number;
  isDrinkEvent?: boolean;
  note?: string;
  achieved?: boolean;
  createdAt?: number;
}

export interface CatCostume {
  hatId?: string;
  accessoryId?: string;
  roomId?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'hat' | 'accessory' | 'room';
  emoji: string;
  icon?: string;
  description: string;
  priceCoins: number;
  price?: number;
  requiredStreak?: number; // e.g. 3 days, 7 days
}

export interface SoberChallenge {
  id: string;
  targetDays: number;
  title: string;
  subtitle: string;
  description?: string;
  rewardCoins: number;
  rewardStamp: string;
  rewardItemId?: string;
  rewardCostumeId?: string;
  icon: string;
  badgeIcon?: string;
  color: string;
}

export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  weightKg: number;
  sojuLimitGlasses: number;
  waterIntakeGoalMl: number;
  catBreedId?: string; // e.g. 'cheese', 'mackerel', 'calico', 'tuxedo', 'white', 'siamese', 'black'
  coins: number;
  stampsCount: number;
  claimedChallenges: string[];
  equippedCostume: CatCostume;
  unlockedCostumes?: string[];
  unlockedItems: string[];
  averageDrinkingCostWon: number; // Default 15,000 KRW
  todayGoal?: DrinkingGoal;
}

export type CatBreedId = 'cheese' | 'mackerel' | 'calico' | 'tuxedo' | 'white' | 'siamese' | 'black';

export interface CatBreedInfo {
  id: CatBreedId;
  name: string; // 치즈냥이, 고등어냥이, 삼색냥이, 턱시도냥이, 백냥이, 샴냥이, 까망냥이
  badge: string; // 치즈태비, 고등어태비, 삼색이, 턱시도, 백묘, 샴, 올블랙
  emoji: string;
  description: string;
  primaryColor: string; // Main fur gradient start/end
  accentColor: string; // Stripe or patch color
  previewBg: string;
}

export interface DrunkStageInfo {
  level: number; // 0, 1, 2, 3, 4
  title: string;
  subTitle: string;
  badge: string;
  blushIntensity: number; // 0 to 1
  swaySpeed: number; // Animation duration in seconds
  swayAngle: number; // Degrees
  eyeState: 'sparkle' | 'happy' | 'dizzy_half' | 'spiral_swirl' | 'blackout_x';
  mouthState: 'smile' | 'laugh' | 'open_sing' | 'tongue_wavy' | 'sleep_drool';
  quote: string;
  accessory?: 'none' | 'sparkle' | 'sweat' | 'hiccup' | 'headband_tie' | 'flying_stars';
  bgGlow: string;
}

export interface DailySummary {
  dateKey: string; // YYYY-MM-DD
  logs: DrinkLogItem[];
  waterMl: number;
  hangoverCareCount: number;
  reasonCounts?: Record<DrinkReason, number>;
}

export interface SoberStreakInfo {
  currentStreak: number;
  totalSoberDaysInMonth: number;
  totalDrinkingDaysInMonth: number;
  longestStreak?: number;
  soberDaysCount?: number;
}

export interface SavedMoneyInfo {
  todaySaved: number;
  totalSaved: number;
  chickenEquivalent: number;
  coffeeEquivalent: number;
}

export interface AiPatternAnalysisResult {
  summary: string;
  topTriggers: {
    reason: string;
    count: number;
    percentage: number;
    advice: string;
  }[];
  peakDrinkingDay: string;
  suggestedMissions: {
    id: string;
    title: string;
    description: string;
    rewardCoins: number;
  }[];
  coachCheerMessage: string;
}
