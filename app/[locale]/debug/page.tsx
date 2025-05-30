import { LanguageSwitcherDemo } from '@/components/demo/language-switcher-demo';
import { LocaleInfo } from '@/components/debug/locale-info';
import { PathTest } from '@/components/debug/path-test';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DebugPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Language Switcher Debug</h1>
        <p className="text-muted-foreground">
          Test the language switcher functionality and view different variants.
        </p>
      </div>

      <LocaleInfo />
      
      <PathTest />

      <Card>
        <CardHeader>
          <CardTitle>Language Switcher Variants</CardTitle>
          <CardDescription>
            Different variants of the language switcher component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSwitcherDemo />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
          <CardDescription>
            How to test the language switcher functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Expected Behavior</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Language switcher should show current language</p>
                <p>• Clicking should switch between EN/VI</p>
                <p>• URL should update with locale prefix</p>
                <p>• Page content should translate</p>
                <p>• Navigation should preserve current page</p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Available Locales</h3>
              <div className="flex gap-2">
                <Badge variant="secondary">en (English)</Badge>
                <Badge variant="secondary">vi (Tiếng Việt)</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                English is the default locale and may not show in URL
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 