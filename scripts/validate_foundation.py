#!/usr/bin/env python3
"""Deterministic structural validation for the NextSet foundation package."""

from __future__ import annotations

import hashlib
import json
import re
import struct
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]

REQUIRED = [
    "README.md",
    "AGENTS.md",
    "docs/project/charter.md",
    "docs/project/vision-principles-users.md",
    "docs/project/glossary.md",
    "docs/project/assumptions-questions.md",
    "docs/project/roadmap.md",
    "docs/project/decision-log.md",
    "docs/research/competitor-analysis.md",
    "docs/research/user-pain-points.md",
    "docs/research/fitness-interaction-research.md",
    "docs/research/non-fitness-inspiration.md",
    "docs/research/open-source-tooling-assessment.md",
    "docs/research/name-collision-scan.md",
    "docs/product/product-requirements.md",
    "docs/product/feature-inventory.md",
    "docs/product/user-journeys.md",
    "docs/domain/workout-progression-rulebook.md",
    "docs/domain/programme-model.md",
    "docs/domain/set-types.md",
    "docs/domain/edge-cases.md",
    "docs/domain/domain-test-scenarios.md",
    "docs/domain/safety-boundaries.md",
    "docs/design/design-principles.md",
    "docs/design/information-architecture.md",
    "docs/design/visual-directions.md",
    "docs/design/colour-typography.md",
    "docs/design/motion-haptics.md",
    "docs/design/content-tone.md",
    "docs/design/accessibility-analysis.md",
    "docs/design/prototype-guide.md",
    "docs/design/source-assets-licences.md",
    "docs/architecture/technology-evaluation.md",
    "docs/architecture/system-architecture.md",
    "docs/architecture/data-model.md",
    "docs/architecture/local-first-offline.md",
    "docs/architecture/future-sync.md",
    "docs/architecture/security-privacy.md",
    "docs/architecture/adrs/0001-mobile-stack.md",
    "docs/architecture/adrs/0002-local-first-storage.md",
    "docs/architecture/adrs/0003-defer-cloud-backend.md",
    "docs/quality/testing-strategy.md",
    "docs/quality/acceptance-criteria.md",
    "docs/quality/accessibility-requirements.md",
    "docs/quality/performance-budgets.md",
    "docs/quality/release-readiness.md",
    "docs/quality/independent-review.md",
    "docs/quality/logging-first-independent-review.md",
    "prototypes/nextset-directions/evidence/2026-09-07-logging-first/manifest.json",
    "prototypes/nextset-directions/evidence/2026-09-07-logging-first/command-results.md",
    "docs/agents/operating-model.md",
    "docs/agents/ownership-review-rework.md",
    "docs/agents/worktree-branch-strategy.md",
    "prototypes/nextset-directions/src/Prototype.tsx",
    "prototypes/nextset-directions/src/prototype.css",
    "prototypes/nextset-directions/design-qa.md",
    "prototypes/nextset-directions/evidence/2026-08-06/capture-manifest.json",
    "prototypes/nextset-directions/evidence/2026-08-06/command-results.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
]

SKILLS = [
    "review-product-requirements",
    "implement-visual-direction",
    "run-visual-qa",
    "review-workout-rules",
    "review-accessibility",
    "run-mobile-e2e",
    "review-data-migration",
    "review-performance",
    "assess-release-readiness",
]

VISUALS = [
    "tempo-ledger-active-workout-390x844.png",
    "field-kit-active-workout-390x844.png",
    "open-pace-active-workout-390x844.png",
]

DIRECTIONS = ("tempo-ledger", "field-kit", "open-pace")
IPHONE_SCREENS = (
    "onboarding",
    "programme-selection",
    "today",
    "active-workout",
    "set-entry",
    "exercise-substitution",
    "workout-completion",
    "history",
    "exercise-progress",
    "programme-editor",
)


