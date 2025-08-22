// Signal processing utilities for EEG data preprocessing
export class EEGPreprocessor {
  /**
   * Apply a simple bandpass filter to EEG data
   * This is a simplified implementation for demonstration
   */
  static bandpassFilter(data: number[], sfreq: number, lowCutoff = 1, highCutoff = 50): number[] {
    // Simple moving average filter as a placeholder
    // In a real implementation, you'd use proper DSP algorithms
    const windowSize = Math.floor(sfreq / 10) // 100ms window
    const filtered: number[] = []

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2))
      const end = Math.min(data.length, i + Math.floor(windowSize / 2))

      let sum = 0
      for (let j = start; j < end; j++) {
        sum += data[j]
      }
      filtered[i] = sum / (end - start)
    }

    return filtered
  }

  /**
   * Remove DC offset from signal
   */
  static removeDCOffset(data: number[]): number[] {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length
    return data.map((val) => val - mean)
  }

  /**
   * Normalize signal amplitude
   */
  static normalize(data: number[]): number[] {
    const max = Math.max(...data.map(Math.abs))
    return data.map((val) => val / max)
  }

  /**
   * Complete preprocessing pipeline
   */
  static preprocess(data: number[], sfreq: number, config: { lowCutoff?: number; highCutoff?: number } = {}): number[] {
    let processed = [...data]

    // Remove DC offset
    processed = this.removeDCOffset(processed)

    // Apply bandpass filter
    processed = this.bandpassFilter(processed, sfreq, config.lowCutoff || 1, config.highCutoff || 50)

    // Normalize
    processed = this.normalize(processed)

    return processed
  }
}
