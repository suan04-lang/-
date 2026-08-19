import React from 'react';
import { motion } from 'motion/react';
import { X, Check, Award, Flame, Gift, ShieldCheck, Sparkles } from 'lucide-react';
import { SOBER_CHALLENGES } from '../data/challenges';
import { SoberStreakInfo, UserProfile } from '../types';
import { playCheerChime, triggerVibration } from '../utils/audio';

interface SoberChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakInfo: SoberStreakInfo;
  profile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onOpenShop?: () => void;
}

export const SoberChallengeModal: React.FC<SoberChallengeModalProps> = ({
  isOpen,
  onClose,
  streakInfo,
  profile,
  onUpdateProfile,
  onOpenShop
}) => {
  if (!isOpen) return null;

  const currentStreak = streakInfo.currentStreak;
  const completedChallengeIds = profile.unlockedCostumes || profile.unlockedItems || [];

  const handleClaimReward = (challengeId: string, rewardCoins: number, rewardCostumeId?: string) => {
    triggerVibration(70);
    playCheerChime();

    onUpdateProfile(prev => {
      const updatedCostumes = prev.unlockedCostumes ? [...prev.unlockedCostumes] : [];
      if (rewardCostumeId && !updatedCostumes.includes(rewardCostumeId)) {
        updatedCostumes.push(rewardCostumeId);
      }
      return {
        ...prev,
        coins: prev.coins + rewardCoins,
        unlockedCostumes: updatedCostumes,
        unlockedItems: updatedCostumes
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="w-full max-w-md bg-white border-t sm:border-2 border-pink-100 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm shadow-xs">
              🌿
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                금주 스탬프 & 챌린지
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                술 안 마신 날이 쌓일수록 냥이의 취기가 회복돼요!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-pink-100 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Streak Hero Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-100 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>현재 금주 연속 달성</span>
            </div>
            <div className="text-2xl font-black flex items-baseline gap-1">
              <span>{currentStreak}일째</span>
              <span className="text-xs font-medium text-emerald-100">
                (이달 {streakInfo.totalSoberDaysInMonth}일 클린)
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 font-medium">
              {currentStreak >= 14
                ? '대단해요! 간 기능과 피부가 완전히 맑아졌어요 ✨'
                : currentStreak >= 7
                ? '1주일 달성! 깊은 수면과 활력이 돌아오고 있어요 🌿'
                : currentStreak >= 3
                ? '3일차 달성! 알코올 독소가 배출되고 있어요 🐾'
                : '오늘 하루 술을 마시지 않으면 금주 스탬프가 찍혀요!'}
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex flex-col items-center justify-center text-white border border-white/30 shrink-0">
            <span className="text-2xl">🐾</span>
            <span className="text-[10px] font-black">{streakInfo.totalSoberDaysInMonth}회 금주</span>
          </div>
        </div>

        {/* 7-Day Visual Stamp Board Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1">
              <span>💮</span> 7일 연속 금주 스탬프 판
            </span>
            <span className="text-[11px] text-emerald-600 font-bold">
              {Math.min(7, currentStreak)} / 7 완료
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
              const isStamped = currentStreak >= dayNum;
              return (
                <div
                  key={dayNum}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                    isStamped
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs scale-105'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  <span className="text-[10px] font-black">{dayNum}일차</span>
                  <span className="text-base my-0.5">{isStamped ? '🐾' : '⭕'}</span>
                  <span className="text-[9px] font-medium opacity-80">
                    {isStamped ? '성공!' : '대기'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Challenges List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          <div className="text-xs font-black text-slate-700 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-pink-500" />
            <span>단계별 금주 챌린지 목표</span>
          </div>

          <div className="space-y-2.5">
            {SOBER_CHALLENGES.map((challenge) => {
              const rewardItem = challenge.rewardItemId || challenge.rewardCostumeId;
              const isAchieved = currentStreak >= challenge.targetDays;
              const hasClaimed =
                rewardItem &&
                (profile.unlockedCostumes?.includes(rewardItem) || profile.unlockedItems?.includes(rewardItem));

              const progressPct = Math.min(100, (currentStreak / challenge.targetDays) * 100);
              const challengeIcon = challenge.icon || challenge.badgeIcon || '🏅';
              const challengeSubtitle = challenge.subtitle || challenge.description || '';

              return (
                <div
                  key={challenge.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isAchieved
                      ? 'bg-white border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="text-2xl p-2 rounded-xl bg-slate-100">
                        {challengeIcon}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <span>{challenge.title}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            +{challenge.rewardCoins} 코인
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {challengeSubtitle}
                        </p>
                      </div>
                    </div>

                    {isAchieved ? (
                      <button
                        onClick={() =>
                          handleClaimReward(
                            challenge.id,
                            challenge.rewardCoins,
                            rewardItem
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs whitespace-nowrap active:scale-95 transition-all"
                      >
                        달성 완료!
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-xl whitespace-nowrap">
                        {currentStreak}/{challenge.targetDays}일
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      className={`h-full rounded-full ${
                        isAchieved
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-pink-400 to-rose-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
