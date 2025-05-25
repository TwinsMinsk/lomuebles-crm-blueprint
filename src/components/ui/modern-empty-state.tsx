
import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Button } from "./button"

interface ModernEmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const ModernEmptyState: React.FC<ModernEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn("text-center py-12", className)}>
      {Icon && (
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
          <Icon className="h-10 w-10 text-gray-400" />
        </div>
      )}
      
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-gray-500 max-w-sm mx-auto">{description}</p>
        )}
        
        {action && (
          <div className="pt-4">
            <Button onClick={action.onClick} className="animate-fade-in">
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export { ModernEmptyState }
