import Navbar from "@/components/app/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | Bookera",
  description: "Manage your conversations with buyers and sellers on Bookera.",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full ">
      <Navbar />
      <div>{children}</div>
    </div>
  );
}
