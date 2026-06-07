## Final Prompt
<taskname="Refactor Plan"/>
<task>Plan and execute a behavior-preserving refactor of Earthlight in small ordered implementation items. Prioritize shared action/client utilities, import-boundary clarity, download-helper consolidation, broken custom schedule validation, and safe legacy cleanup. Do not perform larger design/product refactors unless a very small safe slice falls naturally out of these changes.</task>

<architecture>
- Earthlight is a Next.js App Router app using Clerk auth, Vercel-style Node runtime, Neon serverless Postgres, Drizzle ORM, server actions, Zod validation, and JSONB snapshots for scenarios/ROI/reports. Current Vercel + Neon + Drizzle + Clerk stack is acceptable; do not migrate to Edge or swap ORM.
- Route pages under `src/app/(app)` validate params, call feature queries, and render client feature components.
- Server actions live under `src/features/{projects,scenarios,roi,reports}/actions.ts`; these currently duplicate action result helpers, validation-error helpers, and path revalidation patterns.
- Client feature components under `src/features/**/components` and active top-level panels in `src/components` duplicate action-error formatting and browser download code.
- Client-safe domain constants and schemas live in `src/domain/**`; `src/server/domain/constants.ts` and `src/server/validation/{lighting,report,roi}.ts` are aliases/re-exports, creating multiple canonical import paths.
- Schedule generation uses legacy `src/utils/lightingStandards.ts` and `src/utils/scheduleGenerator.ts`; persisted schedule validation is in `src/domain/validation/lighting.ts` and server actions use it via aliases.
</architecture>

<selected_context>
- `package.json`: verification scripts are `npm run lint`, `npm run typecheck`, and `npm run build`; package uses Next 16, React 18, Drizzle, Neon, Clerk, Zod.
- `src/features/projects/actions.ts`: defines `ActionResult<T>`, local `validationError`, and `revalidateProjectPaths`; project CRUD currently owns the neutral action type imported by unrelated features.
- `src/features/scenarios/actions.ts`: imports `ActionResult` from projects; has local `validationError`, `revalidateScenarioPaths`, preset/custom/import/quick-save/update/delete actions; `createScenarioFromCustomInputs` calls `customScheduleInputSchema` then `generateCustomSchedule`.
- `src/features/roi/actions.ts`, `src/features/reports/actions.ts`: import `ActionResult` from projects and duplicate `validationError`; both have similar revalidation helpers.
- `src/features/projects/components/ProjectListClient.tsx`, `ProjectWorkspaceClient.tsx`, `src/features/scenarios/components/ScenarioFormClient.tsx`, `src/features/roi/components/ROICalculatorClient.tsx`, `src/features/reports/components/ReportBuilderClient.tsx`, `src/components/ExportImportPanel.tsx`: each has duplicated `describeActionError(result)` formatting that joins `result.message` plus `field: message` lines with newline separators. Preserve exact formatting.
- `src/components/ExportImportPanel.tsx`, `src/features/reports/components/ReportViewer.tsx`, `src/components/ProfessionalIntegrations.tsx`: duplicate Blob/object URL/anchor download helpers; preserve filenames, MIME types, and content.
- `src/domain/validation/lighting.ts`: `customScheduleInputSchema` validates numeric bounds and `useSunTimes` location, but does not reject `sleepTime <= wakeTime`; add refinement unless implementing overnight schedules. Existing UI defaults and constraints assume same-day wake 6 / sleep 22.
- `src/utils/scheduleGenerator.ts`: `generateCustomSchedule` computes `userActiveHoursDuration = adjustedSleepTime - adjustedWakeTime`; negative duration can generate invalid/non-monotonic points before normalization. This is the clearly broken behavior to guard at schema/action boundary.
- `src/domain/constants.ts` and `src/server/domain/constants.ts`: server alias re-exports client-safe constants. `ProjectListClient` currently imports from `@/server/domain/constants`; canonical client/shared imports should use `@/domain/constants`.
- `src/domain/validation/{lighting,report,roi}.ts` and `src/server/validation/{lighting,report,roi}.ts`: server aliases re-export client-safe schemas. Client/shared and non-server-only feature code should prefer `@/domain/validation/*`; keep aliases if still used by server-only files or if deletion is not definitely safe.
- `src/server/validation/project.ts` and `src/server/validation/scenario.ts`: server-specific schemas still import constants via `@/server/domain/constants`; these may be switched to `@/domain/constants` if pursuing canonical imports, but do not remove server schema files.
- `src/components/LightingSchedule.tsx`, `CustomizationPanel.tsx`, `FinalReport.tsx`, `ROICalculator.tsx`: selected for legacy cleanup. Search found no active imports of these component module paths; `LightingSchedule` internally imports `CustomizationPanel`; `FinalReport` appears unreferenced; `ROICalculator.tsx` is only a thin re-export to `ROICalculatorClient`.
- `src/lib/utils.ts`, `src/hooks/*`, `src/features/export/serializers.ts`, active route/page/layout files, auth/db/schema/migrations, and active workspace/report/project components are selected as supporting context and regression surface.
</selected_context>

