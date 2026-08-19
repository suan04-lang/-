import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Coins, PiggyBank, Edit3, Check, TrendingUp, Sparkles } from 'lucide-react';
import { SavedMoneyInfo } from '../types';

interface MoneySavedCardProps {
  savedInfo: SavedMoneyInfo;
  averageCostWon: number;
  onUpdateAverageCost: (cost: number) => void;
}

export const MoneySavedCard: React.FC<MoneySavedCardProps> = ({
  savedInfo,
  averageCostWon,
  onUpdateAverageCost
}) => {
  const [isEditingCost, setIsEditingCost] = useState<boolean>(false);
  const [inputCost, setInputCost] = useState<string>(String(averageCostWon));

  const handleSaveCost = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(inputCost);
    if (!isNaN(num) && num >= 5000) {
      onUpdateAverageCost(num);
    }
    setIsEditingCost(false);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 text-white shadow-md shadow-orange-200/50 space-y-3 relative overflow-hidden">
      {/* Decorative Coin Accents */}
      <div className="absolute -right-4 -bottom-4 text-6xl opacity-15 pointer-events-none">
        💰
      </div>

      {/* Top Title & Cost Edit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-100">
          <PiggyBank className="w-4 h-4 text-amber-200" />
          <span>금주로 아낀 술값 & 치킨 지수</span>
        </div>

        <button
          onClick={() => setIsEditingCost(!isEditingCost)}
          className="text-[11px] font-bold text-amber-100 hover:text-white bg-black/15 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>1회 {(averageCostWon / 10000).toFixed(1)}만원 기준</span>
        </button>
      </div>

      {/* Average Cost Edit Form Inline */}
      {isEditingCost && (
        <form onSubmit={handleSaveCost} className="flex gap-2 p-2 bg-black/20 rounded-2xl">
          <input
            type="number"
            value={inputCost}
            onChange={e => setInputCost(e.target.value)}
            className="flex-1 bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl outline-none"
            placeholder="1회 술자리 평균 비용 (원)"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-400 text-slate-900 text-xs font-black rounded-xl hover:bg-amber-300 transition-colors"
          >
            저장
          </button>
        </form>
      )}

      {/* Big Total Saved Amount */}
      <div className="space-y-0.5">
        <div className="text-[11px] text-amber-100 font-medium">총 절약한 음주 비용</div>
        <div className="text-2xl font-black tracking-tight flex items-baseline gap-1">
          <span>{savedInfo.totalSaved.toLocaleString()}</span>
          <span className="text-sm font-bold text-amber-100">원</span>
        </div>
      </div>

      {/* Chicken & Coffee Equivalent Conversions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-2.5 flex items-center gap-2 border border-white/20">
          <span className="text-2xl">🍗</span>
          <div>
            <div className="text-[10px] text-amber-100 font-bold">치킨 환산</div>
            <div className="text-xs font-black">{savedInfo.chickenEquivalent} 마리 아낌!</div>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-xs rounded-2xl p-2.5 flex items-center gap-2 border border-white/20">
          <span className="text-2xl">☕</span>
          <div>
            <div className="text-[10px] text-amber-100 font-bold">커피 환산</div>
            <div className="text-xs font-black">{savedInfo.coffeeEquivalent} 잔 아낌!</div>
          </div>
        </div>
      </div>
    </div>
  );
};
