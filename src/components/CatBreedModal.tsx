import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sparkles, Heart } from 'lucide-react';
import { CAT_BREEDS } from '../data/catBreeds';
import { CatBreedId } from '../types';
import { playCheerChime, triggerVibration } from '../utils/audio';

interface CatBreedModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBreedId: string;
  onSelectBreed: (breedId: CatBreedId) => void;
}

export const CatBreedModal: React.FC<CatBreedModalProps> = ({
  isOpen,
  onClose,
  selectedBreedId,
  onSelectBreed,
}) => {
  if (!isOpen) return null;

  const handleSelect = (breedId: CatBreedId) => {
    triggerVibration(40);
    playCheerChime();
    onSelectBreed(breedId);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-3xl border border-pink-100 shadow-2xl p-5 z-10 max-h-[88vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center text-xl shadow-sm shadow-pink-200">
                🐾
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <span>내 냥이 종류 선택</span>
                  <span className="text-xs bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-full font-bold">
                    {CAT_BREEDS.length}종
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  나와 함께 술을 마시고 취기를 나눌 고양이를 선택하세요
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Breeds List */}
          <div className="overflow-y-auto py-3.5 space-y-3 flex-1 pr-1">
            {CAT_BREEDS.map((breed) => {
              const isSelected = selectedBreedId === breed.id;
              return (
                <motion.div
                  key={breed.id}
                  onClick={() => handleSelect(breed.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-2xl sm:rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50/80 shadow-md shadow-pink-100'
                      : 'border-slate-200 bg-white hover:border-pink-300 hover:bg-pink-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Emoji Avatar Box */}
                    <div className="relative w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-3xl bg-slate-50 border border-slate-200/80 shadow-xs">
                      <span>{breed.emoji}</span>
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs shadow-xs">
                          <Heart className="w-3 h-3 fill-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-black text-slate-900">
                          {breed.name}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-pink-100 text-pink-700 border border-pink-200/60 whitespace-nowrap">
                          {breed.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                        {breed.description}
                      </p>
                    </div>
                  </div>

                  {/* Selection Check Circle */}
                  <div className="ml-2 shrink-0">
                    {isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full border-2 border-slate-300 hover:border-pink-400 transition-colors" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>언제든 자유롭게 변경할 수 있어요</span>
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-pink-500 text-white text-xs font-black rounded-2xl shadow-md shadow-pink-200 hover:bg-pink-600 active:scale-95 transition-all cursor-pointer"
            >
              선택 완료
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
