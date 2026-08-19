import React from 'react';
import { motion } from 'motion/react';
import { Flame, Sparkles, Coins, Calendar, TrendingUp, Trophy } from 'lucide-react';
import { SoberStats } from '../utils/soberStats';

interface SoberStreakCardProps {
  stats: SoberStats;
  onOpenCalendar: () => void;
}

export const SoberStreakCard: React.FC<SoberStreakCardProps> = ({
  stats,
  onOpenCalendar
}) => {
  return (
    <div className="bg-white border-2 border-pink-100 rounded-3xl p-4 shadow-sm text-slate-800 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-500 flex items-center justify-center text-lg shadow-sm shadow-pink-200 text-white">
            {stats.currentStreakDays >= 3 ? '🔥' : '🌱'}
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span>연속 금주 챌린지</span>
              {stats.currentStreakDays > 0 && (
                <span className="text-[10px] bg-pink-100 text-pink-700 font-black px-2 py-0.5 rounded-full border border-pink-200">
                  {stats.currentStreakDays}일 연속
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">건강한 간과 지갑 지키기</p>
          </div>
        </div>

        <button
          onClick={onOpenCalendar}
          className="py-1.5 px-3 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-[11px] font-black border border-pink-200 transition-all flex items-center gap-1 shadow-sm active:scale-95"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>달력/통계</span>
        </button>
      </div>

      {/* Primary 2 Metrics: Streak Days & Money Saved */}
      <div className="grid grid-cols-2 gap-2.5 mb-3 relative z-10">
        {/* Metric 1: Streak */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold">현재 연속 금주</span>
            <Flame className={`w-3.5 h-3.5 ${stats.currentStreakDays > 0 ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <div className="my-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {stats.currentStreakDays}
            </span>
            <span className="text-xs font-bold text-slate-600">일째 달성</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>최장 기록: <strong className="text-slate-700 font-bold">{stats.longestStreakDays}일</strong></span>
          </div>
        </div>

        {/* Metric 2: Money Saved */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold">누적 절약 술값</span>
            <Coins className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="my-1 flex items-baseline gap-0.5">
            <span className="text-xl font-black text-pink-600 tracking-tight">
              +{stats.totalSavedMoneyWon.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-600">원</span>
          </div>
          <div className="text-[10px] text-amber-700 font-medium truncate bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            🍗 치킨 약 <strong>{stats.savedChickenCount}마리</strong>
          </div>
        </div>
      </div>

      {/* 7-Day Visual Mini Streak Graph / Timeline */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl relative z-10">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
            <span>최근 7일 금주 현황 그래프</span>
          </span>
          <span className="text-[10px] text-slate-500">
            이번달 성공률 <strong className="text-pink-600">{stats.monthSuccessRate}%</strong>
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {stats.recent7Days.map((day) => (
            <div key={day.dateKey} className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-slate-500 font-medium truncate w-full">
                {day.dayLabel.split('(')[0]}
              </span>

              {/* Status Bar / Indicator */}
              <div
                className={`w-full h-10 rounded-xl flex flex-col items-center justify-center p-0.5 transition-transform ${
                  day.isSober
                    ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700 shadow-sm'
                    : 'bg-rose-50 border border-rose-300 text-rose-600'
                }`}
              >
                {day.isSober ? (
                  <span className="text-xs">🌿</span>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-[11px]">🍶</span>
                    <span className="text-[8px] font-black text-rose-700 leading-none">
                      {day.glasses}잔
                    </span>
                  </div>
                )}
              </div>

              <span className={`text-[8px] font-bold ${day.isSober ? 'text-emerald-600' : 'text-rose-600'}`}>
                {day.isSober ? '금주' : `${day.glasses}잔`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
