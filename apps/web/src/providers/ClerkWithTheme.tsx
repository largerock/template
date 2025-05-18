"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ClerkProvider } from "@clerk/nextjs";

export function ClerkWithTheme({
  children,
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <ClerkProvider
      afterSignOutUrl='/sign-in'
      appearance={{
        variables: {
          colorPrimary: 'hsl(145, 55%, 50%)',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
