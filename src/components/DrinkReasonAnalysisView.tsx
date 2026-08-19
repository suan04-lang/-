import React, { useState } from 'react';
import { motion } from 'motion/react';
import { getReasonStatistics } from '../utils/storage';
import { DRINK_REASONS, getReasonInfo } from '../data/drinkReasons';
import { DrinkReason } from '../types';
import { Sparkles, TrendingUp, Calendar, AlertTriangle, Lightbulb, Bot, Compass } from 'lucide-react';

interface DrinkReasonAnalysisViewProps {
  onOpenAiCoach: () => void;
}

export const DrinkReasonAnalysisView: React.FC<DrinkReasonAnalysisViewProps> = ({
  onOpenAiCoach
}) => {
  const [periodDays, setPeriodDays] = useState<7 | 30>(30);
  const stats = getReasonStatistics(periodDays);

  const topReason = stats.topReasons[0];
  const peakDay = [...stats.dayOfWeekCounts].sort((a, b) => b.totalGlasses - a.totalGlasses)[0];

  return (
    <div className="space-y-4">
      {/* Top Header & Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-800 flex items-center gap-1.5">
            <span>📊</span> 음주 이유 & 패턴 분석
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            어떤 상황에서 술을 찾는지 나의 음주 트리거를 파악해요
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setPeriodDays(7)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              periodDays === 7 ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            최근 7일
          </button>
          <button
            onClick={() => setPeriodDays(30)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
              periodDays === 30 ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            최근 30일
          </button>
        </div>
      </div>

      {/* AI Coach Banner Trigger */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={onOpenAiCoach}
        className="cursor-pointer bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white rounded-3xl p-4 shadow-md shadow-pink-200/60 relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-black">
              <Bot className="w-3.5 h-3.5" />
              <span>AI 닥터 냥코치 연동</span>
            </div>
            <h3 className="text-sm font-black">
              내 패턴 맞춤 절주 방법 & 미션 받기 🐾
            </h3>
            <p className="text-xs text-pink-100 font-medium">
              가장 자주 겪는 음주 트리거를 분석하고 실천 팁을 제안해드려요!
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0 backdrop-blur-xs">
            ✨
          </div>
        </div>
      </motion.div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Top Trigger Card */}
        <div className="bg-white border border-rose-100 rounded-2xl p-3 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>최다 음주 이유 (트리거)</span>
          </div>
          {topReason ? (
            <div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xl">{getReasonInfo(topReason.reason).emoji}</span>
                <span className="text-sm font-black text-slate-800">
                  {getReasonInfo(topReason.reason).label}
                </span>
              </div>
              <p className="text-xs text-rose-600 font-bold mt-1">
                전체의 {topReason.percentage}% 차지 ({topReason.count}회)
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium mt-1">
              아직 기록된 음주 이유가 없어요
            </div>
          )}
        </div>

        {/* Peak Drinking Day Card */}
        <div className="bg-white border border-amber-100 rounded-2xl p-3 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>가장 술자리가 잦은 요일</span>
          </div>
          {peakDay && peakDay.totalGlasses > 0 ? (
            <div>
              <div className="text-sm font-black text-slate-800 mt-1">
                매주 <span className="text-amber-600">{peakDay.dayName}요일</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                총 {peakDay.count}회 (평균 {(peakDay.totalGlasses / peakDay.count).toFixed(1)}잔)
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium mt-1">
              음주 기록이 없습니다
            </div>
          )}
        </div>
      </div>

      {/* Drinking Reason Breakdown List */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <span>🎯</span> 음주 이유별 통계 분포
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            총 {stats.totalLoggedSessions}회 기록
          </span>
        </div>

        {stats.topReasons.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs font-medium">
            술을 마실 때 이유를 함께 선택하면 여기에 패턴 차트가 나타나요! 🐾
          </div>
        ) : (
          <div className="space-y-2.5">
            {stats.topReasons.map(item => {
              const reasonInfo = getReasonInfo(item.reason);
              return (
                <div key={item.reason} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span>{reasonInfo.emoji}</span>
                      <span className="text-slate-800">{reasonInfo.label}</span>
                    </div>
                    <div className="text-slate-600 font-mono">
                      <span>{item.count}회</span>
                      <span className="text-pink-600 ml-1.5">({item.percentage}%)</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
                    />
                  </div>
                  {/* Custom tip */}
                  <div className="text-[11px] text-slate-500 pl-6 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{reasonInfo.defaultTips}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Day of Week Bar Distribution */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-3">
        <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <span>📅</span> 요일별 음주량 분포
        </h3>

        <div className="grid grid-cols-7 gap-1.5 pt-2">
          {stats.dayOfWeekCounts.map(day => {
            const isHighest = peakDay?.dayName === day.dayName && day.totalGlasses > 0;
            return (
              <div key={day.dayName} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400">
                  {day.totalGlasses > 0 ? `${day.totalGlasses.toFixed(0)}잔` : '-'}
                </span>
                <div className="w-full h-20 bg-slate-100 rounded-xl flex items-end p-1 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${Math.min(100, (day.totalGlasses / Math.max(1, peakDay?.totalGlasses || 1)) * 100)}%`
                    }}
                    transition={{ duration: 0.6 }}
                    className={`w-full rounded-lg ${
                      isHighest
                        ? 'bg-gradient-to-t from-pink-500 to-rose-400'
                        : 'bg-gradient-to-t from-slate-300 to-slate-400'
                    }`}
                  />
                </div>
                <span className={`text-xs font-black ${isHighest ? 'text-pink-600' : 'text-slate-600'}`}>
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
