import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Target, Check, AlertCircle } from 'lucide-react';
import { DrinkingGoal } from '../types';
import { playCheerChime, triggerVibration } from '../utils/audio';

interface DrinkingGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal?: DrinkingGoal;
  onSaveGoal: (goal: DrinkingGoal) => void;
}

export const DrinkingGoalModal: React.FC<DrinkingGoalModalProps> = ({
  isOpen,
  onClose,
  currentGoal,
  onSaveGoal
}) => {
  const [maxGlasses, setMaxGlasses] = useState<number>(currentGoal?.maxGlassesPerSession || 2);
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState<number>(currentGoal?.targetDaysPerWeek || 2);
  const [note, setNote] = useState<string>(currentGoal?.note || '친구들과 가볍게 1차만 즐기기');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerVibration(50);
    playCheerChime();

    onSaveGoal({
      id: currentGoal?.id || `goal_${Date.now()}`,
      maxGlassesPerSession: maxGlasses,
      targetDaysPerWeek,
      note: note.trim() || undefined,
      createdAt: currentGoal?.createdAt || Date.now()
    });

    onClose();
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
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm shadow-xs">
              🎯
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">절주 목표 설정</h2>
              <p className="text-[11px] text-slate-500 font-medium">
                술자리 전 나만의 주량 리밋을 정하고 지켜보세요
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {/* 1회 최대 음주량 (소주잔 기준) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                <span>🍶</span> 1회 술자리 목표 음주량
              </label>
              <span className="text-sm font-black text-pink-600">소주 {maxGlasses}잔 이하</span>
            </div>

            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={maxGlasses}
              onChange={e => setMaxGlasses(Number(e.target.value))}
              className="w-full accent-pink-500"
            />

            <div className="flex gap-1.5 pt-1">
              {[1, 2, 3, 5, 7].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setMaxGlasses(val)}
                  className={`flex-1 py-1 text-xs font-bold rounded-xl border transition-all ${
                    maxGlasses === val
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {val}잔
                </button>
              ))}
            </div>
          </div>

          {/* 주간 최대 음주 횟수 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                <span>📅</span> 1주일 최대 음주 횟수
              </label>
              <span className="text-sm font-black text-pink-600">주 {targetDaysPerWeek}회 이하</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[0, 1, 2, 3, 4].map(days => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setTargetDaysPerWeek(days)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    targetDaysPerWeek === days
                      ? 'bg-pink-500 text-white border-pink-500 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {days === 0 ? '완전 금주' : `주 ${days}회`}
                </button>
              ))}
            </div>
          </div>

          {/* 나만의 다짐 메모 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1.5">
            <label className="block text-xs font-black text-slate-800">
              ✍️ 오늘의 다짐 / 약속 메모
            </label>
            <input
              type="text"
              placeholder="예: 2차는 카페 가기, 안주 위주로 먹기"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-2xl shadow-md shadow-pink-200 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Check className="w-4 h-4" />
            절주 목표 저장하기
          </button>
        </form>
      </motion.div>
    </div>
  );
};
