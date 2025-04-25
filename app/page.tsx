import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-amber-900">Scrabble Online</h1>
        <p className="text-lg text-amber-700">Challenge friends to a classic word game in real-time</p>

        <div className="pt-6 space-y-4">
          <Link href="/game/new" className="w-full">
            <Button className="w-full bg-amber-700 hover:bg-amber-800">Create New Game</Button>
          </Link>
          <Link href="/game/join" className="w-full">
            <Button variant="outline" className="w-full border-amber-700 text-amber-700 hover:bg-amber-100">
              Join Game
            </Button>
          </Link>
        </div>

        <div className="pt-8 text-sm text-amber-600">
          <p>Play the world's favorite word game with friends, no matter where they are!</p>
        </div>
      </div>
    </div>
  )
}
