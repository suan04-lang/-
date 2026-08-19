import { CatBreedInfo } from '../types';

export const CAT_BREEDS: CatBreedInfo[] = [
  {
    id: 'cheese',
    name: '치즈냥이',
    badge: '치즈태비',
    emoji: '🧀',
    description: '노릇노릇 따뜻한 주황빛 털에 진한 줄무늬를 가진 대표 귀염둥이',
    primaryColor: '#fb923c',
    accentColor: '#c2410c',
    previewBg: 'from-amber-100 to-orange-100'
  },
  {
    id: 'mackerel',
    name: '고등어냥이',
    badge: '고등어태비',
    emoji: '🐟',
    description: '은빛 회색 털에 짙은 먹색 줄무늬가 매력적인 한국 토종냥이',
    primaryColor: '#94a3b8',
    accentColor: '#334155',
    previewBg: 'from-slate-100 to-zinc-200'
  },
  {
    id: 'calico',
    name: '삼색냥이',
    badge: '삼색이',
    emoji: '🐱',
    description: '새하얀 털 위에 치즈색 & 깜장색 얼룩이 콕콕 박힌 행운의 냥이',
    primaryColor: '#ffffff',
    accentColor: '#ea580c',
    previewBg: 'from-orange-50 via-slate-50 to-pink-50'
  },
  {
    id: 'tuxedo',
    name: '턱시도냥이',
    badge: '턱시도',
    emoji: '👔',
    description: '시크한 검은 턱시도 코트에 하얀 가슴팍과 양말을 신은 냥이',
    primaryColor: '#1e293b',
    accentColor: '#ffffff',
    previewBg: 'from-slate-200 to-slate-400'
  },
  {
    id: 'white',
    name: '백냥이',
    badge: '백묘',
    emoji: '🥛',
    description: '찹쌀떡처럼 눈부시게 뽀송뽀송하고 순백의 털을 가진 냥이',
    primaryColor: '#ffffff',
    accentColor: '#fda4af',
    previewBg: 'from-pink-50 to-rose-50'
  },
  {
    id: 'siamese',
    name: '샴냥이',
    badge: '샴 포인트',
    emoji: '☕',
    description: '따뜻한 밀크티빛 몸에 초코빛 마스크와 귀 포인트를 가진 귀족냥이',
    primaryColor: '#fef3c7',
    accentColor: '#78350f',
    previewBg: 'from-amber-50 to-amber-100'
  },
  {
    id: 'black',
    name: '까망냥이',
    badge: '올블랙',
    emoji: '🐾',
    description: '윤기 흐르는 밤하늘빛 검은 털에 영롱한 눈망울이 빛나는 미묘',
    primaryColor: '#0f172a',
    accentColor: '#fbbf24',
    previewBg: 'from-zinc-300 to-zinc-600'
  }
];

export const DEFAULT_CAT_BREED_ID = 'cheese';

export function getCatBreedById(id?: string): CatBreedInfo {
  return CAT_BREEDS.find(b => b.id === id) || CAT_BREEDS[0];
}
