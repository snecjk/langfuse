import React, { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/design-system/Badge/Badge";
import { Wrench, Braces, Variable, type IconComponent } from "@langfuse/icons";
import { DropdownIndicator } from "@/src/components/design-system/DropdownIndicator/DropdownIndicator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { usePlaygroundContext } from "../context/PlaygroundProvider";
import { usePlaygroundWindowSize } from "../hooks/usePlaygroundWindowSize";
import {
  PlaygroundTools,
  PlaygroundToolsPopover,
  type PlaygroundToolDialogRequest,
} from "./PlaygroundTools";
import {
  StructuredOutputSchemaSection,
  StructuredOutputSchemaPopover,
  type StructuredOutputSchemaDialogRequest,
} from "./StructuredOutputSchemaSection";
import { Variables } from "./Variables";
import { MessagePlaceholders } from "./MessagePlaceholders";
import { CreateOrEditLLMToolDialog } from "./CreateOrEditLLMToolDialog";
import { CreateOrEditLLMSchemaDialog } from "./CreateOrEditLLMSchemaDialog";
import useProjectIdFromURL from "@/src/hooks/useProjectIdFromURL";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { skillMessages } from "@/src/features/i18n/messages/skills";

function usePopoverToDialog<T>() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [request, setRequest] = useState<{ id: number; payload: T }>();

  const openDialog = (payload: T) => {
    setPopoverOpen(false);
    setRequest((previous) => ({ id: (previous?.id ?? 0) + 1, payload }));
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open) return;
    setDialogOpen(false);
    setPopoverOpen(true);
  };

  return {
    popoverOpen,
    setPopoverOpen,
    request,
    dialogOpen,
    openDialog,
    handleDialogOpenChange,
  };
}

