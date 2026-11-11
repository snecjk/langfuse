import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PageTabs } from "./PageTabs";
import { I18nProvider, useLocale } from "@/src/features/i18n/I18nProvider";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    href: { pathname: string };
    onClick?: () => void;
    className?: string;
  }) => (
    <a
      href={href.pathname}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
      }}
    >
      {children}
    </a>
  ),
}));

vi.mock("next/router", () => ({
  useRouter: () => ({ query: { projectId: "p1" } }),
}));

describe("PageTabs", () => {
  it("switches static labels without changing destinations or user-provided labels", () => {
    function Example() {
      const { setLocale } = useLocale();
      return (
        <>
          <button onClick={() => setLocale("zh-CN")}>Switch language</button>
          <PageTabs
            activeTab="traces"
            tabs={[
              {
                value: "traces",
                label: "Traces",
                labelKey: "traces",
                href: "/project/p1/traces",
              },
              { value: "custom", label: "Traces", href: "/project/p1/custom" },
            ]}
          />
        </>
      );
    }
    render(
      <I18nProvider initialLocale="en">
        <Example />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Switch language" }));
    expect(screen.getByRole("link", { name: "追踪" })).toHaveAttribute(
      "href",
      "/project/p1/traces",
    );
    expect(screen.getByRole("link", { name: "Traces" })).toHaveAttribute(
      "href",
      "/project/p1/custom",
    );
  });
  it("fires onClick on a tab that also has an href", () => {
    const onAnalyticsClick = vi.fn();
    render(
      <I18nProvider initialLocale="en">
        <PageTabs
          activeTab="results"
          tabs={[
            {
              value: "results",
              label: "Results",
              href: "/project/p1/experiments/results",
            },
            {
              value: "analytics",
              label: "Analytics",
              href: "/project/p1/experiments/analytics",
              onClick: onAnalyticsClick,
            },
          ]}
        />
      </I18nProvider>,
    );

    const analytics = screen.getByRole("link", { name: "Analytics" });
    expect(analytics).toHaveAttribute(
      "href",
      "/project/p1/experiments/analytics",
    );
    fireEvent.click(analytics);
    expect(onAnalyticsClick).toHaveBeenCalledTimes(1);
  });
});
