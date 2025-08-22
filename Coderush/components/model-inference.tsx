"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Brain, CheckCircle, Loader2 } from "lucide-react"
import type { EEGData, ModelPrediction } from "@/types/eeg"
import { getModelInstance } from "@/lib/onnx-inference"

interface ModelInferenceProps {
  eegData: EEGData | null
  onPredictionComplete?: (prediction: ModelPrediction) => void
}

export function ModelInference({ eegData, onPredictionComplete }: ModelInferenceProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [prediction, setPrediction] = useState<ModelPrediction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const runAnalysis = async () => {
    if (!eegData) {
      setError("No EEG data available for analysis")
      return
    }

    setIsRunning(true)
    setError(null)
    setPrediction(null)
    setProgress(0)

    try {
      const modelInstance = getModelInstance()

      // Simulate preprocessing steps with progress updates
      setProgress(20)
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProgress(40)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Feature extraction
      setProgress(60)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Model inference
      setProgress(80)
      const result = await modelInstance.predict(eegData)

      setProgress(100)
      setPrediction(result)
      onPredictionComplete?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsRunning(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const getPredictionColor = (pred: string) => {
    return pred === "Schizophrenia" ? "destructive" : "default"
  }

  const getPredictionIcon = (pred: string) => {
    return pred === "Schizophrenia" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Model Analysis
        </CardTitle>
        <CardDescription>
          Deep learning model for EEG-based schizophrenia detection using preprocessed neural signals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analysis Button */}
        <div className="flex flex-col gap-2">
          <Button onClick={runAnalysis} disabled={!eegData || isRunning} className="w-full" size="lg">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Analysis...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>

          {isRunning && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-muted-foreground text-center">
                {progress < 30 && "Preprocessing signal..."}
                {progress >= 30 && progress < 60 && "Extracting features..."}
                {progress >= 60 && progress < 90 && "Running neural network..."}
                {progress >= 90 && "Generating prediction..."}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Analysis Error</span>
            </div>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        )}

        {/* Prediction Results */}
        {prediction && (
          <div className="space-y-4">
            <div className="p-6 border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Prediction Result</h3>
                <Badge variant={getPredictionColor(prediction.prediction)} className="flex items-center gap-1">
                  {getPredictionIcon(prediction.prediction)}
                  {prediction.prediction}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Confidence Score</div>
                  <div className="text-2xl font-bold">{(prediction.confidence * 100).toFixed(1)}%</div>
                  <Progress value={prediction.confidence * 100} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Model Version</div>
                  <div className="text-sm font-medium">{prediction.modelVersion}</div>
                  <div className="text-xs text-muted-foreground">
                    {prediction.modelVersion.includes("Mock")
                      ? "Demo mode - using synthetic predictions"
                      : "Production model"}
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Interpretation */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Clinical Interpretation</h4>
              <p className="text-sm text-muted-foreground">
                {prediction.prediction === "Schizophrenia"
                  ? "The EEG signal shows patterns potentially associated with schizophrenia. This analysis should be used as a screening tool only and requires clinical validation."
                  : "The EEG signal appears consistent with healthy control patterns. Continue monitoring as part of comprehensive neurological assessment."}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Disclaimer:</strong> This is a research tool and should not be used for clinical diagnosis
                without professional medical evaluation.
              </p>
            </div>
          </div>
        )}

        {/* Model Status */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          Model Status: {getModelInstance().getModelInfo().isLoaded ? "Loaded" : "Using mock predictions"}
        </div>
      </CardContent>
    </Card>
  )
}
