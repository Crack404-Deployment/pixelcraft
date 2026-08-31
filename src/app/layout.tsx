import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pixel Craft",
  description: "Free local image resizer and AI background remover. Prepare your app assets for Google Play Console with our Playstore Asset Workflow. Easily format App Icons (512x512), Feature Graphics (1024x500), and tablet screenshots.",
  keywords: [
    "image resizer",
    "background remover",
    "playstore asset workflow",
    "playstore app icon 512x512",
    "google play console feature graphic",
    "app screenshot formatting",
    "1024x500 banner resize",
    "local AI vision models"
  ],
  authors: [{ name: "Crack404", url: "https://pixelcraft.crack404.com" }],
  openGraph: {
    type: "website",
    title: "Pixel Craft - Playstore Asset Guide & Image Tools",
    description: "Format your Google Play Console assets perfectly. Resize icons to 512x512, feature graphics to 1024x500, and remove backgrounds automatically[cite: 4].",
    siteName: "Pixel Craft",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}