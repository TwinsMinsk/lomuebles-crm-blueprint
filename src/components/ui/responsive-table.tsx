
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
    <div ref={ref} className={cn("space-y-4", className)}>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            {children}
          </table>
        </div>
      </div>
      
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {children}
      </div>
    </div>
  )
)
ResponsiveTable.displayName = "ResponsiveTable"

const ResponsiveRow = React.forwardRef<HTMLDivElement, ResponsiveRowProps>(
  ({ children, onClick, className }, ref) => (
    <>
      {/* Desktop Row */}
      <tr 
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
        ref={ref}
        className={cn(
          "lg:hidden p-4 space-y-3 transition-all duration-200",
          onClick && "cursor-pointer hover:shadow-md"
        )}
        onClick={onClick}
        hover={!!onClick}
      >
        {children}
      </ModernCard>
    </>
  )
)
ResponsiveRow.displayName = "ResponsiveRow"

const ResponsiveRowItem = React.forwardRef<HTMLDivElement, ResponsiveRowItemProps>(
  ({ label, value, className, fullWidth = false }, ref) => (
    <>
      {/* Desktop Cell */}
      <td className={cn("hidden lg:table-cell p-4 align-middle", className)}>
        {value}
      </td>
      
      {/* Mobile Item */}
      <div 
        ref={ref}
        className={cn(
          "lg:hidden flex justify-between items-center",
          fullWidth && "flex-col items-start space-y-1",
          className
        )}
      >
        <span className="text-sm font-medium text-gray-600">{label}:</span>
        <div className="flex-1 text-right lg:text-left">{value}</div>
      </div>
    </>
  )
)
ResponsiveRowItem.displayName = "ResponsiveRowItem"

export { ResponsiveTable, ResponsiveRow, ResponsiveRowItem }
