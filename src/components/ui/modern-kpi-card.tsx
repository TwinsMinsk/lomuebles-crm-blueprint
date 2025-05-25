
import * as React from "react"
import { cn } from "@/lib/utils"
import { ModernCard } from "./modern-card"
import { LucideIcon } from "lucide-react"

interface ModernKPICardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: LucideIcon
  className?: string
  loading?: boolean
}

const ModernKPICard: React.FC<ModernKPICardProps> = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className,
  loading = false
}) => {
  const changeColors = {
    positive: "text-green-600 bg-green-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50"
  }

  if (loading) {
    return (
      <ModernCard className={cn("p-6", className)} variant="glass">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
      </ModernCard>
    )
  }

  return (
    <ModernCard className={cn("p-6 relative overflow-hidden", className)} variant="glass">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
      
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {Icon && (
            <div className="h-8 w-8 rounded-lg bg-accent-green/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-accent-green" />
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
              changeColors[changeType]
            )}>
              {change}
            </div>
          )}
        </div>
      </div>
    </ModernCard>
  )
}

export { ModernKPICard }
