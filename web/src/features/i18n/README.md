# Interface localization

The interface supports Simplified Chinese (`zh-CN`, default) and English (`en`).
The language preference belongs to the current browser, not the account. The
`langfuse-ui-locale` cookie lasts one year. Blocked cookies allow switching in the
current page but cannot preserve that choice across reloads.

## Ownership

- `locale.ts`: browser-safe preference parsing and cookie serialization.
- `messages.ts`: text interpolation, locale-aware plurals and English fallback.
- `I18nProvider.tsx`: per-app language state; switching preserves the child tree.
- `messages/*.ts`: independently imported feature namespaces. Do not add a barrel
  importing every namespace into the app shell.

## Adding messages

Define a namespace with an English object and a matching `zh-CN` object, using
`satisfies Messages`. Import that namespace at the owning feature and call
`useTranslation(namespace)`. Translation keys are inferred from English entries.
Use stable semantic keys, not English source sentences. Use `{name}` parameters
with identical names in both languages. Messages with counts use objects with
`one`/`other` templates and a numeric `count` parameter (`other` is mandatory).
Use Chinese plural templates rather than assuming English plural rules.

Missing Chinese messages fall back to English for resilience, but every migrated
namespace must be complete before release. Unknown keys throw in development;
production displays a generic readable error and logs the key without parameters.
Render translations as React text. Never use `dangerouslySetInnerHTML` for them.

Do not translate user data, prompt bodies, model IDs, URLs, API fields, enum values
or machine exports. Separate translated labels from stable IDs. Translate static
configuration at render time; don't persist translated labels in business state.
Pass locale explicitly to formatters without changing timezone, currency or values.

Malformed or blocked preference cookies are expected browser states and are not
reported to Sentry. Language preference changes do not emit product analytics;
the provider remains independent of authentication and analytics initialization.

## Terminology

| English     | Simplified Chinese |
| ----------- | ------------------ |
| Trace       | 追踪               |
| Observation | 观察               |
| Prompt      | 提示词             |
| Dataset     | 数据集             |
| Score       | 评分               |

## Checks

From the repository root (the example environment is only for isolated tests):

```bash
pnpm --filter web exec tsx scripts/i18n/check-translations.ts
pnpm exec dotenv -e .env.dev.example -- pnpm --filter web run test-client src/features/i18n/i18n.clienttest.tsx
```

The resource check loads every namespace and rejects missing translations, empty
messages and inconsistent interpolation parameters. The client suite verifies
preference parsing, English fallback, text safety, plural rules and draft
preservation during switching. Browser checks must separately cover SSR,
navigation, login callbacks and responsive layouts after app integration.
