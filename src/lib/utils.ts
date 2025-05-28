
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDateInMadrid } from "@/utils/timezone"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  
  try {
    return formatDateInMadrid(dateString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
}
