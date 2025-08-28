import { Nunito } from "next/font/google";
import "./globals.css";
import {Menu} from "@/components/Menu/Menu";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Nunito({ subsets: ["latin"] });

export const metadata = {
  title: "WWE Tracker",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
        <Menu />
        <SpeedInsights />
      </body>
    </html>
  );
}
