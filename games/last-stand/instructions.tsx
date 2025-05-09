"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Gamepad2, Info, AlertTriangle } from "lucide-react"
import Image from "next/image"
import SoundButton from "@/components/sound-button"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

// Cyberpunk animations
const glowPulse = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 10px rgba(255, 0, 255, 0.5), 0 0 20px rgba(255, 0, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.5), 0 0 10px rgba(0, 255, 255, 0.3);
  }
`

const CyberCard = styled(Card)`
  background: rgba(16, 16, 48, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  animation: ${glowPulse} 4s infinite alternate;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.8), transparent);
    z-index: 1;
  }
`

const CyberButton = styled(Button)`
  background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
  color: #000;
  font-family: monospace;
  font-weight: bold;
  letter-spacing: 1px;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
    background: linear-gradient(90deg, #0ff 20%, #f0f 80%);
  }
  
  &:active {
    transform: translateY(1px);
  }
`

const CyberSlider = styled(Slider)`
  &[data-orientation="horizontal"] {
    height: 6px;
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.3);
  }
  
  .slider-thumb {
    background: #0ff;
    border: 2px solid #000;
    width: 16px;
    height: 16px;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
  }
  
  .slider-track {
    background: linear-gradient(90deg, #0ff, #f0f);
    height: 100%;
  }
`

interface InstructionsProps {
  onStartGame: (wager: number) => void
  initialWager?: number
}

export function Instructions({ onStartGame, initialWager = 0 }: InstructionsProps) {
  const [wager, setWager] = useState(initialWager || 0)
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  const handleWagerChange = (value: number[]) => {
    setWager(value[0])
  }

  return isCyberpunk ? (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-4 bg-[#0a0a24]/80">
      <CyberCard className="w-full max-w-2xl">
        <CardHeader className="border-b border-[#0ff]/20">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-[#0ff]" />
            <CardTitle className="text-[#0ff] font-mono">AA: LAST STAND</CardTitle>
          </div>
          <CardDescription className="text-[#0ff]/70 font-mono">
            Archer Arena: Last Stand - Fight waves of undead enemies in this survival archery game
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <Image
                  src="/images/last-stand.jpg"
                  alt="Last Stand"
                  width={200}
                  height={120}
                  className="rounded border border-[#0ff]/30"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-[#0ff] font-mono text-lg">Game Instructions</h3>
                <ul className="space-y-1 text-[#0ff]/80 text-sm">
                  <li>• Use WASD or arrow keys to move your archer</li>
                  <li>• Click or tap to shoot arrows at enemies</li>
                  <li>• Survive as many waves as possible</li>
                  <li>• Collect power-ups to enhance your abilities</li>
                  <li>• Earn MUTB tokens based on your performance</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-[#0ff]/10 border border-[#0ff]/30 rounded flex items-center gap-2">
              <Info className="h-5 w-5 text-[#0ff]" />
              <p className="text-[#0ff]/90 text-sm">
                This game requires quick reflexes and strategic positioning. Watch out for special enemies with unique
                abilities!
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-[#0ff] font-mono">Wager Amount (MUTB)</Label>
              <div className="flex items-center gap-4">
                <CyberSlider
                  defaultValue={[wager]}
                  max={10}
                  step={1}
                  onValueChange={handleWagerChange}
                  className="flex-grow"
                />
                <div className="w-16 h-10 bg-[#0a0a24] border border-[#0ff]/30 rounded flex items-center justify-center text-[#0ff] font-mono">
                  {wager}
                </div>
              </div>
              <p className="text-[#0ff]/60 text-xs">
                Higher wagers can result in better rewards, but also higher risk.
              </p>
            </div>

            {wager > 5 && (
              <div className="p-3 bg-[#ff0066]/10 border border-[#ff0066]/30 rounded flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#ff0066]" />
                <p className="text-[#ff0066]/90 text-sm">
                  High wager alert! You're risking {wager} MUTB tokens on this game.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t border-[#0ff]/20 p-4">
          <CyberButton className="w-full" onClick={() => onStartGame(wager)}>
            START GAME
          </CyberButton>
        </CardFooter>
      </CyberCard>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-4">
      <Card className="w-full max-w-2xl bg-[#fbf3de] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            <CardTitle className="font-mono">AA: LAST STAND</CardTitle>
          </div>
          <CardDescription className="font-mono">
            Archer Arena: Last Stand - Fight waves of undead enemies in this survival archery game
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <Image
                  src="/images/last-stand.jpg"
                  alt="Last Stand"
                  width={200}
                  height={120}
                  className="rounded border-2 border-black"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-mono text-lg font-bold">Game Instructions</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Use WASD or arrow keys to move your archer</li>
                  <li>• Click or tap to shoot arrows at enemies</li>
                  <li>• Survive as many waves as possible</li>
                  <li>• Collect power-ups to enhance your abilities</li>
                  <li>• Earn MUTB tokens based on your performance</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-amber-100 border-2 border-black rounded flex items-center gap-2">
              <Info className="h-5 w-5" />
              <p className="text-sm">
                This game requires quick reflexes and strategic positioning. Watch out for special enemies with unique
                abilities!
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-mono">Wager Amount (MUTB)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  defaultValue={[wager]}
                  max={10}
                  step={1}
                  onValueChange={handleWagerChange}
                  className="flex-grow"
                />
                <div className="w-16 h-10 bg-white border-2 border-black rounded flex items-center justify-center font-mono">
                  {wager}
                </div>
              </div>
              <p className="text-xs text-gray-600">Higher wagers can result in better rewards, but also higher risk.</p>
            </div>

            {wager > 5 && (
              <div className="p-3 bg-red-100 border-2 border-red-500 rounded flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">
                  High wager alert! You're risking {wager} MUTB tokens on this game.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t-2 border-black p-4">
          <SoundButton
            className="w-full bg-[#FFD54F] hover:bg-[#FFCA28] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-mono"
            onClick={() => onStartGame(wager)}
          >
            START GAME
          </SoundButton>
        </CardFooter>
      </Card>
    </div>
  )
}

// Add default export that re-exports the Instructions component
export default Instructions