<relationships>
- `projects/actions.ts::ActionResult` -> imported by `scenarios/actions.ts`, `roi/actions.ts`, `reports/actions.ts`; extract this to a neutral shared module before changing imports.
- Server actions -> local `validationError(message, zodError)` -> `{ ok:false, message, fieldErrors:error.flatten().fieldErrors }`; centralize without changing returned shapes or messages.
- Client components -> local `describeActionError` -> toasts; centralize without changing newline output or field label formatting.
- `ScenarioFormClient.handleCustomSave()` -> `createScenarioFromCustomInputs()` -> `customScheduleInputSchema` -> `generateCustomSchedule()` -> `lightingScheduleSchema` -> `createScenario()` -> JSONB persistence.
- `ProjectWorkspaceClient` composes `ScenarioFormClient`, `ExportImportPanel`, `ScheduleVisualizer`, `ROICalculatorClient`, `ReportBuilderClient`, `ReportViewer`, `ResearchInfo`, `LightSourceComparison`, and `ProfessionalIntegrations`; treat it as active regression surface.
- Report/ROI/scenario queries/actions validate persisted JSONB with schemas from validation modules; import-boundary cleanup must preserve schema identities and inferred types.
</relationships>

<ordered_work_items>
1. Shared action infrastructure and client error formatting.
   - Create a neutral shared module for `ActionResult`, Zod-like `validationError`, and any simple action response helpers that can be extracted without changing behavior. Likely location: `src/features/shared/actions.ts` or `src/lib/actions.ts`; choose a path consistent with existing import style.
   - Update project/scenario/roi/report actions to import the neutral type/helper. Preserve all current user-facing messages and returned object shapes.
   - Create a shared client formatter for action errors, likely `src/features/shared/actionErrors.ts` or `src/lib/action-errors.ts`, and replace duplicated `describeActionError` in the six active components. Preserve exact newline formatting: `[result.message, ...fieldMessages].join("\n")` where field messages are `${field}: ${message}`.
   - Verification: `ActionResult` no longer imported from `@/features/projects/actions` outside project action consumers; no local `describeActionError` duplicates remain in active components; `npm run lint` and `npm run typecheck` pass.

