import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Plus,
  Calendar,
  User,
  Smartphone,
  Sparkles,
  RotateCcw,
  AlertOctagon,
  Bot,
  Award,
  ShoppingBag,
  TrendingUp,
  Target,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { DrinkLogItem, UserProfile, DrinkingGoal } from './types';
import { DrinkingCharacter } from './components/DrinkingCharacter';
import { GlassGauge } from './components/GlassGauge';
import { SoberTimerCard } from './components/SoberTimerCard';
import { DrinkLogList } from './components/DrinkLogList';
import { QuickAddDrinkModal } from './components/QuickAddDrinkModal';
import { HangoverCareModal } from './components/HangoverCareModal';
import { UserProfileModal } from './components/UserProfileModal';
import { HistoryCalendarModal } from './components/HistoryCalendarModal';
import { PWAInstallGuide } from './components/PWAInstallGuide';
import { SoberStreakCard } from './components/SoberStreakCard';
import { DrinkReasonAnalysisView } from './components/DrinkReasonAnalysisView';
import { AiCoachModal } from './components/AiCoachModal';
import { SoberChallengeModal } from './components/SoberChallengeModal';
import { CatRoomShopModal } from './components/CatRoomShopModal';
import { DrinkingGoalModal } from './components/DrinkingGoalModal';
import { MoneySavedCard } from './components/MoneySavedCard';

import { calculateBAC } from './utils/bacCalculator';
import { calculateSoberStats } from './utils/soberStats';
import {
  getTodayKey,
  loadUserProfile,
  saveUserProfile,
  loadDrinksForDate,
  saveDrinksForDate,
  loadWaterForDate,
  saveWaterForDate,
  calculateSoberStreak,
  calculateSavedMoney,
  loadDrinkingGoal,
  saveDrinkingGoal
} from './utils/storage';
import {
  playClinkSound,
  playGulpSound,
  playCheerChime,
  triggerVibration
} from './utils/audio';

