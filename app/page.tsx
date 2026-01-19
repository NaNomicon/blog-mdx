import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonStructuredData } from "@/components/seo/structured-data";
import { seoConfig } from "@/config/seo.config";
import { generateSEOMetadata } from "@/lib/seo";

// Define the metadata generation function
export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: "NaN's Blog | Software Development, Productivity & Growth",
    description: "Personal blog of NaNomicon - Exploring software development, productivity, and personal growth through the lens of modern technology like AI and self-hosting.",
  });
}

export default function Home() {
  return (
    <>
      <PersonStructuredData
        name={seoConfig.author}
        siteUrl={seoConfig.siteUrl}
        description="Software developer interested in self-development, productivity, and leveraging technology for growth."
      />
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-6">
          <div className="relative">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-tight gradient-text">
              Build & Grow
              <span className="text-primary">.</span>
            </h1>
            <div className="absolute -top-4 -right-4 float-animation">
              <Sparkles className="w-8 h-8 text-primary opacity-60" />
            </div>
          </div>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-xl text-muted-foreground leading-relaxed">
            Software developer exploring the intersection of technology, 
            productivity, and self-development.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="space-y-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card-enhanced space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-medium gradient-text">The Journey</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              I believe technology should serve our personal growth. Whether it&apos;s 
              leveraging AI to expand our capabilities or self-hosting tools to reclaim our 
              digital sovereignty, it&apos;s all part of becoming a better developer and a better self.
            </p>
          </div>

          <div className="card-enhanced space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-medium gradient-text">Purpose</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              I started this blog to document my progress and share insights on 
              building efficient systems—both in code and in life. Here, you&apos;ll find 
              thoughts on productivity, technical deep-dives, and occasional discoveries.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-8">
        <div className="space-y-6">
          <p className="text-lg text-muted-foreground">
            Currently under construction, but getting better every day
          </p>
          <div className="relative inline-block">
            <Button
              asChild
              size="lg"
              className="group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/blog" className="flex items-center gap-2">
                Explore my thoughts
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
