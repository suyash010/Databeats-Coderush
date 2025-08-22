"use client"

import { useState, useCallback } from "react"
import type { EEGData } from "@/types/eeg"
import { SampleDataGenerator } from "@/lib/sample-data"
import { EEGPreprocessor } from "@/lib/preprocessing"

export function useEEGData() {
  const [rawData, setRawData] = useState<EEGData | null>(null)
  const [processedData, setProcessedData] = useState<EEGData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSampleData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await SampleDataGenerator.loadSampleData()
      setRawData(data)

      // Apply preprocessing
      const processed = EEGPreprocessor.preprocess(data.data, data.sfreq)
      setProcessedData({
        ...data,
        data: processed,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load EEG data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateSyntheticData = useCallback(() => {
    setIsLoading(true)
    setError(null)

    try {
      const data = SampleDataGenerator.generateSampleEEG(10, 250, "Fz")
      setRawData(data)

      // Apply preprocessing
      const processed = EEGPreprocessor.preprocess(data.data, data.sfreq)
      setProcessedData({
        ...data,
        data: processed,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate EEG data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearData = useCallback(() => {
    setRawData(null)
    setProcessedData(null)
    setError(null)
  }, [])

  return {
    rawData,
    processedData,
    isLoading,
    error,
    loadSampleData,
    generateSyntheticData,
    clearData,
  }
}
