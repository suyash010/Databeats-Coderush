// Core EEG data types and interfaces
export interface EEGData {
  data: number[]
  sfreq: number
  channel_name: string
  duration?: number
}

export interface SpectrogramData {
  frequencies: number[]
  times: number[]
  power: number[][]
}

export interface ModelPrediction {
  prediction: "Schizophrenia" | "Healthy Control"
  confidence: number
  modelVersion: string
}

export interface PreprocessingConfig {
  lowCutoff: number
  highCutoff: number
  notchFreq?: number
}
