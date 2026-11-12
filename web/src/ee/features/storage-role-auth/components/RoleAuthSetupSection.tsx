import { type ReactNode, useId, useState } from "react";

import { ExpandToggle } from "@/src/components/design-system/ExpandToggle/ExpandToggle";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function RoleAuthSetupSection({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const contentId = useId();
  const t = useTranslation(enterpriseMessages);

  return (
    <div className="flex flex-col gap-3">
      <ExpandToggle
        expanded={isExpanded}
        onExpandedChange={setIsExpanded}
        label={t("storageRoleShowSetup")}
        expandedLabel={t("storageRoleHideSetup")}
        variant="icon"
        size="sm"
        controls={contentId}
      />
      <div id={contentId} hidden={!isExpanded}>
        {children}
      </div>
    </div>
  );
}
