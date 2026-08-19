import { SoberChallenge } from '../types';

export const SOBER_CHALLENGES: SoberChallenge[] = [
  {
    id: 'challenge_3days',
    targetDays: 3,
    title: '3일 연속 금주 챌린지',
    subtitle: '작심삼일 탈출! 건강한 간의 첫걸음',
    rewardCoins: 50,
    rewardStamp: '🥉 3일 클린 발바닥',
    rewardItemId: 'hat_ribbon',
    icon: '🌱',
    color: 'from-amber-400 to-amber-500'
  },
  {
    id: 'challenge_5days',
    targetDays: 5,
    title: '5일 주중 금주 챌린지',
    subtitle: '월~금 클린 라이프! 아침이 가뿐해지는 기적',
    rewardCoins: 100,
    rewardStamp: '🥈 5일 활력 발바닥',
    rewardItemId: 'item_water_bottle',
    icon: '✨',
    color: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'challenge_7days',
    targetDays: 7,
    title: '7일 일주일 퍼펙트 챌린지',
    subtitle: '일주일 동안 무알콜! 수면 질 상승 & 피부 톤업',
    rewardCoins: 180,
    rewardStamp: '🥇 7일 마스터 발바닥',
    rewardItemId: 'hat_sunglasses',
    icon: '🌟',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'challenge_14days',
    targetDays: 14,
    title: '14일 습관 리셋 챌린지',
    subtitle: '2주 뇌세포 & 간 완벽 회복! 음주 습관 극복',
    rewardCoins: 350,
    rewardStamp: '🏆 14일 영웅 발바닥',
    rewardItemId: 'hat_angel',
    icon: '💫',
    color: 'from-purple-400 to-pink-500'
  },
  {
    id: 'challenge_30days',
    targetDays: 30,
    title: '30일 한 달 금주 신화 챌린지',
    subtitle: '놀라운 신체 변화와 절약의 대성공! 금주 전설 달성',
    rewardCoins: 1000,
    rewardStamp: '👑 30일 전설의 골드 발바닥',
    rewardItemId: 'hat_crown',
    icon: '👑',
    color: 'from-amber-500 to-yellow-400'
  }
];
