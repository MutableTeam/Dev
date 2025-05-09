"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 text-white hover:from-purple-700 hover:via-blue-600 hover:to-cyan-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

// Cyberpunk button animations
const buttonGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 255, 255, 0.5), 0 0 15px rgba(0, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 8px rgba(255, 0, 255, 0.7), 0 0 15px rgba(255, 0, 255, 0.5), 0 0 20px rgba(255, 0, 255, 0.3);
  }
`

const buttonShine = keyframes`
  0% {
    background-position: 200% center;
  }
  100% {
    background-position: -200% center;
  }
`

// Styled components for cyberpunk buttons
const CyberButtonPrimary = styled.button`
  background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
  color: #000;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 1px;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: none;
  border-radius: 0.375rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
    background: linear-gradient(90deg, #0ff 20%, #f0f 80%);
  }
  
  &:active {
    transform: translateY(1px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: ${buttonShine} 3s infinite linear;
    z-index: 1;
  }
`

const CyberButtonOutline = styled.button`
  background: transparent;
  color: #0ff;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 1px;
  border: 1px solid rgba(0, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  border-radius: 0.375rem;
  box-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
  
  &:hover {
    background: rgba(0, 255, 255, 0.1);
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
  
  &:active {
    transform: translateY(1px);
  }
`

const CyberButtonSecondary = styled.button`
  background: linear-gradient(90deg, #f0f 0%, #b300b3 100%);
  color: #000;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 1px;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: none;
  border-radius: 0.375rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(255, 0, 255, 0.7);
    background: linear-gradient(90deg, #f0f 20%, #b300b3 80%);
  }
  
  &:active {
    transform: translateY(1px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: ${buttonShine} 3s infinite linear;
    z-index: 1;
  }
`

const CyberButtonGhost = styled.button`
  background: transparent;
  color: #0ff;
  font-family: monospace;
  font-size: 0.875rem;
  letter-spacing: 1px;
  border: none;
  position: relative;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  border-radius: 0.375rem;
  
  &:hover {
    background: rgba(0, 255, 255, 0.1);
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
  }
  
  &:active {
    transform: translateY(1px);
  }
`

const CyberButtonDestructive = styled.button`
  background: linear-gradient(90deg, #f00 0%, #900 100%);
  color: #fff;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 1px;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px rgba(255, 0, 0, 0.7);
  border-radius: 0.375rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.7);
    background: linear-gradient(90deg, #f00 20%, #900 80%);
  }
  
  &:active {
    transform: translateY(1px);
  }
`

const CyberButtonGradient = styled.button`
  background: linear-gradient(90deg, #0ff, #f0f, #0ff);
  background-size: 200% auto;
  color: #000;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.875rem;
  letter-spacing: 1px;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: none;
  border-radius: 0.375rem;
  animation: ${buttonGlow} 3s infinite alternate;
  
  &:hover {
    transform: translateY(-2px);
    background-position: right center;
  }
  
  &:active {
    transform: translateY(1px);
  }
`

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const { styleMode } = useCyberpunkTheme()
    const isCyberpunk = styleMode === "cyberpunk"

    // Use Slot when asChild is true
    const Comp = asChild ? Slot : "button"

    // For cyberpunk mode, use styled components based on variant
    if (isCyberpunk && !asChild) {
      const sizeClasses =
        size === "sm"
          ? "h-9 px-3 text-xs"
          : size === "lg"
            ? "h-11 px-8"
            : size === "icon"
              ? "h-10 w-10 p-0"
              : "h-10 px-4 py-2"

      const disabledClass = props.disabled ? "opacity-50 pointer-events-none" : ""
      const combinedClassName = `${sizeClasses} ${disabledClass} ${className || ""}`

      switch (variant) {
        case "outline":
          return <CyberButtonOutline ref={ref} className={combinedClassName} {...props} />
        case "secondary":
          return <CyberButtonSecondary ref={ref} className={combinedClassName} {...props} />
        case "ghost":
          return <CyberButtonGhost ref={ref} className={combinedClassName} {...props} />
        case "destructive":
          return <CyberButtonDestructive ref={ref} className={combinedClassName} {...props} />
        case "gradient":
          return <CyberButtonGradient ref={ref} className={combinedClassName} {...props} />
        default:
          return <CyberButtonPrimary ref={ref} className={combinedClassName} {...props} />
      }
    }

    // For regular mode or when asChild is true, use the standard button
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
