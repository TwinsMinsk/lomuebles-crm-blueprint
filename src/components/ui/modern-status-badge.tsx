
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock, AlertTriangle, XCircle, Users, Package } from "lucide-react"

const modernStatusVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 hover:scale-105 animate-fade-in",
  {
    variants: {
      variant: {
        success: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200",
        warning: "bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200",
        danger: "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200",
        info: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200",
        secondary: "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200",
        accent: "bg-gradient-to-r from-accent-green/10 to-accent-green/20 text-accent-green border border-accent-green/30"
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm"
      }
    },
    defaultVariants: {
      variant: "secondary",
      size: "md"
    }
  }
)

interface ModernStatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof modernStatusVariants> {
  status?: string
  icon?: boolean
}

const statusConfig = {
  "Новая": { variant: "info" as const, icon: Clock },
  "В работе": { variant: "accent" as const, icon: Package },
  "Выполнена": { variant: "success" as const, icon: CheckCircle },
  "Просрочена": { variant: "danger" as const, icon: AlertTriangle },
  "Отменена": { variant: "secondary" as const, icon: XCircle },
  "Новый": { variant: "info" as const, icon: Clock },
  "Квалифицированный": { variant: "accent" as const, icon: Users },
  "Неквалифицированный": { variant: "warning" as const, icon: AlertTriangle }
}

const ModernStatusBadge = React.forwardRef<HTMLSpanElement, ModernStatusBadgeProps>(
  ({ className, variant, size, status, icon = true, children, ...props }, ref) => {
    const config = status ? statusConfig[status as keyof typeof statusConfig] : null
    const finalVariant = config?.variant || variant
    const IconComponent = config?.icon

    return (
      <span
        className={cn(modernStatusVariants({ variant: finalVariant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon && IconComponent && <IconComponent className="h-3 w-3" />}
        {children || status}
      </span>
    )
  }
)
ModernStatusBadge.displayName = "ModernStatusBadge"

export { ModernStatusBadge, modernStatusVariants }
