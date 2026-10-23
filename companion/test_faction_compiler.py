#!/usr/bin/env python3
"""
companion/test_faction_compiler.py

Automated unit tests for the NPC Faction compiler and Space Vampires faction.
Offline, stdlib only.
"""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

# Ensure repo root is on sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.compile_faction_npc import (
    compose_npc,
    compile_tavern_card,
    find_fragment_by_id,
    find_fragments_for_world,
    list_factions,
    list_npcs,
    load_json,
    resolve_faction_path,
    resolve_npc_path,
)


class TestFactionCompiler(unittest.TestCase):
    def setUp(self):
        self.faction_path = resolve_faction_path("space-vampires")
        self.faction = load_json(self.faction_path)
        self.grey_wind_path = resolve_faction_path("grey-wind")
        self.grey_wind = load_json(self.grey_wind_path)
        self.cartographers_path = resolve_faction_path("cartographers")
        self.cartographers = load_json(self.cartographers_path)
        self.hollis_path = resolve_npc_path("hollis")
        self.hollis = load_json(self.hollis_path)
        self.pell_path = resolve_npc_path("pell-the-underwritten")
        self.pell = load_json(self.pell_path)

    def test_grey_wind_faction_definition(self):
        """Grey Wind neutral faction plan has required schema fields and fragments."""
        self.assertEqual(self.grey_wind.get("id"), "grey-wind")
        self.assertEqual(self.grey_wind.get("kind"), "neutral")
        self.assertEqual(self.grey_wind.get("world_id"), "grey-wind")
        fragments = self.grey_wind.get("fragments", [])
        self.assertGreaterEqual(len(fragments), 5)

        for frag_ref in fragments:
            fid = frag_ref.get("id")
            frag = find_fragment_by_id(fid)
            self.assertIsNotNone(frag, f"Declared fragment {fid} was not found on disk")
            self.assertEqual(frag.get("world_id"), "grey-wind")
            self.assertIn("detail", frag)
            self.assertIn("facts", frag)
            self.assertIn("evidence", frag)

    def test_compose_and_compile_grey_wind(self):
        """Composing an NPC with The Grey Wind produces slate-grey traits and lorebook."""
        composed = compose_npc(self.hollis, self.grey_wind)
        self.assertEqual(composed["world_id"], "grey-wind")
        self.assertIn("speaker of the Grey Wind", composed["role"])
        self.assertIn("slate-grey skin", composed["portrait"])
        self.assertEqual(composed["extensions"]["faction_kind"], "neutral")

        card = compile_tavern_card(composed, self.grey_wind, include_base_lore=True)
        data = card.get("data", {})
        self.assertIn("the mountain is not going anywhere", data.get("first_mes", ""))

        entry_keys = [e["key"] for e in data.get("character_book", {}).get("entries", [])]
        self.assertIn("grey-wind/mountain-passage", entry_keys)
        self.assertIn("grey-wind/infinite-patience", entry_keys)
        self.assertIn("grey-wind/named-ruins", entry_keys)
        self.assertIn("grey-wind/wish-granting", entry_keys)
        self.assertIn("grey-wind/glyph-stone-horizon", entry_keys)

        tags = data.get("tags", [])
        self.assertIn("faction:grey-wind", tags)
        self.assertIn("neutral-faction", tags)
        self.assertIn("wish-granter", tags)

    def test_cartographers_faction_definition(self):
        """Bureau of the Unwritten Atlas faction plan has required schema fields and fragments."""
        self.assertEqual(self.cartographers.get("id"), "cartographers")
        self.assertEqual(self.cartographers.get("kind"), "neutral")
        self.assertEqual(self.cartographers.get("world_id"), "cartographers")
        fragments = self.cartographers.get("fragments", [])
        self.assertGreaterEqual(len(fragments), 5)

        for frag_ref in fragments:
            fid = frag_ref.get("id")
            frag = find_fragment_by_id(fid)
            self.assertIsNotNone(frag, f"Declared fragment {fid} was not found on disk")
            self.assertEqual(frag.get("world_id"), "cartographers")
            self.assertIn("detail", frag)
            self.assertIn("facts", frag)
            self.assertIn("evidence", frag)

    def test_compose_and_compile_cartographers(self):
        """Composing Pell with Cartographers produces surveyor traits and unwritten tension."""
        composed = compose_npc(self.pell, self.cartographers)
        self.assertEqual(composed["world_id"], "cartographers")
        self.assertIn("Senior Surveyor of the Bureau", composed["role"])
        self.assertIn("waxed canvas", composed["portrait"])
        self.assertIn("astrolabe", " ".join(composed["favored_items"]))
        self.assertFalse(composed.get("written", False))

        card = compile_tavern_card(composed, self.cartographers, include_base_lore=True)
        data = card.get("data", {})
        self.assertIn("Halt and present your warrant", data.get("first_mes", ""))

        entry_keys = [e["key"] for e in data.get("character_book", {}).get("entries", [])]
        self.assertIn("cartographers/canon-warrant", entry_keys)
        self.assertIn("cartographers/epistemic-survey", entry_keys)
        self.assertIn("cartographers/the-living-atlas", entry_keys)
        self.assertIn("cartographers/unwritten-borders", entry_keys)
        self.assertIn("cartographers/glyph-surveyor-rose", entry_keys)

        tags = data.get("tags", [])
        self.assertIn("faction:cartographers", tags)
        self.assertIn("neutral-faction", tags)
        self.assertIn("canon-warrant", tags)
        self.assertIn("cartography", tags)

    def test_space_vampires_faction_definition(self):
        """Faction plan has required schema fields and fragments."""
        self.assertEqual(self.faction.get("id"), "space-vampires")
        self.assertEqual(self.faction.get("kind"), "enemy")
        self.assertEqual(self.faction.get("world_id"), "space-vampires")
        fragments = self.faction.get("fragments", [])
        self.assertGreaterEqual(len(fragments), 5)

        # Ensure every declared fragment actually exists and is readable
        for frag_ref in fragments:
            fid = frag_ref.get("id")
            frag = find_fragment_by_id(fid)
            self.assertIsNotNone(frag, f"Declared fragment {fid} was not found on disk")
            self.assertEqual(frag.get("world_id"), "space-vampires")
            self.assertIn("detail", frag)
            self.assertIn("facts", frag)
            self.assertIn("evidence", frag)

    def test_list_factions_and_npcs(self):
        """Compiler discovery functions list registered factions and NPCs."""
        factions = list_factions()
        faction_ids = [f["id"] for f in factions]
        self.assertIn("space-vampires", faction_ids)

        npcs = list_npcs()
        npc_slugs = [n["slug"] for n in npcs]
        self.assertIn("hollis", npc_slugs)
        self.assertIn("pell-the-underwritten", npc_slugs)

    def test_compose_npc_hollis(self):
        """Composing Hollis with Space Vampires merges fields properly."""
        composed = compose_npc(self.hollis, self.faction)

        # Name preserved
        self.assertEqual(composed["name"], "Hollis the Twice-Written")

        # Written preserved
        self.assertTrue(composed["written"])

        # Role augmented with faction suffix
        self.assertIn("factor to the Mercantile Houses", composed["role"])
        self.assertIn("quartermaster of the asset trade", composed["role"])

        # World altered to faction world_id
        self.assertEqual(composed["world_id"], "space-vampires")
        self.assertIn("The Space Vampires", composed["world"])

        # Style has both retro pixel aesthetic and sterile technology
        self.assertIn("16-bit pixel aesthetic", composed["style"])
        self.assertIn("sterile technological geometry", composed["style"])

        # Portrait contains faction modifications
        self.assertIn("bleached porcelain skin", composed["portrait"])
        self.assertIn("thermoelectric conduits", composed["portrait"])

        # Favored items include stasis cipher key and original items
        favored = composed["favored_items"]
        self.assertTrue(any("stasis coffin" in item for item in favored))
        self.assertTrue(any("seal of attribution" in item for item in favored))

        # Aspirations reflect thermodynamic equilibrium
        self.assertIn("thermodynamic equilibrium", composed["aspirations"])

        # Metadata extensions
        ext = composed.get("extensions", {})
        self.assertEqual(ext.get("faction_id"), "space-vampires")
        self.assertEqual(ext.get("base_world_id"), "scaffolded-kingdom")
        self.assertEqual(ext.get("faction_kind"), "enemy")

    def test_compose_npc_pell(self):
        """Composing Pell the Underwritten with Space Vampires retains unwritten status."""
        composed = compose_npc(self.pell, self.faction)
        self.assertEqual(composed["name"], "Pell the Underwritten")
        self.assertFalse(composed.get("written", False))
        self.assertIn("understudy awaiting a role", composed["role"])
        self.assertIn("factor to the Mercantile Houses", composed["role"])
        self.assertEqual(composed["world_id"], "space-vampires")

    def test_compile_tavern_card_lorebook(self):
        """Compiling a Tavern v2 card embeds all faction fragments and base lore."""
        composed = compose_npc(self.hollis, self.faction)
        card = compile_tavern_card(composed, self.faction, include_base_lore=True)

        self.assertEqual(card.get("spec"), "chara_card_v2")
        self.assertEqual(card.get("spec_version"), "2.0")

        data = card.get("data", {})
        self.assertEqual(data.get("name"), "Hollis the Twice-Written")
        self.assertIn("factor to the Mercantile Houses", data.get("description", ""))

        entries = data.get("character_book", {}).get("entries", [])
        entry_keys = [e["key"] for e in entries]

        # All 5 faction fragments are present
        self.assertIn("space-vampires/mercantile-house", entry_keys)
        self.assertIn("space-vampires/glass-stasis-coffin", entry_keys)
        self.assertIn("space-vampires/anti-life-entropy", entry_keys)
        self.assertIn("space-vampires/technological-instrumentation", entry_keys)
        self.assertIn("space-vampires/glyph-entropy-matrix", entry_keys)

        # Base world fragments from scaffolded-kingdom are also included
        self.assertTrue(any(k.startswith("scaffolded-kingdom/") for k in entry_keys))

        # Tags contain faction markers
        tags = data.get("tags", [])
        self.assertIn("faction:space-vampires", tags)
        self.assertIn("enemy-faction", tags)
        self.assertIn("technology", tags)


if __name__ == "__main__":
    unittest.main()
