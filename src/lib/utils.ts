import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency
 * @param amount - The amount to format (in cents or dollars based on divideByCents param)
 * @param divideByCents - Whether to divide by 100 (default: true)
 * @returns Formatted currency string (e.g., "$12.99")
 */
export function formatPrice(amount: number, divideByCents: boolean = true): string {
  const value = divideByCents ? amount / 100 : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/**
 * Format a date to a readable string
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string (e.g., "January 15, 2024")
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", options).format(dateObj);
}

/**
 * Format a date to a short string
 * @param date - Date to format
 * @returns Short date string (e.g., "Jan 15, 2024")
 */
export function formatDateShort(date: Date | string): string {
  return formatDate(date, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date to relative time
 * @param date - Date to format
 * @returns Relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit);
    if (interval >= 1) {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      return rtf.format(
        -interval,
        unit as Intl.RelativeTimeFormatUnit
      );
    }
  }

  return "just now";
}

/**
 * Generate a URL-friendly slug from a string
 * @param text - Text to slugify
 * @param options - Slugify options
 * @returns URL-friendly slug (e.g., "venison-stew-recipe")
 */
export function generateSlug(
  text: string,
  options?: {
    lower?: boolean;
    strict?: boolean;
    trim?: boolean;
  }
): string {
  return slugify(text, {
    lower: options?.lower ?? true,
    strict: options?.strict ?? true,
    trim: options?.trim ?? true,
    remove: /[*+~.()'"!:@]/g,
  });
}

/**
 * Truncate text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 150)
 * @param suffix - Suffix to append (default: "...")
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number = 150,
  suffix: string = "..."
): string {
  if (text.length <= maxLength) return text;

  // Find the last space within the maxLength
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  // If there's a space, truncate at that space; otherwise, truncate at maxLength
  const finalText = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;

  return finalText + suffix;
}

/**
 * Calculate reading time for text content
 * @param text - Text to calculate reading time for
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(
  text: string,
  wordsPerMinute: number = 200
): number {
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Format reading time to a human-readable string
 * @param minutes - Reading time in minutes
 * @returns Formatted reading time (e.g., "5 min read")
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

/**
 * Format time duration from minutes to hours and minutes
 * @param minutes - Total minutes
 * @returns Formatted time string (e.g., "1 hr 30 min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }

  return `${hours} hr${hours > 1 ? "s" : ""} ${remainingMinutes} min`;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate US phone number format
 * @param phone - Phone number to validate
 * @returns True if valid US phone format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

/**
 * Format phone number to standard format
 * @param phone - Phone number to format
 * @returns Formatted phone number (e.g., "(555) 123-4567")
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Generate initials from a name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Initials (e.g., "JD")
 */
export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0).toUpperCase() || "";
  const last = lastName?.charAt(0).toUpperCase() || "";
  return `${first}${last}`;
}

/**
 * Get full name from first and last name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Full name
 */
export function getFullName(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ");
}

/**
 * Safely parse JSON with fallback
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed JSON or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Debounce function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sleep/delay utility
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate percentage
 * @param value - Current value
 * @param total - Total value
 * @returns Percentage (0-100)
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Clamp a number between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a random string
 * @param length - Length of random string
 * @returns Random string
 */
export function randomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if code is running on the server
 * @returns True if server-side
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Check if code is running on the client
 * @returns True if client-side
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}