def png_dimensions(path: Path) -> tuple[int, int]:
    data = path.read_bytes()[:24]
    if len(data) < 24 or data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("not a PNG")
    return struct.unpack(">II", data[16:24])


def check_markdown(path: Path, errors: list[str]) -> None:
    text = path.read_text(encoding="utf-8")
    if text.count("```") % 2:
        errors.append(f"unbalanced code fence: {path.relative_to(ROOT)}")
    if path.name not in {"PULL_REQUEST_TEMPLATE.md"} and not re.search(r"^#\s+\S", text, re.M):
        errors.append(f"missing H1: {path.relative_to(ROOT)}")
    if re.search(r"\[TODO(?::|\])|TODO placeholder", text, re.I):
        errors.append(f"placeholder remains: {path.relative_to(ROOT)}")

    for match in re.finditer(r"\[[^\]]+\]\(([^)]+)\)", text):
        target = match.group(1).strip()
        parsed = urlparse(target)
        if parsed.scheme or target.startswith("#") or target.startswith("mailto:"):
            continue
        clean = unquote(target.split("#", 1)[0].split("?", 1)[0])
        if not clean:
            continue
        destination = (path.parent / clean).resolve()
        try:
            destination.relative_to(ROOT.resolve())
        except ValueError:
            continue
        if not destination.exists():
            errors.append(
                f"broken local link: {path.relative_to(ROOT)} -> {target}"
            )


