import Link from "next/link";
import Image from "next/image";
import { GithubIcon, ExternalLink } from "lucide-react";
import { getVersion } from "@/lib/version";
import { SocialLinks } from "./social-links";

function Footer() {
  const version = getVersion();
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Brand & Social Links */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logo.png"
                  alt="NaN Logo"
                  width={24}
                  height={24}
                  className="rounded-sm"
                />
                <span className="text-xl font-light tracking-tight">NaN</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Developer & Explorer
              </p>
            </div>
            <SocialLinks />
          </div>

          {/* Links */}
          <div className="flex justify-center">
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/privacy-policy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Powered by & Repository */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Powered by</span>
              <Link
                href="https://www.mdxblog.io/"
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                MDXBlog
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <Link
              href="https://github.com/NaN72dev/blog-mdx"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon className="w-4 h-4" />
              <span>View Source</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NaNomicon. All rights reserved.
          </p>
          <div className="text-xs text-muted-foreground">v{version}</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
