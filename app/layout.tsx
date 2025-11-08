import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import {
  DM_Sans,
  Poppins,
  Space_Grotesk,
  Playfair_Display,
  Montserrat,
  Roboto,
} from "next/font/google";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DMSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const myFont = localFont({
  src: [
    {
      path: "../public/fonts/Stratford-Serial Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-myfont", // your custom CSS variable
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wau",
  description: "All-in-one platform for your business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${myFont.variable} ${DMSans.variable} ${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable} ${montserrat.variable} ${roboto.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
