/* eslint-disable @repo/no-abstracted-overlay-trigger */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/design-system/Spinner/Spinner";
import { Download, Info } from "@langfuse/icons";
import {
  type BatchExportTableName,
  exportOptions,
  type BatchExportFileFormat,
  type OrderByState,
  BatchTableNames,
} from "@langfuse/shared";
import React from "react";
import { api } from "@/src/utils/api";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { batchMessages } from "@/src/features/i18n/messages/batch";

export type BatchExportTableButtonProps = {
  projectId: string;
  tableName: BatchExportTableName;
  orderByState: OrderByState;
  filterState: any;
  searchQuery?: any;
  searchType?: any;
};

export const BatchExportTableButton: React.FC<BatchExportTableButtonProps> = (
  props,
) => {
  const t = useTranslation(batchMessages);
  const [isExporting, setIsExporting] = React.useState(false);
  const createExport = api.batchExport.create.useMutation({
    onSettled: () => {
      setIsExporting(false);
    },
    onSuccess: () => {
      showSuccessToast({
        operation: "export.queue",
        title: t("exportQueued"),
        description: t("exportQueuedDescription"),
        duration: 10000,
        link: {
          href: `/project/${props.projectId}/settings/exports`,
          text: t("viewExports"),
        },
      });
    },
  });
  const handleExport = async (format: BatchExportFileFormat) => {
    setIsExporting(true);
    await createExport.mutateAsync({
      projectId: props.projectId,
      name: `${new Date().toISOString()} - ${props.tableName} as ${format}`,
      format,
      query: {
        tableName: props.tableName,
        filter: props.filterState,
        searchQuery: props.searchQuery || undefined,
        searchType: props.searchType || undefined,
        orderBy: props.orderByState,
      },
    });
  };

  const getWarningMessage = () => {
    switch (props.tableName) {
      case BatchTableNames.Traces:
        return t("traceExportWarning");
      case BatchTableNames.Observations:
        return t("observationExportWarning");
      case BatchTableNames.Events:
        return t("eventExportWarning");
      case BatchTableNames.Sessions:
        return t("sessionExportWarning");
      case BatchTableNames.AuditLogs:
        return t("auditLogExportWarning");
      default:
        // Note: for Scores, DatasetRunItems, DatasetItems, filters should work as expected
        return null;
    }
  };

  const warningMessage = getWarningMessage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={t("export")}
          className="hidden md:inline-flex"
        >
          {isExporting ? (
            <Spinner size="sm" />
          ) : (
            <Download size="base" color="default" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent className="w-80">
          <DropdownMenuLabel>{t("export")}</DropdownMenuLabel>
          {warningMessage && (
            <div className="text-muted-foreground px-2 py-1.5 text-xs">
              <div className="flex items-start gap-1.5">
                <Info size="base" __rawClassName="mt-0.5" />
                <span>{warningMessage}</span>
              </div>
            </div>
          )}
          <DropdownMenuSeparator />
          {Object.entries(exportOptions).map(([key, options]) => (
            <DropdownMenuItem
              key={key}
              className="capitalize"
              onClick={() => handleExport(key as BatchExportFileFormat)}
            >
              {t("exportAs", { format: options.label })}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};
