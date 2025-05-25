
import React from "react"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
  variant?: "text" | "card" | "table" | "button"
  lines?: number
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = "text",
  lines = 1
}) => {
  const variants = {
    text: "h-4 w-3/4 rounded",
    card: "h-32 w-full rounded-xl",
    table: "h-12 w-full rounded",
    button: "h-10 w-24 rounded-lg"
  }

  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]",
              variants.text,
              i === lines - 1 && "w-1/2", // Last line shorter
              className
            )}
            style={{
              animation: "shimmer 2s infinite linear"
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]",
        variants[variant],
        className
      )}
      style={{
        animation: "shimmer 2s infinite linear"
      }}
    />
  )
}

export { LoadingSkeleton }
