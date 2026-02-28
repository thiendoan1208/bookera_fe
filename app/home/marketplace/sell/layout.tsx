import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Item | Bookera",
  description: "Create a new marketplace listing and sell your books on Bookera.",
};

export default function SellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
