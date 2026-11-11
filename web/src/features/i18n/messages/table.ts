import { type Messages } from "../messages";

export const tableMessages = {
  en: {
    noResults: "No results.",
    noResultsFound: "No results found.",
    total: "Total",
    rows: "Rows",
    rowsPerPage: "Rows per page",
    page: "Page",
    pageNumber: "Page number",
    pageCount: "of {count}",
    pageCurrent: "Page {page}",
    of: "of",
    firstPage: "Go to first page",
    previousPage: "Go to previous page",
    nextPage: "Go to next page",
    lastPage: "Go to last page",
    approximatePartial:
      "Approximate count over the active column filters and time range only. It excludes full-text search, score, and comment filters, so it can be noticeably higher than the number of matching rows.",
    approximate:
      "Approximate number of matching rows for the active filters and time range, estimated with ClickHouse's HyperLogLog (typically within a few percent of the true count).",
  },
  "zh-CN": {
    noResults: "暂无结果。",
    noResultsFound: "未找到结果。",
    total: "总计",
    rows: "行数",
    rowsPerPage: "每页行数",
    page: "页码",
    pageNumber: "页码",
    pageCount: "共 {count} 页",
    pageCurrent: "第 {page} 页",
    of: "共",
    firstPage: "跳转到首页",
    previousPage: "上一页",
    nextPage: "下一页",
    lastPage: "跳转到末页",
    approximatePartial:
      "此估算仅考虑当前列筛选条件和时间范围，不包括全文搜索、评分和评论筛选，因此可能明显高于实际匹配行数。",
    approximate:
      "使用 ClickHouse 的 HyperLogLog 估算当前筛选条件和时间范围内的匹配行数，误差通常在实际数量的几个百分点以内。",
  },
} satisfies Messages;
