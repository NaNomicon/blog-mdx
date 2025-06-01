import type {Metadata} from "next";
import Link from "next/link";
import { ArrowRight, Code, Coffee, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PersonStructuredData } from "@/components/seo/structured-data";
import { generateSEOMetadata } from "@/lib/seo";

// Define the metadata generation function
export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: "About",
    description: "Learn more about NaN, a developer with a passion for learning and exploring new technologies. Discover my journey, values, and approach to web development and programming.",
  });
}

export default function About() {
  return (
    <>
      <PersonStructuredData
        name="NaNomicon"
        siteUrl="https://nandev.net"
        description="Developer with a passion for learning and exploring new technologies"
      />
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
              About
              <span className="text-muted-foreground">.</span>
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto" />
          </div>
          
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-xl text-muted-foreground leading-relaxed">
              Developer, learner, and explorer of digital possibilities
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="space-y-16">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Hey there! Thanks for visiting my corner of the internet. I&apos;m NaN, a developer with an insatiable 
              curiosity for learning and exploring new technologies. This space serves as my digital garden where 
              I document discoveries, share insights, and connect with fellow explorers.
            </p>
          </div>

          <Separator />

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Continuous Learning</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Always exploring new technologies, frameworks, and methodologies to stay at the forefront of development.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Sharing Knowledge</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Believing that knowledge grows when shared, I document my journey to help others on theirs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Coffee className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Problem Solving</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Tackling challenges head-on with creativity, persistence, and a good cup of coffee.
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Current Status */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-medium">Current Status</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                This website is currently under construction, evolving and improving with each visit. 
                I&apos;m constantly adding new content, refining the design, and enhancing the user experience.
              </p>
            </div>
            
            <Button asChild size="lg" className="group">
              <Link href="/blog" className="flex items-center gap-2">
                Explore my thoughts
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
