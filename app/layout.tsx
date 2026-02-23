import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PayTrack - Weekly Supplier Payments",
  description: "Mobile-first supplier payment planning app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
