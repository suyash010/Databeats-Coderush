"use client"

import { useMemo } from "react"
import type { EEGData } from "@/types/eeg"
import { SpectrogramGenerator } from "@/lib/spectrogram"

export function useSpectrogram(data: EEGData | null, windowSize = 256, overlap = 0.5) {
  const spectrogramData = useMemo(() => {
    if (!data) return null

    try {
      return SpectrogramGenerator.generateSpectrogram(data.data, data.sfreq, windowSize, overlap)
    } catch (error) {
      console.error("Error generating spectrogram:", error)
      return null
    }
  }, [data, windowSize, overlap])

  const frequencyBands = useMemo(() => {
    if (!spectrogramData) return null

    const { frequencies, power } = spectrogramData

    // Calculate average power in different frequency bands
    const getBandPower = (minFreq: number, maxFreq: number) => {
      const bandIndices = frequencies
        .map((freq, idx) => ({ freq, idx }))
        .filter(({ freq }) => freq >= minFreq && freq <= maxFreq)
        .map(({ idx }) => idx)

      if (bandIndices.length === 0) return 0

      const bandPowers = power.filter((_, freqIdx) => bandIndices.includes(freqIdx)).flat()

      return bandPowers.reduce((sum, val) => sum + val, 0) / bandPowers.length
    }

    return {
      delta: getBandPower(0.5, 4), // Delta waves
      theta: getBandPower(4, 8), // Theta waves
      alpha: getBandPower(8, 13), // Alpha waves
      beta: getBandPower(13, 30), // Beta waves
      gamma: getBandPower(30, 100), // Gamma waves
    }
  }, [spectrogramData])

  return {
    spectrogramData,
    frequencyBands,
    isReady: !!spectrogramData,
  }
}
