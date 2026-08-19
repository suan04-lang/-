import { DrinkReason } from '../types';

export interface DrinkReasonInfo {
  id: DrinkReason;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  defaultTips: string;
}

export const DRINK_REASONS: DrinkReasonInfo[] = [
  {
    id: 'friends',
    label: '친구와 약속',
    emoji: '👥',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: '친구들과의 즐거운 만남 및 친목 도모',
    defaultTips: '술 한 잔에 물 한 잔(1:1 법칙)을 챙기면 다음 날 숙취 없이 대화에 집중할 수 있어요!'
  },
  {
    id: 'stress',
    label: '스트레스 해소',
    emoji: '⚡',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: '업무/학업/대인관계 스트레스 및 피로',
    defaultTips: '알코올은 일시적 마취 효과일 뿐 스트레스 호르몬을 높여요. 따뜻한 차나 가벼운 산책으로 대체해보세요.'
  },
  {
    id: 'celebration',
    label: '기념일 / 축하',
    emoji: '🎉',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: '생일, 승진, 합격, 특별한 날 축하 파티',
    defaultTips: '건배 잔을 천천히 음미하고 무알콜 스파클링으로 분위기를 이어가보세요.'
  },
  {
    id: 'gathering',
    label: '회식 / 모임',
    emoji: '🏢',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: '직장 회식, 동문회, 비즈니스 자리',
    defaultTips: '시작 전 든든하게 식사하고, 잔을 비우지 않고 반만 채워 천천히 마시는 페이스 조절이 최고예요!'
  },
  {
    id: 'habit',
    label: '습관 / 혼술',
    emoji: '🛋️',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: '퇴근 후 무심코 캔맥주, 자기 전 한 잔',
    defaultTips: '탄산수+레몬즙으로 목넘김을 대체하거나, 냥이에게 츄르를 주며 하루를 마무리해보세요.'
  },
  {
    id: 'refresh',
    label: '기분 전환 / 휴식',
    emoji: '🌿',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: '주말 힐링, 맛있는 음식과의 페어링',
    defaultTips: '술 대신 향긋한 허브티나 제로 음료로 몸의 피로를 씻어내보는 건 어떨까요?'
  },
  {
    id: 'other',
    label: '기타 / 직접입력',
    emoji: '✍️',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    description: '기타 상황 및 특별한 이유',
    defaultTips: '나만의 음주 이유를 적어두면 언제 술이 당기는지 확실히 파악할 수 있어요!'
  }
];

export const getReasonInfo = (reason?: DrinkReason): DrinkReasonInfo => {
  return DRINK_REASONS.find(r => r.id === reason) || DRINK_REASONS[0];
};
