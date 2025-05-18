'use client';

import Link from 'next/link';
import { FaGithub, FaLinkedin, FaFacebook } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function ModeToggle() {
  const { setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card/80 backdrop-blur-md text-card-foreground border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Template</h3>
            <p className="text-muted-foreground text-sm">
              Building meaningful professional connections through shared interests.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Button asChild variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  <Link href="https://template.com/about-us/">
                    About Us
                  </Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  <Link href="/connections">
                    My Connections
                  </Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  <Link href="/search">
                    Find Connections
                  </Link>
                </Button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Button asChild variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  <Link href="/help">
                    Help Center
                  </Link>
                </Button>
              </li>
              <li>
                <Button
                  asChild
                  variant="link"
                  className="p-0 h-auto text-muted-foreground hover:text-primary"
                >
                  <a
                    href="https://template.com/privacy-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </Button>
              </li>
              <li>
                <Button asChild variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                  <Link href="/terms">
                    Terms of Service
                  </Link>
                </Button>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <a
                  href="https://github.com/template"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <FaGithub className="size-5" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <a
                  href="https://x.com/getTemplate"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <FaXTwitter className="size-5" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <a
                  href="https://www.linkedin.com/company/43566345634563/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="size-5" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <a
                  href="https://www.facebook.com/Template/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <FaFacebook className="size-5" />
                </a>
              </Button>
              <ModeToggle />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <Separator className="my-8" />
        <p className="text-center text-muted-foreground text-sm">
          © {currentYear} Template. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
