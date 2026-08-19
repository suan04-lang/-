import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Sparkles } from 'lucide-react';
import { DRINK_PRESETS } from '../data/drinkPresets';
import { DRINK_REASONS } from '../data/drinkReasons';
import { DrinkPreset, DrinkLogItem, DrinkCategory, DrinkReason } from '../types';
import { playPourSound, playClinkSound, playGulpSound, triggerVibration } from '../utils/audio';

interface QuickAddDrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDrink: (drink: Omit<DrinkLogItem, 'id' | 'timestamp'>) => void;
}

export const QuickAddDrinkModal: React.FC<QuickAddDrinkModalProps> = ({
  isOpen,
  onClose,
  onAddDrink
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedReason, setSelectedReason] = useState<DrinkReason>('friends');
  const [customReasonText, setCustomReasonText] = useState<string>('');

  // Custom Drink State
  const [customName, setCustomName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<DrinkCategory>('custom');
  const [customVolume, setCustomVolume] = useState<number>(200);
  const [customAbv, setCustomAbv] = useState<number>(16);
  const [customNote, setCustomNote] = useState<string>('');

  const filteredPresets = selectedCategory === 'all'
    ? DRINK_PRESETS
    : DRINK_PRESETS.filter(p => p.category === selectedCategory);

  const handleSelectPreset = (preset: DrinkPreset) => {
    triggerVibration(50);
    playPourSound();
    setTimeout(() => {
      playGulpSound();
    }, 150);

    const alcoholGrams = Number((preset.volumeMl * (preset.abv / 100) * 0.8).toFixed(1));
    const sojuEquivalentGlasses = Number((alcoholGrams / 6.4).toFixed(1));

    onAddDrink({
      category: preset.category,
      name: preset.name,
      volumeMl: preset.volumeMl,
      abv: preset.abv,
      alcoholGrams,
      sojuEquivalentGlasses,
      calories: preset.calories,
      note: preset.description,
      reason: selectedReason,
      reasonText: customReasonText.trim() || undefined
    });
    onClose();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    triggerVibration(60);
    playClinkSound();
    setTimeout(() => {
      playGulpSound();
    }, 150);

    const alcoholGrams = Number((customVolume * (customAbv / 100) * 0.8).toFixed(1));
    const sojuEquivalentGlasses = Number((alcoholGrams / 6.4).toFixed(1));
    const estimatedCalories = Math.round(customVolume * (customAbv / 100) * 7);

    onAddDrink({
      category: customCategory,
      name: customName.trim(),
      volumeMl: customVolume,
      abv: customAbv,
      alcoholGrams,
      sojuEquivalentGlasses,
      calories: estimatedCalories,
      note: customNote.trim() || undefined,
      reason: selectedReason,
      reasonText: customReasonText.trim() || undefined
    });

    // Reset custom
    setCustomName('');
    setCustomNote('');
    setCustomReasonText('');
    onClose();
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
            <span className="text-xl">🍻</span>
            <div>
              <h2 className="text-base font-black text-slate-800">술 마신 양 & 이유 기록</h2>
              <p className="text-[11px] text-slate-500 font-medium">내가 마시면 냥이도 함께 마셔요!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-pink-100 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drinking Reason Picker Section (Top sticky banner) */}
        <div className="p-3 bg-amber-50/70 border-b border-amber-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black text-amber-900 flex items-center gap-1">
              <span>🎯</span> 오늘 술 마시는 이유는 무엇인가요?
            </span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-200/60 px-1.5 py-0.5 rounded-full">
              패턴 분석 연동
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {DRINK_REASONS.map(reason => (
              <button
                type="button"
                key={reason.id}
                onClick={() => setSelectedReason(reason.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                  selectedReason === reason.id
                    ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                    : 'bg-white text-slate-700 border border-amber-200/80 hover:bg-amber-100/50'
                }`}
              >
                <span>{reason.emoji}</span>
                <span>{reason.label}</span>
              </button>
            ))}
          </div>

          {selectedReason === 'other' && (
            <input
              type="text"
              placeholder="구체적인 이유를 적어보세요 (예: 비가 와서, 프로젝트 릴리즈 등)"
              value={customReasonText}
              onChange={e => setCustomReasonText(e.target.value)}
              className="mt-2 w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            />
          )}
        </div>

        {/* Tab Toggle */}
        <div className="p-3 border-b border-slate-100 bg-slate-50">
          <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('preset')}
              className={`py-2 text-xs font-black rounded-xl transition-all ${
                activeTab === 'preset'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ 빠른 주종 선택
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`py-2 text-xs font-black rounded-xl transition-all ${
                activeTab === 'custom'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✍️ 직접 입력 / 커스텀
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {activeTab === 'preset' ? (
            <>
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: '전체' },
                  { id: 'soju', label: '🍶 소주' },
                  { id: 'beer', label: '🍺 맥주' },
                  { id: 'wine', label: '🍷 와인' },
                  { id: 'highball', label: '🍹 하이볼' },
                  { id: 'makgeolli', label: '🍶 막걸리' },
                  { id: 'whiskey', label: '🥃 양주' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-pink-500 text-white border border-pink-500 shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Preset Cards Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {filteredPresets.map(preset => (
                  <motion.button
                    key={preset.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectPreset(preset)}
                    className="flex flex-col text-left p-3 rounded-2xl bg-white hover:bg-pink-50/50 border border-slate-200 hover:border-pink-300 transition-all group shadow-sm relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-xl">
                        {preset.category === 'soju'
                          ? '🍶'
                          : preset.category === 'beer'
                          ? '🍺'
                          : preset.category === 'wine'
                          ? '🍷'
                          : preset.category === 'makgeolli'
                          ? '🍶'
                          : preset.category === 'whiskey'
                          ? '🥃'
                          : '🍹'}
                      </span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {preset.abv}%
                      </span>
                    </div>

                    <div className="font-black text-sm text-slate-800 group-hover:text-pink-600 transition-colors">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {preset.volumeMl}ml · {preset.calories}kcal
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-pink-600 font-bold">
                      <span>소주 {(preset.volumeMl * (preset.abv / 100) * 0.8 / 6.4).toFixed(1)}잔</span>
                      <Plus className="w-3.5 h-3.5 text-pink-500" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            /* Custom Drink Form */
            <form onSubmit={handleAddCustom} className="space-y-4">
              {/* Drink Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  술 이름 / 브랜드
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 원소주, 복분자주, 예거밤 등"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Drink Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  주종 카테고리
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: 'soju', label: '🍶 소주' },
                      { id: 'beer', label: '🍺 맥주' },
                      { id: 'wine', label: '🍷 와인' },
                      { id: 'whiskey', label: '🥃 양주' },
                      { id: 'highball', label: '🍹 하이볼' },
                      { id: 'makgeolli', label: '🍶 막걸리' },
                      { id: 'cocktail', label: '🍸 칵테일' },
                      { id: 'custom', label: '✨ 기타' }
                    ] as const
                  ).map(cat => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCustomCategory(cat.id)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        customCategory === cat.id
                          ? 'bg-pink-500 border-pink-500 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume (ml) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    음주량 (ml)
                  </label>
                  <span className="text-xs font-black text-pink-600">{customVolume} ml</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={customVolume}
                  onChange={e => setCustomVolume(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
                <div className="flex gap-1.5 mt-2">
                  {[50, 180, 355, 500].map(vol => (
                    <button
                      type="button"
                      key={vol}
                      onClick={() => setCustomVolume(vol)}
                      className="flex-1 py-1 text-[11px] font-bold bg-white hover:bg-pink-50 text-slate-700 rounded-lg border border-slate-200"
                    >
                      {vol}ml
                    </button>
                  ))}
                </div>
              </div>

              {/* ABV (%) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    알코올 도수 (%)
                  </label>
                  <span className="text-xs font-black text-pink-600">{customAbv} %</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  step="0.5"
                  value={customAbv}
                  onChange={e => setCustomAbv(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
                <div className="flex gap-1.5 mt-2">
                  {[
                    { label: '맥주 4.5%', val: 4.5 },
                    { label: '막걸리 6%', val: 6 },
                    { label: '소주 16%', val: 16 },
                    { label: '위스키 40%', val: 40 }
                  ].map(abv => (
                    <button
                      type="button"
                      key={abv.val}
                      onClick={() => setCustomAbv(abv.val)}
                      className="flex-1 py-1 text-[10px] font-bold bg-white hover:bg-pink-50 text-slate-700 rounded-lg border border-slate-200"
                    >
                      {abv.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memo Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  음주 메모 (장소 / 안주)
                </label>
                <input
                  type="text"
                  placeholder="예: 1차 회식, 삼겹살에 소주"
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Estimated pure alcohol preview */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">환산 순수 알코올</span>
                <span className="font-black text-pink-600">
                  {(customVolume * (customAbv / 100) * 0.8).toFixed(1)}g (소주 {(customVolume * (customAbv / 100) * 0.8 / 6.4).toFixed(1)}잔)
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 active:scale-[0.98] text-white font-black rounded-2xl shadow-md shadow-pink-200 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                이 술 기록하고 마시기!
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
