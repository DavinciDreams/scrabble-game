import { GameState } from './types';

export interface WordValidationResult {
  isValid: boolean;
  words: string[];
  score: number;
}

export function validateMove(gameState: GameState, placedTiles: { row: number; col: number; tile: Tile }[]): WordValidationResult {
  const words: string[] = [];
  let totalScore = 0;

  // Get all words formed by the move (horizontal and vertical)
  const horizontalWords = getHorizontalWords(gameState.board, placedTiles);
  const verticalWords = getVerticalWords(gameState.board, placedTiles);

  words.push(...horizontalWords.words);
  words.push(...verticalWords.words);
  totalScore = horizontalWords.score + verticalWords.score;

  // Validate words against dictionary
  const areWordsValid = words.every(word => isValidWord(word));

  return {
    isValid: areWordsValid,
    words,
    score: totalScore
  };
}

// Helper function to validate words against a dictionary
async function isValidWord(word: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/validate-word/${word}`);
    const data = await response.json();
    return data.isValid;
  } catch (error) {
    console.error('Error validating word:', error);
    return false;
  }
}