2. Boundary cleanup, download helper consolidation, and broken custom schedule validation.
   - Switch client/shared imports from server aliases to canonical client-safe imports: especially `ProjectListClient` to `@/domain/constants`, and feature query/normalizer/action imports from `@/server/validation/{lighting,report,roi}` to `@/domain/validation/{lighting,report,roi}` where no server-only behavior is involved. Keep `src/server/validation/project.ts` and `scenario.ts`; do not delete aliases unless confirmed unused.
   - Extract a browser-only download helper for text/blob downloads used by `ExportImportPanel`, `ReportViewer`, and `ProfessionalIntegrations`. Preserve each caller's generated content, MIME type, filename, click behavior, and URL revocation behavior if present.
   - Add a `customScheduleInputSchema` refinement requiring `sleepTime > wakeTime` for current same-day schedule semantics. Use a field-specific issue path such as `sleepTime` if practical so existing action error formatting surfaces it predictably. Do not implement overnight schedule support in this slice.
   - Verification: exact search for `@/server/domain/constants` and `@/server/validation/{lighting,report,roi}` shows only intentional server-only alias usage or none; download content/filenames unchanged by inspection; invalid custom input with `sleepTime <= wakeTime` returns an `ok:false` validation result before schedule generation; `npm run lint`, `npm run typecheck`, and preferably `npm run build` pass.

3. Safe legacy surface cleanup.
   - Confirm again that `src/components/LightingSchedule.tsx`, `CustomizationPanel.tsx`, `FinalReport.tsx`, and `ROICalculator.tsx` have no active imports/usages. Current discovery found no active imports; `LightingSchedule` only references `CustomizationPanel` internally, and `ROICalculator.tsx` is a thin re-export.
   - Delete only components proven unused. If any path is externally referenced or uncertain, isolate under a clearly named legacy location instead of changing behavior.
   - Avoid deleting active top-level panels: `ExportImportPanel`, `ScheduleVisualizer`, `ResearchInfo`, `LightSourceComparison`, and `ProfessionalIntegrations` are used by `ProjectWorkspaceClient`.
   - Verification: repo-wide exact searches for those module paths and component names; `npm run lint`, `npm run typecheck`, and `npm run build` pass.
</ordered_work_items>

<deferred_refactors>
- Splitting `ProjectWorkspaceClient` and `scenarios/actions.ts` is worthwhile but broader; do not combine with the shared-helper extraction unless a tiny, low-risk helper naturally falls out.
- ROI payback semantics when savings are zero, JSONB schema typing, fake professional integration API contracts, route param helper extraction, and stricter TS/ESLint are product/design or larger verification decisions. Document them if encountered, but defer implementation in this pass.
</deferred_refactors>

<ambiguities>
- No uncommitted diff exists at discovery time; this is a planned refactor from the current codebase, not a patch review.
- There is no test suite visible in `package.json`; verification relies on lint/typecheck/build unless the implementer adds focused tests or manual validation.
- Server alias files may remain useful for server-only modules; the goal is canonical import clarity, not necessarily deletion.
</ambiguities>

## Selection
- Files: 71 total (71 full)
- Total tokens: 80200 (Auto view)
- Token breakdown: full 80200

### Files
### Selected Files
/Users/erikschneider/Library/Application Support/RepoPrompt/Workspaces/Workspace-Earthlight-DDDF350C-C017-43C5-86B9-3C86BDF6B614/_git_data/
└── repos/
    └── earthlight-6bfe96d9/
        └── 2026-06-07/
            └── 1018/
                └── MAP.txt — 598 tokens (full)
