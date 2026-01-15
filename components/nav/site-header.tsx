import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

import {ModeToggle} from "@/components/nav/theme-toggle";
import {Sheet, SheetClose, SheetContent, SheetHeader, SheetTrigger,} from "@/components/ui/sheet";
import { SocialLinks } from "./social-links";
import HireButton from "../hire-button";

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-6 lg:px-8">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader className="text-left">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="NaN Logo"
                    width={32}
                    height={32}
                    className="rounded-sm transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="text-2xl font-light gradient-text">NaN</span>
              </Link>
            </SheetHeader>
            <nav className="mt-8 space-y-6">
              <Link href="/" className="block text-lg font-medium transition-all duration-300 hover:text-primary hover:translate-x-2">
                <SheetClose>Home</SheetClose>
              </Link>
              <Link href="/about" className="block text-lg font-medium transition-all duration-300 hover:text-primary hover:translate-x-2">
                <SheetClose>About</SheetClose>
              </Link>
              <Link href="/blog" className="block text-lg font-medium transition-all duration-300 hover:text-primary hover:translate-x-2">
                <SheetClose>Blogs</SheetClose>
              </Link>
              <Link href="/notes" className="block text-lg font-medium transition-all duration-300 hover:text-primary hover:translate-x-2">
                <SheetClose>Notes</SheetClose>
              </Link>
            </nav>
            {/* Social Links in Mobile Menu */}
            <div className="mt-8 pt-6 border-t border-border/40">
              <p className="text-sm text-muted-foreground mb-4">Connect with me</p>
              <SocialLinks showLabels={true} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="NaN Logo"
              width={32}
              height={32}
              className="rounded-sm transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <span className="text-2xl font-light tracking-tight gradient-text">NaN</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/about" 
            className="text-sm font-medium transition-all duration-300 hover:text-primary text-foreground/70 relative group"
          >
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link 
            href="/blog" 
            className="text-sm font-medium transition-all duration-300 hover:text-primary text-foreground/70 relative group"
          >
            Blog
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link 
            href="/notes" 
            className="text-sm font-medium transition-all duration-300 hover:text-primary text-foreground/70 relative group"
          >
            Notes
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <HireButton />

          {/* Theme Toggle */}
          <div className="flex items-center">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
