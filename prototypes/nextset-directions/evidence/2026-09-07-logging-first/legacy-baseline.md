# Preserved legacy baseline

Date: 2026-09-07. Scope: earlier three-direction prototype at `/?review=legacy`.

Before editing, the working diff was preserved in `/tmp/nextset-before-logging-first.patch`. The original `src/Prototype.tsx` was reconstructed from HEAD and that patch. Comparing it to the legacy portion of the current file, with only the import additions and component entry rename normalised, returned **True** for byte-equivalent content. The logging-first study is appended separately. Prior uncommitted source changes were not discarded.

The inherited regression suite was run with the bundled Node and an explicit Node PATH:

```text
node node_modules/@playwright/test/cli.js test prototype.spec.ts mobile-runtime.spec.ts --workers=2 --reporter=line
50 passed, 10 failed (60 cases), exit 1
```

The initial invocation without the runtime directory in PATH failed because the Playwright webServer could not find `node`; it was rerun with the bundled Node directory in PATH.

The failing inherited cases were Field Kit ten-screen navigation, old fixture-note wording/role selectors, fixed-footer reachability, set-entry draft navigation, completed-set editing, substitution scope, Open Pace target range, and two future-programme substitution message assertions. These remain unresolved in the preserved historical exploration. They must not be reported as passing, nor used as evidence that the new logging-first default is production-ready. The current review and new regression/evidence suite specifically target the default logging-first flow; the protected runtime is validated separately.
