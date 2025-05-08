"use client"

import type { TokenConfig } from "@/types/token-types"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SUPPORTED_TOKENS } from "@/config/token-registry"

interface TokenSelectorProps {
  selectedToken: TokenConfig
  onTokenSelect: (token: TokenConfig) => void
  otherToken?: TokenConfig // To prevent selecting the same token
  disabled?: boolean
}

export function TokenSelector({ selectedToken, onTokenSelect, otherToken, disabled = false }: TokenSelectorProps) {
  // Filter out the other token if provided
  const availableTokens = otherToken ? SUPPORTED_TOKENS.filter((token) => token.id !== otherToken.id) : SUPPORTED_TOKENS

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled || availableTokens.length <= 1}>
        <Button variant="outline" className="flex items-center gap-2 bg-white p-2 rounded-md border-2 border-black">
          <Image
            src={selectedToken.logoURI || "/placeholder.svg"}
            alt={selectedToken.symbol}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="font-medium font-mono">{selectedToken.symbol}</span>
          {availableTokens.length > 1 && <ChevronDown className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-2 border-black">
        {availableTokens.map((token) => (
          <DropdownMenuItem
            key={token.id}
            onClick={() => onTokenSelect(token)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Image
              src={token.logoURI || "/placeholder.svg"}
              alt={token.symbol}
              width={20}
              height={20}
              className="rounded-full"
            />
            <span>{token.name}</span>
            <span className="text-gray-500 ml-auto">{token.symbol}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
