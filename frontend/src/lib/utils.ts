import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// merge tailwind class names safely
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
