import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FormatNumberOptions = Intl.NumberFormatOptions;

const withApostropheGrouping = (parts: Intl.NumberFormatPart[]) =>
  parts.map((part) => (part.type === "group" ? "'" : part.value)).join("");

export function formatNumber(value: number, options?: FormatNumberOptions) {
  return withApostropheGrouping(new Intl.NumberFormat("en-US", options).formatToParts(value));
}

export function formatCurrency(value: number, currency: string, options?: Omit<FormatNumberOptions, "style" | "currency">) {
  return withApostropheGrouping(
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      ...options,
    }).formatToParts(value),
  );
}
