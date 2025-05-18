import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import React from 'react';
import { ThemeProvider } from '../providers/ThemeProvider';
import { Toaster } from '../components/ui/sonner';
import AppInitializer from '../providers/AppInit';
import GoogleAnalytics from '../providers/GoogleAnalytics';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import './globals.css';
import type { Metadata } from 'next';
import { ReactQueryProvider } from '../providers/QueryProvider'
import { ClerkWithTheme } from '../providers/ClerkWithTheme';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Template App',
  description: 'Template platform for posts',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        url: '/images/template-circle.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/images/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/images/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: {
      url: '/images/apple-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkWithTheme>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <head/>
        <body className={`${inter.className} antialiased h-full bg-background text-foreground`}>
          <GoogleAnalytics>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ReactQueryProvider>
                <AppInitializer>
                  <SignedIn>
                    <div className="flex flex-col min-h-screen">
                      <Navbar/>
                      <main className="flex-1 w-full overflow-auto">
                        {children}
                        <div id="modal-root" />
                      </main>
                      <Footer />
                    </div>
                  </SignedIn>

                  <SignedOut>
                    <div className="flex flex-col min-h-screen">
                      <Navbar/>
                      <main className="flex-1 w-full overflow-auto">
                        {children}
                        <div id="modal-root" />
                      </main>
                      <Footer />
                    </div>
                  </SignedOut>
                  <Toaster />
                </AppInitializer>
              </ReactQueryProvider>
            </ThemeProvider>
          </GoogleAnalytics>
        </body>
      </html>
    </ClerkWithTheme>
  );
}