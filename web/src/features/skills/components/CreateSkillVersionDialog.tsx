import { useStore } from "zustand";
import { Save, TriangleAlert } from "@langfuse/icons";
import { Alert } from "@/src/components/design-system/Alert/Alert";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";
import { type SkillEditorStore } from "@/src/features/skills/components/skillEditorStore";
import { SkillDraftChanges } from "./SkillDraftChanges";

export function CreateSkillVersionDialog({
  projectId,
  store,
  name,
  isFirstVersion,
  isSaving,
  disabled,
  onConfirm,
}: {
  projectId: string;
  store: SkillEditorStore;
  name: string;
  isFirstVersion: boolean;
  isSaving: boolean;
  disabled: boolean;
  onConfirm: () => Promise<void>;
}) {
  const t = useTranslation(skillMessages);
  const originalName = useStore(store, (state) =>
    state.baseVersion === null ? null : state.name,
  );
  const commitMessage = useStore(store, (state) => state.commitMessage);
  const setCommitMessage = useStore(
    store,
    (state) => state.actions.setCommitMessage,
  );

  return (
    <Dialog
      title={isFirstVersion ? t("createSkill") : t("createNewVersion")}
      size="xxl"
      actions={[
        {
          label: isFirstVersion ? t("createSkill") : t("createVersion"),
          icon: Save,
          loading: isSaving,
          disabled,
          onClick: onConfirm,
        },
      ]}
    >
      <Dialog.Body>
        <div className="ph-no-capture flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex shrink-0 flex-col gap-4">
            <p className="text-muted-foreground">
              {isFirstVersion
                ? t("createSkillAsNewSkill", { name })
                : t("commitTheCurrentDraft", { name })}
            </p>
            {isFirstVersion && originalName ? (
              <Alert variant="warning" icon={TriangleAlert}>
                <Alert.Title>{t("youAreDuplicatingThisSkill")}</Alert.Title>
                <Alert.Description>
                  {t("duplicatingSkillDescription", {
                    name,
                    originalName,
                  })}
                </Alert.Description>
              </Alert>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="skill-version-note">{t("versionNote")}</Label>
              <p className="text-muted-foreground text-sm">
                {t("describeChangesInVersion")}
              </p>
              <Textarea
                id="skill-version-note"
                value={commitMessage}
                onChange={(event) => setCommitMessage(event.target.value)}
                placeholder={t("versionNotePlaceholder")}
                rows={3}
                autoFocus
              />
            </div>
          </div>
          <h3 className="shrink-0 text-sm font-bold">{t("fileChanges")}</h3>
          <SkillDraftChanges
            projectId={projectId}
            store={store}
            isFirstVersion={isFirstVersion}
          />
        </div>
      </Dialog.Body>
    </Dialog>
  );
}
