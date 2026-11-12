import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider, useLocale } from "../../I18nProvider";
import { PaginationBar, type PaginationBarState } from "./PaginationBar";

describe("localized pagination", () => {
  it("preserves an unsubmitted page number across language changes and navigates with unchanged indexes", () => {
    const changed = vi.fn();
    function Harness() {
      const { setLocale } = useLocale();
      const [state, setState] = useState<PaginationBarState>({
        pageIndex: 0,
        pageSize: 10,
      });
      return (
        <>
          <button onClick={() => setLocale("zh-CN")}>简体中文</button>
          <PaginationBar
            mode="offset"
            totalCount={100}
            state={state}
            onChange={(next) => {
              changed(next);
              setState(next);
            }}
          />
        </>
      );
    }
    render(
      <I18nProvider initialLocale="en">
        <Harness />
      </I18nProvider>,
    );
    fireEvent.change(screen.getByRole("spinbutton", { name: "Page number" }), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "简体中文" }));
    expect(screen.getByRole("spinbutton", { name: "页码" })).toHaveValue(3);
    expect(changed).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    expect(changed).toHaveBeenCalledExactlyOnceWith({
      pageIndex: 1,
      pageSize: 10,
    });
  });
});
