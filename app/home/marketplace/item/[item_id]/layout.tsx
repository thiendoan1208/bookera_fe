import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Item Details | Bookera Marketplace",
  description: "See marketplace item details, seller information, and purchase options.",
};

export default function MarketplaceItemLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
