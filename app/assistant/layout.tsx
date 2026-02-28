import Navbar from "@/components/app/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assistant | Bookera",
  description:
    "Chat with Kera, your AI book assistant, for recommendations and reading guidance.",
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
