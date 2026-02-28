import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Bookera",
  description:
    "Sign in to your Bookera account to continue exploring books and marketplace items.",
};

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
