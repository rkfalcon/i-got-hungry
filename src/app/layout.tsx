import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "I Got Hungry",
  description: "Find nearby restaurants recommended in public Instagram posts and Reels.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