export default function App() {
  const todayKey = useMemo(() => getTodayKey(), []);

  // State
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [drinkLogs, setDrinkLogs] = useState<DrinkLogItem[]>(() => loadDrinksForDate(todayKey));
  const [waterMl, setWaterMl] = useState<number>(() => loadWaterForDate(todayKey));
  const [currentGoal, setCurrentGoal] = useState<DrinkingGoal | undefined>(() => loadDrinkingGoal() || undefined);

  // Active Main Navigation Tab ('home' | 'analysis' | 'challenge')
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'analysis' | 'challenge'>('home');

  // Modals state
  const [isAddDrinkOpen, setIsAddDrinkOpen] = useState<boolean>(false);
  const [isHangoverCareOpen, setIsHangoverCareOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isPwaGuideOpen, setIsPwaGuideOpen] = useState<boolean>(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState<boolean>(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);

  // Character drinking motion trigger
  const [isDrinkingMotion, setIsDrinkingMotion] = useState<boolean>(false);
  const [currentDrinkName, setCurrentDrinkName] = useState<string>('');

  // Live timer tick every 15s to update BAC countdown smoothly
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Calculate BAC and metrics
  const bacResult = useMemo(() => {
    return calculateBAC(drinkLogs, profile, currentTimeMs);
  }, [drinkLogs, profile, currentTimeMs]);

  // Calculate Sober & Savings Stats (auto-recomputed with logs)
  const soberStats = useMemo(() => {
    return calculateSoberStats();
  }, [drinkLogs]);

  // Sober streak & saved money calculation
  const streakInfo = useMemo(() => {
    return calculateSoberStreak();
  }, [drinkLogs]);

  const moneySavedInfo = useMemo(() => {
    return calculateSavedMoney(profile.averageDrinkingCostWon);
  }, [drinkLogs, profile.averageDrinkingCostWon]);

  // Save changes to storage
  useEffect(() => {
    saveDrinksForDate(todayKey, drinkLogs);
  }, [todayKey, drinkLogs]);

  useEffect(() => {
    saveWaterForDate(todayKey, waterMl);
  }, [todayKey, waterMl]);

  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  // Handle Add Drink
  const handleAddDrink = (drinkData: Omit<DrinkLogItem, 'id' | 'timestamp'>) => {
    const newLog: DrinkLogItem = {
      ...drinkData,
      id: 'drink_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now()
    };

    setDrinkLogs(prev => [newLog, ...prev]);
    setCurrentDrinkName(newLog.name);
    setIsDrinkingMotion(true);

    // Confetti effect if reached limit milestone
    const totalGlasses = (drinkLogs.reduce((sum, item) => sum + item.alcoholGrams, 0) + newLog.alcoholGrams) / 6.4;
    if (totalGlasses >= profile.sojuLimitGlasses && drinkLogs.length > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignore
      }
    }
  };

  // Quick 1-tap add shortcut
  const handleQuickAddShortcut = (
    name: string,
    category: DrinkLogItem['category'],
    volumeMl: number,
    abv: number,
    calories: number
  ) => {
    triggerVibration(40);
    playClinkSound();
    setTimeout(() => {
      playGulpSound();
    }, 150);

    const alcoholGrams = Number((volumeMl * (abv / 100) * 0.8).toFixed(1));
    const sojuEquivalentGlasses = Number((alcoholGrams / 6.4).toFixed(1));

    handleAddDrink({
      category,
      name,
      volumeMl,
      abv,
      alcoholGrams,
      sojuEquivalentGlasses,
      calories,
      reason: 'friends'
    });
  };

  // Handle delete
  const handleDeleteLog = (id: string) => {
    triggerVibration(30);
    setDrinkLogs(prev => prev.filter(log => log.id !== id));
  };

  // Handle Reset Today's log
  const handleResetToday = () => {
    if (window.confirm('오늘의 음주 기록을 초기화하시겠습니까?')) {
      triggerVibration(50);
      setDrinkLogs([]);
      setWaterMl(0);
    }
  };

  // Handle Add Water
  const handleAddWater = (amountMl: number) => {
    setWaterMl(prev => prev + amountMl);
    playCheerChime();
  };

  // Save Goal
  const handleSaveGoal = (goal: DrinkingGoal) => {
    setCurrentGoal(goal);
    saveDrinkingGoal(goal);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center justify-start antialiased font-sans pb-16">
      {/* Mobile Shell Wrapper */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-white shadow-xl relative border-x border-slate-200">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            {/* App Icon */}
            <div
              onClick={() => setIsPwaGuideOpen(true)}
              className="relative w-9 h-9 rounded-xl overflow-hidden border-2 border-pink-400 shadow-2xs cursor-pointer active:scale-95 transition-transform bg-slate-900"
              title="PWA 설치 안내 보기"
            >
              <img
                src="/apple-touch-icon.png"
                alt="깨진 술병 아이콘"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black tracking-tight text-slate-800">취하냥</h1>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-pink-500 text-white shadow-2xs">
                  PWA
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5 border border-amber-300">
                  <span>🪙</span> {profile.coins || 0}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">인터랙티브 고양이 음주 & 금주 육성</p>
            </div>
          </div>

          {/* Action Header Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsShopOpen(true)}
              className="p-2 rounded-xl text-pink-600 hover:bg-pink-50 transition-colors"
              title="냥이 의상실 & 상점"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAiCoachOpen(true)}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
              title="AI 닥터 냥코치"
            >
              <Bot className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="금주 & 음주 캘린더"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="프로필 & 주량 설정"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Top Navigation Pill Tabs (Home / Analysis / Challenge) */}
        <div className="px-4 pt-3 pb-1 bg-white border-b border-slate-100">
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveNavTab('home')}
              className={`py-1.5 text-xs font-black rounded-xl transition-all ${
                activeNavTab === 'home'
                  ? 'bg-white text-pink-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🍶 홈 & 캐릭터
            </button>
            <button
              onClick={() => setActiveNavTab('analysis')}
              className={`py-1.5 text-xs font-black rounded-xl transition-all ${
                activeNavTab === 'analysis'
                  ? 'bg-white text-pink-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              📊 이유 & AI분석
            </button>
            <button
              onClick={() => setActiveNavTab('challenge')}
              className={`py-1.5 text-xs font-black rounded-xl transition-all ${
                activeNavTab === 'challenge'
                  ? 'bg-white text-pink-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🏅 금주 챌린지
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <main className="flex-1 p-4 space-y-4 bg-slate-50/70">
          {/* TAB 1: HOME & DRINKING CHARACTER */}
          {activeNavTab === 'home' && (
            <>
              {/* Interactive Cat Character Section */}
              <section className="bg-white border-2 border-pink-100 rounded-3xl p-3 shadow-2xs flex flex-col items-center relative overflow-hidden">
                <DrinkingCharacter
                  drunkStage={bacResult.drunkStage}
                  isDrinking={isDrinkingMotion}
                  drinkingDrinkName={currentDrinkName}
                  onDrinkActionComplete={() => setIsDrinkingMotion(false)}
                  sojuGlasses={bacResult.sojuEquivalentGlasses}
                  catBreedId={profile.catBreedId || 'cheese'}
                  onCatBreedChange={(breedId) => setProfile(prev => ({ ...prev, catBreedId: breedId }))}
                  costume={profile.equippedCostume}
                  soberDays={streakInfo.currentStreak}
                />
              </section>

              {/* Goal Limit Live Meter (If goal is set) */}
              {currentGoal && (
                <section className="p-3 bg-white border border-pink-200 rounded-2xl shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-800 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-pink-500" />
                      <span>오늘의 절주 목표: {currentGoal.maxGlassesPerSession}잔 이하</span>
                    </span>
                    <button
                      onClick={() => setIsGoalModalOpen(true)}
                      className="text-[10px] text-pink-600 font-bold hover:underline"
                    >
                      목표 수정
                    </button>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        bacResult.sojuEquivalentGlasses > currentGoal.maxGlassesPerSession
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (bacResult.sojuEquivalentGlasses / currentGoal.maxGlassesPerSession) * 100)}%`
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>현재 {bacResult.sojuEquivalentGlasses.toFixed(1)}잔 마심</span>
                    <span>
                      {bacResult.sojuEquivalentGlasses > currentGoal.maxGlassesPerSession ? (
                        <span className="text-rose-600 font-bold">
                          목표 {(bacResult.sojuEquivalentGlasses - currentGoal.maxGlassesPerSession).toFixed(1)}잔 초과!
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold">
                          {(currentGoal.maxGlassesPerSession - bacResult.sojuEquivalentGlasses).toFixed(1)}잔 남음
                        </span>
                      )}
                    </span>
                  </div>
                </section>
              )}

              {/* Glass Measurement Gauge */}
              <section>
                <GlassGauge
                  sojuGlasses={bacResult.sojuEquivalentGlasses}
                  limitGlasses={profile.sojuLimitGlasses}
                  pureAlcoholGrams={bacResult.totalPureAlcoholGrams}
                  totalVolumeMl={bacResult.totalVolumeMl}
                  drunkStage={bacResult.drunkStage}
                />
              </section>

              {/* Quick 1-Tap Action Buttons */}
              <section className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black text-slate-800">⚡ 1초 빠른 기록</span>
                  <span className="text-[10px] text-slate-500 font-medium">누르면 냥이가 즉시 함께 마셔요</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickAddShortcut('소주 1잔', 'soju', 50, 16.0, 64)}
                    className="py-2.5 px-2 bg-white hover:bg-pink-50 active:scale-95 border border-slate-200 hover:border-pink-300 rounded-2xl flex flex-col items-center text-center transition-all group shadow-2xs"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">🍶</span>
                    <span className="text-xs font-black text-slate-800 mt-1">소주 1잔</span>
                    <span className="text-[10px] text-pink-600 font-bold">+50ml</span>
                  </button>

                  <button
                    onClick={() => handleQuickAddShortcut('맥주 1캔', 'beer', 355, 4.5, 150)}
                    className="py-2.5 px-2 bg-white hover:bg-pink-50 active:scale-95 border border-slate-200 hover:border-pink-300 rounded-2xl flex flex-col items-center text-center transition-all group shadow-2xs"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">🍺</span>
                    <span className="text-xs font-black text-slate-800 mt-1">맥주 1캔</span>
                    <span className="text-[10px] text-pink-600 font-bold">+355ml</span>
                  </button>

                  <button
                    onClick={() => handleQuickAddShortcut('소맥 1잔', 'beer', 180, 8.5, 120)}
                    className="py-2.5 px-2 bg-white hover:bg-pink-50 active:scale-95 border border-slate-200 hover:border-pink-300 rounded-2xl flex flex-col items-center text-center transition-all group shadow-2xs"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">💥</span>
                    <span className="text-xs font-black text-slate-800 mt-1">소맥 1잔</span>
                    <span className="text-[10px] text-pink-600 font-bold">+180ml</span>
                  </button>
                </div>

                {/* Big Add Drink Modal Trigger Button */}
                <button
                  onClick={() => {
                    triggerVibration(40);
                    setIsAddDrinkOpen(true);
                  }}
                  className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 active:scale-[0.98] text-white font-black rounded-2xl shadow-md shadow-pink-200 flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  <span>술 마신 양 & 이유 기록하기 (전체/커스텀)</span>
                </button>
              </section>

              {/* Sober Time & BAC Meter Card */}
              <section>
                <SoberTimerCard
                  bacInfo={bacResult}
                  onOpenWaterModal={() => setIsHangoverCareOpen(true)}
                />
              </section>

              {/* Drink Logs Timeline */}
              <section>
                <DrinkLogList logs={drinkLogs} onDeleteLog={handleDeleteLog} />
              </section>

              {/* Danger Alert */}
              {bacResult.drunkStage >= 3 && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 shadow-2xs">
                  <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-rose-900">음주 위험 단계입니다!</div>
                    <div className="text-[11px] text-rose-700 mt-0.5 font-medium leading-relaxed">
                      판단력이 흐려지고 사고 위험이 높아집니다. 음주를 즉시 멈추고 물을 섭취한 후 안전하게 귀가하세요.
                    </div>
                  </div>
                </div>
              )}

              {/* Reset Today Action Button */}
              {drinkLogs.length > 0 && (
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={handleResetToday}
                    className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    오늘 기록 초기화
                  </button>
                </div>
              )}
            </>
          )}

          {/* TAB 2: REASON & AI PATTERN ANALYSIS */}
          {activeNavTab === 'analysis' && (
            <DrinkReasonAnalysisView
              onOpenAiCoach={() => setIsAiCoachOpen(true)}
            />
          )}

          {/* TAB 3: SOBER CHALLENGES & SAVINGS */}
          {activeNavTab === 'challenge' && (
            <div className="space-y-4">
              {/* Money Saved & Chicken Card */}
              <MoneySavedCard
                savedInfo={moneySavedInfo}
                averageCostWon={profile.averageDrinkingCostWon || 35000}
                onUpdateAverageCost={(newCost) =>
                  setProfile(prev => ({ ...prev, averageDrinkingCostWon: newCost }))
                }
              />

              {/* Sober Streak Card */}
              <SoberStreakCard
                stats={soberStats}
                onOpenCalendar={() => setIsHistoryOpen(true)}
              />

              {/* Goal Setting Trigger Banner */}
              <div
                onClick={() => setIsGoalModalOpen(true)}
                className="p-4 bg-white border border-pink-200 rounded-3xl flex items-center justify-between cursor-pointer hover:border-pink-300 transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-lg">
                    🎯
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">
                      {currentGoal ? '목표 음주량 설정 완료' : '나만의 절주 목표 설정하기'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {currentGoal
                        ? `1회 ${currentGoal.maxGlassesPerSession}잔 / 주 ${currentGoal.targetDaysPerWeek}회 이하`
                        : '술자리 전 최대 허용 주량을 설정해요'}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-xl">
                  {currentGoal ? '수정' : '설정하기'}
                </span>
              </div>

              {/* Challenge Modal Trigger Banner */}
              <div
                onClick={() => setIsChallengeOpen(true)}
                className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl flex items-center justify-between cursor-pointer shadow-md shadow-emerald-200/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-lg">
                    💮
                  </div>
                  <div>
                    <div className="text-xs font-black">7일 & 14일 금주 스탬프 챌린지</div>
                    <div className="text-[11px] text-emerald-100 font-medium mt-0.5">
                      스탬프 찍고 코인 & 한정 코스튬 받기
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black bg-white text-emerald-700 px-3 py-1 rounded-xl shadow-xs">
                  도전하기
                </span>
              </div>

              {/* Shop Modal Trigger Banner */}
              <div
                onClick={() => setIsShopOpen(true)}
                className="p-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-3xl flex items-center justify-between cursor-pointer shadow-md shadow-amber-200/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-lg">
                    🎀
                  </div>
                  <div>
                    <div className="text-xs font-black">냥이 꾸미기 의상실 & 상점</div>
                    <div className="text-[11px] text-amber-100 font-medium mt-0.5">
                      보유 코인: {profile.coins.toLocaleString()} COIN
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black bg-white text-amber-800 px-3 py-1 rounded-xl shadow-xs">
                  입장하기
                </span>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Floating Navigation / Fast Action Bar */}
        <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
          <button
            onClick={() => {
              setActiveNavTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-black transition-colors ${
              activeNavTab === 'home' ? 'text-pink-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="text-base">🍶</span>
            <span>음주기록</span>
          </button>

          <button
            onClick={() => {
              triggerVibration(40);
              setIsAddDrinkOpen(true);
            }}
            className="w-12 h-12 -mt-5 rounded-full bg-pink-500 hover:bg-pink-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-pink-200 border-2 border-white transition-all"
            title="술 기록 추가"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          <button
            onClick={() => {
              setActiveNavTab('analysis');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-black transition-colors ${
              activeNavTab === 'analysis' ? 'text-pink-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="text-base">📊</span>
            <span>이유분석</span>
          </button>

          <button
            onClick={() => {
              setActiveNavTab('challenge');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-black transition-colors ${
              activeNavTab === 'challenge' ? 'text-pink-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="text-base">🏅</span>
            <span>금주챌린지</span>
          </button>
        </footer>
      </div>

      {/* All Modal Overlays */}
      <QuickAddDrinkModal
        isOpen={isAddDrinkOpen}
        onClose={() => setIsAddDrinkOpen(false)}
        onAddDrink={handleAddDrink}
      />

      <HangoverCareModal
        isOpen={isHangoverCareOpen}
        onClose={() => setIsHangoverCareOpen(false)}
        waterMl={waterMl}
        waterGoalMl={profile.waterIntakeGoalMl}
        onAddWater={handleAddWater}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
      />

      <HistoryCalendarModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <PWAInstallGuide
        isOpen={isPwaGuideOpen}
        onClose={() => setIsPwaGuideOpen(false)}
      />

      <AiCoachModal
        isOpen={isAiCoachOpen}
        onClose={() => setIsAiCoachOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
      />

      <SoberChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        streakInfo={streakInfo}
        profile={profile}
        onUpdateProfile={setProfile}
        onOpenShop={() => {
          setIsChallengeOpen(false);
          setIsShopOpen(true);
        }}
      />

      <CatRoomShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
      />

      <DrinkingGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoal={currentGoal}
        onSaveGoal={handleSaveGoal}
      />
    </div>
  );
}
