import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Bookera",
  description: "Update your account settings, privacy controls, and security preferences.",
};

export default function SettingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
