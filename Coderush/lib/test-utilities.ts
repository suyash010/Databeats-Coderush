// Testing utilities for EEG analysis system
import type { EEGData, ModelPrediction } from "@/types/eeg"
import { EEGPreprocessor } from "./preprocessing"
import { SpectrogramGenerator } from "./spectrogram"
import { getModelInstance } from "./onnx-inference"

export class EEGTestSuite {
  /**
   * Test preprocessing pipeline
   */
  static testPreprocessing(data: EEGData): {
    original: { mean: number; std: number; range: number }
    processed: { mean: number; std: number; range: number }
    passed: boolean
  } {
    const originalMean = data.data.reduce((sum, val) => sum + val, 0) / data.data.length
    const originalStd = Math.sqrt(
      data.data.reduce((sum, val) => sum + Math.pow(val - originalMean, 2), 0) / data.data.length,
    )
    const originalRange = Math.max(...data.data) - Math.min(...data.data)

    const processed = EEGPreprocessor.preprocess(data.data, data.sfreq)
    const processedMean = processed.reduce((sum, val) => sum + val, 0) / processed.length
    const processedStd = Math.sqrt(
      processed.reduce((sum, val) => sum + Math.pow(val - processedMean, 2), 0) / processed.length,
    )
    const processedRange = Math.max(...processed) - Math.min(...processed)

    // Test criteria: processed data should be normalized and filtered
    const passed = Math.abs(processedMean) < 0.1 && processedRange <= 2.0 && processedStd > 0

    return {
      original: { mean: originalMean, std: originalStd, range: originalRange },
      processed: { mean: processedMean, std: processedStd, range: processedRange },
      passed,
    }
  }

  /**
   * Test spectrogram generation
   */
  static testSpectrogram(data: EEGData): {
    dimensions: { frequencies: number; times: number; power: number }
    frequencyRange: { min: number; max: number }
    passed: boolean
  } {
    const spectrogram = SpectrogramGenerator.generateSpectrogram(data.data, data.sfreq)

    const dimensions = {
      frequencies: spectrogram.frequencies.length,
      times: spectrogram.times.length,
      power: spectrogram.power.length * spectrogram.power[0].length,
    }

    const frequencyRange = {
      min: Math.min(...spectrogram.frequencies),
      max: Math.max(...spectrogram.frequencies),
    }

    // Test criteria: reasonable dimensions and frequency range
    const passed =
      dimensions.frequencies > 0 &&
      dimensions.times > 0 &&
      frequencyRange.min >= 0 &&
      frequencyRange.max <= data.sfreq / 2

    return {
      dimensions,
      frequencyRange,
      passed,
    }
  }

  /**
   * Test model inference
   */
  static async testModelInference(data: EEGData): Promise<{
    prediction: ModelPrediction
    responseTime: number
    passed: boolean
  }> {
    const startTime = performance.now()

    const modelInstance = getModelInstance()
    const prediction = await modelInstance.predict(data)

    const responseTime = performance.now() - startTime

    // Test criteria: valid prediction with reasonable confidence and response time
    const passed =
      (prediction.prediction === "Healthy Control" || prediction.prediction === "Schizophrenia") &&
      prediction.confidence >= 0 &&
      prediction.confidence <= 1 &&
      responseTime < 5000 // Less than 5 seconds

    return {
      prediction,
      responseTime,
      passed,
    }
  }

  /**
   * Run comprehensive test suite
   */
  static async runFullTestSuite(data: EEGData): Promise<{
    preprocessing: ReturnType<typeof EEGTestSuite.testPreprocessing>
    spectrogram: ReturnType<typeof EEGTestSuite.testSpectrogram>
    inference: Awaited<ReturnType<typeof EEGTestSuite.testModelInference>>
    overallPassed: boolean
  }> {
    const preprocessing = this.testPreprocessing(data)
    const spectrogram = this.testSpectrogram(data)
    const inference = await this.testModelInference(data)

    const overallPassed = preprocessing.passed && spectrogram.passed && inference.passed

    return {
      preprocessing,
      spectrogram,
      inference,
      overallPassed,
    }
  }
}
