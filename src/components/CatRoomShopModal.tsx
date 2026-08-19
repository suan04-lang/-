import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Sparkles, ShoppingBag, Coins, Shirt } from 'lucide-react';
import { SHOP_ITEMS, getShopItem } from '../data/shopItems';
import { UserProfile, CatCostume } from '../types';
import { playCheerChime, triggerVibration } from '../utils/audio';

interface CatRoomShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
}

export const CatRoomShopModal: React.FC<CatRoomShopModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hat' | 'accessory' | 'room'>('all');

  if (!isOpen) return null;

  const currentCostume = profile.equippedCostume || {};
  const unlockedCostumes = profile.unlockedCostumes || profile.unlockedItems || [];

  const filteredItems = selectedCategory === 'all'
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(item => item.category === selectedCategory);

  // Equip or Unequip
  const handleToggleEquip = (itemId: string, category: 'hat' | 'accessory' | 'room') => {
    triggerVibration(40);
    playCheerChime();

    onUpdateProfile(prev => {
      const costume = { ...(prev.equippedCostume || {}) };

      if (category === 'hat') {
        costume.hatId = costume.hatId === itemId ? undefined : itemId;
      } else if (category === 'accessory') {
        costume.accessoryId = costume.accessoryId === itemId ? undefined : itemId;
      } else if (category === 'room') {
        costume.roomId = costume.roomId === itemId ? undefined : itemId;
      }

      return {
        ...prev,
        equippedCostume: costume
      };
    });
  };

  // Buy Item with coins
  const handleBuyItem = (itemId: string, price: number, category: 'hat' | 'accessory' | 'room') => {
    if (profile.coins < price) {
      alert('코인이 부족합니다냥! 절주 미션이나 금주 챌린지를 달성해서 코인을 모아보세요 🐾');
      return;
    }

    triggerVibration(60);
    playCheerChime();

    onUpdateProfile(prev => {
      const newUnlocked = [...(prev.unlockedCostumes || prev.unlockedItems || []), itemId];
      const costume = { ...(prev.equippedCostume || {}) };

      if (category === 'hat') costume.hatId = itemId;
      if (category === 'accessory') costume.accessoryId = itemId;
      if (category === 'room') costume.roomId = itemId;

      return {
        ...prev,
        coins: prev.coins - price,
        unlockedCostumes: newUnlocked,
        unlockedItems: newUnlocked,
        equippedCostume: costume
      };
    });
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
              🎀
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                냥이 꾸미기 상점 & 의상실
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                금주로 모은 코인으로 귀여운 코스튬과 방을 꾸며요!
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

        {/* Coin Balance Banner */}
        <div className="p-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-base">
              🪙
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-100">보유 코인</div>
              <div className="text-lg font-black">{profile.coins.toLocaleString()} COIN</div>
            </div>
          </div>

          <span className="text-[11px] font-bold bg-black/15 px-2.5 py-1 rounded-full backdrop-blur-xs">
            금주 & 절주 미션으로 획득 가능
          </span>
        </div>

        {/* Category Filters */}
        <div className="p-3 border-b border-slate-100 bg-slate-50">
          <div className="grid grid-cols-4 gap-1 bg-slate-200/70 p-1 rounded-2xl">
            {[
              { id: 'all', label: '전체' },
              { id: 'hat', label: '👑 모자' },
              { id: 'accessory', label: '🪄 소품' },
              { id: 'room', label: '🏡 배경' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`py-1.5 text-xs font-black rounded-xl transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-white text-pink-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map(item => {
              const itemPrice = item.priceCoins || item.price || 50;
              const itemIcon = item.emoji || item.icon || '✨';
              const isUnlocked = unlockedCostumes.includes(item.id);
              const isEquipped =
                (item.category === 'hat' && currentCostume.hatId === item.id) ||
                (item.category === 'accessory' && currentCostume.accessoryId === item.id) ||
                (item.category === 'room' && currentCostume.roomId === item.id);

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs ${
                    isEquipped
                      ? 'border-pink-500 ring-2 ring-pink-200'
                      : isUnlocked
                      ? 'border-slate-200 hover:border-pink-300'
                      : 'border-slate-200/80'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{itemIcon}</span>
                      {isEquipped ? (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-pink-500 text-white">
                          착용중
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          보유중
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-0.5">
                          <span>🪙</span> {itemPrice}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-black text-slate-800">{item.name}</div>
                    <p className="text-[11px] text-slate-500 font-medium leading-tight">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleToggleEquip(item.id, item.category)}
                        className={`w-full py-1.5 rounded-xl text-xs font-black transition-all ${
                          isEquipped
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-pink-500 hover:bg-pink-600 text-white shadow-xs'
                        }`}
                      >
                        {isEquipped ? '착용 해제' : '착용하기'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyItem(item.id, itemPrice, item.category)}
                        className="w-full py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        <span>구매하기</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
