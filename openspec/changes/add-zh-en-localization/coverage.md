# Localization checkpoint

This is a partial migration, not a declaration of full first-party UI coverage.
Task checkboxes remain open when their module-wide or browser acceptance criteria
are not satisfied. The current priority is visible translated content, followed
by full runtime verification.

## Implemented surfaces

- Authentication: sign-in, sign-up, password setup/reset, verification email
  actions, provider badges, privacy notice and cloud-region picker.
- Navigation: primary routes, group labels, account menus, theme labels and
  explicitly keyed page tabs. Arbitrary project, organization and tab names are
  not translated.
- Common tables: pagination, empty results, search/filter toolbar, selection
  banner and auto-refresh. The design-system PaginationBar stays context-free;
  application consumers use a translated wrapper with explicit labels.
- Tracing: trace and observation list columns and principal actions, detail
  headers, navigation and principal detail tabs. IDs/accessors and JSON remain
  unchanged.
- Prompts/datasets: list-page titles, directory table columns, principal create,
  import/export and delete actions, and selected detail/metrics pages.
- Evaluation: scores list/analysis empty state, v2 evaluator/rule pages and
  tables, legacy evaluator table, annotation queue list and principal item
  controls.
- Settings: organization/project/account entry pages, rename and host settings,
  delete/transfer project dialogs and account actions.
- Locale-aware relative dates and local-time tooltip labels; ISO values and
  timezone semantics are unchanged.

## Known remaining content

- Auth error, enterprise SSO-required/initiation and Hugging Face-specific pages.
- Independent command menus, sidebar notifications and onboarding components.
- Detail body controls, JSON-viewer toolbars and less common tracing actions.
- Prompt/dataset creation/editing/import dialogs, folder operations and remaining
  item/run/compare tables.
- Evaluator editors, templates and dialogs, nested badges/filter descriptions,
  analysis chart internals and remaining annotation form explanations.
- API/LLM key tables, member/invite forms, integration-specific settings and
  enterprise retention/SSO/billing/audit subpages.
- Remaining shared filters, column visibility controls, export dialogs, date
  pickers and numerical/chart formatting call sites.

## Runtime checkpoint

- Existing Docker port 3000 was observed serving a prebuilt release, with no
  serialized UI locale. It does not load this checkout's changes.
- A separate source-built Next development server was started on port 3100
  using the development example environment with NEXTAUTH_URL matching 3100.
- Four concurrent sign-in requests with mixed zh-CN/en cookies returned HTTP
  200. Their translated title, HTML lang and serialized page locale matched each
  request; the authentication page props were retained.
- Native browser preview timed out. Full hydration, keyboard/mobile operation,
  authenticated seeded flows and production cache/bundle checks are not signed
  off by these HTTP checks.

## Checks and constraints

- Consolidated core/date/auth/tab/toolbar/pagination/score/annotation/settings
  regressions passed: `Test Files 13 passed (13)` / `Tests 107 passed (107)`.
- Translation-resource validation verified 654 bilingual entries at this
  checkpoint; this count is not a percentage of total application coverage.
- Web typecheck completed with exit 0. Web lint was rerun after fixing warnings;
  actual command summaries are recorded in chat, not inferred from Turbo cache.
- Full forced monorepo lint cannot complete without Cargo: ai-gateway lint exits
  127 (`cargo: command not found`), `Tasks: 0 successful, 4 total`,
  `Cached: 0 cached, 4 total`.
- Knip exits 1 on dependency/binary findings outside the changed UI files:
  worker's @ag-ui/client, native's @napi-rs/cli and the vitest/napi binaries.
- The existing delete-project Storybook scenario now covers Chinese labels and
  the unchanged confirmation token, but execution requires the missing Chromium
  headless shell. It is not reported as passing.
- Production build, client-bundle scan and full seeded browser validation remain
  deferred; no database seed, migration or user-data rewrite was performed.
