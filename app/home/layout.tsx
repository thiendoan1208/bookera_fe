export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-screen min-h-screen bg-(--bg-primary)">{children}</div>
  );
}
    