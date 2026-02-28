import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Bookera",
  description: "Complete your Bookera marketplace checkout securely.",
};

export default function CheckoutLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
