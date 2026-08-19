import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, AlertTriangle } from 'lucide-react';

interface GlassGaugeProps {
  sojuGlasses: number; // e.g. 3.5 glasses
  limitGlasses: number; // e.g. 7 glasses (1 bottle)
  pureAlcoholGrams: number;
  totalVolumeMl: number;
  drunkStage: number;
}

export const GlassGauge: React.FC<GlassGaugeProps> = ({
  sojuGlasses,
  limitGlasses,
  pureAlcoholGrams,
  totalVolumeMl,
  drunkStage
}) => {
  // Max scale is either 12 glasses or limit + 4
  const maxScale = Math.max(10, limitGlasses + 3);
  const fillRatio = Math.min(1.0, sojuGlasses / maxScale);
  const fillPercent = Math.max(4, Math.round(fillRatio * 100));

  // Determine liquid color gradient by drunk stage
  const getLiquidGradient = () => {
    switch (drunkStage) {
      case 0:
        return 'from-pink-500 to-amber-400';
      case 1:
        return 'from-pink-500 via-purple-400 to-amber-400';
      case 2:
        return 'from-rose-500 via-pink-400 to-yellow-400';
      case 3:
        return 'from-red-500 via-pink-500 to-amber-400';
      case 4:
      default:
        return 'from-purple-800 via-rose-500 to-amber-500';
    }
  };

  const ticks = [
    { value: 0, label: '0' },
    { value: 2, label: '2잔' },
    { value: 4, label: '4잔' },
    { value: 7, label: '1병(7잔)' },
    { value: 10, label: '10잔' }
  ];

  return (
    <div className="w-full bg-white border-2 border-pink-100 rounded-3xl p-4 shadow-sm">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-pink-500 flex items-center justify-center text-white font-black text-base shadow-sm shadow-pink-200">
            🍶
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">오늘 마신 양 (소주 환산)</div>
            <div className="text-xl font-black text-slate-800 flex items-baseline gap-1">
              <span className={drunkStage >= 3 ? 'text-rose-600' : 'text-pink-600'}>
                {sojuGlasses}
              </span>
              <span className="text-xs font-bold text-slate-600">잔</span>
              <span className="text-xs text-slate-400 font-normal ml-1">
                ({(sojuGlasses / 7.2).toFixed(1)}병)
              </span>
            </div>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-pink-50 text-pink-700 px-2.5 py-1 rounded-xl border border-pink-200">
            <span>순수 알코올</span>
            <strong className="text-slate-900 font-black">{pureAlcoholGrams}g</strong>
          </span>
          <span className="text-[10px] text-slate-500 font-medium">총 음주량 {totalVolumeMl.toLocaleString()}ml</span>
        </div>
      </div>

      {/* Glass & Measurement Gauge Graphic */}
      <div className="relative flex items-center gap-4 pt-2 pb-1">
        {/* Glass Container */}
        <div className="relative w-28 h-56 mx-auto bg-slate-900 border-4 border-slate-700 rounded-b-[40px] rounded-t-lg overflow-hidden shadow-inner flex flex-col justify-end p-1">
          {/* Glass Specular Highlights */}
          <div className="absolute top-0 left-2 w-2 h-full bg-gradient-to-r from-white/30 to-transparent pointer-events-none z-20" />
          <div className="absolute top-0 right-2 w-1 h-full bg-white/15 pointer-events-none z-20" />

          {/* Limit / Danger Line Marker */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-rose-400 z-20 flex items-center justify-end px-1"
            style={{ bottom: `${Math.min(95, (limitGlasses / maxScale) * 100)}%` }}
          >
            <span className="text-[9px] bg-rose-600 text-white font-black px-1.5 py-0.5 rounded shadow-sm">
              내 주량 {limitGlasses}잔
            </span>
          </div>

          {/* Liquid Rising Wave Animation */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${fillPercent}%` }}
            transition={{ type: 'spring', damping: 18, stiffness: 120 }}
            className={`relative w-full rounded-b-[32px] bg-gradient-to-t ${getLiquidGradient()} transition-colors duration-700 shadow-lg`}
          >
            {/* Liquid Surface Ripple Line */}
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-white/50 rounded-full blur-[0.5px]" />

            {/* Rising Effervescent Bubbles */}
            <motion.div
              animate={{ y: [0, -60], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
              className="absolute bottom-2 left-3 w-2 h-2 rounded-full bg-white/80"
            />
            <motion.div
              animate={{ y: [0, -80], opacity: [0.7, 0] }}
              transition={{ repeat: Infinity, duration: 2.1, delay: 0.4, ease: 'easeOut' }}
              className="absolute bottom-4 right-4 w-2.5 h-2.5 rounded-full bg-white/70"
            />
            <motion.div
              animate={{ y: [0, -50], opacity: [0.9, 0] }}
              transition={{ repeat: Infinity, duration: 1.3, delay: 0.8, ease: 'easeOut' }}
              className="absolute bottom-1 left-7 w-1.5 h-1.5 rounded-full bg-white/90"
            />
          </motion.div>

          {/* Glass Base */}
          <div className="absolute bottom-0 left-0 right-0 h-3.5 bg-slate-950/90 border-t border-white/10 rounded-b-[36px]" />
        </div>

        {/* Graduated Measurement Scale & Ticks */}
        <div className="flex-1 flex flex-col justify-between h-56 py-2 text-xs font-bold">
          {ticks.map(tick => {
            const isReached = sojuGlasses >= tick.value && tick.value > 0;
            return (
              <div key={tick.value} className="flex items-center gap-2">
                <div
                  className={`w-4 h-[3px] rounded-full transition-colors ${
                    isReached ? 'bg-pink-500 shadow-sm' : 'bg-slate-200'
                  }`}
                />
                <span
                  className={`text-[11px] ${
                    isReached ? 'text-pink-600 font-black' : 'text-slate-400'
                  }`}
                >
                  {tick.label}
                </span>
                {tick.value === limitGlasses && (
                  <span className="text-[10px] text-pink-700 font-black bg-pink-100 px-1.5 py-0.5 rounded border border-pink-200">
                    목표한도
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress & Warning Message */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
          {sojuGlasses > limitGlasses ? (
            <span className="flex items-center gap-1 text-rose-600 font-black">
              <AlertTriangle className="w-3.5 h-3.5" />
              주량({limitGlasses}잔)을 {Number((sojuGlasses - limitGlasses).toFixed(1))}잔 초과했어요!
            </span>
          ) : sojuGlasses === 0 ? (
            <span className="flex items-center gap-1 text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              오늘의 첫 잔을 기록해보세요!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-pink-600 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              설정 주량까지 {Number(Math.max(0, limitGlasses - sojuGlasses).toFixed(1))}잔 남았습니다
            </span>
          )}
        </div>

        {/* Gauge percentage */}
        <span className="text-xs font-black text-pink-700 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200">
          {Math.round((sojuGlasses / limitGlasses) * 100)}%
        </span>
      </div>
    </div>
  );
};
