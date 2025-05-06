
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CompaniesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CompaniesPagination: React.FC<CompaniesPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Generate array of page numbers to display
  const getPageRange = () => {
    const range: number[] = [];
    const maxDisplayPages = 5;
    
    if (totalPages <= maxDisplayPages) {
      // If total pages is less than max display, show all pages
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Always include first page, last page, current page, and 1 page on each side of current
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, 4);
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - 3);
      }
      
      range.push(1); // Always include first page
      
      if (start > 2) {
        range.push(-1); // Use -1 as a marker for ellipsis
      }
      
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      
      if (end < totalPages - 1) {
        range.push(-2); // Use -2 as a marker for ellipsis
      }
      
      range.push(totalPages); // Always include last page
    }
    
    return range;
  };

  const pageRange = getPageRange();

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {pageRange.map((page, index) => {
          if (page < 0) {
            // Render ellipsis
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <span className="px-4 py-2">...</span>
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CompaniesPagination;
