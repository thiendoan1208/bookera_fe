import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Bookera",
  description: "Create your Bookera account and join the community of book lovers.",
};

export default function SignupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
