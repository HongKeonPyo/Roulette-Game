import { RoulettePreset } from '../types/roulette';
import { DEFAULT_PALETTE, getContrastingTextColor } from './colors';

export const INITIAL_PRESETS: RoulettePreset[] = [
  {
    id: 'preset-prizes-weighted',
    title: '행운의 경품 추첨 (확률 차등)',
    category: '이벤트/추첨',
    description: '1등부터 꽝까지 실제 이벤트처럼 당첨 확률이 차등 적용된 프리셋',
    visualMode: 'proportional',
    items: [
      { text: '1등: 최신형 태블릿', weight: 2, color: '#DC2626', textColor: '#FFFFFF' },
      { text: '2등: 무선 이어폰', weight: 8, color: '#F59E0B', textColor: '#0F172A' },
      { text: '3등: 치킨 세트', weight: 20, color: '#10B981', textColor: '#FFFFFF' },
      { text: '4등: 커피 쿠폰', weight: 30, color: '#3B82F6', textColor: '#FFFFFF' },
      { text: '꽝: 다음 기회에', weight: 40, color: '#6B7280', textColor: '#FFFFFF' },
    ],
  },
  {
    id: 'preset-lunch',
    title: '오늘 점심 뭐 먹지?',
    category: '일상/식사',
    description: '결정 장애 해결! 호불호 적은 인기 점심 메뉴 6선',
    visualMode: 'equal',
    items: [
      { text: '김치찌개 / 된장찌개', weight: 20, color: DEFAULT_PALETTE[0], textColor: getContrastingTextColor(DEFAULT_PALETTE[0]) },
      { text: '바삭한 돈까스', weight: 20, color: DEFAULT_PALETTE[1], textColor: getContrastingTextColor(DEFAULT_PALETTE[1]) },
      { text: '매콤 제육볶음', weight: 20, color: DEFAULT_PALETTE[2], textColor: getContrastingTextColor(DEFAULT_PALETTE[2]) },
      { text: '짜장면 & 탕수육', weight: 15, color: DEFAULT_PALETTE[3], textColor: getContrastingTextColor(DEFAULT_PALETTE[3]) },
      { text: '신선한 초밥 / 회덮밥', weight: 15, color: DEFAULT_PALETTE[4], textColor: getContrastingTextColor(DEFAULT_PALETTE[4]) },
      { text: '가벼운 포케 / 샐러드', weight: 10, color: DEFAULT_PALETTE[5], textColor: getContrastingTextColor(DEFAULT_PALETTE[5]) },
    ],
  },
  {
    id: 'preset-penalty',
    title: '친구 / 회식 벌칙 뽑기',
    category: '모임/게임',
    description: '사다리 타기보다 흥미진진한 벌칙 룰렛',
    visualMode: 'equal',
    items: [
      { text: '커피 쏘기', weight: 25, color: '#EF4444', textColor: '#FFFFFF' },
      { text: '설거지 / 분리수거', weight: 25, color: '#F97316', textColor: '#FFFFFF' },
      { text: '노래 한 곡 완창', weight: 20, color: '#8B5CF6', textColor: '#FFFFFF' },
      { text: '간식 사오기', weight: 20, color: '#06B6D4', textColor: '#0F172A' },
      { text: '천사 찬스 (면제!)', weight: 10, color: '#10B981', textColor: '#FFFFFF' },
    ],
  },
  {
    id: 'preset-gacha',
    title: '가챠 뽑기 확률 시뮬레이션',
    category: '게임/시뮬레이션',
    description: '모바일 게임 등급별 극악의 확률을 체감해보는 룰렛',
    visualMode: 'proportional',
    items: [
      { text: 'SSR 전설 캐릭터 (1%)', weight: 1, color: '#F59E0B', textColor: '#0F172A' },
      { text: 'SR 영웅 캐릭터 (9%)', weight: 9, color: '#8B5CF6', textColor: '#FFFFFF' },
      { text: 'R 희귀 장비 (30%)', weight: 30, color: '#3B82F6', textColor: '#FFFFFF' },
      { text: 'N 일반 아이템 (60%)', weight: 60, color: '#64748B', textColor: '#FFFFFF' },
    ],
  },
  {
    id: 'preset-yes-no',
    title: 'YES or NO 결단의 룰렛',
    category: '결정',
    description: '할까 말까 고민될 때 운명에 맡기는 룰렛',
    visualMode: 'equal',
    items: [
      { text: '무조건 진행! (YES)', weight: 45, color: '#10B981', textColor: '#FFFFFF' },
      { text: '잠깐 보류! (NO)', weight: 45, color: '#EF4444', textColor: '#FFFFFF' },
      { text: '다시 한 번 돌리기', weight: 10, color: '#F59E0B', textColor: '#0F172A' },
    ],
  },
];
