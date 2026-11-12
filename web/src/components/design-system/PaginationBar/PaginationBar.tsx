/* eslint-disable boundaries/dependencies */
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "@langfuse/icons";
import { useState } from "react";

import { IconButton } from "@/src/components/design-system/IconButton/IconButton";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export type PaginationBarState = {
  pageIndex: number;
  pageSize: number;
};

export type PaginationBarLabels = {
  rows: string;
  rowsPerPage: string;
  page: string;
  pageNumber: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  ofCount: (count: number | null) => string;
};

const englishLabels: PaginationBarLabels = {
  rows: "Rows",
  rowsPerPage: "Rows per page",
  page: "Page",
  pageNumber: "Page number",
  firstPage: "Go to first page",
  previousPage: "Go to previous page",
  nextPage: "Go to next page",
  lastPage: "Go to last page",
  ofCount: (count) => `of ${count ?? "…"}`,
};

export type PaginationBarProps = (
  | {
      mode: "offset";
      totalCount: number | null;
      state: PaginationBarState;
      onChange: (state: PaginationBarState) => void;
      pageSizeOptions?: number[];
      hasNextPage?: never;
      isLoadingNextPage?: never;
    }
  | {
      mode: "cursor";
      totalCount?: never;
      state: PaginationBarState;
      onChange: (state: PaginationBarState) => void;
      hasNextPage: boolean;
      isLoadingNextPage?: boolean;
      pageSizeOptions?: number[];
    }
) & { labels?: PaginationBarLabels };

function PageNumberInput({
  currentPage,
  pageCount,
  onNavigate,
  label,
}: {
  currentPage: number;
  pageCount: number;
  onNavigate: (pageIndex: number) => void;
  label: string;
}) {
  const [value, setValue] = useState<number | string>(currentPage);

  const submit = (nextValue: string) => {
    const nextPage = Number(nextValue);
    if (!Number.isInteger(nextPage) || nextPage < 1 || nextPage > pageCount) {
      setValue(currentPage);
      return;
    }

    onNavigate(nextPage - 1);
    setValue(nextPage);
  };

  return (
    <Input
      aria-label={label}
      type="number"
      min={1}
      max={pageCount}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        submit(event.currentTarget.value);
      }}
      onBlur={(event) => submit(event.target.value)}
      className="h-8 appearance-none"
      style={{
        width: `${3 + Math.max(1, pageCount.toString().length)}ch`,
      }}
    />
  );
}

export function PaginationBar(props: PaginationBarProps) {
  const {
    state,
    onChange,
    pageSizeOptions = [10, 20, 30, 40, 50],
    labels = englishLabels,
  } = props;
  const totalCount = props.totalCount ?? null;
  const isCursorPagination = props.mode === "cursor";
  const pageCount = Math.max(1, Math.ceil((totalCount ?? 0) / state.pageSize));
  const currentPage = state.pageIndex + 1;
  const canGoBack = state.pageIndex > 0;
  const canGoForward =
    props.mode === "cursor"
      ? props.hasNextPage && !props.isLoadingNextPage
      : totalCount !== null && state.pageIndex < pageCount - 1;

  return (
    <div className="bg-background @container/pagination sticky bottom-0 z-10 flex w-full min-w-0 justify-end border-t py-2 pr-2 font-bold">
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-4 gap-y-2 @min-[520px]/pagination:gap-x-6 @min-[720px]/pagination:gap-x-8">
        {!isCursorPagination && (
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-sm whitespace-nowrap @min-[440px]/pagination:hidden">
              {labels.rows}
            </span>
            <span className="hidden text-sm whitespace-nowrap @min-[440px]/pagination:block">
              {labels.rowsPerPage}
            </span>
            <Select
              value={`${state.pageSize}`}
              onValueChange={(value) => {
                const pageSize = Number(value);
                const firstVisibleRow = state.pageIndex * state.pageSize;
                onChange({
                  pageIndex: Math.floor(firstVisibleRow / pageSize),
                  pageSize,
                });
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={state.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex shrink-0 flex-nowrap items-center gap-x-4 @min-[520px]/pagination:gap-x-6">
          <div className="flex items-center justify-center gap-1 text-sm whitespace-nowrap">
            {labels.page}
            {isCursorPagination ? (
              <span>{currentPage}</span>
            ) : (
              <>
                <PageNumberInput
                  key={`${currentPage}-${pageCount}`}
                  label={labels.pageNumber}
                  currentPage={currentPage}
                  pageCount={pageCount}
                  onNavigate={(pageIndex) => onChange({ ...state, pageIndex })}
                />
                <span>
                  {labels.ofCount(totalCount === null ? null : pageCount)}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCursorPagination && (
              <span className="hidden @min-[560px]/pagination:inline-flex">
                <IconButton
                  icon={ChevronsLeft}
                  onClick={() => onChange({ ...state, pageIndex: 0 })}
                  disabled={!canGoBack}
                  label={labels.firstPage}
                  variant="outline"
                />
              </span>
            )}
            <IconButton
              icon={ChevronLeft}
              onClick={() =>
                onChange({ ...state, pageIndex: state.pageIndex - 1 })
              }
              disabled={!canGoBack}
              label={labels.previousPage}
              variant="outline"
            />
            <IconButton
              icon={ChevronRight}
              onClick={() =>
                onChange({ ...state, pageIndex: state.pageIndex + 1 })
              }
              disabled={!canGoForward}
              label={labels.nextPage}
              variant="outline"
            />
            {!isCursorPagination && (
              <span className="hidden @min-[560px]/pagination:inline-flex">
                <IconButton
                  icon={ChevronsRight}
                  onClick={() =>
                    onChange({ ...state, pageIndex: pageCount - 1 })
                  }
                  disabled={!canGoForward}
                  label={labels.lastPage}
                  variant="outline"
                />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
