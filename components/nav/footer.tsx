import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";
import { getVersion } from "@/lib/version";

function Footer() {
  const version = getVersion();
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <div className="space-y-2">
            <Link href="/" className="text-xl font-light tracking-tight">
              NaN
            </Link>
            <p className="text-sm text-muted-foreground">
              Developer & Explorer
            </p>
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
            </nav>
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                Powered by
                <Link 
                  href="https://www.mdxblog.io/" 
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MDXBlog
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </span>
              <Link 
                href="https://github.com/NaN72dev/blog-mdx"
                className="hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NaNomicon. All rights reserved.
          </p>
          <div className="text-xs text-muted-foreground">
            v{version}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
