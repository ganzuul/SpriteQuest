#!/usr/bin/env python3
"""
companion/check_library.py

SpriteQuest Fragment Library Validator & Epistemic Auditor.

Implements the specification from library/README.md:
  - Hard Rules: Constraints the project has earned certainty about.
    (Fatal under --version-bump / --strict; warnings in dev mode).
  - Underdetermined Findings: Normal evolutionary states in the library.
    (Always advisory, never fatal).
  - Plan Validation: Verifies that plans in library/plans/ cite existing fragments.
  - Cartographer Ledger Audit: Synchronizes and checks library/cartographers_ledger.json.

Usage:
    python3 companion/check_library.py                 # development mode (exit 0)
    python3 companion/check_library.py --version-bump  # version-bump gate (hard rules fatal)
    python3 companion/check_library.py --strict        # fail on hard rule findings
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
FRAGMENTS_DIR = REPO_ROOT / "library" / "fragments"
PLANS_DIR = REPO_ROOT / "library" / "plans"
LEDGER_PATH = REPO_ROOT / "library" / "cartographers_ledger.json"

KNOWN_WORLDS = {
    "shared",
    "scaffolded-kingdom",
    "neighboring-kingdom",
    "quill-realm",
    "obsidian-wyrm",
    "wizard-tower",
    "customs-house",
    "space-vampires",
    "grey-wind",
    "cartographers",
    "unwritten-atlas",
}

KNOWN_FACETS = {
    "portrait",
    "home",
    "favored_items",
    "aspirations",
    "cutout",
    "lore",
    "terrain",
    "prop",
    "evidence",
}

KNOWN_FACT_KEYS = {
    "extent",
    "scale_ref",
    "material",
    "count",
    "state",
}


@dataclass
class Finding:
    severity: str  # "hard_rule" | "underdetermined"
    fragment_id: str
    file_path: str
    rule_name: str
    message: str


class LibraryChecker:
    def __init__(
        self,
        fragments_dir: Path = FRAGMENTS_DIR,
        plans_dir: Path = PLANS_DIR,
        ledger_path: Path | None = LEDGER_PATH,
    ):
        self.fragments_dir = fragments_dir
        self.plans_dir = plans_dir
        self.ledger_path = ledger_path
        self.findings: list[Finding] = []
        self.seen_ids: dict[str, Path] = {}
        self.fragment_docs: dict[str, dict[str, Any]] = {}

    def run_check(self) -> list[Finding]:
        self.findings.clear()
        self.seen_ids.clear()
        self.fragment_docs.clear()

        # 1. Check all fragments on disk
        self._check_fragments()

        # 2. Check plans
        self._check_plans()

        # 3. Check Cartographers Ledger sync
        self._check_ledger()

        return self.findings

    def _check_fragments(self) -> None:
        if not self.fragments_dir.is_dir():
            self.findings.append(
                Finding(
                    severity="hard_rule",
                    fragment_id="ROOT",
                    file_path=str(self.fragments_dir),
                    rule_name="missing_fragments_dir",
                    message="library/fragments directory does not exist",
                )
            )
            return

        for path in sorted(self.fragments_dir.rglob("*.json")):
            rel_path = path.relative_to(self.fragments_dir)
            expected_id = str(rel_path.with_suffix("")).replace("\\", "/")

            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError) as exc:
                self.findings.append(
                    Finding(
                        severity="hard_rule",
                        fragment_id=expected_id,
                        file_path=str(path),
                        rule_name="invalid_json",
                        message=f"JSON decode failure: {exc}",
                    )
                )
                continue

            frag_id = data.get("id")

            # Hard Rule: id must match path exactly
            if frag_id != expected_id:
                self.findings.append(
                    Finding(
                        severity="hard_rule",
                        fragment_id=frag_id or expected_id,
                        file_path=str(path),
                        rule_name="id_path_mismatch",
                        message=f"Fragment id {frag_id!r} does not match relative path {expected_id!r}",
                    )
                )

            # Hard Rule: no duplicate ids
            if frag_id:
                if frag_id in self.seen_ids:
                    self.findings.append(
                        Finding(
                            severity="hard_rule",
                            fragment_id=frag_id,
                            file_path=str(path),
                            rule_name="duplicate_id",
                            message=f"Duplicate fragment id {frag_id!r} already defined in {self.seen_ids[frag_id]}",
                        )
                    )
                else:
                    self.seen_ids[frag_id] = path
                    self.fragment_docs[frag_id] = data

            # Hard Rule: for must be gemma4-orion or diffusion
            for_val = data.get("for")
            if for_val not in ("gemma4-orion", "diffusion"):
                self.findings.append(
                    Finding(
                        severity="hard_rule",
                        fragment_id=frag_id or expected_id,
                        file_path=str(path),
                        rule_name="invalid_for_field",
                        message=f"'for' field must be 'gemma4-orion' or 'diffusion', got {for_val!r}",
                    )
                )

            # Hard Rule: empty detail
            detail = data.get("detail", "")
            if not isinstance(detail, str) or not detail.strip():
                self.findings.append(
                    Finding(
                        severity="hard_rule",
                        fragment_id=frag_id or expected_id,
                        file_path=str(path),
                        rule_name="empty_detail",
                        message="Fragment payload 'detail' is empty or missing",
                    )
                )

            # Evidence validation
            evidence = data.get("evidence")
            if not isinstance(evidence, dict) or not evidence.get("source"):
                self.findings.append(
                    Finding(
                        severity="hard_rule",
                        fragment_id=frag_id or expected_id,
                        file_path=str(path),
                        rule_name="missing_evidence",
                        message="Missing required 'evidence' block with 'source'",
                    )
                )
            else:
                source = str(evidence.get("source", ""))
                quote = str(evidence.get("quote", ""))

                # Check if this is an abstract source tag or unquoted draft evidence (underdetermined)
                if not quote.strip() or source in ("character_book", "openrig-port", "customs-house"):
                    self.findings.append(
                        Finding(
                            severity="underdetermined",
                            fragment_id=frag_id or expected_id,
                            file_path=str(path),
                            rule_name="draft_evidence_provenance",
                            message=f"Evidence citation is draft/symbolic ({source!r}) without a verified source file quote",
                        )
                    )
                else:
                    source_path = REPO_ROOT / source
                    if source_path.is_file():
                        source_text = source_path.read_text(encoding="utf-8")
                        if quote not in source_text:
                            self.findings.append(
                                Finding(
                                    severity="underdetermined",
                                    fragment_id=frag_id or expected_id,
                                    file_path=str(path),
                                    rule_name="stale_source_quote",
                                    message=f"evidence.quote not found verbatim in {source!r} (source file may have evolved)",
                                )
                            )

            # Underdetermined Findings (Advisory)
            world_id = data.get("world_id")
            if world_id not in KNOWN_WORLDS:
                self.findings.append(
                    Finding(
                        severity="underdetermined",
                        fragment_id=frag_id or expected_id,
                        file_path=str(path),
                        rule_name="unknown_world_id",
                        message=f"World id {world_id!r} is not in registered world list",
                    )
                )

            facets = data.get("facets")
            if for_val == "gemma4-orion" and facets:
                self.findings.append(
                    Finding(
                        severity="underdetermined",
                        fragment_id=frag_id or expected_id,
                        file_path=str(path),
                        rule_name="facets_on_gemma4_orion",
                        message="Fragment carries 'facets' but is marked 'for: gemma4-orion' (selects no sheet)",
                    )
                )

            if facets and isinstance(facets, list):
                for f in facets:
                    if f not in KNOWN_FACETS:
                        self.findings.append(
                            Finding(
                                severity="underdetermined",
                                fragment_id=frag_id or expected_id,
                                file_path=str(path),
                                rule_name="unknown_facet",
                                message=f"Facet {f!r} is outside standard facet vocabulary",
                            )
                        )

            facts = data.get("facts")
            if facts and isinstance(facts, dict):
                for k in facts.keys():
                    if k not in KNOWN_FACT_KEYS:
                        self.findings.append(
                            Finding(
                                severity="underdetermined",
                                fragment_id=frag_id or expected_id,
                                file_path=str(path),
                                rule_name="unknown_facts_key",
                                message=f"Facts key {k!r} is outside closed facts vocabulary",
                            )
                        )

    def _check_plans(self) -> None:
        if not self.plans_dir.is_dir():
            return

        for plan_path in sorted(self.plans_dir.rglob("*.json")):
            if "character-card" in plan_path.name:
                continue
            try:
                plan = json.loads(plan_path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue

            fragments = plan.get("fragments", [])
            for ref in fragments:
                fid = ref.get("id") if isinstance(ref, dict) else str(ref)
                if fid and fid not in self.seen_ids:
                    self.findings.append(
                        Finding(
                            severity="hard_rule",
                            fragment_id=fid,
                            file_path=str(plan_path),
                            rule_name="plan_missing_fragment",
                            message=f"Plan {plan.get('id', plan_path.name)!r} references fragment {fid!r} which does not exist on disk",
                        )
                    )

    def _check_ledger(self) -> None:
        if self.ledger_path and self.ledger_path.is_file():
            try:
                from companion.fragment_compiler import CartographersLedger

                ledger = CartographersLedger(
                    ledger_path=self.ledger_path,
                    fragments_dir=self.fragments_dir,
                )
                ledger.sync_with_filesystem(persist=False)
                for fid, entry in ledger.entries.items():
                    mat = entry.get("maturity")
                    if mat not in ("field_note", "curated", "criticized", "canon"):
                        self.findings.append(
                            Finding(
                                severity="hard_rule",
                                fragment_id=fid,
                                file_path=str(self.ledger_path),
                                rule_name="invalid_ledger_maturity",
                                message=f"Ledger entry {fid!r} has invalid maturity {mat!r}",
                            )
                        )
            except Exception as exc:
                self.findings.append(
                    Finding(
                        severity="hard_rule",
                        fragment_id="CARTOGRAPHERS_LEDGER",
                        file_path=str(self.ledger_path),
                        rule_name="ledger_sync_error",
                        message=f"Failed to sync Cartographers Ledger: {exc}",
                    )
                )


def main() -> int:
    parser = argparse.ArgumentParser(description="SpriteQuest Fragment Library Validator")
    parser.add_argument("--version-bump", action="store_true", help="Version-bump run mode (hard rules are fatal)")
    parser.add_argument("--strict", action="store_true", help="Strict run mode (hard rules are fatal)")
    parser.add_argument("--json", action="store_true", help="Output findings as JSON")
    args = parser.parse_args()

    checker = LibraryChecker()
    findings = checker.run_check()

    hard_rules = [f for f in findings if f.severity == "hard_rule"]
    underdetermined = [f for f in findings if f.severity == "underdetermined"]

    if args.json:
        report = {
            "total_fragments": len(checker.seen_ids),
            "hard_rules_count": len(hard_rules),
            "underdetermined_count": len(underdetermined),
            "findings": [asdict(f) for f in findings],
        }
        print(json.dumps(report, indent=2))
    else:
        print(f"Checked {len(checker.seen_ids)} fragments and plans across {FRAGMENTS_DIR.name}/:")
        print(f"  - Hard Rules: {len(hard_rules)}")
        print(f"  - Underdetermined Findings: {len(underdetermined)}")

        if hard_rules:
            print("\n[HARD RULES]:")
            for f in hard_rules:
                print(f"  FAILED [{f.rule_name}] {f.fragment_id}: {f.message} ({f.file_path})")

        if underdetermined:
            print("\n[UNDERDETERMINED (ADVISORY)]:")
            for f in underdetermined[:8]:
                print(f"  advisory [{f.rule_name}] {f.fragment_id}: {f.message}")
            if len(underdetermined) > 8:
                print(f"  ... and {len(underdetermined) - 8} more advisory findings")

    is_fatal = args.version_bump or args.strict
    if is_fatal and hard_rules:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
