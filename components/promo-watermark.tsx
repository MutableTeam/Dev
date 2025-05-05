"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Sparkles, X, Check } from "lucide-react"

export default function PromoWatermark() {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Get form data
    const formData = new FormData(e.currentTarget)

    try {
      // Simulate form submission - in production, replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Reset form
      if (formRef.current) {
        formRef.current.reset()
      }

      // Show success message
      setIsSuccess(true)

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
        setIsExpanded(false)
      }, 5000)
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed top-2 left-2 z-[100]" ref={dropdownRef}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition-all duration-300 ${
          isHovered || isExpanded ? "bg-amber-500" : "bg-amber-400"
        } border border-amber-600 shadow-md`}
        style={{
          background:
            isHovered || isExpanded
              ? "linear-gradient(135deg, #f59f0b 0%, #fbbf24 50%, #f59f0b 100%)"
              : "linear-gradient(135deg, #fbbf24 0%, #f7e05b 50%, #fbbf24 100%)",
        }}
      >
        <div className="relative">
          <Image
            src="/images/mutable-token.png"
            alt="MUTB Token"
            width={16}
            height={16}
            className="rounded-full w-4 h-4 sm:w-6 sm:h-6"
          />
          {isHovered && !isExpanded && (
            <Sparkles
              className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 text-yellow-300"
              style={{ filter: "drop-shadow(0 0 2px #fff)" }}
            />
          )}
        </div>
        <div className="font-bold text-[10px] sm:text-sm text-amber-900">
          Sign up and earn <span className="text-amber-800">50 free MUTB</span>
        </div>
        <Sparkles
          className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 hidden sm:block"
          style={{ filter: "drop-shadow(0 0 2px #fff)" }}
        />
      </button>

      {/* Dropdown Form */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-[#000033] border-4 border-[#00ff00] rounded-lg shadow-lg overflow-hidden arcade-form-container">
          <div className="relative p-4">
            {/* Close button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-2 right-2 text-white hover:text-[#ff00ff] transition-colors"
            >
              <X size={20} />
            </button>

            {/* Pixel decorations */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-[#ff00ff] opacity-50"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-[#00ffff] opacity-50"></div>
            <div className="absolute top-4 left-4 w-2 h-2 bg-[#ffff00] opacity-50"></div>
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-[#00ff00] opacity-50"></div>

            {/* Success message */}
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-green-500/20 p-3 mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-[#ff00ff] text-center mb-2 text-lg font-press-start-2p leading-relaxed">
                  REGISTRATION
                  <br />
                  COMPLETE
                </h3>
                <p className="text-[#00ffff] text-center text-sm font-press-start-2p leading-relaxed">
                  50 MUTB TOKENS
                  <br />
                  WILL BE CREDITED
                  <br />
                  AT TOKEN LAUNCH
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-[#ff00ff] text-center mb-6 text-lg font-press-start-2p leading-relaxed">
                  PLAYER
                  <br />
                  REGISTRATION
                </h2>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="first_name" className="block text-[#00ffff] text-xs font-press-start-2p mb-1">
                      FIRST NAME
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      className="w-full p-2 bg-black/70 border-2 border-[#00ffff] text-white rounded font-mono text-sm font-bold focus:border-[#ff00ff] focus:outline-none focus:ring-1 focus:ring-[#ff00ff]"
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-[#00ffff] text-xs font-press-start-2p mb-1">
                      LAST NAME
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      className="w-full p-2 bg-black/70 border-2 border-[#00ffff] text-white rounded font-mono text-sm font-bold focus:border-[#ff00ff] focus:outline-none focus:ring-1 focus:ring-[#ff00ff]"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[#00ffff] text-xs font-press-start-2p mb-1">
                      EMAIL
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full p-2 bg-black/70 border-2 border-[#00ffff] text-white rounded font-mono text-sm font-bold focus:border-[#ff00ff] focus:outline-none focus:ring-1 focus:ring-[#ff00ff]"
                    />
                  </div>

                  <div>
                    <label htmlFor="solana_address" className="block text-[#00ffff] text-xs font-press-start-2p mb-1">
                      SOLANA ADDRESS
                    </label>
                    <input
                      id="solana_address"
                      name="solana_address"
                      type="text"
                      required
                      placeholder="6BkEas82vMNfj6yt8gUDj6SinCKoNcj1vituuaQrC7uq"
                      className="w-full p-2 bg-black/70 border-2 border-[#00ffff] text-white rounded font-mono text-sm font-bold focus:border-[#ff00ff] focus:outline-none focus:ring-1 focus:ring-[#ff00ff]"
                    />

                    <div className="text-right mt-1">
                      <Link
                        href="https://phantom.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ffff00] text-[8px] sm:text-[10px] font-press-start-2p hover:text-white transition-colors"
                      >
                        NEED A WALLET? GET PHANTOM
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="email_opt_in" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer border-2 border-[#ffff00] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[#ffff00] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffff00]"></div>
                    </label>
                    <span className="text-white text-[8px] sm:text-[10px] font-press-start-2p leading-tight">
                      STAY UP TO DATE WITH MUTABLE NEWS
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#ff0000] text-white border-2 border-white rounded font-press-start-2p text-sm uppercase tracking-wider shadow-[0_6px_0_#990000] hover:bg-[#ff3333] hover:transform hover:-translate-y-1 hover:shadow-[0_7px_0_#990000] active:transform active:translate-y-1 active:shadow-[0_2px_0_#990000] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "REGISTERING..." : "REGISTER PLAYER"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
