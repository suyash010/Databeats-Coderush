"use client"

import { useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EEGData } from "@/types/eeg"
import { SpectrogramGenerator } from "@/lib/spectrogram"

interface SpectrogramVisualizerProps {
  data: EEGData | null
  isLoading?: boolean
  title?: string
  height?: number
}

export function SpectrogramVisualizer({
  data,
  isLoading = false,
  title = "Spectrogram (Wavelet Transform)",
  height = 400,
}: SpectrogramVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate spectrogram data
  const spectrogramData = useMemo(() => {
    if (!data) return null
    return SpectrogramGenerator.generateSpectrogram(data.data, data.sfreq)
  }, [data])

  // Color mapping function
  const getColor = (value: number, min: number, max: number): string => {
    const normalized = (value - min) / (max - min)

    // Use a blue-to-red colormap (viridis-like)
    if (normalized < 0.25) {
      const t = normalized / 0.25
      return `rgb(${Math.floor(68 * (1 - t) + 59 * t)}, ${Math.floor(1 * (1 - t) + 82 * t)}, ${Math.floor(84 * (1 - t) + 139 * t)})`
    } else if (normalized < 0.5) {
      const t = (normalized - 0.25) / 0.25
      return `rgb(${Math.floor(59 * (1 - t) + 33 * t)}, ${Math.floor(82 * (1 - t) + 144 * t)}, ${Math.floor(139 * (1 - t) + 140 * t)})`
    } else if (normalized < 0.75) {
      const t = (normalized - 0.5) / 0.25
      return `rgb(${Math.floor(33 * (1 - t) + 94 * t)}, ${Math.floor(144 * (1 - t) + 201 * t)}, ${Math.floor(140 * (1 - t) + 98 * t)})`
    } else {
      const t = (normalized - 0.75) / 0.25
      return `rgb(${Math.floor(94 * (1 - t) + 253 * t)}, ${Math.floor(201 * (1 - t) + 231 * t)}, ${Math.floor(98 * (1 - t) + 37 * t)})`
    }
  }

  // Draw spectrogram on canvas
  useEffect(() => {
    if (!spectrogramData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { power, frequencies, times } = spectrogramData

    // Set canvas size
    const containerWidth = canvas.parentElement?.clientWidth || 800
    const containerHeight = height - 100 // Account for margins and labels

    canvas.width = containerWidth
    canvas.height = containerHeight

    // Calculate cell dimensions
    const cellWidth = containerWidth / times.length
    const cellHeight = containerHeight / frequencies.length

    // Find min/max values for color scaling
    const flatPower = power.flat()
    const minPower = Math.min(...flatPower)
    const maxPower = Math.max(...flatPower)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw heatmap
    for (let freqIdx = 0; freqIdx < frequencies.length; freqIdx++) {
      for (let timeIdx = 0; timeIdx < times.length; timeIdx++) {
        const powerValue = power[freqIdx][timeIdx]
        const color = getColor(powerValue, minPower, maxPower)

        ctx.fillStyle = color
        ctx.fillRect(
          timeIdx * cellWidth,
          (frequencies.length - 1 - freqIdx) * cellHeight, // Flip Y axis
          cellWidth,
          cellHeight,
        )
      }
    }
  }, [spectrogramData, height])

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Computing time-frequency decomposition...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || !spectrogramData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No EEG data available for spectrogram analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
            Load EEG data to view time-frequency analysis
          </div>
        </CardContent>
      </Card>
    )
  }

  const { frequencies, times } = spectrogramData
  const maxFreq = Math.max(...frequencies)
  const maxTime = Math.max(...times)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            {frequencies.length} freq bins × {times.length} time windows
          </span>
        </CardTitle>
        <CardDescription>
          Frequency range: 0 - {maxFreq.toFixed(1)} Hz | Time range: 0 - {maxTime.toFixed(2)}s
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Y-axis label */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-muted-foreground">
            Frequency (Hz)
          </div>

          {/* Main spectrogram */}
          <div className="ml-12 mr-16">
            <canvas ref={canvasRef} className="w-full border border-border rounded" style={{ height: height - 100 }} />

            {/* X-axis label */}
            <div className="text-center text-sm text-muted-foreground mt-2">Time (seconds)</div>
          </div>

          {/* Color scale legend */}
          <div className="absolute right-0 top-0 h-full w-12 flex flex-col">
            <div className="text-xs text-muted-foreground mb-1 text-center">Power (dB)</div>
            <div className="flex-1 relative">
              <div
                className="w-6 h-full rounded"
                style={{
                  background:
                    "linear-gradient(to top, rgb(68,1,84), rgb(59,82,139), rgb(33,144,140), rgb(94,201,98), rgb(253,231,37))",
                }}
              />
              <div className="absolute -right-8 top-0 text-xs text-muted-foreground">High</div>
              <div className="absolute -right-8 bottom-0 text-xs text-muted-foreground">Low</div>
            </div>
          </div>
        </div>

        {/* Frequency band analysis */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Delta (0.5-4 Hz)</div>
            <div className="text-muted-foreground">Deep sleep</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Theta (4-8 Hz)</div>
            <div className="text-muted-foreground">Drowsiness</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Alpha (8-13 Hz)</div>
            <div className="text-muted-foreground">Relaxed</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Beta (13-30 Hz)</div>
            <div className="text-muted-foreground">Active</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
