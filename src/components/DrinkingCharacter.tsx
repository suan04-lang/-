import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DRUNK_STAGES } from '../data/drinkPresets';
import { getCatBreedById, CAT_BREEDS } from '../data/catBreeds';
import { getShopItem } from '../data/shopItems';
import { CatBreedId, CatCostume } from '../types';
import { playHiccupSound, playCheerChime, triggerVibration } from '../utils/audio';
import { CatBreedModal } from './CatBreedModal';
import { Sparkles, Palette, Award, ShieldCheck } from 'lucide-react';

interface DrinkingCharacterProps {
  drunkStage: number; // 0 to 4
  isDrinking: boolean;
  drinkingDrinkName?: string;
  onDrinkActionComplete?: () => void;
  sojuGlasses: number;
  catBreedId?: string;
  onCatBreedChange?: (breedId: CatBreedId) => void;
  costume?: CatCostume;
  soberDays?: number;
}

const FUNNY_TAP_QUOTES = [
  ['오늘도 기분 좋게 달려볼까냥? 🐾', '술은 적당히 기분 좋게 마시자구! 💕', '짠~ 한번 할까냥? 🥂', '아직은 아주 말짱하다냥! ✨'],
  ['오~ 볼이 발그레 따뜻해진다냥 🌸', '안주 맛있다! 냠냠~ 한잔 더?', '분위기 너무 좋다냥! 캬~ 🎶', '딱 기분 좋은 상태다냥! 💖'],
  ['야아~ 너 진짜 내 최고의 집사다냥! 😽', '이모님 여기 소주 한 병 더요오~!!', '노래방 가서 냥냥송 부를 사람 🎤', '딸꾹! 아니 나 진짜 안 취했다냥! 🫧'],
  ['지구가... 왜 자꾸 뱅글뱅글 도냥...? 🌀', '내가 계산하께에! 내 츄르 카드가 어디찌...', '넥타이는 머리에 매야 제맛이다냥 👔', '술이 나를 마시는 건가냥... 딸꾹! 💫'],
  ['으어어어... 지구야 잠시만 멈춰줘... 🛌', '대리냥... 얼른 불러줘냥...', '침대가 날 부른다냥... 쿨쿨 Zzz 💤', '내일의 나에게 미리 사과한다냥... 🧃']
];

const SOBER_RECOVERY_QUOTES = [
  '간이 맑고 깨끗해지고 있다냥! 🌿✨',
  '금주 파워로 털에 윤기가 자르르~ 🐾',
  '숙취 없는 아침은 정말 최고다냥! ☀️',
  '오늘도 금주 스탬프 찍고 레벨업! 🥇'
];

