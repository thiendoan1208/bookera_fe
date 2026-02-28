import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subject Books | Bookera",
  description: "Discover books from this subject on Bookera.",
};

export default function SubjectLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
