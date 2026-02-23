# Lessons Log

Use this schema for every entry:

## YYYY-MM-DD - Lesson Title
- Trigger: what happened
- Missed Signal: what should have warned us
- New Rule: concrete behavior rule
- Verification Gate: exact command/check that prevents recurrence
- Applied To: task/PR/file references
- Status: active | superseded

---

## 2026-02-23 - Preserve Core Run Stability
- Trigger: We introduced major v1.3 mastery features while existing gameplay had to remain stable.
- Missed Signal: Feature plumbing can unintentionally alter shared scene flow.
- New Rule: Any campaign expansion must explicitly preserve `core` behavior paths and verify unchanged baseline progression.
- Verification Gate: `npm run test` and manual `Core Run` playthrough from title to completion.
- Applied To: `src/main.ts`, `src/content/rooms.ts`, v1.3 campaign integration.
- Status: active

## 2026-02-23 - Always Validate Contrast Modes After Visual/Content Edits
- Trigger: Readability and accessibility are first-class project goals while visual/content updates are frequent.
- Missed Signal: Visual acceptance in one palette can hide issues in high-contrast mode.
- New Rule: For room or visual updates, verify readability in normal and `?contrast=high`.
- Verification Gate: Manual room pass in both palettes plus checklist notes.
- Applied To: `ROADMAP.md`, `DEVELOPMENT.md`, room tuning workflow.
- Status: active

## 2026-02-23 - Medal and Ranking Rules Are Contract Behavior
- Trigger: Mastery medals and PB ranking were added as user-visible progression signals.
- Missed Signal: Small comparator or threshold regressions can silently corrupt progression fairness.
- New Rule: Treat medal thresholds and ranking tie-breaks as contract-tested behavior, not incidental logic.
- Verification Gate: `npm run test` must include medal boundary and ranking comparator checks.
- Applied To: `src/gameplay/medals.ts`, `tests/gameplay/medals.test.ts`.
- Status: active

## 2026-02-23 - Sync Docs Immediately After Expansion Changes
- Trigger: Feature scope and status changed quickly during v1.3 integration.
- Missed Signal: Docs can lag and create conflicting project state narratives.
- New Rule: When implementation changes state claims, update status docs in the same cycle.
- Verification Gate: Update `README.md`, `DEVELOPMENT.md`, `EXECUTION_ORDER.md`, `ROADMAP.md` together before final handoff.
- Applied To: v1.3 rollout documentation updates.
- Status: active

## 2026-02-23 - Catch Encoding Artifacts Before Finalizing Docs
- Trigger: Text artifacts (e.g., malformed symbols) appeared in markdown output.
- Missed Signal: Encoding issues can survive content review if visual scan is skipped.
- New Rule: Run a final text quality pass on updated docs for encoding/symbol artifacts.
- Verification Gate: Open changed docs and scan for malformed characters prior to finalizing.
- Applied To: `DEVELOPMENT.md`, markdown cleanup workflow.
- Status: active

## 2026-02-23 - Use Type-Only Phaser Imports in Tested Helper Modules
- Trigger: A refactor introduced a runtime `phaser` import in a helper module and Vitest failed with `navigator is not defined`.
- Missed Signal: Importing Phaser as a runtime dependency in non-scene helpers can pull browser-only device initialization into node test runs.
- New Rule: In pure/helper modules, use `import type Phaser` when only types are needed; reserve runtime Phaser imports for scene/runtime modules.
- Verification Gate: `npm run test` must complete without `navigator is not defined` or Phaser device bootstrap errors.
- Applied To: `src/scenes/main/settingsController.ts`, `tests/scenes/main/settingsController.test.ts`.
- Status: active
