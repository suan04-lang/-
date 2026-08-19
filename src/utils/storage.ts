import { DrinkLogItem, UserProfile, DrinkReason, DrinkingGoal } from '../types';

const STORAGE_KEYS = {
  DRINK_LOGS_PREFIX: 'drunklog_date_',
  USER_PROFILE: 'drunklog_user_profile',
  WATER_PREFIX: 'drunklog_water_',
  GOAL_PREFIX: 'drunklog_goal_',
  ALL_DATES: 'drunklog_dates_index',
  LAST_SOBER_CHECK_DATE: 'drunklog_last_sober_check'
};

export const DEFAULT_PROFILE: UserProfile = {
  name: '나의 주당',
  gender: 'male',
  weightKg: 70,
  sojuLimitGlasses: 7, // 1 bottle default limit
  waterIntakeGoalMl: 1500,
  catBreedId: 'cheese',
  coins: 60, // Welcome gift coins!
  stampsCount: 0,
  claimedChallenges: [],
  equippedCostume: {
    hatId: undefined,
    accessoryId: undefined,
    roomId: 'room_cozy'
  },
  unlockedItems: ['room_cozy'],
  averageDrinkingCostWon: 15000 // 1회 평균 음주비용
};

export function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        equippedCostume: {
          ...DEFAULT_PROFILE.equippedCostume,
          ...(parsed.equippedCostume || {})
        },
        unlockedItems: parsed.unlockedItems || ['room_cozy'],
        claimedChallenges: parsed.claimedChallenges || [],
        coins: typeof parsed.coins === 'number' ? parsed.coins : DEFAULT_PROFILE.coins,
        stampsCount: typeof parsed.stampsCount === 'number' ? parsed.stampsCount : 0,
        averageDrinkingCostWon: parsed.averageDrinkingCostWon || 15000
      };
    }
  } catch {
    // Ignore
  }
  return DEFAULT_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch {
    // Ignore
  }
}

export function loadDrinksForDate(dateKey: string): DrinkLogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRINK_LOGS_PREFIX + dateKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }
  return [];
}

export function saveDrinksForDate(dateKey: string, logs: DrinkLogItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DRINK_LOGS_PREFIX + dateKey, JSON.stringify(logs));
    
    // Update dates index
    const rawDates = localStorage.getItem(STORAGE_KEYS.ALL_DATES);
    const dates: string[] = rawDates ? JSON.parse(rawDates) : [];
    if (!dates.includes(dateKey)) {
      dates.push(dateKey);
      localStorage.setItem(STORAGE_KEYS.ALL_DATES, JSON.stringify(dates.sort().reverse()));
    }
  } catch {
    // Ignore
  }
}

export function loadDrinkingGoal(): DrinkingGoal | undefined {
  return loadDrinkingGoalForDate(getTodayKey());
}

export function saveDrinkingGoal(goal: DrinkingGoal | undefined): void {
  saveDrinkingGoalForDate(getTodayKey(), goal);
}

export function loadDrinkingGoalForDate(dateKey: string): DrinkingGoal | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOAL_PREFIX + dateKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }
  return undefined;
}

export function saveDrinkingGoalForDate(dateKey: string, goal: DrinkingGoal | undefined): void {
  try {
    if (!goal) {
      localStorage.removeItem(STORAGE_KEYS.GOAL_PREFIX + dateKey);
    } else {
      localStorage.setItem(STORAGE_KEYS.GOAL_PREFIX + dateKey, JSON.stringify(goal));
    }
  } catch {
    // Ignore
  }
}

export function loadWaterForDate(dateKey: string): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATER_PREFIX + dateKey);
    if (raw) {
      return parseInt(raw, 10) || 0;
    }
  } catch {
    // Ignore
  }
  return 0;
}

export function saveWaterForDate(dateKey: string, ml: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WATER_PREFIX + dateKey, String(ml));
  } catch {
    // Ignore
  }
}

export function getAllLoggedDates(): string[] {
  try {
    const rawDates = localStorage.getItem(STORAGE_KEYS.ALL_DATES);
    return rawDates ? JSON.parse(rawDates) : [getTodayKey()];
  } catch {
    return [getTodayKey()];
  }
}

/**
 * Calculates current consecutive sober streak (in days).
 * Checks backwards from today/yesterday.
 */
