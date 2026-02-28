import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order History | Bookera",
  description: "View your marketplace order history and purchase details.",
};

export default function OrderHistoryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
