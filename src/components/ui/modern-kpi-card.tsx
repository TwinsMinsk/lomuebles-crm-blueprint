
import * as React from "react"
import { cn } from "@/lib/utils"
import { ModernCard } from "./modern-card"
import { LucideIcon, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

interface ModernKPICardProps {
  title: string
  value: string | number
  description?: string
  detailsLink?: string
  detailsLinkText?: string
  icon?: LucideIcon
  iconColor?: string
  className?: string
  loading?: boolean
  gradient?: string
  isDarkBackground?: boolean
}

const ModernKPICard: React.FC<ModernKPICardProps> = ({
  title,
  value,
  description,
  detailsLink,
  detailsLinkText = "Подробнее",
  icon: Icon,
  iconColor = "text-white",
  className,
  loading = false,
  gradient = "bg-gradient-to-br from-white to-gray-50",
  isDarkBackground = false
}) => {
  if (loading) {
    return (
      <ModernCard className={cn("p-6", className)} variant="glass">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
      </ModernCard>
    )
  }

  const textColorClass = isDarkBackground ? "text-white" : "text-gray-600"
  const titleColorClass = isDarkBackground ? "text-white/90" : "text-gray-600"
  const valueColorClass = isDarkBackground ? "text-white" : "text-gray-900"
  const descriptionColorClass = isDarkBackground ? "text-white/80" : "text-gray-500"
  const linkColorClass = isDarkBackground ? "text-white hover:text-white/80" : "text-blue-600 hover:text-blue-800"
  const iconBgClass = isDarkBackground ? "bg-white/20" : "bg-white/80"

  return (
    <ModernCard className={cn("relative overflow-hidden hover:shadow-lg transition-all duration-300", gradient, className)} variant="glass">
      <div className="relative p-6 space-y-4">
        {/* Header with title and icon */}
        <div className="flex items-center justify-between">
          <p className={cn("text-sm font-medium", titleColorClass)}>{title}</p>
          {Icon && (
            <div className={cn("h-12 w-12 rounded-xl shadow-sm flex items-center justify-center", iconBgClass)}>
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
          )}
        </div>
        
        {/* Value */}
        <div className="space-y-2">
          <p className={cn("text-3xl font-bold", valueColorClass)}>{value}</p>
          {description && (
            <p className={cn("text-sm leading-relaxed", descriptionColorClass)}>{description}</p>
          )}
        </div>
        
        {/* Details link */}
        {detailsLink && (
          <div className="pt-2">
            <Link 
              to={detailsLink}
              className={cn("inline-flex items-center gap-2 text-sm font-medium transition-colors group", linkColorClass)}
            >
              {detailsLinkText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </ModernCard>
  )
}

export { ModernKPICard }
