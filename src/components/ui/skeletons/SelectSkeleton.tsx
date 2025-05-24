
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SelectSkeletonProps {
  className?: string;
}

const SelectSkeleton: React.FC<SelectSkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-4 p-2 ${className}`}>
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
};

export default SelectSkeleton;
