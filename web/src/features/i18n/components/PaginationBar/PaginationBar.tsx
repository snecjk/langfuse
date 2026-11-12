import {
  PaginationBar as BasePaginationBar,
  type PaginationBarProps,
} from "@/src/components/design-system/PaginationBar/PaginationBar";
import { useTranslation } from "../../I18nProvider";
import { tableMessages } from "../../messages/table";

export type {
  PaginationBarProps,
  PaginationBarState,
} from "@/src/components/design-system/PaginationBar/PaginationBar";

export function PaginationBar(props: PaginationBarProps) {
  const t = useTranslation(tableMessages);
  return (
    <BasePaginationBar
      {...props}
      labels={{
        rows: t("rows"),
        rowsPerPage: t("rowsPerPage"),
        page: t("page"),
        pageNumber: t("pageNumber"),
        firstPage: t("firstPage"),
        previousPage: t("previousPage"),
        nextPage: t("nextPage"),
        lastPage: t("lastPage"),
        ofCount: (count) => t("pageCount", { count: count ?? "…" }),
        ...props.labels,
      }}
    />
  );
}
