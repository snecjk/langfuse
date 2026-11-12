import { Eye } from "@langfuse/icons";
import {
  buildStorageRolePermissionPolicy,
  buildStorageRoleTrustPolicy,
  type StorageRoleActions,
} from "@langfuse/shared";

import { type ReactNode } from "react";

import { CodeSection } from "@/src/components/design-system/CodeSection/CodeSection";
import { type RevealableExternalId } from "@/src/ee/features/storage-role-auth/components/types";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

const MASKED_EXTERNAL_ID = "••••••••••••••••••••••••";
const EXTERNAL_ID_PLACEHOLDER = "<external-id>";

function getExternalIdHint(
  externalId: RevealableExternalId,
  t: ReturnType<typeof useTranslation<typeof enterpriseMessages>>,
) {
  if (!externalId.isSet) {
    return t("storageRoleExternalIdHintSave");
  }
  if (!externalId.value) {
    return t("storageRoleExternalIdHintShow");
  }
  return null;
}

// The label sits outside CodeSection so its actions stay inside the code box.
function LabeledCode({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-bold">{label}</span>
      {children}
    </div>
  );
}

export function RoleAuthSetupInstructions({
  crossAccountRoleArn,
  externalId,
  roleArn,
  bucketName,
  prefix,
  actions,
  description,
}: {
  crossAccountRoleArn: string;
  externalId: RevealableExternalId;
  roleArn: string;
  bucketName: string;
  prefix: string | null | undefined;
  actions: StorageRoleActions;
  description: string;
}) {
  const hasValue = externalId.value !== undefined;
  const t = useTranslation(enterpriseMessages);
  const hint = getExternalIdHint(externalId, t);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm">{description}</p>
      <LabeledCode label={t("storageRoleCrossAccount")}>
        <CodeSection content={crossAccountRoleArn} />
      </LabeledCode>
      <LabeledCode label={t("storageRoleExternalId")}>
        <CodeSection
          content={
            externalId.value ??
            (externalId.isSet ? MASKED_EXTERNAL_ID : EXTERNAL_ID_PLACEHOLDER)
          }
          isCopyable={hasValue}
          actions={
            externalId.isSet && !hasValue && !externalId.isLoading
              ? [
                  {
                    icon: Eye,
                    label: t("storageRoleShowExternalId"),
                    onClick: externalId.reveal,
                  },
                ]
              : []
          }
        />
        {hint ? <p className="text-muted-foreground text-sm">{hint}</p> : null}
      </LabeledCode>
      <LabeledCode label={t("storageRoleTrustPolicy")}>
        <CodeSection
          language="json"
          content={JSON.stringify(
            buildStorageRoleTrustPolicy({
              crossAccountRoleArn,
              externalId: externalId.value ?? EXTERNAL_ID_PLACEHOLDER,
            }),
            null,
            2,
          )}
        />
      </LabeledCode>
      <LabeledCode label={t("storageRolePermissionPolicy")}>
        <CodeSection
          language="json"
          content={JSON.stringify(
            buildStorageRolePermissionPolicy({
              roleArn: roleArn || "arn:aws:iam::123456789012:role/role-name",
              bucketName: bucketName || "bucket-name",
              prefix,
              actions,
            }),
            null,
            2,
          )}
        />
      </LabeledCode>
    </div>
  );
}
