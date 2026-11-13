import { type ScoreAggregate } from "@langfuse/shared";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { showToast } from "@/src/features/notifications/showToast";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { datasetsMessages } from "@/src/features/i18n/messages/datasets";

type ActiveCell = {
  datasetRunId: string;
  traceId: string;
  observationId?: string;
  scoreAggregates: ScoreAggregate;
  environment?: string;
};

type CellTarget = Pick<ActiveCell, "traceId" | "observationId">;

type ActiveCellState = {
  activeCell: ActiveCell | null;
  hasCommentDraft: boolean;
  actions: {
    setActiveCell: (cell: ActiveCell | null) => boolean;
    clearActiveCell: () => boolean;
    closeRunAnnotation: (datasetRunId: string) => boolean;
    setCommentDraft: (target: CellTarget, hasDraft: boolean) => void;
  };
};

const isSameTarget = (left: CellTarget | null, right: CellTarget | null) =>
  left?.traceId === right?.traceId &&
  left?.observationId === right?.observationId;

function createActiveCellStore(saveCommentFirst: string) {
  return createStore<ActiveCellState>((set, get) => ({
    activeCell: null,
    hasCommentDraft: false,
    actions: {
      setActiveCell: (cell) => {
        const { activeCell, hasCommentDraft } = get();
        const sameTarget = isSameTarget(activeCell, cell);
        if (!sameTarget && hasCommentDraft) {
          showToast({
            type: "ERROR",
            title: saveCommentFirst,
            analytics: {
              operation: "dataset_annotation.navigate",
              errorOrigin: "frontend",
              errorCategory: "user_input",
            },
          });
          return false;
        }
        set({
          activeCell: cell,
          hasCommentDraft: sameTarget && hasCommentDraft,
        });
        return true;
      },
      clearActiveCell: () => get().actions.setActiveCell(null),
      closeRunAnnotation: (datasetRunId) =>
        get().activeCell?.datasetRunId !== datasetRunId ||
        get().actions.clearActiveCell(),
      setCommentDraft: (target, hasDraft) => {
        if (isSameTarget(get().activeCell, target)) {
          set({ hasCommentDraft: hasDraft });
        }
      },
    },
  }));
}

const ActiveCellContext = createContext<
  ReturnType<typeof createActiveCellStore> | undefined
>(undefined);

export function ActiveCellProvider({ children }: { children: ReactNode }) {
  const t = useTranslation(datasetsMessages);
  const [store] = useState(() => createActiveCellStore(t("saveCommentFirst")));

  return (
    <ActiveCellContext.Provider value={store}>
      {children}
    </ActiveCellContext.Provider>
  );
}

export function useActiveCell() {
  const store = useContext(ActiveCellContext);
  if (!store) {
    throw new Error("useActiveCell must be used within ActiveCellProvider");
  }
  const activeCell = useStore(store, (state) => state.activeCell);
  return { activeCell, ...store.getState().actions };
}