/Volumes/HomeX/erikschneider/earthlight/
├── docs/
│   └── investigations/
│       └── projects-server-error-on-vercel-2026-06-07.md — 2,162 tokens (full)
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── projects/
│   │   │   │   ├── [projectId]/
│   │   │   │   │   ├── scenarios/
│   │   │   │   │   │   └── [scenarioId]/
│   │   │   │   │   │       └── page.tsx — 428 tokens (full)
│   │   │   │   │   └── page.tsx — 341 tokens (full)
│   │   │   │   └── page.tsx — 343 tokens (full)
│   │   │   ├── reports/
│   │   │   │   └── [reportId]/
│   │   │   │       └── page.tsx — 210 tokens (full)
│   │   │   └── layout.tsx — 265 tokens (full)
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx — 68 tokens (full)
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx — 68 tokens (full)
│   │   ├── globals.css — 662 tokens (full)
│   │   ├── layout.tsx — 176 tokens (full)
│   │   ├── not-found.tsx — 199 tokens (full)
│   │   ├── page.tsx — 847 tokens (full)
│   │   └── providers.tsx — 144 tokens (full)
│   ├── components/
│   │   ├── CustomizationPanel.tsx — 3,328 tokens (full)
│   │   ├── ExportImportPanel.tsx — 1,478 tokens (full)
│   │   ├── FinalReport.tsx — 1,600 tokens (full)
│   │   ├── LightSourceComparison.tsx — 6,446 tokens (full)
│   │   ├── LightingSchedule.tsx — 1,674 tokens (full)
│   │   ├── ProfessionalIntegrations.tsx — 5,150 tokens (full)
│   │   ├── ROICalculator.tsx — 30 tokens (full)
│   │   ├── ResearchInfo.tsx — 904 tokens (full)
│   │   └── ScheduleVisualizer.tsx — 1,281 tokens (full)
│   ├── domain/
│   │   ├── roi/
│   │   │   ├── assumptions.ts — 239 tokens (full)
│   │   │   └── calculator.ts — 658 tokens (full)
│   │   ├── validation/
│   │   │   ├── lighting.ts — 1,092 tokens (full)
│   │   │   ├── report.ts — 658 tokens (full)
│   │   │   └── roi.ts — 646 tokens (full)
│   │   └── constants.ts — 151 tokens (full)
│   ├── features/
│   │   ├── export/
│   │   │   └── serializers.ts — 965 tokens (full)
│   │   ├── projects/
│   │   │   ├── components/
│   │   │   │   ├── ProjectListClient.tsx — 3,032 tokens (full)
│   │   │   │   └── ProjectWorkspaceClient.tsx — 4,068 tokens (full)
│   │   │   ├── actions.ts — 867 tokens (full)
│   │   │   └── queries.ts — 730 tokens (full)
│   │   ├── reports/
│   │   │   ├── components/
│   │   │   │   ├── ReportBuilderClient.tsx — 1,171 tokens (full)
│   │   │   │   └── ReportViewer.tsx — 2,663 tokens (full)
│   │   │   ├── actions.ts — 789 tokens (full)
│   │   │   ├── normalizers.ts — 925 tokens (full)
│   │   │   └── queries.ts — 879 tokens (full)
│   │   ├── roi/
│   │   │   ├── components/
│   │   │   │   └── ROICalculatorClient.tsx — 2,757 tokens (full)
│   │   │   ├── actions.ts — 958 tokens (full)
│   │   │   └── queries.ts — 760 tokens (full)
│   │   └── scenarios/
│   │       ├── components/
│   │       │   └── ScenarioFormClient.tsx — 3,634 tokens (full)
│   │       ├── actions.ts — 3,167 tokens (full)
│   │       ├── displaySchedule.ts — 689 tokens (full)
│   │       └── queries.ts — 1,167 tokens (full)
│   ├── hooks/
│   │   ├── use-mobile.tsx — 148 tokens (full)
│   │   └── use-toast.ts — 1,026 tokens (full)
│   ├── lib/
│   │   └── utils.ts — 43 tokens (full)
│   ├── server/
│   │   ├── auth/
│   │   │   ├── authorization.ts — 553 tokens (full)
│   │   │   └── identity.ts — 632 tokens (full)
│   │   ├── db/
│   │   │   ├── migrations/
│   │   │   │   ├── meta/
│   │   │   │   │   ├── 0000_snapshot.json — 4,739 tokens (full)
│   │   │   │   │   └── _journal.json — 54 tokens (full)
│   │   │   │   └── 0000_shiny_sentinel.sql — 1,793 tokens (full)
│   │   │   ├── index.ts — 113 tokens (full)
│   │   │   └── schema.ts — 1,857 tokens (full)
│   │   ├── domain/
│   │   │   └── constants.ts — 9 tokens (full)
│   │   ├── lighting/
│   │   │   └── sunTimes.ts — 506 tokens (full)
│   │   └── validation/
│   │       ├── lighting.ts — 12 tokens (full)
│   │       ├── project.ts — 432 tokens (full)
│   │       ├── report.ts — 11 tokens (full)
│   │       ├── roi.ts — 10 tokens (full)
│   │       └── scenario.ts — 900 tokens (full)
│   ├── utils/
│   │   ├── lightingStandards.ts — 1,783 tokens (full)
│   │   └── scheduleGenerator.ts — 2,694 tokens (full)
│   └── proxy.ts — 175 tokens (full)
├── drizzle.config.ts — 466 tokens (full)
├── eslint.config.js — 173 tokens (full)
├── next.config.mjs — 30 tokens (full)
├── package.json — 753 tokens (full)
└── tsconfig.json — 221 tokens (full)