export const ConfigurationDropdowns: React.FC = () => {
  const t = useTranslation(skillMessages);
  const { containerRef, width, isVeryCompact, isCompact } =
    usePlaygroundWindowSize();
  const {
    tools,
    structuredOutputSchema,
    promptVariables,
    messagePlaceholders,
  } = usePlaygroundContext();
  const projectId = useProjectIdFromURL();
  const toolsOverlay = usePopoverToDialog<PlaygroundToolDialogRequest>();
  const schemaOverlay =
    usePopoverToDialog<StructuredOutputSchemaDialogRequest>();

  const toolsCount = tools.length;
  const hasSchema = structuredOutputSchema ? 1 : 0;
  const variablesCount = promptVariables.length + messagePlaceholders.length;
  const toolsPopoverWidth =
    width > 0 ? Math.min(Math.max(width - 24, 0), 320) : undefined;
  const toolsLabel = t("tools");
  const schemaLabel = t("schema");
  const variablesLabel = t("variables");

  // Helper function to get responsive content (text or icon)
  const getResponsiveContent = (
    fullText: string,
    Icon: IconComponent,
    abbreviation?: string,
  ) => {
    if (isVeryCompact) {
      return <Icon size="base" />;
    }
    if (isCompact) {
      return (
        <>
          <Icon size="base" />
          <span className="text-sm">{abbreviation ?? fullText}</span>
        </>
      );
    }
    return (
      <>
        <Icon size="base" />
        <span className="text-sm">{fullText}</span>
      </>
    );
  };

  return (
    <div ref={containerRef} className="bg-muted/25 shrink-0 border-b px-3 py-2">
      <div className="flex items-center justify-start gap-2">
        {/* Tools Dropdown */}
        <Popover
          open={toolsOverlay.popoverOpen}
          onOpenChange={toolsOverlay.setPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              {getResponsiveContent(toolsLabel, Wrench)}
              {toolsCount > 0 && (
                <Badge color="filled" size="sm" text={String(toolsCount)} />
              )}
              <DropdownIndicator size="sm" nudge />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 max-w-[calc(100vw-1rem)] min-w-0 overflow-hidden p-4"
            align="start"
            style={toolsPopoverWidth ? { width: toolsPopoverWidth } : undefined}
          >
            <div className="mb-3">
              <h4 className="mb-1 text-sm font-bold">{t("tools")}</h4>
              <p className="text-muted-foreground text-xs">
                {t("configureToolsForModel")}
              </p>
            </div>
            {toolsCount > 0 ? (
              <div className="mb-3">
                <PlaygroundTools onOpenToolDialog={toolsOverlay.openDialog} />
              </div>
            ) : (
              <div className="mb-3">
                <p className="text-muted-foreground text-xs">
                  {t("noToolsAttached")}
                </p>
              </div>
            )}
            <div className="border-t pt-3">
              <PlaygroundToolsPopover
                onOpenToolDialog={toolsOverlay.openDialog}
              />
            </div>
          </PopoverContent>
        </Popover>
        {toolsOverlay.request && projectId && (
          <CreateOrEditLLMToolDialog
            key={`tool-${toolsOverlay.request.id}`}
            projectId={projectId}
            open={toolsOverlay.dialogOpen}
            onOpenChange={toolsOverlay.handleDialogOpenChange}
            onSave={toolsOverlay.request.payload.onSave}
            onDelete={toolsOverlay.request.payload.onDelete}
            existingLlmTool={toolsOverlay.request.payload.existingLlmTool}
            defaultValues={toolsOverlay.request.payload.defaultValues}
          />
        )}

        {/* Structured Output Dropdown */}
        <Popover
          open={schemaOverlay.popoverOpen}
          onOpenChange={schemaOverlay.setPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              {getResponsiveContent(schemaLabel, Braces)}
              {hasSchema > 0 && (
                <Badge color="filled" size="sm" text={String(hasSchema)} />
              )}
              <DropdownIndicator size="sm" nudge />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="mb-3">
              <h4 className="mb-1 text-sm font-bold">
                {t("structuredOutput")}
              </h4>
              <p className="text-muted-foreground text-xs">
                {t("configureJSONSchemaForStructuredOutput")}
              </p>
            </div>
            {structuredOutputSchema ? (
              <div className="mb-3">
                <StructuredOutputSchemaSection
                  onOpenSchemaDialog={schemaOverlay.openDialog}
                />
              </div>
            ) : (
              <div className="mb-3">
                <p className="text-muted-foreground text-xs">
                  {t("noSchemaProvided")}
                </p>
              </div>
            )}
            <div className="border-t pt-3">
              <StructuredOutputSchemaPopover
                onOpenSchemaDialog={schemaOverlay.openDialog}
              />
            </div>
          </PopoverContent>
        </Popover>
        {schemaOverlay.request && projectId && (
          <CreateOrEditLLMSchemaDialog
            key={`schema-${schemaOverlay.request.id}`}
            projectId={projectId}
            open={schemaOverlay.dialogOpen}
            onOpenChange={schemaOverlay.handleDialogOpenChange}
            onSave={schemaOverlay.request.payload.onSave}
            onDelete={schemaOverlay.request.payload.onDelete}
            existingLlmSchema={schemaOverlay.request.payload.existingLlmSchema}
            defaultValues={schemaOverlay.request.payload.defaultValues}
          />
        )}

        {/* Variables & Placeholders Dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              {getResponsiveContent(variablesLabel, Variable, t("vars"))}
              {variablesCount > 0 && (
                <Badge color="filled" size="sm" text={String(variablesCount)} />
              )}
              <DropdownIndicator size="sm" nudge />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="mb-3">
              <h4 className="mb-1 text-sm font-bold">
                {t("variablesAndMessagePlaceholders")}
              </h4>
              <p className="text-muted-foreground text-xs">
                {t("configureVariablesAndMessagePlaceholders")}
              </p>
            </div>
            {variablesCount > 0 ? (
              <div
                className="mb-3"
                style={{ maxHeight: "50vh", overflowY: "auto" }}
              >
                <div className="space-y-4">
                  <div>
                    <h5 className="mb-2 text-xs font-bold">{t("variables")}</h5>
                    <Variables />
                  </div>
                  <div>
                    <h5 className="mb-2 text-xs font-bold">
                      {t("messagePlaceholders")}
                    </h5>
                    <MessagePlaceholders />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <p className="text-muted-foreground text-xs">
                  {t("noVariablesOrMessagePlaceholdersDefined")}
                </p>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
