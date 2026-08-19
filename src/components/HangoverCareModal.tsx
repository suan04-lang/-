import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Droplets, Phone, Copy, Check, Car, Utensils, Heart } from 'lucide-react';
import { playPourSound, triggerVibration } from '../utils/audio';

interface HangoverCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  waterMl: number;
  waterGoalMl: number;
  onAddWater: (amountMl: number) => void;
}

export const HangoverCareModal: React.FC<HangoverCareModalProps> = ({
  isOpen,
  onClose,
  waterMl,
  waterGoalMl,
  onAddWater
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const waterPercent = Math.min(100, Math.round((waterMl / waterGoalMl) * 100));

  const handleWaterClick = (ml: number) => {
    triggerVibration(40);
    playPourSound();
    onAddWater(ml);
  };

  const handleCopySafeMessage = () => {
    const text = `[귀가 안심 알림] 저 지금 안전하게 대리/택시 타고 집으로 귀가 중입니다! 🚕 걱정하지 마세요.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerVibration(30);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <span className="text-xl">💧</span>
            <h2 className="text-base font-black text-slate-800">숙취 케어 & 안전 귀가</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-pink-100 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50">
          {/* Hydration Tracker Card */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-500" />
                <span className="text-xs font-black text-slate-800">오늘의 수분 섭취량</span>
              </div>
              <span className="text-xs font-black text-pink-600">{waterMl} / {waterGoalMl} ml ({waterPercent}%)</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3 p-0.5 border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${waterPercent}%` }}
              />
            </div>

            {/* Quick Water Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '+200ml (1컵)', ml: 200 },
                { label: '+350ml (머그)', ml: 350 },
                { label: '+500ml (1병)', ml: 500 }
              ].map(btn => (
                <button
                  key={btn.ml}
                  onClick={() => handleWaterClick(btn.ml)}
                  className="py-2.5 px-1 text-xs font-black bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-xl transition-all active:scale-95 text-center shadow-sm"
                >
                  💧 {btn.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center font-medium">
              💡 물을 충분히 마시면 알코올 분해가 2배 빨라지고 숙취가 줄어듭니다!
            </p>
          </div>

          {/* Safe Ride & Return Home */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800">
              <Car className="w-4 h-4 text-pink-500" />
              <span>안전 귀가 & 대리운전</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:1577-1577"
                className="flex items-center justify-center gap-1.5 py-3 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all active:scale-95 border border-slate-200"
              >
                <Phone className="w-3.5 h-3.5 text-pink-500" />
                대리운전 전화걸기
              </a>

              <a
                href="https://kakaot.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 px-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm"
              >
                🚖 카카오 T 택시
              </a>
            </div>

            {/* Safe Message Copy */}
            <button
              onClick={handleCopySafeMessage}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-between border border-slate-200 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-500" />
                가족/친구에게 안심 귀가 문자 복사
              </span>
              {copied ? (
                <span className="text-pink-600 flex items-center gap-1 text-[11px] font-black">
                  <Check className="w-3 h-3" /> 복사 완료!
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

          {/* Hangover Food Recommendations */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 mb-2.5">
              <Utensils className="w-4 h-4 text-amber-500" />
              <span>추천 해장 음식 & 음료</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-black text-slate-800">🍲 콩나물국 / 북엇국</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">아스파라긴산으로 간 해독 촉진</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-black text-slate-800">🍯 따뜻한 꿀물 / 이온음료</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">당분 및 전해질 즉각 보충</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-black text-slate-800">🍅 토마토 주스</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">라이코펜이 아세트알데히드 배출</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-black text-slate-800">🍌 바나나 / 초코우유</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">칼륨 보충 & 위벽 보호</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
