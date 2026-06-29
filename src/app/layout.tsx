import type { Metadata } from "next";
import { Source_Serif_4, Public_Sans } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const sans = Public_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Office of Workers Compensation | Papua New Guinea",
    template: "%s | Office of Workers Compensation PNG",
  },
  description:
    "The official portal of the Office of Workers Compensation (OWC), Ministry of Labour and Employment, Papua New Guinea. Lodge and track claims, access forms, employer services, reports and public notices under the Workers Compensation Act 1978.",
  keywords: [
    "Office of Workers Compensation",
    "OWC PNG",
    "Workers Compensation Act 1978",
    "Ministry of Labour and Employment",
    "Papua New Guinea",
    "workplace injury claims",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        {process.env.NODE_ENV !== "production" && (
          <>
            <Script
              crossOrigin="anonymous"
              src="//unpkg.com/react-grab/dist/index.global.js"
            />
            <Script
              crossOrigin="anonymous"
              src="//unpkg.com/same-runtime/dist/index.global.js"
            />
          </>
        )}
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
