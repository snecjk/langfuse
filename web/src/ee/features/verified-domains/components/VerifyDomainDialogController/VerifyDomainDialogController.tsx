import { DialogController } from "@/src/components/design-system/DialogController/DialogController";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { type ReactNode } from "react";
import { type DomainRowData } from "../VerifiedDomainsSettingsTable/VerifiedDomainsSettingsTable";
import { DnsRecordTable } from "../DnsRecordTable/DnsRecordTable";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function VerifyDomainDialogController({
  children,
  verifyingDomainId,
  onVerify,
}: {
  children: (control: {
    openDialog: (row: DomainRowData) => void;
  }) => ReactNode;
  verifyingDomainId: string | null;
  onVerify: (row: DomainRowData) => Promise<void>;
}) {
  const t = useTranslation(enterpriseMessages);
  return (
    <DialogController<DomainRowData>
      onBeforeClose={() => verifyingDomainId === null}
      renderDialog={({ state: row, closeDialog }) => (
        <Dialog
          size="lg"
          title={t("verifiedDomainVerifyTitle", { domain: row.domain })}
          actions={[
            {
              label: t("verifiedDomainVerifyAction"),
              loading: verifyingDomainId === row.id,
              onClick: async () => {
                try {
                  await onVerify(row);
                  closeDialog();
                } catch {
                  // The connected table reports the mutation error.
                }
              },
            },
          ]}
        >
          <Dialog.Body>
            <p className="text-sm font-bold">{t("verifiedDomainTxtHelp")}</p>
            <DnsRecordTable
              recordHost={row.recordHost}
              recordValue={row.recordValue}
            />
            <p className="text-muted-foreground text-xs">
              {t("verifiedDomainDnsPropagation", {
                verify: t("verifiedDomainVerifyAction"),
              })}
            </p>
          </Dialog.Body>
        </Dialog>
      )}
    >
      {({ openDialog }) => children({ openDialog })}
    </DialogController>
  );
}
