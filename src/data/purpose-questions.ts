import { PurposeQuestion } from '@/types/alignment';

export const PURPOSE_QUESTIONS: PurposeQuestion[] = [
  {
    id: 'important',
    question: 'What is most important in this life?',
    explanation: 'What do you value above all else? What gives life meaning?',
    placeholder: 'e.g., Family, personal growth, making a difference...',
  },
  {
    id: 'contribute',
    question: 'What do you want to contribute?',
    explanation: 'What gifts, talents, or knowledge do you want to share with the world?',
    placeholder: 'e.g., Help others find clarity, create beautiful things...',
  },
  {
    id: 'grow',
    question: 'How do you want to grow?',
    explanation: 'What kind of person do you want to become? What skills do you want to develop?',
    placeholder: 'e.g., More patient, better leader, deeper thinker...',
  },
  {
    id: 'significant',
    question: 'What will make you significant?',
    explanation: 'What would make you feel your life truly mattered?',
    placeholder: 'e.g., Raising great kids, building a legacy, inspiring change...',
  },
  {
    id: 'belong',
    question: 'What do you want to belong to?',
    explanation: 'What communities, causes, or movements resonate with you?',
    placeholder: 'e.g., A close-knit family, a creative community, a movement for change...',
  },
  {
    id: 'security',
    question: 'What would give you security?',
    explanation: 'What would make you feel safe, stable, and at peace?',
    placeholder: 'e.g., Financial freedom, strong relationships, good health...',
  },
  {
    id: 'exciting',
    question: 'What would make your life exciting?',
    explanation: 'What adventures, challenges, or experiences call to you?',
    placeholder: 'e.g., Traveling the world, starting a business, learning new skills...',
  },
];

export const PURPOSE_QUESTION_GROUPS = [
  ['important', 'contribute'],
  ['grow', 'significant'],
  ['belong', 'security', 'exciting'],
];
