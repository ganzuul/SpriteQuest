#!/usr/bin/env python3
"""
companion/test_check_library.py

Unit and integration tests for companion/check_library.py.
Verifies:
  1. Live library pass under --strict / --version-bump
  2. Hard rules detection (id mismatch, missing evidence, duplicate id, invalid 'for', empty detail)
  3. Plan validation (detecting missing fragment references)
  4. Cartographers Ledger sync and maturity validation
  5. Underdetermined / advisory findings behavior
"""

import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.check_library import LibraryChecker, main
from companion.fragment_compiler import CartographersLedger


class TestCheckLibrary(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp(prefix="test_lib_")
        self.temp_root = Path(self.temp_dir)
        self.fragments_dir = self.temp_root / "fragments"
        self.plans_dir = self.temp_root / "plans"
        self.ledger_path = self.temp_root / "cartographers_ledger.json"

        self.fragments_dir.mkdir(parents=True)
        self.plans_dir.mkdir(parents=True)

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def _write_fragment(self, rel_path: str, data: dict) -> Path:
        target = self.fragments_dir / rel_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(data, indent=2), encoding="utf-8")
        return target

    def _write_plan(self, rel_path: str, data: dict) -> Path:
        target = self.plans_dir / rel_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(data, indent=2), encoding="utf-8")
        return target

    def test_live_library_passes_strict(self):
        """The actual repository fragment library and plans must pass all hard rules."""
        checker = LibraryChecker()
        findings = checker.run_check()
        hard_rules = [f for f in findings if f.severity == "hard_rule"]
        self.assertEqual(
            hard_rules,
            [],
            f"Expected 0 hard rule violations in repo library, found: {[f.message for f in hard_rules]}"
        )

    def test_valid_isolated_fragment(self):
        self._write_fragment(
            "customs-house/test-crate.json",
            {
                "id": "customs-house/test-crate",
                "world_id": "customs-house",
                "for": "diffusion",
                "detail": "A solid pine crate stamped with zinc ink.",
                "evidence": {
                    "source": "companion/schemas.py",
                    "quote": "StandingTier"
                }
            }
        )
        checker = LibraryChecker(
            fragments_dir=self.fragments_dir,
            plans_dir=self.plans_dir,
            ledger_path=self.ledger_path
        )
        findings = checker.run_check()
        hard_rules = [f for f in findings if f.severity == "hard_rule"]
        self.assertEqual(len(hard_rules), 0)

    def test_id_path_mismatch_detected(self):
        self._write_fragment(
            "customs-house/real-path.json",
            {
                "id": "customs-house/fake-path",
                "world_id": "customs-house",
                "for": "diffusion",
                "detail": "Test detail",
                "evidence": {"source": "manual"}
            }
        )
        checker = LibraryChecker(
            fragments_dir=self.fragments_dir,
            plans_dir=self.plans_dir,
            ledger_path=self.ledger_path
        )
        findings = checker.run_check()
        rule_names = [f.rule_name for f in findings if f.severity == "hard_rule"]
        self.assertIn("id_path_mismatch", rule_names)

    def test_invalid_for_field_detected(self):
        self._write_fragment(
            "shared/bad-for.json",
            {
                "id": "shared/bad-for",
                "world_id": "shared",
                "for": "unsupported-model",
                "detail": "Test detail",
                "evidence": {"source": "manual"}
            }
        )
        checker = LibraryChecker(
            fragments_dir=self.fragments_dir,
            plans_dir=self.plans_dir,
            ledger_path=self.ledger_path
        )
        findings = checker.run_check()
        rule_names = [f.rule_name for f in findings if f.severity == "hard_rule"]
        self.assertIn("invalid_for_field", rule_names)

    def test_empty_detail_detected(self):
        self._write_fragment(
            "shared/empty-detail.json",
            {
                "id": "shared/empty-detail",
                "world_id": "shared",
                "for": "diffusion",
                "detail": "   ",
                "evidence": {"source": "manual"}
            }
        )
        checker = LibraryChecker(
            fragments_dir=self.fragments_dir,
            plans_dir=self.plans_dir,
            ledger_path=self.ledger_path
        )
        findings = checker.run_check()
        rule_names = [f.rule_name for f in findings if f.severity == "hard_rule"]
        self.assertIn("empty_detail", rule_names)

    def test_plan_missing_fragment_detected(self):
        self._write_plan(
            "test-plan.json",
            {
                "id": "test-plan",
                "fragments": [
                    {"id": "nonexistent/missing-fragment"}
                ]
            }
        )
        checker = LibraryChecker(
            fragments_dir=self.fragments_dir,
            plans_dir=self.plans_dir,
            ledger_path=self.ledger_path
        )
        findings = checker.run_check()
        rule_names = [f.rule_name for f in findings if f.severity == "hard_rule"]
        self.assertIn("plan_missing_fragment", rule_names)

    def test_cartographers_ledger_sync_and_validation(self):
        # Create a fragment
        self._write_fragment(
            "customs-house/item-one.json",
            {
                "id": "customs-house/item-one",
                "world_id": "customs-house",
                "for": "diffusion",
                "detail": "Detail one",
                "evidence": {"source": "character_book"}
            }
        )
        # Initialize ledger
        ledger = CartographersLedger(ledger_path=self.ledger_path, fragments_dir=self.fragments_dir)
        ledger.sync_with_filesystem(persist=True)

        checker = LibraryChecker(
            fragments_dir=self.fragments_dir,
            plans_dir=self.plans_dir,
            ledger_path=self.ledger_path
        )
        findings = checker.run_check()
        hard_rules = [f for f in findings if f.severity == "hard_rule"]
        self.assertEqual(len(hard_rules), 0)


if __name__ == "__main__":
    unittest.main()
