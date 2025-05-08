"use client"
import { Settings } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import SoundButton from "@/components/sound-button"

interface SwapSettingsProps {
  slippageBps: number
  onSlippageChange: (slippageBps: number) => void
}

export function SwapSettings({ slippageBps, onSlippageChange }: SwapSettingsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <SoundButton variant="outline" size="sm" className="h-8 border border-black">
          <Settings className="h-4 w-4 mr-1" />
          Settings
        </SoundButton>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 border-2 border-black">
        <div className="space-y-4">
          <h4 className="font-bold">Slippage Tolerance</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm">{(slippageBps / 100).toFixed(2)}%</span>
            <div className="flex gap-2">
              <SoundButton
                variant="outline"
                size="sm"
                className="h-6 text-xs border border-black"
                onClick={() => onSlippageChange(50)}
              >
                0.5%
              </SoundButton>
              <SoundButton
                variant="outline"
                size="sm"
                className="h-6 text-xs border border-black"
                onClick={() => onSlippageChange(100)}
              >
                1%
              </SoundButton>
              <SoundButton
                variant="outline"
                size="sm"
                className="h-6 text-xs border border-black"
                onClick={() => onSlippageChange(200)}
              >
                2%
              </SoundButton>
            </div>
          </div>
          <Slider
            value={[slippageBps]}
            min={10}
            max={500}
            step={10}
            onValueChange={(value) => onSlippageChange(value[0])}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Your transaction will revert if the price changes unfavorably by more than this percentage.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
