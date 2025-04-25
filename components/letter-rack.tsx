"use client"

import { useMemo } from "react"
import { useMobile } from "@/hooks/use-mobile"
import type { Tile } from "@/lib/types"

interface LetterRackProps {
  tiles: Tile[]
  onTileSelect: (tile: Tile) => void
  selectedTile: Tile | null
  disabled: boolean
}

export default function LetterRack({ tiles, onTileSelect, selectedTile, disabled }: LetterRackProps) {
  const isMobile = useMobile()

  // Define tile size based on screen size
  const tileSize = useMemo(() => {
    return isMobile ? "w-[35px] h-[35px]" : "w-[45px] h-[45px]"
  }, [isMobile])

  // Define font size based on screen size
  const fontSize = useMemo(() => {
    return isMobile ? "text-lg" : "text-xl"
  }, [isMobile])

  // Define tile value font size based on screen size
  const valueSize = useMemo(() => {
    return isMobile ? "text-[10px]" : "text-xs"
  }, [isMobile])

  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-semibold mb-2 text-amber-800">Your Tiles</h2>

      <div className="flex justify-center gap-2 p-2 bg-amber-100 rounded-lg min-h-[60px]">
        {tiles.length === 0 ? (
          <div className="flex items-center justify-center text-amber-500 italic">No tiles</div>
        ) : (
          tiles.map((tile) => (
            <div
              key={tile.id}
              className={`${tileSize} bg-amber-300 border-2 ${
                selectedTile?.id === tile.id ? "border-amber-600 shadow-md translate-y-[-4px]" : "border-amber-400"
              } rounded-md flex items-center justify-center relative cursor-pointer transition-all duration-100 ${
                disabled ? "opacity-70 cursor-not-allowed" : "hover:border-amber-500 hover:shadow-sm"
              }`}
              onClick={() => !disabled && onTileSelect(tile)}
            >
              <span className={`${fontSize} font-bold text-amber-900`}>{tile.letter}</span>
              <span className={`${valueSize} absolute bottom-0.5 right-1 font-medium text-amber-800`}>
                {tile.value}
              </span>
            </div>
          ))
        )}
      </div>

      {disabled && <p className="text-sm text-amber-600 mt-2 text-center">Wait for your turn to play</p>}
    </div>
  )
}
