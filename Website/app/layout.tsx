import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/app/footer";

export const metadata: Metadata = {
  title: "PC:CC",
  description: "Convert your NL2 CSV files to Planet Coaster 2!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="PC:CC" />
      </head>
      <body className="min-h-screen bg-ctp-base text-ctp-text flex flex-col">
        {children}

        <Footer></Footer>
      </body>
    </html >
  );
}
