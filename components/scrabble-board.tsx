"use client"

import { useMemo } from "react"
import { useMobile } from "@/hooks/use-mobile"
import type { BoardCell, Tile } from "@/lib/types"

interface ScrabbleBoardProps {
  board: BoardCell[][]
  onCellClick: (row: number, col: number) => void
  selectedTile: Tile | null
  isUserTurn: boolean
}

export default function ScrabbleBoard({ board, onCellClick, selectedTile, isUserTurn }: ScrabbleBoardProps) {
  const isMobile = useMobile()

  // Define cell size based on screen size
  const cellSize = useMemo(() => {
    return isMobile ? "w-[20px] h-[20px]" : "w-[35px] h-[35px]"
  }, [isMobile])

  // Define font size based on screen size
  const fontSize = useMemo(() => {
    return isMobile ? "text-xs" : "text-sm"
  }, [isMobile])

  // Define tile value font size based on screen size
  const valueSize = useMemo(() => {
    return isMobile ? "text-[8px]" : "text-[10px]"
  }, [isMobile])

  // Get cell background color based on bonus type
  const getCellColor = (cell: BoardCell) => {
    if (cell.tile) return "bg-amber-200"

    switch (cell.bonus) {
      case "DL":
        return "bg-blue-200"
      case "TL":
        return "bg-blue-500"
      case "DW":
        return "bg-red-200"
      case "TW":
        return "bg-red-500"
      case "CENTER":
        return "bg-pink-200"
      default:
        return "bg-amber-50"
    }
  }

  // Get bonus text
  const getBonusText = (bonus: string | null) => {
    switch (bonus) {
      case "DL":
        return "DL"
      case "TL":
        return "TL"
      case "DW":
        return "DW"
      case "TW":
        return "TW"
      case "CENTER":
        return "★"
      default:
        return ""
    }
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-[repeat(15,1fr)] gap-[1px] border border-amber-800 bg-amber-800">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${cellSize} ${getCellColor(cell)} flex items-center justify-center relative cursor-pointer transition-all duration-100 ${
                isUserTurn && selectedTile && !cell.tile ? "hover:bg-amber-300" : ""
              } ${cell.isNew ? "ring-2 ring-amber-500" : ""}`}
              onClick={() => isUserTurn && onCellClick(rowIndex, colIndex)}
            >
              {cell.tile ? (
                <div className="absolute inset-0 flex items-center justify-center bg-amber-300 border border-amber-400 rounded-sm shadow-sm">
                  <span className={`${fontSize} font-bold text-amber-900`}>{cell.tile.letter}</span>
                  <span className={`${valueSize} absolute bottom-0 right-0.5 font-medium text-amber-800`}>
                    {cell.tile.value}
                  </span>
                </div>
              ) : (
                <span
                  className={`${valueSize} text-center font-medium ${
                    cell.bonus === "TL" || cell.bonus === "TW" ? "text-white" : "text-amber-900"
                  }`}
                >
                  {getBonusText(cell.bonus)}
                </span>
              )}
            </div>
          )),
        )}
      </div>
    </div>
  )
}
