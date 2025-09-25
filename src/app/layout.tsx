import type { Metadata } from "next";
import { SystemProvider as ChakraProvider } from "@chakra-ui/react";
import { CacheProvider } from "@chakra-ui/next-js";
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
      <ChakraProvider>
        {children}
      </ChakraProvider>
    </html>
  );
}
