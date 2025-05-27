
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
}

const ModernKPICard: React.FC<ModernKPICardProps> = ({
  title,
  value,
  description,
  detailsLink,
  detailsLinkText = "Подробнее",
  icon: Icon,
  iconColor = "text-accent-green",
  className,
  loading = false,
  gradient = "bg-gradient-to-br from-white to-gray-50"
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

  return (
    <ModernCard className={cn("relative overflow-hidden hover:shadow-lg transition-all duration-300", gradient, className)} variant="glass">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
      
      <div className="relative p-6 space-y-4">
        {/* Header with title and icon */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {Icon && (
            <div className="h-12 w-12 rounded-xl bg-white/80 shadow-sm flex items-center justify-center">
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
          )}
        </div>
        
        {/* Value */}
        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
          )}
        </div>
        
        {/* Details link */}
        {detailsLink && (
          <div className="pt-2">
            <Link 
              to={detailsLink}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors group"
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
