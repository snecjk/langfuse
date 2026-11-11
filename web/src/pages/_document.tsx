import NextDocument, {
  Html,
  Head,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from "next/document";
import { plexMono } from "@/src/styles/fonts";
import { localeFromCookie, type Locale } from "@/src/features/i18n/locale";

export default function Document({
  uiLocale,
}: DocumentInitialProps & { uiLocale: Locale }) {
  return (
    // next-themes mutates class/style on <html> before hydration; suppress the
    // expected mismatch one level deep (React 19 logs it and can re-render).
    <Html
      lang={uiLocale}
      suppressHydrationWarning
      className={plexMono.variable}
    >
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (context: DocumentContext) => ({
  ...(await NextDocument.getInitialProps(context)),
  uiLocale: localeFromCookie(context.req?.headers.cookie),
});
