/* eslint-disable @typescript-eslint/no-deprecated -- Legacy UI usage retained during migration to design-system components. */
import React, { useState } from "react";
import { api } from "@/src/utils/api";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { classifyTrpcToastError } from "@/src/utils/trpcErrorClassification";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { dashboardMessages } from "@/src/features/i18n/messages/dashboards";
import { dashboardMessages as baseDashboardMessages } from "@/src/features/i18n/messages/dashboard";

interface EditDialogDashboardContentProps {
  closeDialog: () => void;
  projectId: string;
  dashboardId: string;
  initialName: string;
  initialDescription: string;
}

export function EditDialogDashboardContent({
  closeDialog,
  projectId,
  dashboardId,
  initialName,
  initialDescription,
}: EditDialogDashboardContentProps) {
  const t = useTranslation(dashboardMessages);
  const tb = useTranslation(baseDashboardMessages);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const utils = api.useUtils();

  const updateDashboard = api.dashboard.updateDashboardMetadata.useMutation({
    onSuccess: () => {
      utils.dashboard.invalidate();
      closeDialog();
    },
    onError: (e) => {
      showErrorToast(
        t("failedUpdateDashboard"),
        e.message,
        classifyTrpcToastError(e, "dashboard.update"),
      );
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      showErrorToast(t("validationError"), t("dashboardNameRequired"), {
        operation: "dashboard.update",
        errorOrigin: "frontend",
        errorCategory: "user_input",
      });
      return;
    }

    updateDashboard.mutate({
      projectId,
      dashboardId,
      name: name.trim(),
      description: description.trim(),
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("editDashboard")}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("dashboardNamePlaceholder")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("dashboardDescriptionPlaceholder")}
              rows={3}
            />
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <div className="flex gap-2">
          <Button onClick={closeDialog} variant="outline" type="button">
            {tb("cancel")}
          </Button>
          <Button
            onClick={handleSave}
            type="button"
            loading={updateDashboard.isPending}
          >
            {t("saveChanges")}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
