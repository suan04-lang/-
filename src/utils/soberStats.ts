import { getAllLoggedDates, loadDrinksForDate, getTodayKey } from './storage';
import { DrinkLogItem } from '../types';

export interface SoberStats {
  currentStreakDays: number;
  longestStreakDays: number;
  totalSoberDaysInMonth: number;
  totalDrinkingDaysInMonth: number;
  monthSuccessRate: number;
  totalSavedMoneyWon: number;
  savedChickenCount: number;
  savedCoffeeCount: number;
  recent7Days: Array<{
    dateKey: string;
    dayLabel: string;
    isSober: boolean;
    glasses: number;
    alcoholGrams: number;
  }>;
}

// Average drinking session estimated cost in KRW (술값 + 안주/배달 평균 15,000원)
export const AVERAGE_DRINK_COST_PER_SESSION = 15000;

export function calculateSoberStats(costPerSession: number = AVERAGE_DRINK_COST_PER_SESSION): SoberStats {
  const todayKey = getTodayKey();
  const allDates = getAllLoggedDates();
  
  // Create a map of date -> total alcohol
  const dateDrinkMap = new Map<string, number>();
  
  // Check past 60 days
  const now = new Date();
  const past60Days: string[] = [];
  for (let i = 59; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;
    past60Days.push(key);
    
    const logs = loadDrinksForDate(key);
    const totalGrams = logs.reduce((sum, item) => sum + item.alcoholGrams, 0);
    dateDrinkMap.set(key, totalGrams);
  }

  // 1. Calculate Current Streak (counting backwards from yesterday/today)
  let currentStreak = 0;
  const todayLogs = loadDrinksForDate(todayKey);
  const todayGrams = todayLogs.reduce((sum, item) => sum + item.alcoholGrams, 0);
  
  // If haven't drunk today, start streak including today
  let startIndex = todayGrams === 0 ? past60Days.length - 1 : past60Days.length - 2;
  
  for (let i = startIndex; i >= 0; i--) {
    const key = past60Days[i];
    const grams = dateDrinkMap.get(key) || 0;
    if (grams === 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // 2. Calculate Longest Streak in the 60-day window
  let longestStreak = 0;
  let tempStreak = 0;
  for (let i = 0; i < past60Days.length; i++) {
    const key = past60Days[i];
    const grams = dateDrinkMap.get(key) || 0;
    if (grams === 0) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // 3. Month Stats (Current Month)
  const currentMonthPrefix = todayKey.slice(0, 7); // YYYY-MM
  let monthSober = 0;
  let monthDrinking = 0;
  const currentDayNum = parseInt(todayKey.slice(8), 10);

  for (let d = 1; d <= currentDayNum; d++) {
    const dayStr = String(d).padStart(2, '0');
    const dateKey = `${currentMonthPrefix}-${dayStr}`;
    const logs = loadDrinksForDate(dateKey);
    const grams = logs.reduce((sum, item) => sum + item.alcoholGrams, 0);
    if (grams > 0) {
      monthDrinking++;
    } else {
      monthSober++;
    }
  }

  const totalDaysSoFar = monthSober + monthDrinking;
  const monthSuccessRate = totalDaysSoFar > 0 ? Math.round((monthSober / totalDaysSoFar) * 100) : 100;

  // 4. Saved Money
  // Total sober days across logged records or in the window
  const totalSoberDays = monthSober; // Base on this month or streak
  const totalSavedMoneyWon = (monthSober + Math.max(0, currentStreak - monthSober)) * costPerSession;
  const savedChickenCount = Number((totalSavedMoneyWon / 20000).toFixed(1));
  const savedCoffeeCount = Math.floor(totalSavedMoneyWon / 4500);

  // 5. Recent 7 Days Timeline
  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
  const recent7Days: SoberStats['recent7Days'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;
    
    const logs = loadDrinksForDate(key);
    const grams = logs.reduce((sum, item) => sum + item.alcoholGrams, 0);
    const glasses = Number((grams / 6.4).toFixed(1));
    
    recent7Days.push({
      dateKey: key,
      dayLabel: `${d.getDate()}일(${dayLabels[d.getDay()]})`,
      isSober: grams === 0,
      glasses,
      alcoholGrams: grams
    });
  }

  return {
    currentStreakDays: currentStreak,
    longestStreakDays: longestStreak,
    totalSoberDaysInMonth: monthSober,
    totalDrinkingDaysInMonth: monthDrinking,
    monthSuccessRate,
    totalSavedMoneyWon,
    savedChickenCount,
    savedCoffeeCount,
    recent7Days
  };
}
