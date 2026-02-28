import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Results | Bookera",
  description: "View search results for books, authors, and related works on Bookera.",
};

export default function SearchResultLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
