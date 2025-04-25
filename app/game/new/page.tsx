"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewGamePage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateGame = async () => {
    if (!playerName.trim()) return

    setIsCreating(true)

    fetch('/api/games/join', {
      method: 'GET', // Correct method
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId: '12345', playerName: 'JohnDoe' }), // Example payload
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Game joined successfully:', data);
      })
      .catch((error) => {
        console.error('Failed to join game:', error);
      });

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-amber-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Game</CardTitle>
          <CardDescription>Set up a new Scrabble game and invite friends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-amber-700 hover:bg-amber-800"
            onClick={handleCreateGame}
            disabled={!playerName.trim() || isCreating}
          >
            {isCreating ? "Creating Game..." : "Create Game"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
