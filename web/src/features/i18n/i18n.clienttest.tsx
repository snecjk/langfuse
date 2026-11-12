import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { localeFromCookie, localeCookie, resolveLocale } from "./locale";
import { translate, type Messages } from "./messages";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { I18nProvider, useLocale, useTranslation } from "./I18nProvider";
import { commonMessages } from "./messages/common";

describe("interface localization", () => {
  it("resolves only supported preferences and round-trips the browser cookie", () => {
    expect(resolveLocale(undefined)).toBe("zh-CN");
    expect(resolveLocale("fr")).toBe("zh-CN");
    expect(localeFromCookie("unrelated=en")).toBe("zh-CN");
    expect(localeFromCookie("langfuse-ui-locale=%E0%A4%A")).toBe("zh-CN");
    expect(localeFromCookie("langfuse-ui-locale=unsupported")).toBe("zh-CN");
    for (const locale of ["en", "zh-CN"] as const) {
      const cookie = localeCookie(locale, true);
      expect(localeFromCookie(`session=example; ${cookie}`)).toBe(locale);
      expect(cookie).toContain(
        "Path=/; SameSite=Lax; Max-Age=31536000; Secure",
      );
    }
    expect(localeCookie("en", false)).not.toContain("Secure");
  });

  it("translates, falls back to English and renders interpolated values as text", () => {
    const messages = {
      en: { greeting: "Hello, {name}", fallback: "Open {name}" },
      "zh-CN": { greeting: "你好，{name}" },
    } satisfies Messages;
    const name = '<img src=x onerror="alert(1)">';
    expect(translate("zh-CN", messages, "greeting", { name: "小明" })).toBe(
      "你好，小明",
    );
    expect(translate("zh-CN", messages, "fallback", { name })).toBe(
      `Open ${name}`,
    );
    const markup = renderToStaticMarkup(
      <p>{translate("zh-CN", messages, "greeting", { name })}</p>,
    );
    expect(markup).toContain("&lt;img");
    expect(markup).not.toContain("<img");
  });

  it("uses the message language's plural rules, including English fallback", () => {
    const messages = {
      en: { items: { one: "{count} item", other: "{count} items" } },
      "zh-CN": {},
    } satisfies Messages;
    expect(translate("zh-CN", messages, "items", { count: 1 })).toBe("1 item");
    expect(translate("en", messages, "items", { count: 2 })).toBe("2 items");
  });

  it("switches namespaces without losing drafts and remembers the browser preference", () => {
    function Form() {
      const { locale, setLocale } = useLocale();
      const t = useTranslation(commonMessages);
      const [draft, setDraft] = useState("");
      return (
        <>
          <input
            aria-label="draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button onClick={() => setLocale(locale === "en" ? "zh-CN" : "en")}>
            {t("language")}
          </button>
        </>
      );
    }
    document.cookie = "langfuse-ui-locale=; Max-Age=0; Path=/";
    const mount = () =>
      render(
        <I18nProvider initialLocale={localeFromCookie(document.cookie)}>
          <Form />
        </I18nProvider>,
      );
    const view = mount();
    fireEvent.change(screen.getByLabelText("draft"), {
      target: { value: "unsubmitted" },
    });
    fireEvent.click(screen.getByRole("button", { name: "语言" }));
    expect(
      screen.getByRole("button", { name: "Language" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("draft")).toHaveValue("unsubmitted");
    expect(document.documentElement.lang).toBe("en");
    view.unmount();
    const remounted = mount();
    expect(
      screen.getByRole("button", { name: "Language" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Language" }));
    expect(localeFromCookie(document.cookie)).toBe("zh-CN");
    remounted.unmount();
    document.cookie = "langfuse-ui-locale=; Max-Age=0; Path=/";
  });

  it("composes full messages with different word order, safe parameters and counts", () => {
    // One complete semantic message per language — not translated fragments
    // concatenated at the callsite. The two languages order the link, the
    // user-provided name and the count differently on purpose.
    const messages = {
      en: {
        inviteSummary: {
          one: "{count} teammate — {name} can join {link}",
          other: "{count} teammates — {name} can join {link}",
        },
      },
      "zh-CN": {
        inviteSummary: "{name} 可以加入{link}（{count}位成员）",
      },
    } satisfies Messages;
    // `count` participates in both plural selection and text interpolation.
    const enOne = translate("en", messages, "inviteSummary", {
      count: 1,
      name: "小明",
      link: "this workspace",
    });
    const enMany = translate("en", messages, "inviteSummary", {
      count: 3,
      name: "小明",
      link: "this workspace",
    });
    const zh = translate("zh-CN", messages, "inviteSummary", {
      count: 3,
      name: "小明",
      link: "this workspace",
    });
    expect(enOne).toBe("1 teammate — 小明 can join this workspace");
    expect(enMany).toBe("3 teammates — 小明 can join this workspace");
    expect(zh).toBe("小明 可以加入this workspace（3位成员）");
    // Word order differs across languages but every value is present verbatim.
    expect(zh.indexOf("小明")).toBeLessThan(zh.indexOf("this workspace"));

    // Interpolated values are text, never HTML.
    const unsafe = '<img src=x onerror="alert(1)">';
    const markup = renderToStaticMarkup(
      <p>
        {translate("zh-CN", messages, "inviteSummary", {
          count: 1,
          name: unsafe,
          link: "this workspace",
        })}
      </p>,
    );
    expect(markup).toContain("&lt;img");
    expect(markup).not.toContain("<img");
  });

  it("diagnoses a message parameter the caller forgot to supply", () => {
    const messages = {
      en: { greet: "Hello, {name}" },
      "zh-CN": { greet: "你好，{name}" },
    } satisfies Messages;
    // Development fails loudly and names the key and parameter.
    expect(() => translate("zh-CN", messages, "greet", {})).toThrow(
      /Missing interface translation parameter "name" for key "greet"/,
    );
  });
});
