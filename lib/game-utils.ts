import type { GameState, BoardCell } from "./types"

// Create the initial game board with bonus squares
export function createInitialBoard(): BoardCell[][] {
  const board: BoardCell[][] = Array(15)
    .fill(null)
    .map(() =>
      Array(15)
        .fill(null)
        .map(() => ({
          bonus: null,
          tile: null,
          isNew: false,
        })),
    )

  // Triple Word Score
  const tripleWordCells = [
    [0, 0],
    [0, 7],
    [0, 14],
    [7, 0],
    [7, 14],
    [14, 0],
    [14, 7],
    [14, 14],
  ]

  // Double Word Score
  const doubleWordCells = [
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
    [1, 13],
    [2, 12],
    [3, 11],
    [4, 10],
    [10, 4],
    [11, 3],
    [12, 2],
    [13, 1],
    [10, 10],
    [11, 11],
    [12, 12],
    [13, 13],
  ]

  // Triple Letter Score
  const tripleLetterCells = [
    [1, 5],
    [1, 9],
    [5, 1],
    [5, 5],
    [5, 9],
    [5, 13],
    [9, 1],
    [9, 5],
    [9, 9],
    [9, 13],
    [13, 5],
    [13, 9],
  ]

  // Double Letter Score
  const doubleLetterCells = [
    [0, 3],
    [0, 11],
    [2, 6],
    [2, 8],
    [3, 0],
    [3, 7],
    [3, 14],
    [6, 2],
    [6, 6],
    [6, 8],
    [6, 12],
    [7, 3],
    [7, 11],
    [8, 2],
    [8, 6],
    [8, 8],
    [8, 12],
    [11, 0],
    [11, 7],
    [11, 14],
    [12, 6],
    [12, 8],
    [14, 3],
    [14, 11],
  ]

  // Set bonus cells
  tripleWordCells.forEach(([row, col]) => {
    board[row][col].bonus = "TW"
  })

  doubleWordCells.forEach(([row, col]) => {
    board[row][col].bonus = "DW"
  })

  tripleLetterCells.forEach(([row, col]) => {
    board[row][col].bonus = "TL"
  })

  doubleLetterCells.forEach(([row, col]) => {
    board[row][col].bonus = "DL"
  })

  // Center cell
  board[7][7].bonus = "CENTER"

  return board
}

// Generate the letter bag with distribution and point values
export function generateLetterBag() {
  const letterDistribution = [
    { letter: "A", count: 9, value: 1 },
    { letter: "B", count: 2, value: 3 },
    { letter: "C", count: 2, value: 3 },
    { letter: "D", count: 4, value: 2 },
    { letter: "E", count: 12, value: 1 },
    { letter: "F", count: 2, value: 4 },
    { letter: "G", count: 3, value: 2 },
    { letter: "H", count: 2, value: 4 },
    { letter: "I", count: 9, value: 1 },
    { letter: "J", count: 1, value: 8 },
    { letter: "K", count: 1, value: 5 },
    { letter: "L", count: 4, value: 1 },
    { letter: "M", count: 2, value: 3 },
    { letter: "N", count: 6, value: 1 },
    { letter: "O", count: 8, value: 1 },
    { letter: "P", count: 2, value: 3 },
    { letter: "Q", count: 1, value: 10 },
    { letter: "R", count: 6, value: 1 },
    { letter: "S", count: 4, value: 1 },
    { letter: "T", count: 6, value: 1 },
    { letter: "U", count: 4, value: 1 },
    { letter: "V", count: 2, value: 4 },
    { letter: "W", count: 2, value: 4 },
    { letter: "X", count: 1, value: 8 },
    { letter: "Y", count: 2, value: 4 },
    { letter: "Z", count: 1, value: 10 },
    { letter: " ", count: 2, value: 0 }, // Blank tiles
  ]

  const letterBag: { letter: string; value: number }[] = []

  letterDistribution.forEach(({ letter, count, value }) => {
    for (let i = 0; i < count; i++) {
      letterBag.push({ letter, value })
    }
  })

  return letterBag
}

// Initial game state
export const initialGameState: GameState = {
  board: createInitialBoard(),
  players: [],
  currentPlayerId: null,
  letterBag: generateLetterBag(),
  moveHistory: [],
}
