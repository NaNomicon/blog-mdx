'use client';

import LanguageSwitcher from '@/components/nav/language-switcher';
import LanguageSwitcherV2 from '@/components/nav/language-switcher-v2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LanguageSwitcherDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Link-based Navigation (Recommended)</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Emoji Flags (Link)</CardTitle>
              <CardDescription>
                Uses Next.js Link for reliable navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageSwitcherV2 variant="emoji" showLabel={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">SVG Flags (Link)</CardTitle>
              <CardDescription>
                High-quality SVG flags with Link navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageSwitcherV2 variant="svg" showLabel={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Minimal (Link)</CardTitle>
              <CardDescription>
                Clean minimal design with Link navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageSwitcherV2 variant="minimal" showLabel={true} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Router-based Navigation (Alternative)</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Emoji Flags (Router)</CardTitle>
              <CardDescription>
                Uses useRouter with window.location fallback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageSwitcher variant="emoji" showLabel={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">SVG Flags (Router)</CardTitle>
              <CardDescription>
                High-quality SVG flags with router navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageSwitcher variant="svg" showLabel={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Minimal (Router)</CardTitle>
              <CardDescription>
                Clean minimal design with router navigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageSwitcher variant="minimal" showLabel={true} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 