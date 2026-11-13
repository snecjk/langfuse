import { forwardRef, useImperativeHandle, useState } from "react";
import { useStore } from "zustand";

import { Button } from "@/src/components/ui/button";
import {
  createRuleSetupStore,
  isRuleDraftDirty,
} from "@/src/features/evals/v2/stores/createRuleSetupStore";
import { EvaluatorAssignmentsEditor } from "@/src/features/evals/v2/components/Rules/EvaluatorAssignmentsEditor/EvaluatorAssignmentsEditor";
import type {
  RuleDraft,
  RuleEvaluatorOption,
} from "@/src/features/evals/v2/types/rules";
import type { ExperimentEvaluatorAssignmentsHandle } from "@/src/features/experiments/components/ExperimentEvaluatorAssignments/types/experimentEvaluatorAssignmentsHandle";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

export const ExperimentEvaluatorAssignmentsEditor = forwardRef<
  ExperimentEvaluatorAssignmentsHandle,
  {
    evaluatorOptions: RuleEvaluatorOption[];
    initialAssignments: RuleDraft["assignments"];
    sampleObject: Record<string, unknown> | null;
    unvalidatedSourceColumnIds?: string[];
    search: string;
    onSearchChange: (value: string) => void;
    onSaveAssignments: (assignments: RuleDraft["assignments"]) => Promise<void>;
    disabled?: boolean;
    showSaveButton?: boolean;
  }
>(function ExperimentEvaluatorAssignmentsEditor(
  {
    evaluatorOptions,
    initialAssignments,
    sampleObject,
    unvalidatedSourceColumnIds,
    search,
    onSearchChange,
    onSaveAssignments,
    disabled = false,
    showSaveButton = true,
  },
  ref,
) {
  const t = useTranslation(experimentMessages);
  const [store] = useState(() =>
    createRuleSetupStore({
      name: t("experimentEvaluators"),
      filter: [],
      sampling: 1,
      assignments: initialAssignments,
    }),
  );
  const isDirty = useStore(store, isRuleDraftDirty);

  const save = async () => {
    if (disabled || !isDirty) return;

    const state = store.getState();
    await onSaveAssignments(state.assignments);
    store.setState({
      initialDraft: {
        name: state.name,
        filter: state.filter,
        sampling: state.sampling,
        assignments: state.assignments,
      },
    });
  };
  useImperativeHandle(ref, () => ({ save }));

  return (
    <div className="space-y-3">
      <EvaluatorAssignmentsEditor
        evaluatorOptions={evaluatorOptions}
        store={store}
        search={search}
        onSearchChange={onSearchChange}
        sampleObject={sampleObject}
        unvalidatedSourceColumnIds={unvalidatedSourceColumnIds}
        costEstimates={[]}
        estimatingEvaluatorIds={[]}
        footerTrailing={null}
        pickerWidth="trigger"
        emptyDescription={t("attachEvaluator")}
        sourceUnavailableMessage={t("noSampleItem")}
        disabled={disabled}
      />
      {showSaveButton ? (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            disabled={disabled || !isDirty}
            onClick={() => {
              save().catch(() => {
                // The mutation displays its error toast and the draft remains dirty.
              });
            }}
          >
            {t("save")}
          </Button>
        </div>
      ) : null}
    </div>
  );
});
