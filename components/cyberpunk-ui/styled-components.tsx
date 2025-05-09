import styled from "@emotion/styled"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cyberpunkTheme } from "@/styles/cyberpunk-theme"

const { colors, animations, effects, typography } = cyberpunkTheme

// Card components
export const CyberCard = styled(Card)`
  background: ${colors.background.card};
  border: 1px solid ${colors.border.cyan};
  box-shadow: 0 0 15px ${colors.shadow.cyan}, inset 0 0 10px ${colors.shadow.magenta};
  backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 48%, ${colors.border.cyan} 50%, transparent 52%);
    background-size: 200% 200%;
    animation: ${animations.shine} 8s infinite linear;
    z-index: 0;
  }
`

export const CyberCardHeader = styled(CardHeader)`
  border-bottom: 1px solid ${colors.border.cyan};
  background: ${colors.background.darker};
  position: relative;
  z-index: 1;
`

export const CyberCardTitle = styled(CardTitle)`
  ${effects.textGlow()};
  font-family: ${typography.fontFamily.mono};
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.base};
  letter-spacing: ${typography.letterSpacing.wide};
`

export const CyberCardDescription = styled(CardDescription)`
  color: ${colors.text.cyan};
  font-family: ${typography.fontFamily.mono};
`

export const CyberCardContent = styled(CardContent)`
  position: relative;
  z-index: 1;
`

export const CyberCardFooter = styled(CardFooter)`
  border-top: 1px solid ${colors.border.cyan};
  background: ${colors.background.darker};
  position: relative;
  z-index: 1;
`

// Button components
export const CyberButton = styled(Button)`
  background: ${colors.background.button};
  color: #000;
  font-family: ${typography.fontFamily.mono};
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.xs};
  letter-spacing: ${typography.letterSpacing.wide};
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-shadow: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px ${colors.shadow.cyanBright};
    background: ${colors.background.buttonHover};
  }
  
  &:active {
    transform: translateY(1px);
  }
`

export const CyberTestButton = styled(CyberButton)`
  background: ${colors.background.testButton};
  
  &:hover {
    background: ${colors.background.testButtonHover};
    box-shadow: 0 0 15px ${colors.shadow.magenta};
  }
`

export const CyberOutlineButton = styled(CyberButton)`
  background: transparent;
  border: 1px solid ${colors.border.cyanBright};
  color: ${colors.text.cyan};
  
  &:hover {
    background: ${colors.border.cyan};
    color: ${colors.text.primary};
  }
`

// Badge component
export const CyberBadge = styled(Badge)`
  background: linear-gradient(90deg, ${colors.border.cyan} 0%, ${colors.border.magenta} 100%);
  border: 1px solid ${colors.border.cyanBright};
  color: ${colors.text.cyan};
  text-shadow: 0 0 5px ${colors.shadow.cyanBright};
  font-family: ${typography.fontFamily.mono};
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.xs};
  letter-spacing: ${typography.letterSpacing.wide};
  padding: 0.2rem 0.5rem;
`

export const CyberTestBadge = styled(CyberBadge)`
  background: linear-gradient(90deg, ${colors.border.magenta} 0%, ${colors.primary.darkMagenta} 100%);
  border: 1px solid ${colors.border.magentaBright};
  color: ${colors.text.magenta};
  text-shadow: 0 0 5px ${colors.shadow.magenta};
`

// Input component
export const CyberInput = styled(Input)`
  background: ${colors.background.darker};
  border: 1px solid ${colors.border.cyan};
  color: ${colors.text.cyan};
  font-family: ${typography.fontFamily.mono};
  
  &:focus {
    border-color: ${colors.primary.cyan};
    box-shadow: 0 0 0 2px ${colors.shadow.cyan};
  }
  
  &::placeholder {
    color: ${colors.text.muted};
  }
`

// Skeleton component
export const CyberSkeleton = styled(Skeleton)`
  background: ${colors.background.darker};
  &::after {
    background: linear-gradient(
      90deg,
      transparent,
      ${colors.border.cyan},
      transparent
    );
  }
`

// Grid background
export const GridBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  ${effects.gridBackground}
  z-index: 0;
`

// Container with scanlines effect
export const ScanlineContainer = styled.div`
  ${effects.scanlines}
`

// Glowing text
export const GlowText = styled.span`
  ${effects.textGlow()};
  font-family: ${typography.fontFamily.mono};
`

// Glowing magenta text
export const MagentaGlowText = styled.span`
  ${effects.textGlow(colors.primary.magenta)};
  font-family: ${typography.fontFamily.mono};
`

// Glitch container
export const GlitchContainer = styled.div`
  position: relative;
  
  &::before, &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
  }
  
  &::before {
    color: ${colors.primary.cyan};
    z-index: -1;
    animation: ${animations.glitch} 3s infinite;
  }
  
  &::after {
    color: ${colors.primary.magenta};
    z-index: -2;
    animation: ${animations.glitch} 2s infinite reverse;
  }
`

// Neon border
export const NeonBorder = styled.div`
  border: 1px solid ${colors.primary.cyan};
  box-shadow: 0 0 10px ${colors.shadow.cyanBright}, inset 0 0 5px ${colors.shadow.cyanBright};
  border-radius: ${cyberpunkTheme.borderRadius.default};
  padding: 1px;
`

// Cyberpunk panel
export const CyberPanel = styled.div`
  background: ${colors.background.darker};
  border: 1px solid ${colors.border.cyan};
  border-radius: ${cyberpunkTheme.borderRadius.default};
  padding: ${cyberpunkTheme.spacing[4]};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${colors.primary.cyan}, ${colors.primary.magenta}, ${colors.primary.cyan});
    z-index: 1;
  }
`

// Cyberpunk header
export const CyberHeader = styled.header`
  background: ${colors.background.darker};
  border-bottom: 1px solid ${colors.border.cyan};
  padding: ${cyberpunkTheme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${colors.primary.cyan}, transparent);
  }
`

// Cyberpunk footer
export const CyberFooter = styled.footer`
  background: ${colors.background.darker};
  border-top: 1px solid ${colors.border.cyan};
  padding: ${cyberpunkTheme.spacing[4]};
  text-align: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${colors.primary.cyan}, transparent);
  }
`
