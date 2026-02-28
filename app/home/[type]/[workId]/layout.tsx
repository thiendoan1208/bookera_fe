import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Details | Bookera",
  description: "Read full details, authors, and related recommendations for this book.",
};

export default function BookDetailLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
