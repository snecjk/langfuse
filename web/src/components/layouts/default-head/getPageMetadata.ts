import { type Locale } from "@/src/features/i18n/locale";
import { translate } from "@/src/features/i18n/messages";
import { metadataMessages } from "@/src/features/i18n/messages/metadata";
import {
  type CloudRegionName,
  isRegionProduction,
} from "@/src/features/organizations/cloudRegions";

/**
 * Every region serves the same sign-in page, and the sign-in page is reached
 * with a `targetPath` query from shared traces. Google therefore sees many
 * URLs for one page and picks one of them; the canonical names that one page
 * so the choice is not left to the crawler.
 */
const CANONICAL_CLOUD_ORIGIN = "https://cloud.langfuse.com";

type PageMetadata = {
  title: string;
  description?: string;
  canonicalUrl?: string;
};

type MetadataKeys = {
  title: keyof typeof metadataMessages.en;
  description?: keyof typeof metadataMessages.en;
};

const cloudAuthPages: Record<string, MetadataKeys> = {
  "/auth/sign-in": {
    title: "signInCloudTitle",
    description: "signInCloudDescription",
  },
  "/auth/sign-up": {
    title: "signUpCloudTitle",
    description: "signUpCloudDescription",
  },
};

const selfHostedAuthPages: Record<string, MetadataKeys> = {
  "/auth/sign-in": {
    title: "signInTitle",
    description: "signInDescription",
  },
  "/auth/sign-up": {
    title: "signUpTitle",
    description: "signUpDescription",
  },
};

// Reached from e-mail links, not from search, so no region-specific copy.
// ResetPasswordPage swaps in "Set password" after hydration when the session
// shows the user has no password yet; that cannot be known from the route.
const passwordPages: Record<string, MetadataKeys> = {
  "/auth/reset-password": {
    title: "resetTitle",
    description: "resetDescription",
  },
  "/auth/setup-password": {
    title: "setupTitle",
    description: "setupDescription",
  },
};

const defaultMetadata: PageMetadata = { title: "Langfuse" };

/**
 * Metadata that must be in the server-rendered HTML. Pages own their own
 * `<Head>`, but the auth pages render behind the session gate and never reach
 * the server response, so crawlers only see what is emitted here.
 *
 * `pathname` is the Next.js route (no query string), which is what makes the
 * canonical drop `?targetPath=`.
 */
export function getPageMetadata(
  pathname: string,
  region: CloudRegionName | undefined,
  locale: Locale = "en",
): PageMetadata {
  const keys =
    (region ? cloudAuthPages : selfHostedAuthPages)[pathname] ??
    passwordPages[pathname];
  if (!keys) return defaultMetadata;
  const metadata: PageMetadata = {
    title: translate(locale, metadataMessages, keys.title),
    description: keys.description
      ? translate(locale, metadataMessages, keys.description)
      : undefined,
  };
  if (!region || !isRegionProduction(region)) return metadata;
  return { ...metadata, canonicalUrl: `${CANONICAL_CLOUD_ORIGIN}${pathname}` };
}
