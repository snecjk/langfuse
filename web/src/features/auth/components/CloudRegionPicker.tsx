import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { authFormsMessages } from "@/src/features/i18n/messages/auth-forms";
/* eslint-disable @repo/no-abstracted-overlay-trigger, @typescript-eslint/no-deprecated, @typescript-eslint/no-use-before-define -- Legacy UI usage retained during migration to design-system components. */
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/src/components/ui/select";
import type { CloudRegion } from "@/src/features/organizations/cloudRegions";

export function CloudRegionPicker({
  regions,
  selectedRegion,
  onValueChange,
  isSignUpPage,
}: {
  regions: CloudRegion[];
  selectedRegion?: CloudRegion;
  onValueChange: (value: CloudRegion["name"]) => void;
  isSignUpPage?: boolean;
}) {
  const t = useTranslation(authFormsMessages);
  return (
    <div className="bg-card mt-8 -mb-10 rounded-lg px-6 py-6 text-sm shadow-sm sm:mx-auto sm:w-full sm:max-w-[480px] sm:px-10">
      <div className="flex w-full flex-col gap-2">
        <div>
          <span className="text-sm leading-none font-bold">
            {t("dataRegion")}
            <DataRegionInfo />
          </span>
          {isSignUpPage && selectedRegion?.name === "HIPAA" ? (
            <p className="text-muted-foreground text-xs">{t("hipaaDemo")}</p>
          ) : null}
        </div>
        <Select value={selectedRegion?.name} onValueChange={onValueChange}>
          <SelectTrigger
            className="w-full"
            disableValueLineClamp
            aria-label={
              selectedRegion
                ? t("regionAria", { region: selectedRegion.name })
                : undefined
            }
          >
            {selectedRegion ? (
              <CloudRegionLabel region={selectedRegion} />
            ) : null}
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.name} value={region.name}>
                <CloudRegionLabel region={region} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedRegion?.name === "HIPAA" && (
          <div className="bg-muted/50 text-muted-foreground mt-2 rounded-md p-3 text-xs">
            <p>
              {t("baa")}{" "}
              <a
                href="https://langfuse.com/security/hipaa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:text-link-hover underline"
              >
                {t("hipaaLearn")}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CloudRegionLabel({ region }: { region: CloudRegion }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={
          region.name === "HIPAA"
            ? "translate-y-[-3px] text-xl leading-none"
            : "-translate-y-px text-xl leading-none"
        }
      >
        {region.flag}
      </span>
      <span>{region.name}</span>
    </span>
  );
}

const DataRegionInfo = () => {
  const t = useTranslation(authFormsMessages);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <a
          href="#"
          className="text-link hover:text-link-hover ml-1 text-xs"
          title={t("whatTitle")}
          tabIndex={-1}
        >
          {t("whatLink")}
        </a>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dataRegions")}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription className="flex flex-col gap-2">
            <p>{t("regionsIntro")}</p>
            <ul className="list-disc pl-5">
              <li>{t("regionUs")}</li>
              <li>{t("regionEu")}</li>
              <li>{t("regionJp")}</li>
              <li>{t("regionHipaa")}</li>
            </ul>
            <p>{t("regionsSeparated")}</p>
            <p>{t("regionSubscriptions")}</p>
            <p>
              {t("learnAbout")}{" "}
              <a
                href="https://langfuse.com/security/data-regions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:text-link-hover underline"
              >
                {t("dataRegionsLower")}
              </a>{" "}
              {t("and")}{" "}
              <a
                href="https://langfuse.com/docs/data-security-privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:text-link-hover underline"
              >
                {t("securityPrivacy")}
              </a>
              .
            </p>
          </DialogDescription>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
