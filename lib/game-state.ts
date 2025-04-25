import { GameState } from './types';

// Standard Scrabble letter distribution and points
const letterDistribution = {
  A: { count: 9, value: 1 },
  B: { count: 2, value: 3 },
  C: { count: 2, value: 3 },
  D: { count: 4, value: 2 },
  E: { count: 12, value: 1 },
  F: { count: 2, value: 4 },
  G: { count: 3, value: 2 },
  H: { count: 2, value: 4 },
  I: { count: 9, value: 1 },
  J: { count: 1, value: 8 },
  K: { count: 1, value: 5 },
  L: { count: 4, value: 1 },
  M: { count: 2, value: 3 },
  N: { count: 6, value: 1 },
  O: { count: 8, value: 1 },
  P: { count: 2, value: 3 },
  Q: { count: 1, value: 10 },
  R: { count: 6, value: 1 },
  S: { count: 4, value: 1 },
  T: { count: 6, value: 1 },
  U: { count: 4, value: 1 },
  V: { count: 2, value: 4 },
  W: { count: 2, value: 4 },
  X: { count: 1, value: 8 },
  Y: { count: 2, value: 4 },
  Z: { count: 1, value: 10 }
};

// Create letter bag
const createLetterBag = () => {
  const bag: { letter: string; value: number }[] = [];
  Object.entries(letterDistribution).forEach(([letter, { count, value }]) => {
    for (let i = 0; i < count; i++) {
      bag.push({ letter, value });
    }
  });
  return bag;
};

// Create empty board
const createBoard = () => {
  const board: GameState['board'] = Array(15).fill(null).map(() =>
    Array(15).fill(null).map(() => ({
      tile: null
    }))
  );
  return board;
};

export const initialGameState: GameState = {
  board: createBoard(),
  players: [],
  currentPlayerId: null,
  letterBag: createLetterBag(),
  moveHistory: []
};