---

## Generated Plan

## Chat Send ✅
- **Chat**: `refactor-plan-12794C` | **Mode**: plan

### Response
## Summary

This should be a **targeted behavior-preserving refactor**, not a broader redesign. The current Next.js App Router + Clerk + Neon + Drizzle + Zod stack is appropriate for Vercel Node runtime; do **not** migrate runtime, ORM, auth, or persistence. The work should extract duplicated action/client/download helpers, clarify client-safe import boundaries, add one intentionally behavioral validation fix for invalid custom schedules, and delete only legacy components proven unused.

> Note: I could not run `bd quickstart` or modify files because the prompt explicitly says text-only mode and no tool calls are permitted. Before implementation, create a bead for this refactor and track each ordered item there.

---

## Current-state analysis

### Architecture and data flow

- Routes under `src/app/(app)` are server components with `runtime = "nodejs"`.
- Auth is enforced twice:
  - `src/proxy.ts` via Clerk middleware for `/projects`, `/reports`, `/api`.
  - `src/app/(app)/layout.tsx` via `await auth.protect()`.
- Feature pages call server-side query modules:
  - `/projects` → `listProjectsForCurrentIdentity()`
  - `/projects/[projectId]` → project + latest scenario queries
  - `/projects/[projectId]/scenarios/[scenarioId]` → project/scenario/ROI/report queries
  - `/reports/[reportId]` → report snapshot query
- Server actions live in feature modules and return a shared shape, currently owned by `projects/actions.ts`:

```ts
type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
```

This ownership is wrong: `scenarios`, `roi`, and `reports` import a neutral action result type from the projects feature.

### Repeated logic

Duplicated server action logic:

- `validationError(...)` exists in:
  - `src/features/projects/actions.ts`
  - `src/features/scenarios/actions.ts`
  - `src/features/roi/actions.ts`
  - `src/features/reports/actions.ts`

Duplicated client action error formatting exists in:

- `ProjectListClient.tsx`
- `ProjectWorkspaceClient.tsx`
- `ScenarioFormClient.tsx`
- `ROICalculatorClient.tsx`
- `ReportBuilderClient.tsx`
- `ExportImportPanel.tsx`

The exact current formatting must be preserved:

```ts
[result.message, ...fieldMessages].join("\n")
```

with field messages shaped as:

```ts
`${field}: ${message}`
```

Duplicated browser download behavior exists in:

- `ExportImportPanel.tsx`
- `ReportViewer.tsx`
- `ProfessionalIntegrations.tsx`

Each creates a `Blob`, object URL, anchor, clicks it, removes anchor, and revokes the URL.

### Import-boundary issue

Client-safe constants and validation schemas live under `src/domain/**`, but several files import through server aliases:

- `@/server/domain/constants`
- `@/server/validation/lighting`
- `@/server/validation/report`
- `@/server/validation/roi`

These aliases are not harmful at runtime, but they blur the client/server boundary and make it easier to accidentally import server-only code into client bundles later.

### Broken custom schedule validation

`customScheduleInputSchema` currently validates numeric bounds but allows:

```ts
sleepTime <= wakeTime
```

`generateCustomSchedule()` assumes same-day schedules and computes:

