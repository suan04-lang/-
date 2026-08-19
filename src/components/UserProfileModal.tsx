import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Save, Sparkles } from 'lucide-react';
import { UserProfile, CatBreedId } from '../types';
import { CAT_BREEDS } from '../data/catBreeds';
import { triggerVibration } from '../utils/audio';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (newProfile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) => {
  const [name, setName] = useState<string>(profile.name);
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender);
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg);
  const [sojuLimitGlasses, setSojuLimitGlasses] = useState<number>(profile.sojuLimitGlasses);
  const [waterGoalMl, setWaterGoalMl] = useState<number>(profile.waterIntakeGoalMl);
  const [catBreedId, setCatBreedId] = useState<string>(profile.catBreedId || 'cheese');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerVibration(40);
    onSaveProfile({
      name: name.trim() || '나의 주당',
      gender,
      weightKg: Math.max(30, Math.min(200, weightKg)),
      sojuLimitGlasses: Math.max(1, Math.min(30, sojuLimitGlasses)),
      waterIntakeGoalMl: Math.max(500, Math.min(5000, waterGoalMl)),
      catBreedId: catBreedId as CatBreedId
    });
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
            <User className="w-5 h-5 text-pink-500" />
            <h2 className="text-base font-black text-slate-800">내 주량 및 프로필 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-pink-100 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50">
          {/* Cat Variety Selection */}
          <div className="bg-white p-4 rounded-3xl border border-pink-100 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>🐾 함께할 고양이 캐릭터 선택</span>
              </label>
              <span className="text-xs text-pink-700 font-black bg-pink-100 px-2.5 py-0.5 rounded-full border border-pink-200">
                {CAT_BREEDS.find(b => b.id === catBreedId)?.name || '치즈냥이'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {CAT_BREEDS.map(breed => (
                <button
                  type="button"
                  key={breed.id}
                  onClick={() => {
                    triggerVibration(25);
                    setCatBreedId(breed.id);
                  }}
                  className={`p-3 rounded-2xl text-left border-2 text-xs transition-all flex items-center gap-2.5 cursor-pointer ${
                    catBreedId === breed.id
                      ? 'border-pink-500 bg-pink-50/80 text-pink-900 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-pink-200 hover:bg-white'
                  }`}
                >
                  <span className="text-2xl shrink-0">{breed.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-black truncate">{breed.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{breed.badge}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">닉네임</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">성별 (BAC 계산용)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2.5 text-xs font-black rounded-xl border transition-all ${
                  gender === 'male'
                    ? 'bg-pink-500 border-pink-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                남성 (R=0.70)
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2.5 text-xs font-black rounded-xl border transition-all ${
                  gender === 'female'
                    ? 'bg-pink-500 border-pink-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                여성 (R=0.60)
              </button>
            </div>
          </div>

          {/* Weight */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">체중 (kg)</label>
              <span className="text-xs font-black text-pink-600">{weightKg} kg</span>
            </div>
            <input
              type="range"
              min="40"
              max="130"
              step="1"
              value={weightKg}
              onChange={e => setWeightKg(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          {/* My Target Limit (Soju Glasses) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">내 주량 한도 (소주잔 기준)</label>
              <span className="text-xs font-black text-pink-600">
                {sojuLimitGlasses}잔 ({(sojuLimitGlasses / 7.2).toFixed(1)}병)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="21"
              step="1"
              value={sojuLimitGlasses}
              onChange={e => setSojuLimitGlasses(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
            <div className="flex gap-1.5 mt-2">
              {[
                { label: '반병(3.5잔)', val: 4 },
                { label: '1병(7잔)', val: 7 },
                { label: '1.5병(11잔)', val: 11 },
                { label: '2병(14잔)', val: 14 }
              ].map(item => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => setSojuLimitGlasses(item.val)}
                  className="flex-1 py-1 text-[10px] font-bold bg-white hover:bg-pink-50 text-slate-700 rounded-lg border border-slate-200"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Water goal */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">음주 시 수분 섭취 목표</label>
              <span className="text-xs font-black text-cyan-600">{waterGoalMl} ml</span>
            </div>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={waterGoalMl}
              onChange={e => setWaterGoalMl(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-black rounded-2xl shadow-md shadow-pink-200 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            설정 저장하기
          </button>
        </form>
      </motion.div>
    </div>
  );
};
