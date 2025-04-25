"use client"

import { Button } from "@/components/ui/button"

interface GameControlsProps {
  onSubmit: () => void
  onReset: () => void
  canSubmit: boolean
  canReset: boolean
}

export default function GameControls({ onSubmit, onReset, canSubmit, canReset }: GameControlsProps) {
  return (
    <div className="flex gap-2 justify-center">
      <Button
        variant="outline"
        className="border-amber-700 text-amber-700 hover:bg-amber-100"
        onClick={onReset}
        disabled={!canReset}
      >
        Reset Move
      </Button>
      <Button className="bg-amber-700 hover:bg-amber-800" onClick={onSubmit} disabled={!canSubmit}>
        Submit Move
      </Button>
    </div>
  )
}
