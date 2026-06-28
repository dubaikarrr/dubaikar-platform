import type { Metadata } from "next";
import { Inter, Roboto, Open_Sans, Lora, Merriweather, Poppins, Montserrat, Source_Sans_3, Playfair_Display, Space_Grotesk, DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700"] });
const openSans = Open_Sans({ variable: "--font-open-sans", subsets: ["latin"], weight: ["400", "600", "700"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], weight: ["400", "500", "700"] });
const merriweather = Merriweather({ variable: "--font-merriweather", subsets: ["latin"], weight: ["400", "700"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const sourceSans = Source_Sans_3({ variable: "--font-source-sans", subsets: ["latin"], weight: ["400", "600", "700"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["400", "500", "700"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], weight: ["400", "500", "700"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: {
    default: "Dubaikar, your move to Dubai, step by step",
    template: "%s · Dubaikar",
  },
  description:
    "Dubaikar guides Indian professionals through the entire journey of moving to and settling in Dubai, plan, prepare, apply, depart, arrive, settle. Free tools, guides, and expert sessions.",
  metadataBase: new URL("https://dubaikar.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = `${inter.variable} ${roboto.variable} ${openSans.variable} ${lora.variable} ${merriweather.variable} ${poppins.variable} ${montserrat.variable} ${sourceSans.variable} ${playfair.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${outfit.variable}`;
  return (
    <html lang="en" className={`${fontVars} h-full`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