export function calculateSoberStreak(): { currentStreak: number; totalSoberDaysInMonth: number; totalDrinkingDaysInMonth: number } {
  const today = new Date();
  const todayKey = getTodayKey();
  const todayDrinks = loadDrinksForDate(todayKey);

  let currentStreak = 0;
  let checkDate = new Date();

  // If today has drinks, streak is 0 unless it's only looking from yesterday
  if (todayDrinks.length > 0) {
    currentStreak = 0;
  } else {
    // Today is sober so far! Start counting from today
    let consecutive = 0;
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      const drinks = loadDrinksForDate(key);
      if (drinks.length === 0) {
        consecutive++;
      } else {
        break;
      }
    }
    currentStreak = consecutive;
  }

  // Count this month's stats
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  let totalSoberDaysInMonth = 0;
  let totalDrinkingDaysInMonth = 0;

  for (let day = 1; day <= today.getDate(); day++) {
    const d = new Date(currentYear, currentMonth, day);
    const key = formatDateKey(d);
    const drinks = loadDrinksForDate(key);
    if (drinks.length > 0) {
      totalDrinkingDaysInMonth++;
    } else {
      totalSoberDaysInMonth++;
    }
  }

  return {
    currentStreak,
    totalSoberDaysInMonth,
    totalDrinkingDaysInMonth
  };
}

/**
 * Calculates money saved through sober days.
 */
export function calculateSavedMoney(avgCostPerSession: number = 15000): {
  todaySaved: number;
  totalSaved: number;
  chickenEquivalent: number;
  coffeeEquivalent: number;
} {
  const todayKey = getTodayKey();
  const todayDrinks = loadDrinksForDate(todayKey);
  const isTodaySober = todayDrinks.length === 0;
  const todaySaved = isTodaySober ? avgCostPerSession : 0;

  const { totalSoberDaysInMonth } = calculateSoberStreak();
  // Calculate total saved based on sober days (e.g. past 30 days)
  const totalSaved = totalSoberDaysInMonth * avgCostPerSession;

  const chickenEquivalent = Math.floor(totalSaved / 20000); // 20,000 KRW per chicken
  const coffeeEquivalent = Math.floor(totalSaved / 4500); // 4,500 KRW per coffee

  return {
    todaySaved,
    totalSaved,
    chickenEquivalent,
    coffeeEquivalent
  };
}

/**
 * Collects drinking reason statistics over the past 7 days and 30 days.
 */
export function getReasonStatistics(days: 7 | 30 = 30): {
  reasonCounts: Record<DrinkReason, number>;
  totalLoggedSessions: number;
  topReasons: { reason: DrinkReason; count: number; percentage: number }[];
  dayOfWeekCounts: { dayName: string; dayIndex: number; count: number; totalGlasses: number }[];
} {
  const today = new Date();
  const reasonCounts: Record<DrinkReason, number> = {
    friends: 0,
    stress: 0,
    celebration: 0,
    gathering: 0,
    habit: 0,
    refresh: 0,
    other: 0
  };

  const dayOfWeekCounts = [
    { dayName: '일', dayIndex: 0, count: 0, totalGlasses: 0 },
    { dayName: '월', dayIndex: 1, count: 0, totalGlasses: 0 },
    { dayName: '화', dayIndex: 2, count: 0, totalGlasses: 0 },
    { dayName: '수', dayIndex: 3, count: 0, totalGlasses: 0 },
    { dayName: '목', dayIndex: 4, count: 0, totalGlasses: 0 },
    { dayName: '금', dayIndex: 5, count: 0, totalGlasses: 0 },
    { dayName: '토', dayIndex: 6, count: 0, totalGlasses: 0 }
  ];

  let totalLoggedSessions = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);
    const drinks = loadDrinksForDate(key);

    if (drinks.length > 0) {
      totalLoggedSessions++;
      const dayIdx = d.getDay();
      dayOfWeekCounts[dayIdx].count++;
      
      const dayGlasses = drinks.reduce((acc, curr) => acc + curr.sojuEquivalentGlasses, 0);
      dayOfWeekCounts[dayIdx].totalGlasses += dayGlasses;

      drinks.forEach(item => {
        if (item.reason && reasonCounts[item.reason] !== undefined) {
          reasonCounts[item.reason]++;
        } else {
          reasonCounts['other']++;
        }
      });
    }
  }

  const allCount = Object.values(reasonCounts).reduce((a, b) => a + b, 0);
  const topReasons = (Object.keys(reasonCounts) as DrinkReason[])
    .map(reason => ({
      reason,
      count: reasonCounts[reason],
      percentage: allCount > 0 ? Math.round((reasonCounts[reason] / allCount) * 100) : 0
    }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    reasonCounts,
    totalLoggedSessions,
    topReasons,
    dayOfWeekCounts
  };
}

