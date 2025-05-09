"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useCyberpunkTheme } from "@/contexts/cyberpunk-theme-context"
import styled from "@emotion/styled"

// Styled components for cyberpunk mode

const CyberCardHeader = styled.div`
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(16, 16, 48, 0.7);
  position: relative;
  z-index: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  }
`

const CyberCardTitle = styled.h3`
  color: #0ff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
  font-family: monospace;
  font-weight: bold;
  font-size: 1.5rem;
  letter-spacing: 1px;
  margin: 0;
`

const CyberCardDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin: 0;
`

const CyberCardContent = styled.div`
  position: relative;
  z-index: 1;
  padding: 1.5rem;
  padding-top: 1rem; // Changed from 0 to 1rem to add space between header and content
`

const CyberCardFooter = styled.div`
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(16, 16, 48, 0.7);
  position: relative;
  z-index: 1;
  padding: 1.5rem;
  padding-top: 1rem;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.8), transparent);
  }
`

const GridBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  transform: perspective(500px) rotateX(60deg);
  transform-origin: center bottom;
  opacity: 0.3;
  z-index: 0;
`

// Regular Card component with conditional rendering
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const { styleMode } = useCyberpunkTheme()
  const isCyberpunk = styleMode === "cyberpunk"

  if (isCyberpunk) {
    return (
      <div
        ref={ref}
        className={cn("rounded-lg border bg-card text-card-foreground shadow-sm cyberpunk-card", className)}
        {...props}
      >
        <GridBackground />
        {props.children}
      </div>
    )
  }

  return (
    <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { styleMode } = useCyberpunkTheme()
    const isCyberpunk = styleMode === "cyberpunk"

    if (isCyberpunk) {
      return <CyberCardHeader ref={ref} className={className} {...props} />
    }

    return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  },
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { styleMode } = useCyberpunkTheme()
    const isCyberpunk = styleMode === "cyberpunk"

    if (isCyberpunk) {
      return <CyberCardTitle ref={ref} className={className} {...props} />
    }

    return <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  },
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { styleMode } = useCyberpunkTheme()
    const isCyberpunk = styleMode === "cyberpunk"

    if (isCyberpunk) {
      return <CyberCardDescription ref={ref} className={className} {...props} />
    }

    return <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  },
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { styleMode } = useCyberpunkTheme()
    const isCyberpunk = styleMode === "cyberpunk"

    if (isCyberpunk) {
      return <CyberCardContent ref={ref} className={cn("mt-2", className)} {...props} />
    }

    return <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  },
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { styleMode } = useCyberpunkTheme()
    const isCyberpunk = styleMode === "cyberpunk"

    if (isCyberpunk) {
      return <CyberCardFooter ref={ref} className={className} {...props} />
    }

    return <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  },
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
