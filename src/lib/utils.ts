import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Common utility functions used across components
export const utils = {
  // Format validation
  formatClassName: (baseClass: string, additionalClasses?: string) => {
    return additionalClasses ? `${baseClass} ${additionalClasses}` : baseClass;
  },

  // Component helpers
  generateId: () => Math.random().toString(36).substr(2, 9),

  // Validation helpers
  isEmpty: (value: any) => {
    return value === undefined || value === null || value === '';
  },

  // Type guards
  isString: (value: any): value is string => {
    return typeof value === 'string';
  }
};

export default utils;