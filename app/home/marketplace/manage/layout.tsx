import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Listings | Bookera",
  description: "Manage your marketplace listings, sales status, and buyer details.",
};

export default function ManageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
