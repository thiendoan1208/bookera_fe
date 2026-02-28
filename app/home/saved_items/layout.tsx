import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Items | Bookera",
  description: "Manage your saved books and marketplace items in one place.",
};

export default function SavedItemsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
