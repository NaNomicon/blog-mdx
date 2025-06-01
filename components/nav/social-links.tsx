import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SiX, SiBluesky, SiDailydotdev, SiGithub } from "@icons-pack/react-simple-icons";
import { seoConfig } from "@/config/seo.config";

interface SocialLinksProps {
  className?: string;
  showLabels?: boolean;
}

export function SocialLinks({ className = "", showLabels = false }: SocialLinksProps) {
  const socialLinks = [
    {
      name: "Twitter",
      url: `https://x.com/NaNomicon_`,
      icon: <SiX className="w-4 h-4" />,
    },
    {
      name: "Bluesky",
      url: seoConfig.blueskyProfile,
      icon: <SiBluesky className="w-4 h-4" />,
    },
    {
      name: "daily.dev",
      url: seoConfig.dailyDevProfile,
      icon: <SiDailydotdev className="w-4 h-4" />,
    },
    {
      name: "GitHub",
      url: "https://github.com/NaNomicon",
      icon: <SiGithub className="w-4 h-4" />,
    },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {socialLinks.map((link) => (
        <Link
          key={link.name}
          href={link.url}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.icon}
          {showLabels && (
            <>
              <span className="text-sm">{link.name}</span>
              <ExternalLink className="w-3 h-3" />
            </>
          )}
          <span className="sr-only">{link.name}</span>
        </Link>
      ))}
    </div>
  );
} 