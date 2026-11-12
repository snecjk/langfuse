import { ListRestartIcon } from "@langfuse/icons";
import { useRouter } from "next/router";

import { Button } from "@/src/components/ui/button";
import { usePersistedWindowIds } from "@/src/features/playground/page/hooks/usePersistedWindowIds";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";

export const ResetPlaygroundButton: React.FC = () => {
  const t = useTranslation(skillMessages);
  const router = useRouter();
  const { clearAllCache } = usePersistedWindowIds();

  const handleClick = () => {
    clearAllCache();
    router.reload();
  };

  return (
    <Button
      variant="outline"
      title={t("resetPlaygroundState")}
      onClick={handleClick}
      className="gap-1"
    >
      <ListRestartIcon size="base" color="default" />
      <span className="hidden lg:inline">{t("resetPlayground")}</span>
    </Button>
  );
};
