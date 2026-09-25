import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "pqp, era pra hoje?",
  description: "o caderninho de demandas que não esquece.",
  appleWebApp: { capable: true, title: "pqp", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#181210",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
