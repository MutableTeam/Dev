"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isTablet, setIsTablet] = React.useState<boolean>(false)
  const [isTouchDevice, setIsTouchDevice] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Function to update device type
    const updateDeviceType = () => {
      // Check for touch capability
      const hasTouchCapability =
        "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0

      // Check for mobile/tablet based on screen width
      const width = window.innerWidth
      const isMobileSize = width < MOBILE_BREAKPOINT
      const isTabletSize = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT

      // Check for mobile user agent
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent)

      // Set states
      setIsMobile(isMobileSize || (hasTouchCapability && isMobileUA && width < TABLET_BREAKPOINT))
      setIsTablet(
        isTabletSize || (hasTouchCapability && isMobileUA && width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT),
      )
      setIsTouchDevice(hasTouchCapability || isMobileUA)

      // Log for debugging
      console.log("Device detection:", {
        width,
        hasTouchCapability,
        isMobileUA,
        isMobileSize,
        isTabletSize,
        isMobile: isMobileSize || (hasTouchCapability && isMobileUA && width < TABLET_BREAKPOINT),
        isTablet:
          isTabletSize || (hasTouchCapability && isMobileUA && width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT),
        isTouchDevice: hasTouchCapability || isMobileUA,
      })
    }

    // Initial check
    updateDeviceType()

    // Add event listeners for resize
    window.addEventListener("resize", updateDeviceType)

    // Add orientation change listener for mobile devices
    window.addEventListener("orientationchange", updateDeviceType)

    return () => {
      window.removeEventListener("resize", updateDeviceType)
      window.removeEventListener("orientationchange", updateDeviceType)
    }
  }, [])

  return { isMobile, isTablet, isTouchDevice }
}
