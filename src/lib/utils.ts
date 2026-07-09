import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortName(fullName: string): string {
  return fullName.trim().split(/\s+/).slice(0, 2).join(" ")
}