```ts
userActiveHoursDuration = adjustedSleepTime - adjustedWakeTime
```

A negative or zero duration can produce invalid or nonsensical generated points. Do **not** implement overnight schedule semantics in this slice; reject invalid same-day inputs at schema/action boundary.

---

## Design

### 1. Shared action infrastructure

#### New module: `src/features/shared/actions.ts`

Kind: pure shared TypeScript module.

Purpose:

- Own the cross-feature `ActionResult<T>` type.
- Own shared Zod-like validation error conversion.
- Avoid making `projects/actions.ts` the accidental shared action package.

Exports:

```ts
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export type ZodLikeError = {
  flatten: () => { fieldErrors: Record<string, string[]> };
};

export function validationError(
  message: string,
  error: ZodLikeError,
): ActionResult<never>;
```

Behavior:

- Must return exactly:

```ts
{
  ok: false,
  message,
  fieldErrors: error.flatten().fieldErrors,
}
```

No thrown errors, no logging, no message changes.

#### Updated imports

- `projects/actions.ts`
- `scenarios/actions.ts`
- `roi/actions.ts`
- `reports/actions.ts`

must import `ActionResult` and `validationError` from `@/features/shared/actions`.

Remove local `validationError` helpers from those files.

---

### 2. Shared client action-error formatter

#### New module: `src/features/shared/actionErrors.ts`

Kind: pure client-safe formatting utility.

Purpose:

- Replace duplicate local `describeActionError`.
- Preserve exact toast description output.

Signature:

```ts
export function describeActionError(result: {
  message: string;
  fieldErrors?: Record<string, string[]>;
}): string;
```

Implementation contract:

- Iterate `Object.entries(result.fieldErrors ?? {})`.
- Convert each message to `${field}: ${message}`.
- Return `[result.message, ...fieldMessages].join("\n")`.

Callers:

- `src/features/projects/components/ProjectListClient.tsx`
- `src/features/projects/components/ProjectWorkspaceClient.tsx`
- `src/features/scenarios/components/ScenarioFormClient.tsx`
- `src/features/roi/components/ROICalculatorClient.tsx`
- `src/features/reports/components/ReportBuilderClient.tsx`
- `src/components/ExportImportPanel.tsx`

No toast title, variant, or control flow changes.

---

### 3. Canonical client-safe imports

Use `src/domain/**` as canonical for shared constants/schemas.

#### Constants

Change imports from `@/server/domain/constants` to `@/domain/constants` in:

- `src/features/projects/components/ProjectListClient.tsx`
- `src/server/db/schema.ts`
- `src/server/validation/project.ts`
- `src/server/validation/scenario.ts`

Keep `src/server/domain/constants.ts` as a compatibility alias unless a repo-wide search proves it unused and deletion is explicitly desired later.

#### Validation schemas

Change imports of client-safe schemas to `@/domain/validation/*` in:

- `src/features/scenarios/actions.ts`
  - `customScheduleInputSchema`
  - `lightingScheduleSchema`
- `src/features/scenarios/queries.ts`
  - `lightingScheduleSchema`
- `src/features/roi/actions.ts`
- `src/features/roi/queries.ts`
- `src/features/reports/actions.ts`
- `src/features/reports/queries.ts`
- `src/features/reports/normalizers.ts`
- `src/server/lighting/sunTimes.ts`

Keep server-specific schemas in:

- `src/server/validation/project.ts`
- `src/server/validation/scenario.ts`

Do not delete `src/server/validation/{lighting,report,roi}.ts` unless exact search confirms no remaining imports and the team wants alias removal in the same small slice.

---

### 4. Browser download helper consolidation

#### New module: `src/lib/browser-download.ts`

Kind: browser-only utility imported only from client components.

Purpose:

- Consolidate Blob/object URL/anchor-click/revoke behavior.
- Preserve filenames, content, and MIME types.

Suggested public interface:

