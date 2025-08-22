"use client"

import * as ort from "onnxruntime-web"
import type { ModelPrediction, EEGData } from "@/types/eeg"

export class ONNXModelInference {
  private session: ort.InferenceSession | null = null
  private modelPath: string
  private isLoaded = false

  constructor(modelPath = "/model/model.onnx") {
    this.modelPath = modelPath
  }

  /**
   * Initialize ONNX Runtime and load the model
   */
  async loadModel(): Promise<void> {
    if (this.isLoaded && this.session) {
      return
    }

    try {
      // Configure ONNX Runtime for web
      ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/"

      // Try to load the model
      try {
        this.session = await ort.InferenceSession.create(this.modelPath)
        this.isLoaded = true
        console.log("ONNX model loaded successfully")
      } catch (modelError) {
        console.warn("Could not load ONNX model from", this.modelPath, "- using mock predictions")
        // Model file doesn't exist, we'll use mock predictions
        this.isLoaded = false
      }
    } catch (error) {
      console.error("Failed to initialize ONNX Runtime:", error)
      throw new Error("Failed to initialize ONNX Runtime")
    }
  }

  /**
   * Prepare EEG data for model input
   */
  private prepareInput(data: number[]): Float32Array {
    // For demonstration, we'll use a simple feature extraction
    // In a real model, this would be more sophisticated
    const features = new Float32Array(128) // Assume model expects 128 features

    // Extract basic statistical features
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    const std = Math.sqrt(variance)
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min

    // Fill feature vector with statistical measures and frequency domain features
    features[0] = mean
    features[1] = std
    features[2] = variance
    features[3] = min
    features[4] = max
    features[5] = range

    // Add some frequency domain features (simplified)
    for (let i = 6; i < 64; i++) {
      const freq = ((i - 6) / 58) * 50 // 0-50 Hz range
      let power = 0
      for (let j = 0; j < data.length; j++) {
        power += Math.cos((2 * Math.PI * freq * j) / 250) * data[j] // Assume 250 Hz sampling
      }
      features[i] = power / data.length
    }

    // Add time domain features
    for (let i = 64; i < 128; i++) {
      const windowStart = Math.floor(((i - 64) / 64) * data.length)
      const windowEnd = Math.min(windowStart + Math.floor(data.length / 64), data.length)
      let windowMean = 0
      for (let j = windowStart; j < windowEnd; j++) {
        windowMean += data[j]
      }
      features[i] = windowMean / (windowEnd - windowStart)
    }

    return features
  }

  /**
   * Generate mock prediction for demonstration
   */
  private generateMockPrediction(features: Float32Array): ModelPrediction {
    // Simple heuristic based on signal characteristics
    const mean = features[0]
    const std = features[1]
    const complexity = std / (Math.abs(mean) + 0.001)

    // Mock classification logic
    const isSchizophrenia = complexity > 0.5 && Math.abs(mean) < 0.1
    const baseConfidence = 0.7 + Math.random() * 0.25 // 70-95% confidence

    return {
      prediction: isSchizophrenia ? "Schizophrenia" : "Healthy Control",
      confidence: Math.min(0.95, baseConfidence),
      modelVersion: "Mock CNN v1.0 (Demo)",
    }
  }

  /**
   * Run inference on EEG data
   */
  async predict(eegData: EEGData): Promise<ModelPrediction> {
    await this.loadModel()

    const features = this.prepareInput(eegData.data)

    if (this.session && this.isLoaded) {
      try {
        // Create input tensor
        const inputTensor = new ort.Tensor("float32", features, [1, features.length])

        // Run inference
        const results = await this.session.run({ input: inputTensor })

        // Process results (assuming binary classification output)
        const output = results.output as ort.Tensor
        const predictions = output.data as Float32Array

        const schizophreniaProb = predictions[0]
        const healthyProb = predictions[1] || 1 - schizophreniaProb

        return {
          prediction: schizophreniaProb > healthyProb ? "Schizophrenia" : "Healthy Control",
          confidence: Math.max(schizophreniaProb, healthyProb),
          modelVersion: "CNN v1.0",
        }
      } catch (error) {
        console.error("Inference error:", error)
        // Fallback to mock prediction
        return this.generateMockPrediction(features)
      }
    } else {
      // Use mock prediction when model is not available
      return this.generateMockPrediction(features)
    }
  }

  /**
   * Get model information
   */
  getModelInfo(): { isLoaded: boolean; modelPath: string } {
    return {
      isLoaded: this.isLoaded,
      modelPath: this.modelPath,
    }
  }

  /**
   * Dispose of the model session
   */
  dispose(): void {
    if (this.session) {
      this.session.release()
      this.session = null
      this.isLoaded = false
    }
  }
}

// Singleton instance
let modelInstance: ONNXModelInference | null = null

export function getModelInstance(): ONNXModelInference {
  if (!modelInstance) {
    modelInstance = new ONNXModelInference()
  }
  return modelInstance
}
