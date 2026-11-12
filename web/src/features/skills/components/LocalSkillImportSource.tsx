import { useState } from "react";
import type { FileWithPath } from "react-dropzone";
import { Dropzone } from "@/src/components/design-system/Dropzone/Dropzone";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";
import { discoverLocalSkills } from "../utils/local-import";
import type { SkillImportSourceProps } from "./skillImportTypes";

export function LocalSkillImportSource({
  busy,
  onScan,
  onReset,
}: SkillImportSourceProps) {
  const t = useTranslation(skillMessages);
  const [files, setFiles] = useState<File[]>();
  const [error, setError] = useState<string>();

  const handleDropError = (error: Error) => {
    onReset();
    setFiles(undefined);
    setError(error.message);
  };

  const handleDrop = async (acceptedFiles: FileWithPath[]) => {
    if (acceptedFiles.length === 0 || busy) return;
    setFiles(acceptedFiles);
    setError(undefined);
    await onScan(async () => ({
      skills: await discoverLocalSkills(
        acceptedFiles.map((file) => ({
          // file-selector prefixes dropped paths with "/" or "./".
          path: (
            file.webkitRelativePath ||
            file.relativePath ||
            file.path ||
            file.name
          ).replace(/^(\.\/|\/)/, ""),
          file,
        })),
      ),
      source: "local",
      commitMessage: "Imported from local files",
    }));
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        {t("dropFilesDescription")}
      </p>
      <div className="ph-no-capture">
        <Dropzone
          variant="panel"
          accept={undefined}
          maxFiles={10_000}
          maxSize={undefined}
          minSize={undefined}
          src={files}
          isDisabled={busy}
          onError={handleDropError}
          onDrop={handleDrop}
        />
      </div>
      {busy ? <p role="status">{t("scanningLocalFiles")}</p> : null}
      {error ? (
        <p role="alert" className="ph-no-capture text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
