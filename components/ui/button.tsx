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

// Glitch effect animations
const glitchAnim = keyframes`
  0%, 100% {
    transform: translate(0);
    text-shadow: -0.5px 0 #ff00de, 0.5px 0.5px #00ffff;
  }
  5% {
    transform: translate(-1px, 0) skew(1deg);
    text-shadow: -0.5px 0 #ff00de, 0.5px 0.5px #00ffff;
  }
  10% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: -0.5px 0 #ff00de, 0.5px 0.5px #00ffff;
  }
  15% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: 0.5px 0.5px #ff00de, -0.5px -0.5px #00ffff;
  }
  20% {
    transform: translate(1px, -1px) skew(-1deg);
    text-shadow: 0.5px 0.5px #ff00de, -0.5px -0.5px #00ffff;
  }
  25% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: 0.5px 0.5px #ff00de, -0.5px -0.5px #00ffff;
  }
  30% {
    transform: translate(-1px, 0) skew(1deg);
    text-shadow: -0.5px 0 #ff00de, 0.5px 0.5px #00ffff;
  }
  35% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: -0.5px 0 #ff00de, 0.5px 0.5px #00ffff;
  }
  40% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: 0 0 transparent, 0 0 transparent;
  }
  45% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: 0 0 transparent, 0 0 transparent;
  }
  50% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: 0 0 transparent, 0 0 transparent;
  }
  55% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: 0 0 transparent, 0 0 transparent;
  }
  60% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: 0 0 transparent, 0 0 transparent;
  }
  65% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: 0 0 transparent, 0 0 transparent;
  }
  70% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: 0 0 transparent, 0 0 transparent;
  }
  75% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: 0 0 transparent, 0 0 transparent;
  }
  80% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: 0 0 transparent, 0 0 transparent;
  }
  85% {
    transform: translate(-1px, 0) skew(1deg);
    text-shadow: -0.5px 0 #ff00de, 0.5px 0.5px #00ffff;
  }
  90% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: -0.5px 0 #ff00de, 0.5px 0.5px #00ffff;
  }
  95% {
    transform: translate(0, 0) skew(0deg);
    text-shadow: 0 0 transparent, 0 0 transparent;
  }
`

// Replace the glitchClip keyframes with this more subtle version
const glitchClip = keyframes`
  0%, 100% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  10% {
    clip-path: polygon(0 5%, 100% 5%, 100% 95%, 0 95%);
  }
  20% {
    clip-path: polygon(0 10%, 100% 10%, 100% 90%, 0 90%);
  }
  30% {
    clip-path: polygon(0 10%, 100% 10%, 100% 90%, 0 90%);
  }
  40% {
    clip-path: polygon(0 15%, 100% 15%, 100% 85%, 0 85%);
  }
  50% {
    clip-path: polygon(0 10%, 100% 10%, 100% 90%, 0 90%);
  }
  60% {
    clip-path: polygon(0 5%, 100% 5%, 100% 95%, 0 95%);
  }
  70% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
`

// Button shape glitch animation
const buttonGlitch = keyframes`
  0%, 100% {
    transform: translate(0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  7% {
    transform: translate(-2px, 0);
    clip-path: polygon(0 0, 100% 0, 98% 100%, 0 100%);
  }
  8% {
    transform: translate(0, 0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  9% {
    transform: translate(2px, -2px);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 2% 100%);
  }
  10% {
    transform: translate(0, 0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  13% {
    transform: translate(0, 0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  14% {
    transform: translate(-2px, 0);
    clip-path: polygon(0 0, 97% 0, 100% 100%, 3% 100%);
  }
  15% {
    transform: translate(0, 0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  40% {
    transform: translate(0, 0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  41% {
    transform: translate(3px, 1px);
    clip-path: polygon(0 0, 100% 0, 97% 100%, 3% 100%);
  }
  42% {
    transform: translate(0, 0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  43% {
    transform: translate(-3px, 0);
    clip-path: polygon(3% 0, 100% 0, 97% 100%, 0 100%);
  }
  44% {
    transform: translate(0, 0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  73% {
    transform: translate(0, 0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  74% {
    transform: translate(2px, 1px);
    clip-path: polygon(0 0, 97% 0, 100% 100%, 3% 100%);
  }
  75% {
    transform: translate(0, 0);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
`

const flashGlitch = keyframes`
  0%, 100% {
    background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
  }
  8% {
    background: linear-gradient(90deg, #f0f 10%, #0ff 90%);
  }
  9% {
    background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
  }
  10% {
    background: linear-gradient(270deg, #0ff 0%, #f0f 100%);
  }
  11% {
    background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
  }
  41% {
    background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
  }
  42% {
    background: linear-gradient(90deg, #f0f 20%, #0ff 80%);
  }
  43% {
    background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
  }
  74% {
    background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
  }
  75% {
    background: linear-gradient(270deg, #0ff 10%, #f0f 90%);
  }
  76% {
    background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
    animation: ${buttonGlitch} 4s infinite, ${flashGlitch} 4s infinite;
    
    & > span {
      animation: ${glitchAnim} 8s infinite;
    }
    
    &::before, &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, #0ff 0%, #f0f 100%);
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.3;
    }
    
    &::before {
      left: 1px;
      text-shadow: -0.5px 0 #ff00de;
      animation: ${glitchClip} 8s infinite linear alternate-reverse;
      background: linear-gradient(90deg, #0ff 20%, #f0f 80%);
      clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
    }
    
    &::after {
      left: -1px;
      text-shadow: 0.5px 0 #00ffff;
      animation: ${glitchClip} 8s infinite linear alternate-reverse;
      background: linear-gradient(90deg, #0ff 20%, #f0f 80%);
      clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
    }
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
  
  /* Ensure button content is above the shine effect */
  & > * {
    position: relative;
    z-index: 2;
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

      // Add data-text attribute for glitch effect
      const buttonText = typeof props.children === "string" ? props.children : ""
      const dataTextProps = buttonText ? { "data-text": buttonText } : {}

      // Wrap children in span for text glitch
      const wrappedChildren = <span>{props.children}</span>

      switch (variant) {
        case "outline":
          return <CyberButtonOutline ref={ref} className={combinedClassName} {...dataTextProps} {...props} />
        case "secondary":
          return <CyberButtonSecondary ref={ref} className={combinedClassName} {...dataTextProps} {...props} />
        case "ghost":
          return <CyberButtonGhost ref={ref} className={combinedClassName} {...dataTextProps} {...props} />
        case "destructive":
          return <CyberButtonDestructive ref={ref} className={combinedClassName} {...dataTextProps} {...props} />
        case "gradient":
          return <CyberButtonGradient ref={ref} className={combinedClassName} {...dataTextProps} {...props} />
        default:
          return (
            <CyberButtonPrimary ref={ref} className={combinedClassName} {...dataTextProps} {...props}>
              {wrappedChildren}
            </CyberButtonPrimary>
          )
      }
    }

    // For regular mode or when asChild is true, use the standard button
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
