"use client"

import { useMemo } from "react"

interface HeatmapGridProps {
  data: number[][]
  width: number
  height: number
  colorScale?: (value: number, min: number, max: number) => string
}

export function HeatmapGrid({ data, width, height, colorScale }: HeatmapGridProps) {
  const { normalizedData, minValue, maxValue } = useMemo(() => {
    const flatData = data.flat()
    const min = Math.min(...flatData)
    const max = Math.max(...flatData)

    return {
      normalizedData: data,
      minValue: min,
      maxValue: max,
    }
  }, [data])

  const defaultColorScale = (value: number, min: number, max: number): string => {
    const normalized = (value - min) / (max - min)
    const intensity = Math.floor(normalized * 255)
    return `rgb(${intensity}, ${intensity}, ${255 - intensity})`
  }

  const getColor = colorScale || defaultColorScale

  if (!data.length || !data[0].length) {
    return <div>No data to display</div>
  }

  const cellWidth = width / data[0].length
  const cellHeight = height / data.length

  return (
    <svg width={width} height={height} className="border border-border rounded">
      {data.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <rect
            key={`${rowIndex}-${colIndex}`}
            x={colIndex * cellWidth}
            y={rowIndex * cellHeight}
            width={cellWidth}
            height={cellHeight}
            fill={getColor(value, minValue, maxValue)}
            stroke="none"
          />
        )),
      )}
    </svg>
  )
}
