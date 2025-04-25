export interface Tile {
  id: string
  letter: string
  value: number
}

export interface BoardCell {
  bonus: string | null
  tile: Tile | null
  isNew: boolean
}

export interface Player {
  id: string
  name: string
  score: number
  tiles: Tile[]
  isCurrentTurn: boolean
}

export interface Move {
  playerId: string
  score: number
  tiles: {
    letter: string
    position: {
      row: number
      col: number
    }
  }[]
}

export interface GameState {
  board: BoardCell[][]
  players: Player[]
  currentPlayerId: string | null
  letterBag: { letter: string; value: number }[]
  moveHistory: Move[]
}
