import Navbar from "@/components/app/navbar";

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
