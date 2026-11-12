import { parseS3Uri } from "@langfuse/shared";
import Image from "next/image";
import { useId, useState, type SyntheticEvent } from "react";

import { MediaFileCard } from "@/src/components/MediaFileCard/MediaFileCard";
import { Dialog } from "@/src/components/design-system/Dialog/Dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { classifyMediaValue } from "@/src/components/ui/media/mediaUtils";
import { useTranslation } from "@/src/features/i18n/I18nProvider";
import { enterpriseMessages } from "@/src/features/i18n/messages/enterprise";

export function TestMediaObjectDialog({
  isPending,
  onTest,
}: {
  isPending: boolean;
  onTest: (uri: string) => Promise<string | null>;
}) {
  const [uri, setUri] = useState("");
  const [preview, setPreview] = useState<{
    signedUrl: string;
    uri: string;
  } | null>(null);
  const formId = useId();
  const inputId = useId();
  const t = useTranslation(enterpriseMessages);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submittedUri = uri.trim();
    setPreview(null);
    const signedUrl = await onTest(submittedUri);
    setPreview(signedUrl ? { signedUrl, uri: submittedUri } : null);
  };

  return (
    <Dialog
      closeOnInteractionOutside
      title={t("externalMediaStorageTestTitle")}
      actions={[
        {
          disabled: !uri.trim(),
          form: formId,
          label: t("externalMediaStorageTest"),
          loading: isPending,
          type: "submit",
        },
      ]}
    >
      <Dialog.Body>
        <p className="text-muted-foreground text-sm">
          {t("externalMediaStorageTestHelp")}
        </p>
        <form id={formId} className="grid gap-2" onSubmit={handleSubmit}>
          <Label htmlFor={inputId}>{t("externalMediaStorageS3Uri")}</Label>
          <Input
            id={inputId}
            value={uri}
            placeholder="s3://bucket/media/image.png"
            disabled={isPending}
            onChange={(event) => {
              setUri(event.target.value);
              setPreview(null);
            }}
          />
        </form>
        {preview ? (
          <MediaObjectPreview
            key={preview.signedUrl}
            signedUrl={preview.signedUrl}
            uri={preview.uri}
          />
        ) : null}
      </Dialog.Body>
    </Dialog>
  );
}

function MediaObjectPreview({
  signedUrl,
  uri,
}: {
  signedUrl: string;
  uri: string;
}) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const t = useTranslation(enterpriseMessages);
  const descriptor = classifyMediaValue(uri);
  const contentType = descriptor?.contentType ?? "application/octet-stream";
  const fileName =
    parseS3Uri(uri)?.key.split("/").pop() || "external media object";
  const mediaType = contentType.split("/")[0];

  const previewContent = (() => {
    switch (mediaType) {
      case "image":
        return (
          <Image
            className="max-h-80 max-w-full rounded border object-contain"
            src={signedUrl}
            alt={t("externalMediaStoragePreview")}
            width={640}
            height={360}
            unoptimized
            onError={() => setHasLoadError(true)}
          />
        );
      case "audio":
        return (
          <audio
            aria-label={t("externalMediaStoragePreview")}
            controls
            className="w-full"
            preload="metadata"
            onError={() => setHasLoadError(true)}
            src={signedUrl}
          />
        );
      case "video":
        return (
          <video
            aria-label={t("externalMediaStoragePreview")}
            controls
            className="w-full"
            preload="metadata"
            playsInline
            onError={() => setHasLoadError(true)}
            src={signedUrl}
          />
        );
      default:
        return (
          <MediaFileCard
            contentType={contentType}
            fileName={fileName}
            onClick={() =>
              window.open(signedUrl, "_blank", "noopener,noreferrer")
            }
          />
        );
    }
  })();

  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      <p className="text-sm font-bold">{t("externalMediaStoragePreview")}</p>
      {previewContent}
      {hasLoadError ? (
        <p className="text-destructive text-sm">
          {t("externalMediaStoragePreviewLoadFailed")}
        </p>
      ) : null}
    </div>
  );
}
