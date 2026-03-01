import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Code, Coffee, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PersonStructuredData } from "@/components/seo/structured-data";
import { generateSEOMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generateSEOMetadata({
    title: "About | Software Development & Productivity",
    description:
      "Learn more about NaN, a software developer exploring the intersection of productivity, self-development, and technology. Discover how I use AI and self-hosting as tools for growth.",
    locale,
  });
}

export default async function About({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("About");
  return (
    <>
      <PersonStructuredData
        name="NaNomicon"
        siteUrl="https://nanomicon.com"
        description="Software developer interested in self-development, productivity, and leveraging technology for growth."
      />
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
              {t("heroTitle")}
              <span className="text-muted-foreground">.</span>
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto" />
          </div>
          
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t("heroSubtitle")}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="space-y-16">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t("introParagraph1") }} />
            <p className="text-lg text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t("introParagraph2") }} />
          </div>

          <Separator />

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">{t("value1Title")}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{t("value1Description")}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">{t("value2Title")}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{t("value2Description")}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Coffee className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">{t("value3Title")}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{t("value3Description")}</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Current Status */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-medium">{t("currentStatusTitle")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("currentStatusDescription")}</p>
            </div>
            
            <Button asChild size="lg" className="group">
              <Link href="/blog" className="flex items-center gap-2">
                {t("exploreButton")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
