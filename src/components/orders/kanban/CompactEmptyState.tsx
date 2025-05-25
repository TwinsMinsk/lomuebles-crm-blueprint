
import React from "react";
import { LucideIcon } from "lucide-react";

interface CompactEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

const CompactEmptyState: React.FC<CompactEmptyStateProps> = ({
  icon: Icon,
  title,
  description
}) => {
  return (
    <div className="text-center py-4">
      <div className="mx-auto w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

export default CompactEmptyState;
