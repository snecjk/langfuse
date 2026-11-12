/* eslint-disable @repo/no-abstracted-overlay-trigger */
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { catalogMessages } from "@/src/features/i18n/messages/catalog";
import { Button } from "@/src/components/ui/button";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { api } from "@/src/utils/api";
import { Trash } from "@langfuse/icons";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import useProjectIdFromURL from "@/src/hooks/useProjectIdFromURL";

export function DeletePrompt({ promptName }: { promptName: string }) {
  const t = useTranslation(catalogMessages);
  const projectId = useProjectIdFromURL();
  const utils = api.useUtils();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAccess = useHasProjectAccess({ projectId, scope: "prompts:CUD" });

  const mutDeletePrompt = api.prompts.delete.useMutation({
    onSuccess: () => {
      utils.prompts.invalidate();
      setError(null);
      setIsOpen(false);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  return (
    <Popover open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          disabled={!hasAccess}
          aria-label={t("deletePrompt")}
        >
          <Trash size="sm" color="default" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <h2 className="mb-3 font-bold">{t("confirm")}</h2>
        <p className="mb-3 text-sm">
          {t("deletePromptPrefix")}{" "}
          <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-bold">
            {promptName}
          </code>{" "}
          {t("deletePromptSuffix")}
        </p>
        {error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="font-bold">{t("error")}</p>
            <p className="whitespace-pre-wrap">{error}</p>
          </div>
        )}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="destructive"
            loading={mutDeletePrompt.isPending}
            onClick={() => {
              if (!projectId) {
                console.error("Project ID is missing");
                return;
              }
              setError(null);

              mutDeletePrompt.mutate({
                projectId,
                promptName,
              });
            }}
          >
            {t("deletePrompt")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
