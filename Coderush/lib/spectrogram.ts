// Spectrogram generation utilities
import type { SpectrogramData } from "@/types/eeg"

export class SpectrogramGenerator {
  /**
   * Generate spectrogram data using Short-Time Fourier Transform
   * This is a simplified implementation for demonstration
   */
  static generateSpectrogram(data: number[], sfreq: number, windowSize = 256, overlap = 0.5): SpectrogramData {
    const hopSize = Math.floor(windowSize * (1 - overlap))
    const numWindows = Math.floor((data.length - windowSize) / hopSize) + 1
    const freqBins = Math.floor(windowSize / 2) + 1

    // Generate frequency array
    const frequencies = Array.from({ length: freqBins }, (_, i) => (i * sfreq) / windowSize)

    // Generate time array
    const times = Array.from({ length: numWindows }, (_, i) => (i * hopSize) / sfreq)

    // Initialize power matrix
    const power: number[][] = Array(freqBins)
      .fill(null)
      .map(() => Array(numWindows).fill(0))

    // Simplified STFT computation
    for (let windowIdx = 0; windowIdx < numWindows; windowIdx++) {
      const start = windowIdx * hopSize
      const windowData = data.slice(start, start + windowSize)

      // Apply Hanning window
      const windowed = windowData.map((val, i) => val * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (windowSize - 1))))

      // Compute FFT (simplified - using basic DFT for demonstration)
      for (let freqIdx = 0; freqIdx < freqBins; freqIdx++) {
        let real = 0
        let imag = 0

        for (let n = 0; n < windowed.length; n++) {
          const angle = (-2 * Math.PI * freqIdx * n) / windowSize
          real += windowed[n] * Math.cos(angle)
          imag += windowed[n] * Math.sin(angle)
        }

        // Power spectral density
        power[freqIdx][windowIdx] = Math.log10(real * real + imag * imag + 1e-10)
      }
    }

    return { frequencies, times, power }
  }
}
