
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Plus } from "lucide-react"

interface FloatingActionButtonProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
  className?: string
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <Plus className="h-6 w-6" />,
  label = "Добавить",
  className
}) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50",
        "bg-gradient-to-r from-accent-green to-green-600 hover:from-accent-green/90 hover:to-green-600/90",
        "lg:hidden", // Only show on mobile
        className
      )}
      size="icon"
      title={label}
    >
      {icon}
    </Button>
  )
}

export { FloatingActionButton }
