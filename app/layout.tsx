import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Health Auto Export Dashboard",
  description: "Visualize your Apple Watch health data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#141414] text-[#c8c8c8] font-sans">
        {children}
      </body>
    </html>
  );
}