export const DrinkingCharacter: React.FC<DrinkingCharacterProps> = ({
  drunkStage,
  isDrinking,
  drinkingDrinkName,
  onDrinkActionComplete,
  catBreedId = 'cheese',
  onCatBreedChange,
  costume,
  soberDays = 0
}) => {
  const [currentQuote, setCurrentQuote] = useState<string>('');
  const [showQuote, setShowQuote] = useState<boolean>(false);
  const [hiccupTrigger, setHiccupTrigger] = useState<boolean>(false);
  const [tapBounce, setTapBounce] = useState<number>(0);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isBreedModalOpen, setIsBreedModalOpen] = useState<boolean>(false);

  const stageConfig = DRUNK_STAGES[Math.min(4, Math.max(0, drunkStage))];
  const activeBreed = getCatBreedById(catBreedId);

  const equippedHat = costume?.hatId ? getShopItem(costume.hatId) : undefined;
  const equippedAccessory = costume?.accessoryId ? getShopItem(costume.accessoryId) : undefined;
  const equippedRoom = costume?.roomId ? getShopItem(costume.roomId) : undefined;

  // Random periodic hiccups for stage 2 and above
  useEffect(() => {
    if (drunkStage < 2) return;
    const interval = setInterval(() => {
      if (!isDrinking) {
        setHiccupTrigger(prev => !prev);
        if (Math.random() > 0.4) {
          playHiccupSound();
        }
      }
    }, 6000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [drunkStage, isDrinking]);

  // Handle isDrinking animation state
  useEffect(() => {
    if (isDrinking) {
      const cheers = [
        `꿀꺽꿀꺽! ${drinkingDrinkName || '술'} 캬~~! 🍻`,
        `시원하게 원샷이다냥! 😋`,
        `크으으~ ${drinkingDrinkName || '한 잔'} 끝내준다냥! ✨`,
        `짠! 달다 달아~ 🥂`
      ];
      setCurrentQuote(cheers[Math.floor(Math.random() * cheers.length)]);
      setShowQuote(true);

      const timer = setTimeout(() => {
        if (onDrinkActionComplete) {
          onDrinkActionComplete();
        }
      }, 1600);

      return () => clearTimeout(timer);
    }
  }, [isDrinking, drinkingDrinkName, onDrinkActionComplete]);

  // Tap character handler with heart bursts
  const handleCharacterTap = (e: React.MouseEvent<HTMLDivElement>) => {
    setTapBounce(prev => prev + 1);
    triggerVibration(40);
    playCheerChime();

    // Spawn floating cute heart / paw
    const rect = e.currentTarget.getBoundingClientRect();
    const newHeart = {
      id: Date.now() + Math.random(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setFloatingHearts(prev => [...prev.slice(-4), newHeart]);

    if (soberDays >= 1 && drunkStage === 0 && Math.random() > 0.5) {
      const randomSober = SOBER_RECOVERY_QUOTES[Math.floor(Math.random() * SOBER_RECOVERY_QUOTES.length)];
      setCurrentQuote(randomSober);
    } else {
      const quotesForStage = FUNNY_TAP_QUOTES[drunkStage] || FUNNY_TAP_QUOTES[0];
      const randomQuote = quotesForStage[Math.floor(Math.random() * quotesForStage.length)];
      setCurrentQuote(randomQuote);
    }
    setShowQuote(true);

    if (drunkStage >= 2 && Math.random() > 0.5) {
      playHiccupSound();
    }
  };

  // Get background room style
  const getRoomBackgroundClasses = () => {
    if (costume?.roomId === 'room_sakura') {
      return 'bg-gradient-to-b from-pink-100/80 via-rose-50 to-pink-100/60 border-pink-200';
    }
    if (costume?.roomId === 'room_lounge') {
      return 'bg-gradient-to-b from-amber-100/70 via-orange-50 to-amber-100/50 border-amber-200';
    }
    if (costume?.roomId === 'room_cosmic') {
      return 'bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900 text-white border-purple-800';
    }
    return 'bg-gradient-to-b from-orange-50/50 via-white to-pink-50/30 border-pink-100';
  };

  return (
    <div className={`relative flex flex-col items-center justify-center w-full py-2 px-2 select-none rounded-3xl transition-colors duration-500 ${getRoomBackgroundClasses()}`}>
      {/* Falling Sakura / Cosmic / Recovery Particles */}
      {costume?.roomId === 'room_sakura' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute top-2 left-6 text-xs animate-bounce opacity-70">🌸</div>
          <div className="absolute top-8 right-8 text-xs animate-pulse opacity-80">🌸</div>
          <div className="absolute bottom-4 left-10 text-[10px] opacity-60">🌸</div>
        </div>
      )}
      {costume?.roomId === 'room_cosmic' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute top-3 left-8 text-xs animate-pulse opacity-90">⭐</div>
          <div className="absolute top-10 right-6 text-xs animate-ping opacity-80">✨</div>
          <div className="absolute bottom-6 left-12 text-[10px] opacity-70">🌌</div>
        </div>
      )}
      {soberDays >= 1 && drunkStage === 0 && (
        <div className="absolute -top-1 right-2 pointer-events-none flex items-center gap-1 bg-emerald-100/90 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300 shadow-xs">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>{soberDays}일 연속 클린 회복중</span>
        </div>
      )}

      {/* Top Controls: Speech Bubble & Breed Switcher */}
      <div className="w-full flex items-center justify-between px-2 mb-1 z-10">
        {/* Stage Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-pink-500 text-white shadow-xs">
          <span
            className={`w-2 h-2 rounded-full animate-ping ${
              drunkStage === 0
                ? 'bg-emerald-300'
                : drunkStage === 1
                ? 'bg-amber-300'
                : drunkStage === 2
                ? 'bg-yellow-300'
                : drunkStage === 3
                ? 'bg-red-300'
                : 'bg-purple-300'
            }`}
          />
          <span className="uppercase tracking-wide">{stageConfig.title}</span>
        </div>

        {/* Change Cat Breed Button */}
        <button
          onClick={() => setIsBreedModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 hover:bg-pink-100 text-pink-700 rounded-full text-xs font-bold border border-pink-200 shadow-xs transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
          title="고양이 종류 바꾸기"
        >
          <span>{activeBreed.emoji}</span>
          <span>{activeBreed.name}</span>
          <Palette className="w-3 h-3 text-pink-500 ml-0.5" />
        </button>
      </div>

      {/* Speech Bubble Area */}
      <div className="h-11 flex items-center justify-center my-1 w-full max-w-xs px-2 z-10">
        <AnimatePresence mode="wait">
          {showQuote && (
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0, y: 10, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              transition={{ type: 'spring', damping: 15, stiffness: 250 }}
              className="relative bg-white border-2 border-pink-400 text-slate-800 px-4 py-1.5 rounded-2xl text-xs font-black shadow-lg shadow-pink-200/50 flex items-center gap-1.5 z-20"
            >
              <span>{currentQuote}</span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-pink-400 rotate-45" />
            </motion.div>
          )}
          {!showQuote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-slate-700 font-bold flex items-center gap-1 bg-white/90 px-3.5 py-1.5 rounded-full border border-pink-200 shadow-xs z-20 backdrop-blur-xs"
            >
              <span>{soberDays >= 1 && drunkStage === 0 ? '✨ 금주로 간 세포 완벽 회복 중이다냥!' : stageConfig.quote}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Animated Character Canvas */}
      <motion.div
        key={`char-${tapBounce}`}
        onClick={handleCharacterTap}
        whileTap={{ scale: 0.93, rotate: [-2, 2, 0] }}
        animate={
          isDrinking
            ? {
                y: [0, -14, -3, -14, 0],
                rotate: [0, 5, -3, 4, 0],
                scale: [1, 1.04, 1, 1.03, 1],
                transition: { duration: 1.4, ease: 'easeInOut' }
              }
            : drunkStage === 4
            ? {
                y: [0, 3, 1, 3, 0],
                rotate: [-2, 2, -1, 2, -2],
                transition: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }
              }
            : drunkStage === 3
            ? {
                rotate: [-6, 6, -5, 5, -6],
                y: [0, -5, 2, -5, 0],
                transition: { repeat: Infinity, duration: stageConfig.swaySpeed, ease: 'easeInOut' }
              }
            : drunkStage >= 1
            ? {
                rotate: [-stageConfig.swayAngle * 0.9, stageConfig.swayAngle * 0.9, -stageConfig.swayAngle * 0.9],
                y: [0, -4, 0],
                transition: { repeat: Infinity, duration: stageConfig.swaySpeed, ease: 'easeInOut' }
              }
            : {
                y: [0, -4, 0],
                rotate: [0, 1.5, 0, -1.5, 0],
                transition: { repeat: Infinity, duration: 4.2, ease: 'easeInOut' }
              }
        }
        className="relative w-48 h-52 sm:w-52 sm:h-56 flex items-center justify-center cursor-pointer transition-transform group"
      >
        {/* Sober Golden/Emerald Recovery Aura Glow */}
        {soberDays >= 1 && drunkStage === 0 && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.65, 0.35] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute -inset-2 rounded-full bg-gradient-to-tr from-emerald-300/40 via-amber-200/40 to-teal-300/30 blur-lg pointer-events-none"
          />
        )}

        {/* Floating Tap Hearts/Stars */}
        <AnimatePresence>
          {floatingHearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ opacity: 1, scale: 0.5, y: 0 }}
              animate={{ opacity: 0, scale: 1.4, y: -70, x: (Math.random() - 0.5) * 40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute text-lg pointer-events-none z-30 font-black"
              style={{ left: heart.x, top: heart.y }}
            >
              {soberDays >= 1 && drunkStage === 0 ? '✨' : '💖'}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* ======================= CLEAN VECTOR CAT SVG ============================ */}
        {/* ========================================================================= */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="cheeseFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="mackerelFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="blackFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="creamTummy" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fffbeb" />
            </linearGradient>
            <linearGradient id="pinkEar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
            <linearGradient id="goldenBell" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="siameseBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdf4ff" />
              <stop offset="100%" stopColor="#fae8ff" />
            </linearGradient>
            <linearGradient id="siamesePoint" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="haloGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          {/* ==================== 1. WAGGING TAIL ==================== */}
          <motion.path
            d="M 142 165 C 168 160 186 142 178 122 C 172 108 160 114 163 124 C 167 136 154 150 138 155 Z"
            fill={catBreedId === 'siamese' ? 'url(#siamesePoint)' : catBreedId === 'mackerel' ? 'url(#mackerelFur)' : catBreedId === 'black' ? 'url(#blackFur)' : catBreedId === 'white' ? '#ffffff' : 'url(#cheeseFur)'}
            stroke={catBreedId === 'white' ? '#e2e8f0' : catBreedId === 'black' ? '#0f172a' : '#b45309'}
            strokeWidth="1.2"
            animate={{
              rotate: isDrinking ? [0, 18, -12, 18, 0] : drunkStage >= 3 ? [-8, 8, -8] : [-4, 6, -4],
              originX: '142px',
              originY: '165px'
            }}
            transition={{ repeat: Infinity, duration: isDrinking ? 0.6 : 2.5, ease: 'easeInOut' }}
          />

          {/* ==================== 2. MAIN ROUND BODY ==================== */}
          <path
            d="M 68 110 C 50 126 50 162 70 176 C 90 186 110 186 130 176 C 150 162 150 126 132 110 Z"
            fill={catBreedId === 'siamese' ? 'url(#siameseBody)' : catBreedId === 'mackerel' ? 'url(#mackerelFur)' : catBreedId === 'black' ? 'url(#blackFur)' : catBreedId === 'white' ? '#ffffff' : 'url(#cheeseFur)'}
            stroke={catBreedId === 'white' ? '#cbd5e1' : catBreedId === 'black' ? '#0f172a' : '#c2410c'}
            strokeWidth="1.4"
          />

          {/* Calico Body Patches */}
          {catBreedId === 'calico' && (
            <g>
              <ellipse cx="66" cy="144" rx="14" ry="18" fill="#ea580c" />
              <ellipse cx="134" cy="148" rx="12" ry="16" fill="#1e293b" />
            </g>
          )}

          {/* White Belly Patch */}
          {catBreedId !== 'black' && catBreedId !== 'siamese' && (
            <ellipse cx="100" cy="148" rx="25" ry="24" fill="url(#creamTummy)" />
          )}

          {/* ==================== 3. ADORABLE ROUND HEAD ==================== */}
          {/* Outer Ears */}
          <path
            d="M 52 74 C 48 50 54 22 62 14 C 74 24 82 48 88 64 Z"
            fill={catBreedId === 'siamese' ? 'url(#siamesePoint)' : catBreedId === 'mackerel' ? 'url(#mackerelFur)' : catBreedId === 'black' ? 'url(#blackFur)' : catBreedId === 'white' ? '#ffffff' : 'url(#cheeseFur)'}
            stroke={catBreedId === 'white' ? '#cbd5e1' : catBreedId === 'black' ? '#0f172a' : '#c2410c'}
            strokeWidth="1.4"
          />
          <path
            d="M 148 74 C 152 50 146 22 138 14 C 126 24 118 48 112 64 Z"
            fill={catBreedId === 'siamese' ? 'url(#siamesePoint)' : catBreedId === 'mackerel' ? 'url(#mackerelFur)' : catBreedId === 'black' ? 'url(#blackFur)' : catBreedId === 'white' ? '#ffffff' : 'url(#cheeseFur)'}
            stroke={catBreedId === 'white' ? '#cbd5e1' : catBreedId === 'black' ? '#0f172a' : '#c2410c'}
            strokeWidth="1.4"
          />

          {/* Head Sphere */}
          <ellipse
            cx="100"
            cy="76"
            rx="49"
            ry="43"
            fill={catBreedId === 'siamese' ? 'url(#siameseBody)' : catBreedId === 'mackerel' ? 'url(#mackerelFur)' : catBreedId === 'black' ? 'url(#blackFur)' : catBreedId === 'white' ? '#ffffff' : 'url(#cheeseFur)'}
            stroke={catBreedId === 'white' ? '#cbd5e1' : catBreedId === 'black' ? '#0f172a' : '#c2410c'}
            strokeWidth="1.4"
          />

          {/* Calico Head Orange & Black Patches */}
          {catBreedId === 'calico' && (
            <g>
              <path d="M 58 54 C 54 36 60 22 62 16 C 70 24 76 40 76 54 C 70 56 62 56 58 54 Z" fill="#ea580c" />
              <path d="M 142 54 C 146 36 140 22 138 16 C 130 24 124 40 124 54 C 130 56 138 56 142 54 Z" fill="#1e293b" />
            </g>
          )}

          {/* Tuxedo Face White Mask Blaze */}
          {catBreedId === 'tuxedo' && (
            <path
              d="M 100 58 L 86 86 C 82 96 90 106 100 106 C 110 106 118 96 114 86 Z"
              fill="#ffffff"
            />
          )}

          {/* Siamese Dark Chocolate Mask */}
          {catBreedId === 'siamese' && (
            <g>
              <path d="M 72 44 C 66 38 60 22 56 14 C 50 24 48 44 48 56 Z" fill="url(#siamesePoint)" />
              <path d="M 128 44 C 134 38 140 22 144 14 C 150 24 152 44 152 56 Z" fill="url(#siamesePoint)" />
              <ellipse cx="100" cy="78" rx="26" ry="18" fill="url(#siamesePoint)" />
            </g>
          )}

          {/* Inner Ears */}
          <path d="M 70 44 C 64 36 60 24 57 19 C 53 28 52 42 51 52 C 58 50 64 48 70 44 Z" fill="url(#pinkEar)" />
          <path d="M 130 44 C 136 36 140 24 143 19 C 147 28 148 42 149 52 C 142 50 136 48 130 44 Z" fill="url(#pinkEar)" />

          {/* Tabby Forehead M-Pattern */}
          {(catBreedId === 'cheese' || catBreedId === 'mackerel') && (
            <g stroke={catBreedId === 'cheese' ? '#9a3412' : '#1e293b'} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M 90 42 Q 95 50 97 45 Q 100 52 103 45 Q 105 50 110 42" />
              <path d="M 80 46 Q 86 52 87 58" strokeWidth="2.2" />
              <path d="M 120 46 Q 114 52 113 58" strokeWidth="2.2" />
            </g>
          )}

          {/* Drunk Headband (Stage 3: Headband Necktie) */}
          {drunkStage === 3 && (
            <g>
              <path d="M 48 56 C 64 50 136 50 152 56 L 150 67 C 134 60 66 60 50 67 Z" fill="#1e3a8a" stroke="#172554" strokeWidth="1.2" />
              <circle cx="148" cy="62" r="5" fill="#1e40af" />
              <path d="M 148 62 L 174 78 L 166 96 L 144 70 Z" fill="#1e3a8a" />
              <path d="M 149 64 L 164 110 L 150 114 L 143 70 Z" fill="#2563eb" />
            </g>
          )}

          {/* Stage 4 Ice Pack */}
          {drunkStage === 4 && (
            <g>
              <path d="M 80 40 C 80 30 120 30 120 40 C 120 45 106 48 100 48 C 94 48 80 45 80 40 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.4" opacity="0.95" />
              <circle cx="100" cy="30" r="5" fill="#0284c7" />
              <ellipse cx="95" cy="37" rx="5" ry="2.5" fill="#ffffff" opacity="0.8" />
            </g>
          )}

          {/* ==================== 4. EQUIPPED HATS / COSTUMES ==================== */}
          {costume?.hatId === 'hat_ribbon' && (
            <g transform="translate(125, 25)">
              <ellipse cx="0" cy="0" rx="8" ry="6" fill="#ec4899" />
              <path d="M -8 0 C -18 -10 -20 10 -8 0 Z" fill="#f472b6" stroke="#db2777" strokeWidth="1" />
              <path d="M 8 0 C 18 -10 20 10 8 0 Z" fill="#f472b6" stroke="#db2777" strokeWidth="1" />
              <circle cx="0" cy="0" r="3.5" fill="#fbcfe8" />
            </g>
          )}

          {costume?.hatId === 'hat_angel' && (
            <g transform="translate(100, 18)">
              <ellipse cx="0" cy="0" rx="34" ry="7" fill="none" stroke="url(#haloGold)" strokeWidth="4.5" />
              <ellipse cx="0" cy="0" rx="34" ry="7" fill="none" stroke="#fef08a" strokeWidth="2" opacity="0.8" />
            </g>
          )}

          {costume?.hatId === 'hat_crown' && (
            <g transform="translate(100, 22)">
              <polygon points="-24,12 -20,-12 -8,0 0,-16 8,0 20,-12 24,12" fill="url(#goldenBell)" stroke="#b45309" strokeWidth="1.5" />
              <circle cx="-20" cy="-12" r="2.5" fill="#ef4444" />
              <circle cx="0" cy="-16" r="3" fill="#3b82f6" />
              <circle cx="20" cy="-12" r="2.5" fill="#10b981" />
            </g>
          )}

          {costume?.hatId === 'hat_santa' && (
            <g transform="translate(100, 26)">
              <path d="M -26,10 C -20,-20 10,-30 30,-10 C 26,0 15,10 -26,10 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.2" />
              <ellipse cx="0" cy="10" rx="28" ry="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
              <circle cx="32" cy="-10" r="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            </g>
          )}

          {costume?.hatId === 'hat_chef' && (
            <g transform="translate(100, 22)">
              <ellipse cx="0" cy="-10" rx="28" ry="18" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="-18" y="-2" width="36" height="12" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            </g>
          )}

          {/* ==================== 5. SOFT PILLOWY MUZZLE & CHEEKS ==================== */}
          {catBreedId !== 'black' && catBreedId !== 'siamese' && (
            <path
              d="M 100 80 C 90 76 78 81 78 90 C 78 99 92 104 100 97 C 108 104 122 99 122 90 C 122 81 110 76 100 80 Z"
              fill={catBreedId === 'tuxedo' || catBreedId === 'calico' || catBreedId === 'white' ? '#ffffff' : 'url(#creamTummy)'}
              stroke={catBreedId === 'white' || catBreedId === 'calico' ? '#e2e8f0' : '#fed7aa'}
              strokeWidth="1.1"
            />
          )}

          {/* Blushing Cheeks */}
          {drunkStage > 0 ? (
            <g>
              <ellipse
                cx="66"
                cy="86"
                rx={10 + drunkStage * 2}
                ry={7 + drunkStage * 1.2}
                fill={drunkStage >= 3 ? '#ef4444' : '#fb7185'}
                opacity={Math.min(0.85, 0.45 + drunkStage * 0.12)}
              />
              <ellipse
                cx="134"
                cy="86"
                rx={10 + drunkStage * 2}
                ry={7 + drunkStage * 1.2}
                fill={drunkStage >= 3 ? '#ef4444' : '#fb7185'}
                opacity={Math.min(0.85, 0.45 + drunkStage * 0.12)}
              />
              <line x1="62" y1="84" x2="70" y2="88" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="130" y1="84" x2="138" y2="88" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <ellipse cx="67" cy="86" rx="7.5" ry="4.5" fill="#fda4af" opacity="0.55" />
              <ellipse cx="133" cy="86" rx="7.5" ry="4.5" fill="#fda4af" opacity="0.55" />
            </g>
          )}

          {/* Whiskers */}
          <g stroke={catBreedId === 'black' || catBreedId === 'tuxedo' ? '#ffffff' : '#7c2d12'} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity={catBreedId === 'black' ? 0.9 : 0.85}>
            <path d="M 82 86 Q 60 81 44 78" />
            <path d="M 80 90 Q 58 89 40 90" />
            <path d="M 82 94 Q 62 99 46 102" />
            <path d="M 118 86 Q 140 81 156 78" />
            <path d="M 120 90 Q 142 89 160 90" />
            <path d="M 118 94 Q 138 99 154 102" />
          </g>

          {/* ==================== 6. SPARKLY EYES / EXPRESSIONS ==================== */}
          {drunkStage === 0 && (
            <g>
              {/* Left Eye */}
              <ellipse cx="80" cy="69" rx="9.5" ry="11.5" fill={catBreedId === 'siamese' ? '#0284c7' : catBreedId === 'black' ? '#047857' : '#0f172a'} />
              <ellipse cx="80" cy="71" rx="8" ry="9" fill={catBreedId === 'siamese' ? '#38bdf8' : catBreedId === 'black' ? '#10b981' : '#1e293b'} />
              <circle cx="77" cy="65" r="4.3" fill="#ffffff" />
              <polygon points="83,73 84,70 87,73 84,74 83,77 82,74 79,73 82,70" fill="#ffffff" />
              <circle cx="77" cy="75" r="1.4" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="120" cy="69" rx="9.5" ry="11.5" fill={catBreedId === 'siamese' ? '#0284c7' : catBreedId === 'black' ? '#047857' : '#0f172a'} />
              <ellipse cx="120" cy="71" rx="8" ry="9" fill={catBreedId === 'siamese' ? '#38bdf8' : catBreedId === 'black' ? '#10b981' : '#1e293b'} />
              <circle cx="117" cy="65" r="4.3" fill="#ffffff" />
              <polygon points="123,73 124,70 127,73 124,74 123,77 122,74 119,73 122,70" fill="#ffffff" />
              <circle cx="117" cy="75" r="1.4" fill="#ffffff" />
            </g>
          )}

          {drunkStage === 1 && (
            <g stroke={catBreedId === 'black' ? '#ffffff' : '#0f172a'} strokeWidth="4.2" strokeLinecap="round" fill="none">
              <path d="M 71 71 Q 80 58 89 71" />
              <path d="M 111 71 Q 120 58 129 71" />
              <path d="M 88 66 L 92 62" strokeWidth="2.2" />
              <path d="M 112 66 L 108 62" strokeWidth="2.2" />
            </g>
          )}

          {drunkStage === 2 && (
            <g>
              <path d="M 71 65 Q 80 77 89 67" fill="none" stroke={catBreedId === 'black' ? '#ffffff' : '#0f172a'} strokeWidth="4.2" strokeLinecap="round" />
              <circle cx="80" cy="73" r="3.2" fill="#dc2626" />
              <circle cx="81" cy="72" r="1" fill="#ffffff" />

              <path d="M 111 65 Q 120 77 129 67" fill="none" stroke={catBreedId === 'black' ? '#ffffff' : '#0f172a'} strokeWidth="4.2" strokeLinecap="round" />
              <circle cx="120" cy="73" r="3.2" fill="#dc2626" />
              <circle cx="121" cy="72" r="1" fill="#ffffff" />
            </g>
          )}

          {drunkStage === 3 && (
            <g stroke={catBreedId === 'black' ? '#ffffff' : '#0f172a'} strokeWidth="2.6" strokeLinecap="round" fill="none">
              <path d="M 80 69 m -7, 0 a 7,7 0 1,0 14,0 a 5,5 0 1,0 -10,0 a 3,3 0 1,0 6,0" />
              <path d="M 120 69 m -7, 0 a 7,7 0 1,0 14,0 a 5,5 0 1,0 -10,0 a 3,3 0 1,0 6,0" />
            </g>
          )}

          {drunkStage === 4 && (
            <g stroke={catBreedId === 'black' ? '#ffffff' : '#0f172a'} strokeWidth="4.2" strokeLinecap="round">
              <line x1="73" y1="64" x2="87" y2="74" />
              <line x1="87" y1="64" x2="73" y2="74" />
              <line x1="113" y1="64" x2="127" y2="74" />
              <line x1="127" y1="64" x2="113" y2="74" />
            </g>
          )}

          {/* Sunglasses Accessory */}
          {costume?.hatId === 'hat_sunglasses' && (
            <g transform="translate(100, 69)">
              <ellipse cx="-20" cy="0" rx="14" ry="11" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              <ellipse cx="20" cy="0" rx="14" ry="11" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              <line x1="-6" y1="-2" x2="6" y2="-2" stroke="#0f172a" strokeWidth="3" />
              <line x1="-28" y1="-3" x2="-14" y2="5" stroke="#ffffff" strokeWidth="1.8" opacity="0.6" strokeLinecap="round" />
              <line x1="12" y1="-3" x2="26" y2="5" stroke="#ffffff" strokeWidth="1.8" opacity="0.6" strokeLinecap="round" />
            </g>
          )}

          {/* Pink Nose */}
          <polygon points="96,78 104,78 100,84" fill="#f43f5e" />

          {/* Mouth */}
          {drunkStage === 0 && (
            <path
              d="M 92 84 Q 96 89 100 84 Q 104 89 108 84"
              fill="none"
              stroke={catBreedId === 'black' ? '#ffffff' : '#7c2d12'}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          )}

          {drunkStage === 1 && (
            <g>
              <path d="M 92 84 Q 100 96 108 84" fill="#be123c" stroke={catBreedId === 'black' ? '#ffffff' : '#7c2d12'} strokeWidth="2.1" />
              <ellipse cx="100" cy="90" rx="4" ry="2.8" fill="#fb7185" />
            </g>
          )}

          {drunkStage === 2 && (
            <g>
              <path d="M 91 84 Q 95 93 100 85 Q 105 93 109 84" fill="none" stroke={catBreedId === 'black' ? '#ffffff' : '#7c2d12'} strokeWidth="2.6" strokeLinecap="round" />
              <ellipse cx="100" cy="90" rx="4" ry="4.5" fill="#f43f5e" />
            </g>
          )}

          {drunkStage === 3 && (
            <g>
              <path d="M 91 85 Q 95 93 100 85 Q 105 93 109 85" fill="none" stroke={catBreedId === 'black' ? '#ffffff' : '#7c2d12'} strokeWidth="2.8" strokeLinecap="round" />
              <ellipse cx="104" cy="92" rx="4.8" ry="7" fill="#f43f5e" />
              <line x1="104" y1="88" x2="104" y2="95" stroke="#be123c" strokeWidth="1.3" />
            </g>
          )}

          {drunkStage === 4 && (
            <g>
              <ellipse cx="100" cy="89" rx="6" ry="4.5" fill="#7f1d1d" stroke={catBreedId === 'black' ? '#ffffff' : '#7c2d12'} strokeWidth="1.8" />
              <circle cx="110" cy="92" r="5" fill="#38bdf8" opacity="0.9" stroke="#ffffff" strokeWidth="1.4" />
              <circle cx="112" cy="90" r="1.6" fill="#ffffff" />
            </g>
          )}

          {/* ==================== 7. RED COLLAR & 3D GOLDEN BELL ==================== */}
          <g>
            <path d="M 75 106 Q 100 116 125 106" fill="none" stroke="#dc2626" strokeWidth="5.5" strokeLinecap="round" />
            <circle cx="100" cy="115" r="6.5" fill="url(#goldenBell)" stroke="#b45309" strokeWidth="1.2" />
            <line x1="96" y1="116" x2="104" y2="116" stroke="#78350f" strokeWidth="1.2" />
            <circle cx="100" cy="118" r="1.2" fill="#78350f" />
            <circle cx="98" cy="112" r="1.8" fill="#ffffff" />
          </g>

          {/* ==================== 8. FRONT ARMS & PAWS (🐾 핑크 젤리) ==================== */}
          {isDrinking ? (
            <g>
              <polygon points="90,82 110,82 106,104 94,104" fill="#6ee7b7" opacity="0.9" stroke="#059669" strokeWidth="1.8" />
              <circle cx="86" cy="76" r="3.2" fill="#34d399" />
              <circle cx="114" cy="74" r="3.2" fill="#6ee7b7" />
              <path d="M 74 116 C 78 106 84 98 88 98" stroke={catBreedId === 'mackerel' ? '#64748b' : catBreedId === 'tuxedo' || catBreedId === 'white' ? '#ffffff' : catBreedId === 'black' ? '#0f172a' : '#ea580c'} strokeWidth="9.5" strokeLinecap="round" fill="none" />
              <path d="M 126 116 C 122 106 116 98 112 98" stroke={catBreedId === 'mackerel' ? '#64748b' : catBreedId === 'tuxedo' || catBreedId === 'white' ? '#ffffff' : catBreedId === 'black' ? '#0f172a' : '#ea580c'} strokeWidth="9.5" strokeLinecap="round" fill="none" />
              <circle cx="88" cy="98" r="3.6" fill="#fb7185" />
              <circle cx="112" cy="98" r="3.6" fill="#fb7185" />
            </g>
          ) : (
            <g>
              {/* Left Arm */}
              <path
                d="M 74 114 C 70 124 74 136 82 134 C 87 132 87 124 83 118 Z"
                fill={catBreedId === 'tuxedo' || catBreedId === 'white' ? '#ffffff' : catBreedId === 'mackerel' ? 'url(#mackerelFur)' : catBreedId === 'black' ? 'url(#blackFur)' : 'url(#cheeseFur)'}
                stroke={catBreedId === 'white' || catBreedId === 'tuxedo' ? '#cbd5e1' : catBreedId === 'black' ? '#0f172a' : '#c2410c'}
                strokeWidth="1.2"
              />
              <ellipse cx="80" cy="132" rx="4" ry="3.2" fill="#fb7185" />
              <circle cx="77" cy="127" r="1.6" fill="#fb7185" />
              <circle cx="81" cy="126" r="1.6" fill="#fb7185" />
              <circle cx="85" cy="127" r="1.6" fill="#fb7185" />

              {/* Right Arm */}
              <path
                d="M 126 114 C 130 124 126 136 118 134 C 113 132 113 124 117 118 Z"
                fill={catBreedId === 'tuxedo' || catBreedId === 'white' ? '#ffffff' : catBreedId === 'mackerel' ? 'url(#mackerelFur)' : catBreedId === 'black' ? 'url(#blackFur)' : 'url(#cheeseFur)'}
                stroke={catBreedId === 'white' || catBreedId === 'tuxedo' ? '#cbd5e1' : catBreedId === 'black' ? '#0f172a' : '#c2410c'}
                strokeWidth="1.2"
              />
              <ellipse cx="120" cy="132" rx="4" ry="3.2" fill="#fb7185" />
              <circle cx="115" cy="127" r="1.6" fill="#fb7185" />
              <circle cx="119" cy="126" r="1.6" fill="#fb7185" />
              <circle cx="123" cy="127" r="1.6" fill="#fb7185" />
            </g>
          )}

          {/* ==================== 9. EQUIPPED ACCESSORIES (Held in hand) ==================== */}
          {costume?.accessoryId === 'item_water_bottle' && (
            <g transform="translate(132, 120)">
              <rect x="0" y="0" width="10" height="22" rx="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.2" />
              <rect x="2" y="-4" width="6" height="4" rx="1" fill="#0284c7" />
              <line x1="2" y1="8" x2="8" y2="8" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
            </g>
          )}

          {costume?.accessoryId === 'item_churu' && (
            <g transform="translate(130, 118) rotate(-25)">
              <rect x="0" y="0" width="7" height="26" rx="2" fill="#f43f5e" stroke="#be123c" strokeWidth="1" />
              <rect x="0" y="2" width="7" height="6" fill="#fbbf24" />
              <circle cx="3.5" cy="5" r="1.5" fill="#ffffff" />
            </g>
          )}

          {costume?.accessoryId === 'item_sparkler' && (
            <g transform="translate(132, 110) rotate(15)">
              <line x1="0" y1="0" x2="0" y2="30" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="0,-8 2,-2 8,-2 3,2 5,8 0,4 -5,8 -3,2 -8,-2 -2,-2" fill="#facc15" stroke="#eab308" strokeWidth="1" />
            </g>
          )}

          {costume?.accessoryId === 'item_mocktail' && (
            <g transform="translate(130, 122)">
              <polygon points="0,0 12,0 8,14 4,14" fill="#a7f3d0" stroke="#059669" strokeWidth="1" />
              <line x1="6" y1="14" x2="6" y2="22" stroke="#059669" strokeWidth="1.5" />
              <ellipse cx="6" cy="22" rx="5" ry="1.5" fill="#059669" />
              <circle cx="10" cy="-1" r="3" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
            </g>
          )}

          {/* ==================== 10. SITTING HIND FEET ==================== */}
          <path
            d="M 64 170 C 64 164 74 164 84 168 C 88 170 88 178 82 178 C 72 178 64 176 64 170 Z"
            fill={catBreedId === 'tuxedo' || catBreedId === 'white' ? '#ffffff' : catBreedId === 'mackerel' ? 'url(#mackerelFur)' : catBreedId === 'black' ? 'url(#blackFur)' : 'url(#cheeseFur)'}
            stroke={catBreedId === 'white' || catBreedId === 'tuxedo' ? '#cbd5e1' : catBreedId === 'black' ? '#0f172a' : '#c2410c'}
            strokeWidth="1.2"
          />
          <ellipse cx="75" cy="172" rx="4" ry="2.6" fill="#fb7185" />

          <path
            d="M 136 170 C 136 164 126 164 116 168 C 112 170 112 178 118 178 C 128 178 136 176 136 170 Z"
            fill={catBreedId === 'tuxedo' || catBreedId === 'white' ? '#ffffff' : catBreedId === 'mackerel' ? 'url(#mackerelFur)' : catBreedId === 'black' ? 'url(#blackFur)' : 'url(#cheeseFur)'}
            stroke={catBreedId === 'white' || catBreedId === 'tuxedo' ? '#cbd5e1' : catBreedId === 'black' ? '#0f172a' : '#c2410c'}
            strokeWidth="1.2"
          />
          <ellipse cx="125" cy="172" rx="4" ry="2.6" fill="#fb7185" />
        </svg>
      </motion.div>

      {/* Quick Breed Switcher Carousel Ribbon */}
      <div className="w-full mt-3 z-10 pt-2 border-t border-pink-100/80">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-black text-slate-600 flex items-center gap-1">
            <span>🐾</span> 캐릭터 종류
          </span>
          <button
            onClick={() => setIsBreedModalOpen(true)}
            className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>전체보기</span>
            <Palette className="w-3 h-3 text-pink-500" />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 px-0.5 no-scrollbar scroll-smooth">
          {CAT_BREEDS.map((breed) => {
            const isSelected = catBreedId === breed.id;
            return (
              <button
                key={breed.id}
                onClick={() => {
                  triggerVibration(25);
                  onCatBreedChange?.(breed.id);
                }}
                className={`shrink-0 px-3.5 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  isSelected
                    ? 'bg-pink-500 text-white shadow-sm shadow-pink-200 ring-2 ring-pink-300'
                    : 'bg-white/90 text-slate-700 hover:bg-pink-50 hover:text-pink-700 border border-slate-200 shadow-2xs'
                }`}
              >
                <span className="text-sm leading-none">{breed.emoji}</span>
                <span>{breed.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cat Breed Selection Modal */}
      <CatBreedModal
        isOpen={isBreedModalOpen}
        onClose={() => setIsBreedModalOpen(false)}
        selectedBreedId={catBreedId}
        onSelectBreed={(breedId) => {
          onCatBreedChange?.(breedId);
        }}
      />
    </div>
  );
};
