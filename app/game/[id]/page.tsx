"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Pusher from 'pusher-js'
import ScrabbleBoard from "@/components/scrabble-board"
import LetterRack from "@/components/letter-rack"
import GameControls from "@/components/game-controls"
import PlayerInfo from "@/components/player-info"
import { useToast } from "@/components/ui/use-toast"
import { GameState, Player, Tile } from "@/lib/types"
import { useMobile } from "@/lib/hooks/use-mobile"
import { initialGameState } from "@/lib/game-state"

export default function GamePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const playerName = searchParams.get("name") || "Guest"
  const gameId = params.id
  const { toast } = useToast()
  const isMobile = useMobile()

  // Game state
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [placedTiles, setPlacedTiles] = useState<{ row: number; col: number; tile: Tile }[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [pusherChannel, setPusherChannel] = useState<any>(null)

  const notifyMove = async (newGameState: GameState, moveDetails: { 
    playerId: string; 
    score: number; 
    words: string[] 
  }) => {
    try {
      // First notify the server
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/game/${gameId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameState: newGameState,
          moveDetails,
        }),
      });

      // Then trigger the Pusher event
      if (pusherChannel) {
        await pusherChannel.trigger('client-move-made', {
          gameState: newGameState,
          moveDetails,
        });
      }
    } catch (error) {
      console.error('Failed to notify move:', error);
      throw new Error('Failed to notify other players of your move');
    }
  };

  useEffect(() => {
    const initGame = async () => {
      try {
        // Initialize Pusher
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        // Subscribe to the game channel
        const channel = pusher.subscribe(`game-${gameId}`);
        setPusherChannel(channel);

        // Listen for player joins
        channel.bind('player-joined', (data: Player) => {
          setGameState((prev) => ({
            ...prev,
            players: [...prev.players, data],
          }));
        });

        // Listen for moves
        channel.bind('move-made', (data: { 
          gameState: GameState,
          moveDetails: { playerId: string, score: number }
        }) => {
          setGameState(data.gameState);
        });

        setIsConnected(true);
      } catch (error) {
        console.error("Failed to connect:", error);
        toast({
          title: "Connection failed",
          description: "Could not connect to the game server",
          variant: "destructive",
        });
      }
    };

    initGame();

    return () => {
      if (pusherChannel) {
        pusherChannel.unsubscribe();
      }
    };
  }, [gameId, toast]);

  // Helper function to draw tiles from the letter bag
  function drawTiles(count: number): Tile[] {
    const tiles: Tile[] = []
    const letterBag = [...gameState.letterBag]

    for (let i = 0; i < count; i++) {
      if (letterBag.length === 0) break

      const randomIndex = Math.floor(Math.random() * letterBag.length)
      const letter = letterBag.splice(randomIndex, 1)[0]

      tiles.push({
        id: `tile-${Math.random().toString(36).substring(2, 10)}`,
        letter: letter.letter,
        value: letter.value,
      })
    }

    setGameState((prev) => ({
      ...prev,
      letterBag,
    }))

    return tiles
  }

  // Handle tile selection from rack
  const handleTileSelect = (tile: Tile) => {
    setSelectedTile(tile)
  }

  // Handle tile placement on board
  const handleCellClick = (row: number, col: number) => {
    if (!selectedTile) return

    // Check if cell is already occupied
    if (gameState.board[row][col].tile) {
      toast({
        description: "This cell is already occupied",
        variant: "destructive",
      })
      return
    }

    // Place the tile on the board
    const newBoard = [...gameState.board]
    newBoard[row][col] = {
      ...newBoard[row][col],
      tile: selectedTile,
      isNew: true,
    }

    // Add to placed tiles
    setPlacedTiles([...placedTiles, { row, col, tile: selectedTile }])

    // Remove the tile from player's rack
    const currentPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId)
    if (currentPlayer) {
      const updatedPlayers = gameState.players.map((player) => {
        if (player.id === currentPlayer.id) {
          return {
            ...player,
            tiles: player.tiles.filter((t) => t.id !== selectedTile.id),
          }
        }
        return player
      })

      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        players: updatedPlayers,
      }))
    }

    setSelectedTile(null)
  }

  // Submit the current move
  const handleSubmitMove = async () => {
    if (placedTiles.length === 0) {
      toast({
        description: "Place at least one tile to make a move",
        variant: "destructive"
      });
      return;
    }

    try {
      // Validate the move
      const validation = await validateMove(gameState, placedTiles);

      if (!validation.isValid) {
        toast({
          title: "Invalid Words",
          description: "One or more words are not valid",
          variant: "destructive"
        });
        return;
      }

      // Update player score
      const updatedPlayers = gameState.players.map((player) => {
        if (player.id === gameState.currentPlayerId) {
          const newTiles = drawTiles(placedTiles.length);
          return {
            ...player,
            score: player.score + validation.score,
            tiles: [...player.tiles, ...newTiles],
            isCurrentTurn: false,
          };
        }

        if (gameState.players.length > 1 && player.id !== gameState.currentPlayerId) {
          return {
            ...player,
            isCurrentTurn: true,
          };
        }

        return player;
      });

      // Create new game state
      const newGameState = {
        ...gameState,
        board: gameState.board.map(row =>
          row.map(cell => ({
            ...cell,
            isNew: false,
          }))
        ),
        players: updatedPlayers,
        currentPlayerId:
          gameState.players.length > 1
            ? gameState.players.find((p) => p.id !== gameState.currentPlayerId)?.id || gameState.currentPlayerId
            : gameState.currentPlayerId,
        moveHistory: [
          ...gameState.moveHistory,
          {
            playerId: gameState.currentPlayerId,
            score: validation.score,
            words: validation.words,
            tiles: placedTiles.map((pt) => ({
              letter: pt.tile.letter,
              position: { row: pt.row, col: pt.col },
            })),
          },
        ],
      };

      // Notify other players through Pusher
      try {
        await notifyMove(newGameState, {
          playerId: gameState.currentPlayerId,
          score: validation.score,
          words: validation.words,
        });

        // Update local game state
        setGameState(newGameState);
        setPlacedTiles([]);

        toast({
          title: "Move submitted",
          description: `You scored ${validation.score} points with ${validation.words.join(', ')}!`,
        });
      } catch (error) {
        console.error('Error submitting move:', error);
        toast({
          title: "Error",
          description: "Failed to submit move. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting move:', error);
      toast({
        title: "Error",
        description: "Failed to submit move. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Reset the current move
  const handleResetMove = () => {
    if (placedTiles.length === 0) return

    // Remove placed tiles from the board
    const newBoard = [...gameState.board]
    placedTiles.forEach(({ row, col }) => {
      newBoard[row][col] = {
        ...newBoard[row][col],
        tile: null,
        isNew: false,
      }
    })

    // Return tiles to player's rack
    const currentPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId)
    if (currentPlayer) {
      const updatedPlayers = gameState.players.map((player) => {
        if (player.id === currentPlayer.id) {
          return {
            ...player,
            tiles: [...player.tiles, ...placedTiles.map((pt) => pt.tile)],
          }
        }
        return player
      })

      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        players: updatedPlayers,
      }))
    }

    setPlacedTiles([])
  }

  // Get the current player
  const currentPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId) || null

  // Check if it's the user's turn
  const isUserTurn = currentPlayer?.isCurrentTurn && gameState.players[0]?.id === gameState.currentPlayerId

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-800">Connecting to game...</h2>
          <p className="mt-2 text-amber-600">Game ID: {gameId}</p>
        </div>
      </div>
    )
  }
  else if (gameState.players.length === 0) {
    return (
    <div className="flex flex-col min-h-screen bg-amber-50 p-4">
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-amber-900">Scrabble Online</h1>
        <p className="text-amber-700">Game ID: {gameId}</p>
      </header>
      <div className="mt-4 p-3 bg-amber-100 rounded-md text-sm">
        <p className="font-medium text-amber-800">Waiting for players to join...</p>
        <p className="text-amber-700 mt-1">Share the game code with friends to play together!</p>
      </div>

      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-4 flex-1`}>
        <div className={`${isMobile ? "order-2" : "order-1"} ${isMobile ? "w-full" : "w-1/4"}`}>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2 text-amber-800">Players</h2>
            {gameState.players.map((player) => (
              <PlayerInfo
                key={player.id}
                player={player}
                isCurrentPlayer={player.id === gameState.players[0]?.id}
                isCurrentTurn={player.isCurrentTurn}
              />
            ))}
            {gameState.players.length === 0 && (
              <div className="mt-4 p-3 bg-amber-100 rounded-md text-sm">
                <p className="font-medium text-amber-800">No players joined yet</p>
                <p className="text-amber-700 mt-1">Share the game code with friends to play together!</p>
              </div>
            )}

          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2 text-amber-800">Game Info</h2>
            <p className="text-sm text-amber-700">Tiles remaining: {gameState.letterBag.length}</p>
            <p className="text-sm text-amber-700 mt-1">{isUserTurn ? "Your turn" : "Waiting for opponent"}</p>

            {gameState.moveHistory.length > 0 && (
              <div className="mt-3">
                <h3 className="text-sm font-medium text-amber-800">Last Move</h3>
                <p className="text-xs text-amber-700">
                  {gameState.players.find(
                    (p) => p.id === gameState.moveHistory[gameState.moveHistory.length - 1].playerId,
                  )?.name || "Player"}
                  {" scored "}
                  {gameState.moveHistory[gameState.moveHistory.length - 1].score}
                  {" points"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`${isMobile ? "order-1" : "order-2"} ${isMobile ? "w-full" : "flex-1"} flex flex-col`}>
          <div className="bg-white rounded-lg shadow-md p-4 flex-1 flex flex-col items-center justify-center">
            <ScrabbleBoard
              board={gameState.board}
              onCellClick={handleCellClick}
              selectedTile={selectedTile}
              isUserTurn={isUserTurn}
            />
          </div>

          {isUserTurn && (
            <div className="mt-4">
              <GameControls
                onSubmit={handleSubmitMove}
                onReset={handleResetMove}
                canSubmit={placedTiles.length > 0}
                canReset={placedTiles.length > 0}
              />
            </div>
          )}
          

          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <LetterRack
              tiles={gameState.players[0]?.tiles || []}
              onTileSelect={handleTileSelect}
              selectedTile={selectedTile}
              disabled={!isUserTurn}
            />
          </div>
        </div>
      </div>
    </div>
  )}
}
