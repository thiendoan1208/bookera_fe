import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace | Bookera",
  description: "Buy and sell books in the Bookera marketplace.",
};

export default function MarketplaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
