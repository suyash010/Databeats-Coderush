"use client"

import { useState, useCallback } from "react"
import type { EEGData, ModelPrediction } from "@/types/eeg"
import { getModelInstance } from "@/lib/onnx-inference"

export function useModelInference() {
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<ModelPrediction | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runInference = useCallback(async (eegData: EEGData) => {
    setIsLoading(true)
    setError(null)
    setPrediction(null)

    try {
      const modelInstance = getModelInstance()
      const result = await modelInstance.predict(eegData)
      setPrediction(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Inference failed"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setPrediction(null)
    setError(null)
  }, [])

  return {
    runInference,
    clearResults,
    isLoading,
    prediction,
    error,
  }
}
