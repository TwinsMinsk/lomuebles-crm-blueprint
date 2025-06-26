
import * as React from "react"
import { cn } from "@/lib/utils"
import { ModernCard } from "./modern-card"

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveRowProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

interface ResponsiveRowItemProps {
  label: string
  value: React.ReactNode
  className?: string
  fullWidth?: boolean
}

const ResponsiveTable = React.forwardRef<HTMLDivElement, ResponsiveTableProps>(
  ({ children, className }, ref) => (
    <div ref={ref} className={cn("w-full", className)}>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            {children}
          </table>
        </div>
      </div>
      
      {/* Mobile Cards - will be rendered by individual ResponsiveRow components */}
      <div className="lg:hidden space-y-3">
        {/* Mobile cards are rendered individually by ResponsiveRow components */}
      </div>
    </div>
  )
)
ResponsiveTable.displayName = "ResponsiveTable"

const ResponsiveRow = React.forwardRef<HTMLTableRowElement, ResponsiveRowProps>(
  ({ children, onClick, className }, ref) => (
    <>
      {/* Desktop Row */}
      <tr 
        ref={ref}
        className={cn(
          "hidden lg:table-row border-b transition-colors hover:bg-muted/50",
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        {children}
      </tr>
      
      {/* Mobile Card */}
      <ModernCard 
        className={cn(
          "lg:hidden p-4 space-y-3 transition-all duration-200 mb-3",
          onClick && "cursor-pointer hover:shadow-md"
        )}
        onClick={onClick}
        hover={!!onClick}
      >
        <div className="space-y-3">
          {children}
        </div>
      </ModernCard>
    </>
  )
)
ResponsiveRow.displayName = "ResponsiveRow"

const ResponsiveRowItem = React.forwardRef<HTMLTableCellElement, ResponsiveRowItemProps>(
  ({ label, value, className, fullWidth = false }, ref) => (
    <>
      {/* Desktop Cell */}
      <td ref={ref} className={cn("hidden lg:table-cell p-4 align-middle", className)}>
        {value}
      </td>
      
      {/* Mobile Item */}
      <div 
        className={cn(
          "lg:hidden flex justify-between items-start gap-3",
          fullWidth && "flex-col space-y-1"
        )}
      >
        <span className="text-sm font-medium text-gray-600 min-w-[120px]">{label}:</span>
        <div className={cn("flex-1", fullWidth ? "w-full" : "text-right")}>{value}</div>
      </div>
    </>
  )
)
ResponsiveRowItem.displayName = "ResponsiveRowItem"

export { ResponsiveTable, ResponsiveRow, ResponsiveRowItem }
