#!/usr/bin/env python3
"""
companion/test_render_sheets.py

Automated unit tests for the Black Forest Labs Flux 3 Klein renderer and model checker.
Offline, stdlib only.
"""

from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.check_models import (
    DIFFUSION_CANDIDATES,
    CLIP_CANDIDATES,
    VAE_CANDIDATES,
    pick_first,
)
from companion.render_sheets import (
    assemble,
    brief_for,
    build_flux_workflow,
    facets_of,
    full_prompt,
)


class TestFluxRenderer(unittest.TestCase):
    def setUp(self):
        self.sample_sheet = {
            "name": "Hollis the Twice-Written",
            "role": "quartermaster of the asset trade",
            "style": "Retro JRPG 16-bit aesthetic",
            "portrait": "an unshaven quartermaster in a ledger-keeper's coat",
            "home": "a customs house built into the gap between two level chunks",
            "favored_items": [
                "a seal of attribution",
                "a copied sword"
            ],
            "aspirations": "to see the trade route restored"
        }

    def test_facets_extraction(self):
        """facets_of correctly extracts and structures sheet facets."""
        facets = facets_of(self.sample_sheet)
        facet_keys = [f[0] for f in facets]
        self.assertEqual(facet_keys, ["portrait", "home", "favored_items", "aspirations"])

        # favored_items has two items
        favored = [f[1] for f in facets if f[0] == "favored_items"][0]
        self.assertEqual(len(favored), 2)
        self.assertEqual(favored[0], "a seal of attribution")

    def test_prompt_assembly(self):
        """brief_for and full_prompt assemble character context and style."""
        brief = brief_for(self.sample_sheet, self.sample_sheet["portrait"])
        self.assertIn("Hollis the Twice-Written", brief)
        self.assertIn("quartermaster of the asset trade", brief)
        self.assertIn("unshaven quartermaster", brief)

        prompt = full_prompt(self.sample_sheet, self.sample_sheet["portrait"], "portrait")
        self.assertTrue(prompt.startswith("Retro JRPG 16-bit aesthetic"))
        self.assertIn("Hollis the Twice-Written", prompt)

    def test_build_flux_workflow(self):
        """build_flux_workflow generates a valid ComfyUI API graph for Flux 3 Klein."""
        graph = build_flux_workflow(
            prompt="Retro character portrait",
            negative="",
            seed=42,
            width=1024,
            height=1536,
            prefix="test/hollis/portrait",
            steps=16,
            cfg=1.0,
        )

        # Ensure all required node types exist in graph
        class_types = {node["class_type"] for node in graph.values()}
        self.assertTrue("UnetLoaderGGUF" in class_types or "UNETLoader" in class_types)
        expected_types = {
            "CLIPLoader",
            "VAELoader",
            "CLIPTextEncode",
            "EmptyFlux2LatentImage",
            "KSampler",
            "VAEDecode",
            "SaveImage",
        }
        self.assertTrue(expected_types.issubset(class_types))

        # Check KSampler inputs
        ksampler = [n for n in graph.values() if n["class_type"] == "KSampler"][0]
        self.assertEqual(ksampler["inputs"]["steps"], 16)
        self.assertEqual(ksampler["inputs"]["cfg"], 1.0)
        self.assertEqual(ksampler["inputs"]["sampler_name"], "euler")
        self.assertEqual(ksampler["inputs"]["seed"], 42)

        # Check CLIPLoader has type="flux3"
        cliploader = [n for n in graph.values() if n["class_type"] == "CLIPLoader"][0]
        self.assertEqual(cliploader["inputs"]["type"], "flux3")

    def test_candidates_defined(self):
        """Model candidate lists prioritize Flux 3 Klein."""
        self.assertIn("flux3_image_klein", DIFFUSION_CANDIDATES[0])
        self.assertTrue(any("flux" in c for c in DIFFUSION_CANDIDATES))
        self.assertTrue(any("qwen" in c or "t5" in c for c in CLIP_CANDIDATES))
        self.assertTrue(any("flux" in v or "ae" in v for v in VAE_CANDIDATES))


if __name__ == "__main__":
    unittest.main()