def main() -> int:
    errors: list[str] = []

    for relative in REQUIRED:
        path = ROOT / relative
        if not path.is_file() or path.stat().st_size == 0:
            errors.append(f"missing or empty required artefact: {relative}")

    markdown_files = sorted(
        path for path in ROOT.rglob("*.md") if "node_modules" not in path.parts
    )
    for path in markdown_files:
        check_markdown(path, errors)

    for skill in SKILLS:
        skill_file = ROOT / "skills" / skill / "SKILL.md"
        agent_file = ROOT / "skills" / skill / "agents" / "openai.yaml"
        if not skill_file.is_file() or not agent_file.is_file():
            errors.append(f"incomplete skill structure: {skill}")
            continue
        skill_text = skill_file.read_text(encoding="utf-8")
        if not skill_text.startswith("---\n") or f"name: {skill}\n" not in skill_text:
            errors.append(f"invalid skill frontmatter: {skill}")
        for heading in ("Required inputs", "Procedure", "Evidence required", "Failure conditions", "Output"):
            if f"## {heading}" not in skill_text:
                errors.append(f"skill {skill} missing section: {heading}")

    visual_dir = ROOT / "prototypes" / "visual-references"
    for filename in VISUALS:
        path = visual_dir / filename
        if not path.is_file():
            errors.append(f"missing visual reference: {filename}")
            continue
        try:
            if png_dimensions(path) != (390, 844):
                errors.append(f"wrong visual dimensions: {filename} {png_dimensions(path)}")
        except ValueError as exc:
            errors.append(f"invalid visual reference {filename}: {exc}")

    prototype = (ROOT / "prototypes/nextset-directions/src/Prototype.tsx").read_text(encoding="utf-8")
    for direction in ("Tempo Ledger", "Field Kit", "Open Pace"):
        if prototype.count(direction) < 1:
            errors.append(f"prototype missing direction: {direction}")
    for screen in (
        "onboarding",
        "programme",
        "today",
        "active",
        "set-entry",
        "substitution",
        "complete",
        "history",
        "exercise-progress",
        "programme-editor",
    ):
        if f'"{screen}"' not in prototype:
            errors.append(f"prototype missing screen: {screen}")

    design_qa = (ROOT / "prototypes/nextset-directions/design-qa.md").read_text(encoding="utf-8")
    if "final result: pass" not in design_qa.lower():
        errors.append("design-qa.md does not record an exact passing final result")

    independent_review = (ROOT / "docs/quality/logging-first-independent-review.md").read_text(encoding="utf-8")
    if "final gate result: pass" not in independent_review.lower():
        errors.append("logging-first-independent-review.md does not record an exact passing final gate")

    evidence_dir = ROOT / "prototypes/nextset-directions/evidence/2026-08-06"
    for direction in DIRECTIONS:
        for screen in IPHONE_SCREENS:
            path = evidence_dir / "screens" / f"{direction}-{screen}-iphone-light.png"
            if not path.is_file():
                errors.append(f"missing iPhone evidence: {path.relative_to(ROOT)}")
            elif png_dimensions(path) != (393, 852):
                errors.append(f"wrong iPhone evidence dimensions: {path.relative_to(ROOT)} {png_dimensions(path)}")

        pixel_path = evidence_dir / "screens" / f"{direction}-active-workout-pixel-10-light.png"
        if not pixel_path.is_file():
            errors.append(f"missing Pixel evidence: {pixel_path.relative_to(ROOT)}")
        elif png_dimensions(pixel_path) != (427, 952):
            errors.append(f"wrong Pixel evidence dimensions: {pixel_path.relative_to(ROOT)} {png_dimensions(pixel_path)}")

        for suffix in ("active-workout-source-vs-rendered", "ten-screen-rendered-contact-sheet"):
            comparison = evidence_dir / "comparisons" / f"{direction}-{suffix}.png"
            if not comparison.is_file() or comparison.stat().st_size == 0:
                errors.append(f"missing comparison evidence: {comparison.relative_to(ROOT)}")

    manifest_path = evidence_dir / "capture-manifest.json"
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        records = manifest.get("records", [])
        if len(records) != 33:
            errors.append(f"capture manifest has {len(records)} records; expected 33")
        for record in records:
            audit = record.get("audit", {})
            if audit.get("horizontalOverflow"):
                errors.append(f"horizontal overflow in capture manifest: {record.get('file', 'unknown')}")
            if audit.get("undersizedControls"):
                errors.append(f"undersized controls in capture manifest: {record.get('file', 'unknown')}")
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"invalid capture manifest: {exc}")

    # The three-direction package above is historical evidence. Validate current
    # logging-first captures separately, including exact source hashes.
    current_dir = ROOT / "prototypes/nextset-directions/evidence/2026-09-07-logging-first"
    try:
        current = json.loads((current_dir / "manifest.json").read_text(encoding="utf-8"))
        required_states = {"workouts-empty", "active-empty", "exercise-picker", "active-recorded", "history", "routine", "progress", "pixel-active", "large-text"}
        records = current.get("records", [])
        captured_states = {record.get("state") for record in records}
        for missing in sorted(required_states - captured_states):
            errors.append(f"missing current logging-first state: {missing}")
        for record in records:
            capture = current_dir / record["file"]
            if not capture.is_file() or capture.stat().st_size == 0:
                errors.append(f"missing logging-first screenshot: {record['file']}")
            if record.get("horizontalOverflow") or record.get("undersizedControls"):
                errors.append(f"logging-first layout defect: {record['state']}")
        if current.get("runtimeErrors"):
            errors.append("logging-first capture has runtime errors")
        for source in ("src/Prototype.tsx", "src/prototype.css"):
            actual = hashlib.sha256((ROOT / "prototypes/nextset-directions" / source).read_bytes()).hexdigest()
            if current.get("sourceHashes", {}).get(source) != actual:
                errors.append(f"logging-first captures are stale for {source}")
    except (OSError, KeyError, json.JSONDecodeError) as exc:
        errors.append(f"invalid logging-first manifest: {exc}")

    if errors:
        print("Foundation validation FAILED")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        f"Foundation validation passed: {len(REQUIRED)} required artefacts, "
        f"{len(markdown_files)} Markdown files, {len(SKILLS)} skills, "
        f"{len(VISUALS)} normalized visual references."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
