import { Nunito } from "next/font/google";
import "./globals.css";

const inter = Nunito({ subsets: ["latin"] });

export const metadata = {
  title: "WWE Tracker",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
