import Link from "next/link";
import { Menu } from "lucide-react";

import {ModeToggle} from "@/components/nav/theme-toggle";
import {Sheet, SheetClose, SheetContent, SheetHeader, SheetTrigger,} from "@/components/ui/sheet";

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-6 lg:px-8">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader className="text-left">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-light">NaN</span>
              </Link>
            </SheetHeader>
            <nav className="mt-8 space-y-6">
              <Link href="/" className="block text-lg font-medium transition-colors hover:text-foreground/80">
                <SheetClose>Home</SheetClose>
              </Link>
              <Link href="/about" className="block text-lg font-medium transition-colors hover:text-foreground/80">
                <SheetClose>About</SheetClose>
              </Link>
              <Link href="/blog" className="block text-lg font-medium transition-colors hover:text-foreground/80">
                <SheetClose>Blog</SheetClose>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-light tracking-tight">NaN</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/about" 
            className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
          >
            About
          </Link>
          <Link 
            href="/blog" 
            className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Blog
          </Link>
        </nav>

        {/* Theme Toggle */}
        <div className="flex items-center">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
