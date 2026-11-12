import { SwitchInput } from "@/src/components/design-system/SwitchInput/SwitchInput";
import { useAccessAuditLogSetting } from "@/src/ee/features/access-audit-log/hooks/useAccessAuditLogSetting";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function AccessLoggingSwitch(props: { orgId: string }) {
  const setting = useAccessAuditLogSetting(props.orgId);
  const t = useTranslation(enterpriseMessages);

  return (
    <SwitchInput
      id="access-audit-log-enabled"
      description={t("auditAccessLoggingDescription")}
      checked={setting.enabled}
      disabled={setting.disabled}
      onCheckedChange={setting.setEnabled}
    />
  );
}
