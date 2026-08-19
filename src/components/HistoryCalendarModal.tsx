import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, ChevronLeft, ChevronRight, Coins, Flame, CheckCircle2 } from 'lucide-react';
import { loadDrinksForDate, getTodayKey } from '../utils/storage';
import { calculateSoberStats } from '../utils/soberStats';

interface HistoryCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryCalendarModal: React.FC<HistoryCalendarModalProps> = ({
  isOpen,
  onClose
}) => {
  const todayKey = getTodayKey();
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(() => todayKey.slice(0, 7)); // 'YYYY-MM'
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  const soberStats = useMemo(() => calculateSoberStats(), []);

  // Parse current year & month
  const [year, month] = currentYearMonth.split('-').map(Number);

  // Month navigation
  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    const ym = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setCurrentYearMonth(ym);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    const ym = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setCurrentYearMonth(ym);
  };

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 = Sun, 1 = Mon...
    const daysInMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Empty slots before month start
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: 0, dateKey: '', isCurrentMonth: false, isSober: true, glasses: 0, grams: 0 });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isFuture = dateKey > todayKey;
      const logs = loadDrinksForDate(dateKey);
      const grams = logs.reduce((sum, item) => sum + item.alcoholGrams, 0);
      const glasses = Number((grams / 6.4).toFixed(1));

      days.push({
        day: d,
        dateKey,
        isCurrentMonth: true,
        isFuture,
        isToday: dateKey === todayKey,
        isSober: grams === 0,
        glasses,
        grams,
        logCount: logs.length
      });
    }

    return days;
  }, [year, month, todayKey]);

  // Selected date details
  const logsForSelected = selectedDate ? loadDrinksForDate(selectedDate) : [];
  const selectedTotalGrams = Math.round(logsForSelected.reduce((sum, item) => sum + item.alcoholGrams, 0));
  const selectedTotalGlasses = Number((selectedTotalGrams / 6.4).toFixed(1));
  const selectedTotalCalories = logsForSelected.reduce((sum, item) => sum + item.calories, 0);

  if (!isOpen) return null;

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
            <Calendar className="w-5 h-5 text-pink-500" />
            <h2 className="text-base font-black text-slate-800">금주 캘린더 & 절약 통계</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-pink-100 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50">
          {/* Top Cumulative Savings & Streak Header Banner */}
          <div className="p-4 bg-white border border-pink-100 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>누적 절약한 술값</span>
              </div>
              <div className="text-[11px] font-bold text-pink-600 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>연속 {soberStats.currentStreakDays}일 금주 중</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-black text-slate-900">
                +{soberStats.totalSavedMoneyWon.toLocaleString()}원
              </span>
              <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                🍗 치킨 약 {soberStats.savedChickenCount}마리
              </span>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-[11px]">
              <div>
                <span className="text-slate-500">이번달 금주</span>
                <div className="font-black text-emerald-600">{soberStats.totalSoberDaysInMonth}일</div>
              </div>
              <div>
                <span className="text-slate-500">이번달 음주</span>
                <div className="font-black text-rose-600">{soberStats.totalDrinkingDaysInMonth}일</div>
              </div>
              <div>
                <span className="text-slate-500">최장 연속 금주</span>
                <div className="font-black text-pink-600">{soberStats.longestStreakDays}일</div>
              </div>
            </div>
          </div>

          {/* Month Switcher Bar */}
          <div className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-pink-100 text-slate-600 hover:text-pink-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-black text-slate-800">
              {year}년 {month}월
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-pink-100 text-slate-600 hover:text-pink-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Monthly Calendar Grid */}
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500 mb-2">
              <span className="text-rose-500">일</span>
              <span>월</span>
              <span>화</span>
              <span>수</span>
              <span>목</span>
              <span>금</span>
              <span className="text-blue-500">토</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return <div key={`empty-${idx}`} className="h-12" />;
                }

                const isSelected = cell.dateKey === selectedDate;
                const isPastOrToday = !cell.isFuture;

                return (
                  <button
                    key={cell.dateKey}
                    onClick={() => setSelectedDate(cell.dateKey)}
                    className={`h-13 rounded-xl flex flex-col items-center justify-between p-1 transition-all border text-[10px] relative ${
                      isSelected
                        ? 'bg-pink-500 border-pink-600 text-white shadow-md'
                        : cell.isToday
                        ? 'bg-pink-50 border-pink-300 text-pink-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-pink-50'
                    }`}
                  >
                    {/* Day number */}
                    <span className={`text-[10px] font-black ${isSelected ? 'text-white' : cell.isToday ? 'text-pink-600' : ''}`}>
                      {cell.day}
                    </span>

                    {/* Status Badge icon */}
                    {isPastOrToday ? (
                      cell.isSober ? (
                        <div className="flex flex-col items-center">
                          <span className="text-xs">🌿</span>
                          <span className={`text-[7px] font-bold leading-none ${isSelected ? 'text-emerald-100' : 'text-emerald-600'}`}>금주</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-xs">🍶</span>
                          <span className={`text-[7px] font-bold leading-none ${isSelected ? 'text-rose-100' : 'text-rose-600'}`}>
                            {cell.glasses}잔
                          </span>
                        </div>
                      )
                    ) : (
                      <span className="text-[8px] text-slate-300">·</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span>🌿</span>
                <strong className="text-emerald-600">금주 성공일</strong>
              </span>
              <span className="flex items-center gap-1">
                <span>🍶</span>
                <strong className="text-rose-600">음주일 (잔 수)</strong>
              </span>
            </div>
          </div>

          {/* Selected Date Summary & Logs Card */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">{selectedDate} 상세 기록</span>
              {selectedTotalGlasses > 0 ? (
                <span className="text-xs font-black text-rose-600">
                  소주 환산 {selectedTotalGlasses}잔 ({(selectedTotalGlasses / 7.2).toFixed(1)}병)
                </span>
              ) : (
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>완벽한 금주 달성! 🌿</span>
                </span>
              )}
            </div>

            {logsForSelected.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">순수 알코올</div>
                    <div className="text-sm font-black text-slate-800 mt-0.5">{selectedTotalGrams}g</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">총 음용량</div>
                    <div className="text-sm font-black text-slate-800 mt-0.5">
                      {logsForSelected.reduce((s, i) => s + i.volumeMl, 0)}ml
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">총 칼로리</div>
                    <div className="text-sm font-black text-pink-600 mt-0.5">{selectedTotalCalories}kcal</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {logsForSelected.map(log => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-black text-slate-800">{log.name}</span>
                        <span className="text-pink-600 text-[11px] ml-1.5">({log.sojuEquivalentGlasses}잔)</span>
                        <div className="text-[10px] text-slate-500">
                          {log.volumeMl}ml ({log.abv}%) · {log.calories}kcal
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                술을 마시지 않고 건강하게 보낸 날입니다! 간이 푹 쉬었습니다. 😺💕
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
