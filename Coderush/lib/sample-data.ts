// Sample EEG data generator and loader
import type { EEGData } from "@/types/eeg"

export class SampleDataGenerator {
  /**
   * Generate synthetic EEG data for demonstration
   */
  static generateSampleEEG(duration = 10, sfreq = 250, channelName = "Fz"): EEGData {
    const numSamples = duration * sfreq
    const data: number[] = []

    // Generate synthetic EEG-like signal
    for (let i = 0; i < numSamples; i++) {
      const t = i / sfreq

      // Alpha rhythm (8-12 Hz)
      const alpha = 0.5 * Math.sin(2 * Math.PI * 10 * t)

      // Beta rhythm (13-30 Hz)
      const beta = 0.3 * Math.sin(2 * Math.PI * 20 * t)

      // Theta rhythm (4-8 Hz)
      const theta = 0.4 * Math.sin(2 * Math.PI * 6 * t)

      // Add noise
      const noise = 0.1 * (Math.random() - 0.5)

      // Combine components
      data[i] = alpha + beta + theta + noise
    }

    return {
      data,
      sfreq,
      channel_name: channelName,
      duration,
    }
  }

  /**
   * Load sample data from public directory
   */
  static async loadSampleData(type: "default" | "healthy" | "schizophrenia" = "default"): Promise<EEGData> {
    const fileMap = {
      default: "/data/sample_eeg.json",
      healthy: "/data/healthy_control.json",
      schizophrenia: "/data/schizophrenia_sample.json",
    }

    try {
      const response = await fetch(fileMap[type])
      if (!response.ok) {
        // Fallback to generated data if file doesn't exist
        console.warn(`Sample data file ${fileMap[type]} not found, generating synthetic data`)
        return this.generateSampleEEG()
      }
      return await response.json()
    } catch (error) {
      console.warn("Error loading sample data, generating synthetic data:", error)
      return this.generateSampleEEG()
    }
  }

  /**
   * Generate realistic EEG data with specific characteristics
   */
  static generateRealisticEEG(
    condition: "healthy" | "schizophrenia" = "healthy",
    duration = 10,
    sfreq = 250,
    channelName = "Fz",
  ): EEGData {
    const numSamples = duration * sfreq
    const data: number[] = []

    for (let i = 0; i < numSamples; i++) {
      const t = i / sfreq

      if (condition === "healthy") {
        // Healthy control patterns
        const alpha = 0.6 * Math.sin(2 * Math.PI * 10 * t) // Strong alpha rhythm
        const beta = 0.2 * Math.sin(2 * Math.PI * 20 * t) // Moderate beta
        const theta = 0.1 * Math.sin(2 * Math.PI * 6 * t) // Low theta
        const noise = 0.05 * (Math.random() - 0.5) // Low noise

        data[i] = alpha + beta + theta + noise
      } else {
        // Schizophrenia-like patterns
        const alpha = 0.3 * Math.sin(2 * Math.PI * 9 * t) // Reduced alpha
        const beta = 0.4 * Math.sin(2 * Math.PI * 25 * t) // Increased beta
        const theta = 0.5 * Math.sin(2 * Math.PI * 5 * t) // Increased theta
        const gamma = 0.3 * Math.sin(2 * Math.PI * 40 * t) // Increased gamma
        const noise = 0.15 * (Math.random() - 0.5) // Higher noise
        const artifacts = Math.random() < 0.02 ? 0.5 * (Math.random() - 0.5) : 0 // Occasional artifacts

        data[i] = alpha + beta + theta + gamma + noise + artifacts
      }
    }

    return {
      data,
      sfreq,
      channel_name: channelName,
      duration,
    }
  }

  /**
   * Generate multiple sample datasets for testing
   */
  static generateTestDataset(): { healthy: EEGData[]; schizophrenia: EEGData[] } {
    const healthy: EEGData[] = []
    const schizophrenia: EEGData[] = []

    // Generate 5 healthy control samples
    for (let i = 0; i < 5; i++) {
      healthy.push(this.generateRealisticEEG("healthy", 10, 250, `HC${String(i + 1).padStart(3, "0")}`))
    }

    // Generate 5 schizophrenia samples
    for (let i = 0; i < 5; i++) {
      schizophrenia.push(this.generateRealisticEEG("schizophrenia", 10, 250, `SZ${String(i + 1).padStart(3, "0")}`))
    }

    return { healthy, schizophrenia }
  }
}
