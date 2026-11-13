import { ArrowUpRight } from "@langfuse/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectedIOTableCell } from "@/src/components/table/ConnectedIOTableCell";
import { shouldIgnoreRowClickTarget } from "@/src/components/table/shouldIgnoreRowClickTarget";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { experimentMessages } from "@/src/features/i18n/messages/experiments";

type ExperimentInputCellProps = {
  projectId: string;
  datasetId: string | null;
  itemId: string;
  input: string | null | undefined;
  isLoading: boolean;
  singleLine: boolean;
  t?: ReturnType<typeof useTranslation<typeof experimentMessages>>;
};

export function ExperimentInputCell({
  projectId,
  datasetId,
  itemId,
  input,
  isLoading,
  singleLine,
  t: tProp,
}: ExperimentInputCellProps) {
  const router = useRouter();
  const tOwn = useTranslation(experimentMessages);
  const t = tProp ?? tOwn;
  const href = datasetId
    ? `/project/${projectId}/datasets/${datasetId}/items/${encodeURIComponent(itemId)}`
    : null;

  return (
    // `min-h-0 overflow-hidden` keeps this wrapper bounded to the row so the
    // IO cell's own scrollport can move. Without it the wrapper grows with the
    // JSON and the row clips the rest.
    <div
      className={`group relative h-full min-h-0 w-full overflow-hidden ${href ? "cursor-pointer pr-6" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        if (!href || shouldIgnoreRowClickTarget(event.target)) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          window.open(href, "_blank", "noopener,noreferrer");
        } else {
          return router.push(href);
        }
      }}
    >
      {href ? (
        <Link
          href={href}
          aria-label={t("openDatasetItem")}
          className="text-muted-foreground hover:text-primary absolute top-1 right-1 rounded-sm p-0.5 focus-visible:ring-2 focus-visible:outline-none"
          onClick={(event) => event.stopPropagation()}
        >
          <ArrowUpRight size="base" aria-hidden />
        </Link>
      ) : null}
      {/* Display chooses text or JSON. Row height does not. */}
      {isLoading ? (
        <ConnectedIOTableCell
          isLoading
          followRowHeight={false}
          singleLine={singleLine}
        />
      ) : (
        <ConnectedIOTableCell
          data={input ?? null}
          followRowHeight={false}
          singleLine={singleLine}
        />
      )}
    </div>
  );
}
