# Prototype scope

Follow the root `AGENTS.md`. Everything below `prototypes/` is a disposable review artefact, not the production application.

- Preserve the Product Design mobile runtime and its local `AGENTS.md`; implement app-owned UI only in the permitted files.
- Use an exact selected visual reference as the visible source of truth. Keep original generated/source files.
- Mock data must be realistic, internally consistent, and visibly understood as illustrative. Never cite it as measured product data.
- Implement the primary interaction path and visible states needed for review; do not add backend, account, telemetry, payment, or persistence systems.
- Use licensed assets and an icon library. Do not recreate visible images or icons with ASCII, emoji, CSS art, handcrafted SVG, or placeholders.
- Capture the app-owned mobile viewport at the intended dimensions and compare it with the source visual before claiming fidelity.
- Record install, runtime, browser, screenshot, and QA blockers precisely. A generated source mock is not an implementation screenshot.
- Do not move prototype code into a future production tree; rebuild approved behaviour against production architecture and tests.
