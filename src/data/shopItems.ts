import { ShopItem } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
  // 🎩 모자 / 헤어 아이템
  {
    id: 'hat_ribbon',
    name: '러블리 핑크 리본',
    category: 'hat',
    emoji: '🎀',
    description: '사랑스러움이 200% 증가하는 핑크 리본',
    priceCoins: 30,
    requiredStreak: 0
  },
  {
    id: 'hat_sunglasses',
    name: '쿨가이 선글라스',
    category: 'hat',
    emoji: '🕶️',
    description: '시크하고 도도한 매력의 선글라스',
    priceCoins: 50,
    requiredStreak: 0
  },
  {
    id: 'hat_chef',
    name: '미슐랭 쉐프 모자',
    category: 'hat',
    emoji: '👨‍🍳',
    description: '맛있는 건강 안주를 뚝딱 만드는 모자',
    priceCoins: 80,
    requiredStreak: 3
  },
  {
    id: 'hat_santa',
    name: '루돌프 산타 모자',
    category: 'hat',
    emoji: '🎅',
    description: '따뜻한 연말 분위기를 내주는 산타 모자',
    priceCoins: 120,
    requiredStreak: 5
  },
  {
    id: 'hat_angel',
    name: '금주 천사 링',
    category: 'hat',
    emoji: '😇',
    description: '알코올을 정화하는 성스러운 천사 링',
    priceCoins: 200,
    requiredStreak: 7
  },
  {
    id: 'hat_crown',
    name: '황금빛 챔피언 왕관',
    category: 'hat',
    emoji: '👑',
    description: '금주 마스터만이 쓸 수 있는 빛나는 왕관',
    priceCoins: 500,
    requiredStreak: 14
  },

  // 🧶 손 소품 / 액세서리
  {
    id: 'item_water_bottle',
    name: '시원한 에비앙 생수병',
    category: 'accessory',
    emoji: '💧',
    description: '언제든 수분을 보충해주는 청정 생수병',
    priceCoins: 40,
    requiredStreak: 0
  },
  {
    id: 'item_churu',
    name: '명품 참치 츄르 간식',
    category: 'accessory',
    emoji: '🐟',
    description: '술 생각날 때마다 냠냠 먹는 최고급 간식',
    priceCoins: 60,
    requiredStreak: 0
  },
  {
    id: 'item_sparkler',
    name: '반짝이는 요술봉',
    category: 'accessory',
    emoji: '🪄',
    description: '간을 맑고 깨끗하게 정화하는 마법봉',
    priceCoins: 150,
    requiredStreak: 5
  },
  {
    id: 'item_mocktail',
    name: '무알콜 라임 모히또',
    category: 'accessory',
    emoji: '🍹',
    description: '알코올 0.0%의 상큼한 청량 칵테일',
    priceCoins: 100,
    requiredStreak: 3
  },

  // 🏠 방 테마 / 배경
  {
    id: 'room_cozy',
    name: '따스한 온돌방',
    category: 'room',
    emoji: '🛋️',
    description: '포근한 방석과 따스한 햇살이 드는 기본 힐링룸',
    priceCoins: 0,
    requiredStreak: 0
  },
  {
    id: 'room_sakura',
    name: '봄날 벚꽃 정원',
    category: 'room',
    emoji: '🌸',
    description: '분홍빛 벚꽃 잎이 흩날리는 야외 정원',
    priceCoins: 120,
    requiredStreak: 3
  },
  {
    id: 'room_lounge',
    name: '럭셔리 스파 라운지',
    category: 'room',
    emoji: '✨',
    description: '피로를 말끔히 풀어주는 고급 힐링 스파',
    priceCoins: 250,
    requiredStreak: 7
  },
  {
    id: 'room_cosmic',
    name: '신비로운 오로라 우주',
    category: 'room',
    emoji: '🌌',
    description: '별빛과 오로라가 반짝이는 몽환적인 우주 공간',
    priceCoins: 500,
    requiredStreak: 14
  }
];

export const getShopItem = (id?: string): ShopItem | undefined => {
  return SHOP_ITEMS.find(item => item.id === id);
};
