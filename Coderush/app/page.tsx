"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Brain, Activity, BarChart3, Download, RefreshCw, AlertCircle } from "lucide-react"
import { EEGVisualizer } from "@/components/eeg-visualizer"
import { SpectrogramVisualizer } from "@/components/spectrogram-visualizer"
import { ModelInference } from "@/components/model-inference"
import { DataSelector } from "@/components/data-selector"
import { ErrorBoundary } from "@/components/error-boundary"
import { useEEGData } from "@/hooks/use-eeg-data"
import { useToast } from "@/hooks/use-toast"
import type { ModelPrediction, EEGData } from "@/types/eeg"

export default function NeuroInsightDashboard() {
  const { rawData, processedData, isLoading, error, loadSampleData, generateSyntheticData, clearData } = useEEGData()
  const [activeTab, setActiveTab] = useState("signal")
  const [lastPrediction, setLastPrediction] = useState<ModelPrediction | null>(null)
  const { toast } = useToast()

  const handlePredictionComplete = (prediction: ModelPrediction) => {
    setLastPrediction(prediction)
    toast({
      title: "Analysis Complete",
      description: `Prediction: ${prediction.prediction} (${(prediction.confidence * 100).toFixed(1)}% confidence)`,
      variant: prediction.prediction === "Schizophrenia" ? "destructive" : "default",
    })
  }

  const handleDataLoaded = (data: EEGData, label?: string) => {
    toast({
      title: "Data Loaded Successfully",
      description: `${label || "EEG data"} loaded with ${data.data.length} samples at ${data.sfreq} Hz`,
    })
  }

  const handleLoadSampleData = async () => {
    try {
      await loadSampleData()
      handleDataLoaded(processedData || rawData!, "Sample EEG data")
    } catch (err) {
      toast({
        title: "Error Loading Data",
        description: "Failed to load sample data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateSynthetic = async () => {
    try {
      await generateSyntheticData()
      handleDataLoaded(processedData || rawData!, "Synthetic EEG data")
    } catch (err) {
      toast({
        title: "Error Generating Data",
        description: "Failed to generate synthetic data. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground shadow-lg">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">NeuroInsight</h1>
                  <p className="text-muted-foreground">EEG-Based Schizophrenia Detection Platform</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:flex">
                  Research Tool
                </Badge>
                {lastPrediction && (
                  <Badge variant={lastPrediction.prediction === "Schizophrenia" ? "destructive" : "default"}>
                    Last: {lastPrediction.prediction}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Control Panel */}
            <div className="xl:col-span-1 space-y-4">
              <ErrorBoundary>
                <DataSelector onDataLoaded={handleDataLoaded} isLoading={isLoading} />
              </ErrorBoundary>

              {/* Legacy Controls - keeping for backward compatibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Basic data operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleLoadSampleData}
                    disabled={isLoading}
                    className="w-full bg-transparent"
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isLoading ? "Loading..." : "Load Sample Data"}
                  </Button>
                  <Button
                    onClick={handleGenerateSynthetic}
                    disabled={isLoading}
                    className="w-full bg-transparent"
                    variant="outline"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    {isLoading ? "Generating..." : "Generate Synthetic"}
                  </Button>
                  <Button onClick={clearData} disabled={!rawData || isLoading} className="w-full" variant="ghost">
                    Clear Data
                  </Button>
                </CardContent>
              </Card>

              {/* Data Info */}
              {rawData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Data Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Channel:</span>
                      <span className="font-medium">{rawData.channel_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sampling Rate:</span>
                      <span className="font-medium">{rawData.sfreq} Hz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{(rawData.data.length / rawData.sfreq).toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Samples:</span>
                      <span className="font-medium">{rawData.data.length.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Error Display */}
              {error && (
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Error
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-destructive">{error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                    >
                      Reload Page
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Visualization Area */}
            <div className="xl:col-span-3 space-y-6">
              {/* Visualization Tabs */}
              <ErrorBoundary>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signal" className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="hidden sm:inline">Raw EEG Signal</span>
                      <span className="sm:hidden">Signal</span>
                    </TabsTrigger>
                    <TabsTrigger value="spectrogram" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Spectrogram</span>
                      <span className="sm:hidden">Spectrum</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="signal" className="mt-6">
                    <ErrorBoundary>
                      <EEGVisualizer
                        data={processedData}
                        isLoading={isLoading}
                        title="Preprocessed EEG Signal"
                        height={500}
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="spectrogram" className="mt-6">
                    <ErrorBoundary>
                      <SpectrogramVisualizer
                        data={processedData}
                        isLoading={isLoading}
                        title="Time-Frequency Analysis"
                        height={500}
                      />
                    </ErrorBoundary>
                  </TabsContent>
                </Tabs>
              </ErrorBoundary>

              {/* Model Analysis */}
              <ErrorBoundary>
                <ModelInference eegData={processedData} onPredictionComplete={handlePredictionComplete} />
              </ErrorBoundary>
            </div>
          </div>

          {/* Footer Information */}
          <footer className="mt-12 pt-8 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-2">About NeuroInsight</h3>
                <p>
                  A research platform for EEG-based neurological analysis using deep learning. This tool demonstrates
                  the potential of AI in neuroscience research and clinical screening.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Technical Details</h3>
                <ul className="space-y-1">
                  <li>• Preprocessing: 1-50 Hz bandpass filter</li>
                  <li>• Feature extraction: Time-frequency analysis</li>
                  <li>• Model: Convolutional Neural Network</li>
                  <li>• Runtime: ONNX.js in browser</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Disclaimer</h3>
                <p>
                  This is a research demonstration tool. Results should not be used for clinical diagnosis without
                  professional medical evaluation and validation.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  )
}
