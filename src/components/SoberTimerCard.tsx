import React from 'react';
import { Clock, Car, Droplets } from 'lucide-react';
import { BacResult } from '../utils/bacCalculator';

interface SoberTimerCardProps {
  bacInfo: BacResult;
  onOpenWaterModal: () => void;
}

export const SoberTimerCard: React.FC<SoberTimerCardProps> = ({
  bacInfo,
  onOpenWaterModal
}) => {
  const formatSoberTime = (date: Date | null) => {
    if (!date) return '현재 술 섭취 없음';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const isTomorrow = date.getDate() !== new Date().getDate();
    return `${isTomorrow ? '내일 ' : '오늘 '}${hours}:${minutes}`;
  };

  const formatRemainingDuration = (minutes: number) => {
    if (minutes <= 0) return '0분';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}분 후`;
    return `${hrs}시간 ${mins}분 후`;
  };

  const getBacColor = () => {
    if (bacInfo.currentBac >= 0.08) return 'text-rose-700 border-rose-300 bg-rose-50 font-black';
    if (bacInfo.currentBac >= 0.03) return 'text-amber-800 border-amber-300 bg-amber-50 font-black';
    if (bacInfo.currentBac > 0) return 'text-pink-700 border-pink-200 bg-pink-50 font-bold';
    return 'text-slate-600 border-slate-200 bg-slate-100 font-medium';
  };

  return (
    <div className="w-full bg-white border-2 border-pink-100 rounded-3xl p-4 shadow-sm">
      {/* BAC Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">추정 혈중알코올농도 (BAC)</div>
            <div className="text-lg font-black text-slate-800 flex items-center gap-2 mt-0.5">
              <span>{(bacInfo.currentBac * 100).toFixed(3)}</span>
              <span className="text-pink-600 text-sm font-black">%</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getBacColor()}`}>
                {bacInfo.currentBac >= 0.08
                  ? '면허취소 (0.08%+)'
                  : bacInfo.currentBac >= 0.03
                  ? '면허정지 (0.03%+)'
                  : bacInfo.currentBac > 0
                  ? '알코올 감지'
                  : '정상'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Water Button */}
        <button
          onClick={onOpenWaterModal}
          className="flex items-center gap-1 bg-pink-500 hover:bg-pink-600 text-white px-3.5 py-2 rounded-2xl text-xs font-black transition-all active:scale-95 shadow-sm shadow-pink-200"
        >
          <Droplets className="w-4 h-4 text-white" />
          <span>물 마시기</span>
        </button>
      </div>

      {/* Sober Countdown Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
        <div>
          <div className="text-[11px] text-slate-500 font-semibold">술이 완전히 깨는 예상 시간</div>
          <div className="text-sm font-black text-slate-800 mt-0.5">
            {formatSoberTime(bacInfo.soberTimeDate)}
            {bacInfo.soberTimeMinutes > 0 && (
              <span className="text-xs font-black text-pink-600 ml-1.5">
                (약 {formatRemainingDuration(bacInfo.soberTimeMinutes)})
              </span>
            )}
          </div>
        </div>

        {/* Driving Warning */}
        <div className="flex items-center gap-1.5 text-xs">
          {bacInfo.currentBac >= 0.03 ? (
            <span className="flex items-center gap-1 text-rose-700 font-black bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-xl">
              <Car className="w-3.5 h-3.5" />
              운전 금지!
            </span>
          ) : (
            <span className="text-slate-400 text-[11px] font-medium">위드마크 기준</span>
          )}
        </div>
      </div>
    </div>
  );
};
