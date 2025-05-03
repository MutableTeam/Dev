import MultiWalletConnector from "@/components/multi-wallet-connector"
import DemoWatermark from "@/components/demo-watermark"
import PromoWatermark from "@/components/promo-watermark"
import GlobalAudioControls from "@/components/global-audio-controls"
import DebugOverlay from "@/components/debug-overlay"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-[#f5efdc]">
      <div className="max-w-6xl mx-auto">
        <MultiWalletConnector />
        <DemoWatermark />
        <PromoWatermark />
        <GlobalAudioControls />
        <DebugOverlay initiallyVisible={false} position="bottom-right" />
      </div>
    </main>
  )
}
