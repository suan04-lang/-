import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Clock } from 'lucide-react';
import { DrinkLogItem } from '../types';

interface DrinkLogListProps {
  logs: DrinkLogItem[];
  onDeleteLog: (id: string) => void;
}

export const DrinkLogList: React.FC<DrinkLogListProps> = ({ logs, onDeleteLog }) => {
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'soju':
        return '🍶';
      case 'beer':
        return '🍺';
      case 'wine':
        return '🍷';
      case 'whiskey':
        return '🥃';
      case 'makgeolli':
        return '🍶';
      case 'highball':
      case 'cocktail':
        return '🍹';
      default:
        return '✨';
    }
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white border-2 border-pink-100 rounded-3xl p-6 text-center shadow-sm">
        <div className="text-3xl mb-2">🥂</div>
        <h3 className="text-sm font-black text-slate-800">오늘의 첫 잔을 기록해보세요!</h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          마신 술을 추가하면 귀여운 고양이가 함께 마시며 점점 취해갑니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-pink-100 rounded-3xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <h3 className="text-sm font-black text-slate-800 tracking-wide">오늘의 음주 타임라인</h3>
        </div>
        <span className="text-xs text-pink-700 font-black bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
          총 {logs.length}건
        </span>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {logs.map(log => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-pink-300 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-sm">
                  {getCategoryIcon(log.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800">{log.name}</span>
                    <span className="text-[11px] font-black text-pink-700 bg-pink-100 px-2 py-0.5 rounded-md border border-pink-200">
                      소주 {log.sojuEquivalentGlasses}잔
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5 text-pink-600 font-bold">
                      <Clock className="w-3 h-3 text-pink-500" />
                      {formatTime(log.timestamp)}
                    </span>
                    <span>·</span>
                    <span>{log.volumeMl}ml ({log.abv}%)</span>
                    <span>·</span>
                    <span>{log.calories}kcal</span>
                  </div>
                  {log.note && (
                    <div className="text-[11px] text-slate-600 mt-1 italic bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      "{log.note}"
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDeleteLog(log.id)}
                className="w-8 h-8 rounded-xl hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors shrink-0 ml-2 active:scale-95"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
