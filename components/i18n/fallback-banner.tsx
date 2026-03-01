import { getTranslations } from "next-intl/server";
import { Info } from "lucide-react";

export async function FallbackBanner() {
  const t = await getTranslations("I18n");
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{t("fallbackNotice")}</p>
    </div>
  );
}