```ts
export function downloadTextFile(
  content: string,
  filename: string,
  type: string,
): void;
```

Behavior contract:

1. Create `new Blob([content], { type })`.
2. Create object URL.
3. Create `<a>`.
4. Set `href` and `download`.
5. Append to `document.body`.
6. Click anchor.
7. Remove anchor.
8. Revoke object URL.

Update callers:

- `ExportImportPanel.tsx`
  - Remove local `downloadTextFile`.
  - Use shared helper for JSON/CSV/IES schedule exports.
- `ReportViewer.tsx`
  - Replace local Blob/anchor code in `downloadReportJson`.
  - Preserve `reportExportFilename()` behavior.
- `ProfessionalIntegrations.tsx`
  - Replace repeated Blob/anchor code in:
    - `exportToRevit`
    - `exportToDIALux`
    - `exportToAGi32`
    - `generatePluginScript`

Do not change generated JSON/LDT/plugin content.

---

### 5. Custom schedule validation fix

Modify `src/domain/validation/lighting.ts`.

Current `customScheduleInputSchema` already uses `.strict().superRefine(...)`.

Add another issue inside the existing `superRefine`:

- Condition: `input.sleepTime <= input.wakeTime`
- Path: `["sleepTime"]`
- Message: choose one stable user-facing message, for example:

```text
Sleep time must be later than wake time for same-day schedules.
```

Resulting behavior:

- `ScenarioFormClient.handleCustomSave()`
- → `createScenarioFromCustomInputs()`
- → `customScheduleInputSchema.safeParse(...)`
- returns `ok: false`
- before `fetchSunTimesForLocation()`
- before `generateCustomSchedule()`
- before DB persistence

This is the only intentional behavior change in this refactor.

---

### 6. Safe legacy cleanup

Candidate files:

- `src/components/LightingSchedule.tsx`
- `src/components/CustomizationPanel.tsx`
- `src/components/FinalReport.tsx`
- `src/components/ROICalculator.tsx`

Deletion rule:

- Delete only after exact repo-wide searches confirm no active imports by path or component name.
- `LightingSchedule` and `CustomizationPanel` are internally coupled; if `LightingSchedule` is unused, both can be deleted together.
- `ROICalculator.tsx` is only a thin re-export to `ROICalculatorClient`; delete only if no external import path relies on `@/components/ROICalculator`.

Do **not** delete active top-level panels:

- `ExportImportPanel`
- `ScheduleVisualizer`
- `ResearchInfo`
- `LightSourceComparison`
- `ProfessionalIntegrations`

---

## File-by-file impact

### Add: `src/features/shared/actions.ts`

- Add `ActionResult<T>`.
- Add `ZodLikeError`.
- Add `validationError(...)`.
- Dependency: none.

### Add: `src/features/shared/actionErrors.ts`

- Add `describeActionError(...)`.
- Dependency: none, or type-only dependency on shared action types if desired.

### Add: `src/lib/browser-download.ts`

- Add `downloadTextFile(...)`.
- Browser-only usage.
- Dependency: DOM APIs only.

### Modify: `src/features/projects/actions.ts`

- Remove local `ActionResult` definition.
- Remove local `validationError`.
- Import both from shared action module.
- Preserve CRUD behavior and revalidation.

### Modify: `src/features/scenarios/actions.ts`

- Change `ActionResult` import from projects actions to shared actions.
- Remove local `validationError`.
- Import client-safe lighting schemas from `@/domain/validation/lighting`.
- Keep scenario-specific schemas from `@/server/validation/scenario`.
- Preserve all action messages except new custom schedule invalid case.

### Modify: `src/features/roi/actions.ts`

- Change `ActionResult` and `validationError` imports to shared action module.
- Change ROI schema import to `@/domain/validation/roi`.

### Modify: `src/features/reports/actions.ts`

- Change `ActionResult` and `validationError` imports to shared action module.
- Change report schema import to `@/domain/validation/report`.

### Modify: `src/features/projects/components/ProjectListClient.tsx`

