"use client";

import { useState } from "react";
import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Bell, Mail, Menu, Users } from "lucide-react";
import { Button } from "../ui/button";
import { ClerkUserButtonWithPages } from '../clerk/UserButtonWithPages';
import { toast } from 'sonner';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast("You have been successfully logged out");
    router.push("/sign-in");
  };

  return (
    <header className="bg-card/80 backdrop-blur-md text-card-foreground shadow-sm border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2">
              <span className="font-medium text-lg">Template</span>
            </Link>

            <SignedIn>
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <Link
                  href="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </SignedIn>
          </div>

          <SignedIn>

            <div className="flex items-center">
              <div className="hidden md:flex md:items-center md:space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Bell className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => router.push("/messages")}
                >
                  <Mail className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => router.push("/connections")}
                >
                  <Users className="h-5 w-5" />
                </Button>

                {/* Use Clerk UserButton instead of custom dropdown */}
                <ClerkUserButtonWithPages />
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-secondary hover:text-primary transition-colors">
                <Link href="/sign-in">
                  Sign In
                </Link>
              </Button>
            </div>
          </SignedOut>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <SignedIn>
        {isMenuOpen && (
          <div className="md:hidden bg-card/90 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/Connections"
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Connections
              </Link>
              <Link
                href={`/profile/${user?.id}`}
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </SignedIn>
    </header>
  );
};

export default Navbar;