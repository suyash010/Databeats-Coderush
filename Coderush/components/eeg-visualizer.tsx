"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EEGData } from "@/types/eeg"

interface EEGVisualizerProps {
  data: EEGData | null
  isLoading?: boolean
  title?: string
  height?: number
}

export function EEGVisualizer({ data, isLoading = false, title = "EEG Signal", height = 400 }: EEGVisualizerProps) {
  // Transform EEG data for Recharts
  const chartData = useMemo(() => {
    if (!data) return []

    return data.data.map((amplitude, index) => ({
      time: (index / data.sfreq).toFixed(3), // Convert sample index to time in seconds
      amplitude: amplitude,
      timeNumeric: index / data.sfreq, // Keep numeric version for proper sorting
    }))
  }, [data])

  // Calculate signal statistics
  const stats = useMemo(() => {
    if (!data) return null

    const amplitudes = data.data
    const mean = amplitudes.reduce((sum, val) => sum + val, 0) / amplitudes.length
    const std = Math.sqrt(amplitudes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amplitudes.length)
    const min = Math.min(...amplitudes)
    const max = Math.max(...amplitudes)

    return { mean, std, min, max }
  }, [data])

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Loading EEG signal data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No EEG data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
            Load sample data to view EEG signal
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            Channel: {data.channel_name} | {data.sfreq} Hz
          </span>
        </CardTitle>
        <CardDescription>
          Duration: {(data.data.length / data.sfreq).toFixed(2)}s | Samples: {data.data.length.toLocaleString()}
          {stats && (
            <span className="ml-4">
              Range: {stats.min.toFixed(3)} to {stats.max.toFixed(3)} μV
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="time"
                type="number"
                scale="linear"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value) => `${Number.parseFloat(value).toFixed(1)}s`}
                label={{ value: "Time (seconds)", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                domain={["dataMin - 0.1", "dataMax + 0.1"]}
                tickFormatter={(value) => `${value.toFixed(2)}`}
                label={{ value: "Amplitude (μV)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(4)} μV`, "Amplitude"]}
                labelFormatter={(label) => `Time: ${Number.parseFloat(label).toFixed(3)}s`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line
                type="monotone"
                dataKey="amplitude"
                stroke="hsl(var(--chart-1))"
                strokeWidth={1}
                dot={false}
                activeDot={{ r: 3, stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {stats && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">Mean</div>
              <div className="text-muted-foreground">{stats.mean.toFixed(4)} μV</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Std Dev</div>
              <div className="text-muted-foreground">{stats.std.toFixed(4)} μV</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Min</div>
              <div className="text-muted-foreground">{stats.min.toFixed(4)} μV</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Max</div>
              <div className="text-muted-foreground">{stats.max.toFixed(4)} μV</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
