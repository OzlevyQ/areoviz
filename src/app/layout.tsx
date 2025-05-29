// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { NextAuthProvider } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AreoVizN AI - Advanced Aviation Dashboard',
  description: 'Real-time flight data monitoring, anomaly detection, and AI-driven advisory system for aviation professionals',
  keywords: 'aviation, flight data, anomaly detection, AI, dashboard, pilot, technician, manager',
  authors: [{ name: 'AreoVizN Team' }],
  openGraph: {
    title: 'AreoVizN AI - Advanced Aviation Dashboard',
    description: 'Real-time flight data monitoring and AI-driven advisory system',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
