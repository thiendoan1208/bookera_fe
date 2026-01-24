"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScreenWidth(): number {
  if (typeof window === "undefined") {
    return 0;
  }
  return window.innerWidth;
}