- Import `describeActionError`.
- Remove local duplicate.
- Change constants import to `@/domain/constants`.

### Modify: `src/features/projects/components/ProjectWorkspaceClient.tsx`

- Import `describeActionError`.
- Remove local duplicate.

### Modify: `src/features/scenarios/components/ScenarioFormClient.tsx`

- Import `describeActionError`.
- Remove local duplicate.

### Modify: `src/features/roi/components/ROICalculatorClient.tsx`

- Import `describeActionError`.
- Remove local duplicate.

### Modify: `src/features/reports/components/ReportBuilderClient.tsx`

- Import `describeActionError`.
- Remove local duplicate.

### Modify: `src/components/ExportImportPanel.tsx`

- Import `describeActionError`.
- Import `downloadTextFile`.
- Remove local duplicates.
- Preserve export format map and content types.

### Modify: `src/features/reports/components/ReportViewer.tsx`

- Import `downloadTextFile`.
- Replace local Blob/anchor logic in `downloadReportJson`.

### Modify: `src/components/ProfessionalIntegrations.tsx`

- Import `downloadTextFile`.
- Replace repeated Blob/anchor sections.
- Preserve toast messages and generated content.

### Modify: `src/domain/validation/lighting.ts`

- Add `sleepTime > wakeTime` validation to `customScheduleInputSchema`.
- Keep existing sun-times location validation.

### Modify: `src/features/scenarios/queries.ts`

- Import `lightingScheduleSchema` from `@/domain/validation/lighting`.
- Keep `scenarioScheduleInputsSchema` from server scenario validation.

### Modify: `src/features/roi/queries.ts`

- Import ROI schema/types from `@/domain/validation/roi`.

### Modify: `src/features/reports/queries.ts`

- Import report schema/types from `@/domain/validation/report`.

### Modify: `src/features/reports/normalizers.ts`

- Import report schema/types from `@/domain/validation/report`.

### Modify: `src/server/lighting/sunTimes.ts`

- Import `lightingLocationSchema` from `@/domain/validation/lighting`.

### Modify: `src/server/db/schema.ts`

- Import constants from `@/domain/constants`.

### Modify: `src/server/validation/project.ts`

- Import constants from `@/domain/constants`.

### Modify: `src/server/validation/scenario.ts`

- Import constants from `@/domain/constants`.
- Keep server-specific scenario validation module.

### Delete if confirmed unused

- `src/components/LightingSchedule.tsx`
- `src/components/CustomizationPanel.tsx`
- `src/components/FinalReport.tsx`
- `src/components/ROICalculator.tsx`

---

## Risks and migration

- No database schema or migration changes.
- No persisted JSON shape changes.
- No route contract changes.
- Main functional risk is accidental client/server import regression; mitigate by running `npm run typecheck` and `npm run build`.
- The only intended behavior change is rejecting `sleepTime <= wakeTime` for custom schedules.

---

## Implementation order

1. Create bead issue for this refactor and sub-items for the three ordered slices.
2. Add `src/features/shared/actions.ts`.
3. Update all server action modules to use shared `ActionResult` and `validationError`.
4. Add `src/features/shared/actionErrors.ts`.
5. Replace duplicated `describeActionError` in active client components.
6. Run `npm run lint` and `npm run typecheck`.
7. Switch canonical imports from server aliases to `@/domain/**`.
8. Add `src/lib/browser-download.ts`.
9. Replace browser download code in export/report/integration components.
10. Add `sleepTime > wakeTime` refinement to `customScheduleInputSchema`.
11. Run `npm run lint`, `npm run typecheck`, and preferably `npm run build`.
12. Search for legacy component imports/usages.
13. Delete only proven-unused legacy components.
14. Run final `npm run lint`, `npm run typecheck`, and `npm run build`.
15. Update bead status with verification results.


> 💡 Continue this plan conversation with ask_oracle(chat_id: "refactor-plan-12794C", new_chat: false)