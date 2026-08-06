# Manual Skill-format workflow scope

These packages are reusable, validated procedures in Codex Skill format. They are stored at top-level `skills/` because this managed workspace rejected writes to the supported auto-discovery path `.agents/skills/`. Invoke one manually by directing Codex to follow `skills/<name>/SKILL.md`; in a writable checkout, copy the package to `.agents/skills/<name>/` and rerun the official validator before calling it an auto-discovered repository Skill.

Follow the root `AGENTS.md` and the official Codex Skill structure.

- Each skill folder contains `SKILL.md` and `agents/openai.yaml`; add scripts, references, or assets only when necessary.
- Frontmatter contains only `name` and `description`; descriptions state concrete trigger conditions.
- Procedures must name required inputs, evidence, failure conditions, and output format.
- Keep normative product facts in project documents, not duplicated inside skills. Skills should link to the current source of truth.
- Validate every skill with the official `quick_validate.py` before merge.
- Forward-test complex or safety-critical skills with a fresh agent and raw task artefacts; do not leak the expected answer.
- Never weaken a product quality gate to make a skill report success.
