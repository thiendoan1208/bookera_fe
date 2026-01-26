"use client";

import { categories } from "@/data/categories";
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

export function getRandomSubject(): string {
  const subjects = [];

  for (let i = 0; i < categories.length; i++) {
    subjects.push(categories[i].subjects);
  }

  const randomIndex = Math.floor(Math.random() * subjects.flat().length);
  return subjects.flat()[randomIndex].slug;
}

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};
