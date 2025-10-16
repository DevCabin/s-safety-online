import type { Metadata } from "next";
import { ChakraProvider } from "@chakra-ui/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "S Safety Online",
  description: "AI Email Safety Checker for Seniors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
