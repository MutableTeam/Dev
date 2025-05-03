"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HelpCircle, Keyboard, Shield } from "lucide-react"
import SoundButton from "@/components/sound-button"

interface InstructionsProps {
  variant?: "icon" | "full"
  className?: string
}

export default function Instructions({ variant = "icon", className = "" }: InstructionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <SoundButton
            variant="outline"
            size="icon"
            className={`rounded-full border-2 border-black text-black hover:bg-[#FFD54F] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all ${className}`}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Game Instructions</span>
          </SoundButton>
        ) : (
          <SoundButton
            variant="outline"
            className={`border-2 border-black text-black hover:bg-[#FFD54F] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all ${className}`}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Game Instructions
          </SoundButton>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-2 border-black bg-[#fbf3de]">
        <DialogHeader>
          <DialogTitle className="font-mono">GAME INSTRUCTIONS</DialogTitle>
          <DialogDescription>How to play Archer Arena</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Game Modes</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">1v1 Duel:</span> You against one opponent. One life only - make it count!
              </li>
              <li>
                <span className="font-medium">Free-For-All:</span> You against 3 other players in a chaotic battle
                royale.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Movement</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>W, A, S, D - Move your character</li>
                  <li>Space - Dash (quick dodge)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1">Combat</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Left Mouse Button - Draw and fire bow</li>
                  <li>Hold longer for more powerful shots</li>
                  <li>Right Mouse Button - Special attack (when charged)</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Tips
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use obstacles for cover</li>
              <li>Time your shots - fully drawn arrows deal more damage</li>
              <li>Keep moving to avoid enemy arrows</li>
              <li>Use dash to quickly escape dangerous situations</li>
              <li>In 1v1 mode, you only have one life - be careful!</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
