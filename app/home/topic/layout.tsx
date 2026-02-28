import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Topics | Bookera",
  description: "Explore books by categories and topics on Bookera.",
};

export default function TopicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
