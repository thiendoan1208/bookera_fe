import Navbar from "@/components/app/navbar";
import Sidebar from "@/components/app/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Bookera",
  description: "Browse trending books and curated collections on Bookera home.",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full ">
      <Navbar />
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
