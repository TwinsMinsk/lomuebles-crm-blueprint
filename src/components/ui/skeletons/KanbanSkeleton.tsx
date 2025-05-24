
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface KanbanSkeletonProps {
  columns?: number;
  cardsPerColumn?: number;
}

const KanbanSkeleton: React.FC<KanbanSkeletonProps> = ({ 
  columns = 5, 
  cardsPerColumn = 3 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-x-auto pb-6">
      {Array.from({ length: columns }).map((_, columnIndex) => (
        <div key={columnIndex} className="flex flex-col">
          {/* Column header skeleton */}
          <div className="bg-muted p-2 rounded-t-md">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          
          {/* Column content skeleton */}
          <div className="flex-1 p-2 min-h-[150px] rounded-b-md bg-muted/50 space-y-2">
            {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
              <div key={cardIndex} className="bg-white p-3 rounded-md shadow-sm border">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-3/4 mb-2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanSkeleton;
