/* eslint-disable @repo/no-margin-on-root-elements */
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { tableMessages } from "@/src/features/i18n/messages/table";
import { type MultiSelect } from "@/src/components/table/data-table-toolbar";
import { Button } from "@/src/components/ui/button";
import { numberFormatter } from "@/src/utils/numbers";

export function DataTableSelectAllBanner({
  selectAll,
  setSelectAll,
  setRowSelection,
  pageSize,
  totalCount,
  approximateCount,
}: MultiSelect) {
  const t = useTranslation(tableMessages);
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : null;
  // Hide the precise number when the row count is not the affected-entity count.
  const exactCount = approximateCount ? null : totalCount;

  return (
    <div className="bg-light-blue/40 dark:bg-light-blue/50 @container mb-2 flex flex-wrap items-center justify-center gap-2 rounded-sm p-2">
      {selectAll ? (
        <span className="text-sm">
          {t("all")}{" "}
          <span className="font-bold">
            {exactCount === null
              ? t("matching")
              : numberFormatter(exactCount, 0)}
          </span>{" "}
          {t("itemsSelected")}{" "}
          <Button
            variant="ghost"
            className="text-accent-dark-blue hover:text-accent-dark-blue/80 h-auto p-0 font-bold"
            onClick={() => {
              setSelectAll(false);
              setRowSelection({});
            }}
          >
            {t("clearSelection")}
          </Button>
        </span>
      ) : (
        <span className="text-sm">
          {t("allOnPage")}{" "}
          <span className="font-bold">{numberFormatter(pageSize, 0)}</span>{" "}
          {t("pageItemsSelected")}{" "}
          <Button
            variant="ghost"
            className="text-accent-dark-blue hover:text-accent-dark-blue/80 h-auto p-0 font-bold"
            onClick={() => {
              setSelectAll(true);
            }}
          >
            {exactCount === null || totalPages === null
              ? t("selectAllMatching")
              : t("selectAllPages", {
                  count: numberFormatter(exactCount, 0),
                  pages: numberFormatter(totalPages, 0),
                })}
          </Button>
        </span>
      )}
    </div>
  );
}
