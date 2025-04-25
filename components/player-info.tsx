import type { Player } from "@/lib/types"

interface PlayerInfoProps {
  player: Player
  isCurrentPlayer: boolean
  isCurrentTurn: boolean
}

export default function PlayerInfo({ player, isCurrentPlayer, isCurrentTurn }: PlayerInfoProps) {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-md mb-2 ${
        isCurrentTurn ? "bg-amber-100" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold mr-2">
          {player.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-amber-900">
            {player.name} {isCurrentPlayer && "(You)"}
          </p>
          <p className="text-xs text-amber-700">Tiles: {player.tiles.length}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-amber-800">{player.score}</p>
        {isCurrentTurn && <span className="text-xs text-amber-600">Current turn</span>}
      </div>
    </div>
  )
}
