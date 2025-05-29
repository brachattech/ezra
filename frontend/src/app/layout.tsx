import type { Metadata } from "next";
import { Poppins, Fira_Code } from "next/font/google";
import '../styles/globals.css'

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-fira-code",
});

export const metadata: Metadata = {
  title: "Ezra App",
  description: "Aplicação Ezra com Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00FFFF" />
      </head>
      <body className={`min-h-screen bg-purple-900 ${poppins.variable} ${firaCode.variable}`}>
        {children}
      </body>
    </html>
  )
}
