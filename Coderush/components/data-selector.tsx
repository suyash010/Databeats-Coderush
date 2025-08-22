"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Database, FileText, Users, Activity } from "lucide-react"
import type { EEGData } from "@/types/eeg"
import { SampleDataGenerator } from "@/lib/sample-data"

interface DataSelectorProps {
  onDataLoaded: (data: EEGData, label?: string) => void
  isLoading?: boolean
}

export function DataSelector({ onDataLoaded, isLoading = false }: DataSelectorProps) {
  const [selectedType, setSelectedType] = useState<"healthy" | "schizophrenia" | "synthetic">("healthy")

  const loadSampleData = async (type: "healthy" | "schizophrenia" | "synthetic") => {
    try {
      let data: EEGData
      let label: string

      if (type === "synthetic") {
        data = SampleDataGenerator.generateSampleEEG(10, 250, "Fz")
        label = "Synthetic EEG"
      } else if (type === "healthy") {
        data = await SampleDataGenerator.loadSampleData("healthy")
        label = "Healthy Control"
      } else {
        data = await SampleDataGenerator.loadSampleData("schizophrenia")
        label = "Schizophrenia Sample"
      }

      onDataLoaded(data, label)
    } catch (error) {
      console.error("Failed to load sample data:", error)
    }
  }

  const generateRealisticData = (condition: "healthy" | "schizophrenia") => {
    const data = SampleDataGenerator.generateRealisticEEG(condition, 10, 250, "Fz")
    const label = condition === "healthy" ? "Generated Healthy" : "Generated Schizophrenia"
    onDataLoaded(data, label)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Sample Data
        </CardTitle>
        <CardDescription>Load different types of EEG data for analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Data Type</label>
          <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="healthy">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Healthy Control
                </div>
              </SelectItem>
              <SelectItem value="schizophrenia">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Schizophrenia Sample
                </div>
              </SelectItem>
              <SelectItem value="synthetic">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Synthetic Data
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Load Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={() => loadSampleData(selectedType)}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            Load{" "}
            {selectedType === "healthy" ? "Healthy" : selectedType === "schizophrenia" ? "Schizophrenia" : "Synthetic"}{" "}
            Data
          </Button>

          <Button
            onClick={() => generateRealisticData(selectedType === "synthetic" ? "healthy" : selectedType)}
            disabled={isLoading || selectedType === "synthetic"}
            className="w-full"
            variant="ghost"
            size="sm"
          >
            Generate Realistic {selectedType === "healthy" ? "Healthy" : "Schizophrenia"} Pattern
          </Button>
        </div>

        {/* Data Characteristics */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Expected Characteristics</div>
          <div className="flex flex-wrap gap-1">
            {selectedType === "healthy" && (
              <>
                <Badge variant="outline" className="text-xs">
                  Strong Alpha (8-12Hz)
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Low Noise
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Regular Patterns
                </Badge>
              </>
            )}
            {selectedType === "schizophrenia" && (
              <>
                <Badge variant="outline" className="text-xs">
                  Reduced Alpha
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Increased Theta
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Higher Noise
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Irregular Patterns
                </Badge>
              </>
            )}
            {selectedType === "synthetic" && (
              <>
                <Badge variant="outline" className="text-xs">
                  Mixed Frequencies
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Controlled Noise
                </Badge>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
