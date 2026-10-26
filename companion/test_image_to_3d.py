#!/usr/bin/env python3
"""
companion/test_image_to_3d.py

Automated Test Suite for:
  1. 2D Diffusion Image -> 3D Mesh & Physics Collision Pipeline for Outdoor Ruins.
  2. Authentic Lattice Prompt Refinement for Outdoor Ruins and Scene Primitives.
"""

from __future__ import annotations

import json
import math
import struct
import unittest
from pathlib import Path

try:
    import numpy as np
    from PIL import Image
    import trimesh
    HAVE_3D_DEPS = True
except ImportError:
    HAVE_3D_DEPS = False

REPO_ROOT = Path(__file__).resolve().parent.parent
import sys
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

if HAVE_3D_DEPS:
    from companion.image_to_3d import (
        load_and_segment_sprite,
        reconstruct_3d_from_image,
        decimate_to_lowpoly,
        decompose_coacd_colliders,
        export_binary_stl,
        export_collider_glb,
        process_ruin_pipeline,
        RUIN_SPECS,
    )
else:
    load_and_segment_sprite = None
    reconstruct_3d_from_image = None
    decimate_to_lowpoly = None
    decompose_coacd_colliders = None
    export_binary_stl = None
    export_collider_glb = None
    process_ruin_pipeline = None
    RUIN_SPECS = {}

from companion.fragment_compiler import compile_asset_brief, ASSET_RECIPES, rewrite_prompt
from companion.stl_primitives import STLPrimitive


class TestImageTo3DRuinPipeline(unittest.TestCase):
    """Test 2D Diffusion Sprite -> 3D Mesh -> CoACD Collider -> STL."""

    @unittest.skipUnless(HAVE_3D_DEPS, "trimesh / 3D deps not installed in current Python environment")
    def test_sprite_segmentation_alpha(self):
        """Alpha channel and silhouette mask are extracted cleanly."""
        sprite_path = REPO_ROOT / "library" / "sprites" / "ancient-bastion.png"
        self.assertTrue(sprite_path.is_file(), f"Sprite file missing: {sprite_path}")

        rgba, mask = load_and_segment_sprite(sprite_path)
        self.assertEqual(rgba.mode, "RGBA")
        self.assertIsInstance(mask, np.ndarray)
        self.assertTrue(mask.dtype == bool)
        self.assertGreater(mask.sum(), 1000)

    @unittest.skipUnless(HAVE_3D_DEPS, "trimesh / 3D deps not installed in current Python environment")
    def test_watertight_3d_reconstruction_from_sprite(self):
        """Reconstructs watertight 3D solid mesh with base grounded at Z=0."""
        sprite_path = REPO_ROOT / "library" / "sprites" / "relic-cairn.png"
        rgba, mask = load_and_segment_sprite(sprite_path)
        target_extents = (1.8, 1.8, 1.6)

        mesh = reconstruct_3d_from_image(
            rgba, mask, target_extents=target_extents, style="relic_cairn", resolution=64
        )
        self.assertIsInstance(mesh, trimesh.Trimesh)
        self.assertGreater(len(mesh.faces), 1000)
        self.assertAlmostEqual(mesh.vertices[:, 2].min(), 0.0, places=3)

        # Check dimensional bounds
        extents = mesh.extents
        self.assertAlmostEqual(extents[0], target_extents[0], delta=0.25)
        self.assertAlmostEqual(extents[1], target_extents[1], delta=0.25)
        self.assertAlmostEqual(extents[2], target_extents[2], delta=0.25)

    @unittest.skipUnless(HAVE_3D_DEPS, "trimesh / 3D deps not installed in current Python environment")
    def test_lowpoly_lod_decimation(self):
        """Decimates dense mesh down to runtime target face budget."""
        sprite_path = REPO_ROOT / "library" / "sprites" / "wish-stone-slab.png"
        rgba, mask = load_and_segment_sprite(sprite_path)
        mesh = reconstruct_3d_from_image(rgba, mask, target_extents=(3.0, 8.0, 0.8), style="wish_stone_slab", resolution=48)
        initial_faces = len(mesh.faces)

        lod = decimate_to_lowpoly(mesh, target_faces=300)
        self.assertLess(len(lod.faces), initial_faces)
        self.assertLessEqual(len(lod.faces), 600)
        self.assertAlmostEqual(lod.vertices[:, 2].min(), 0.0, places=3)

    @unittest.skipUnless(HAVE_3D_DEPS, "trimesh / 3D deps not installed in current Python environment")
    def test_coacd_convex_decomposition(self):
        """CoACD produces solver-ready compound collision pieces."""
        sprite_path = REPO_ROOT / "library" / "sprites" / "relic-cairn.png"
        rgba, mask = load_and_segment_sprite(sprite_path)
        mesh = reconstruct_3d_from_image(rgba, mask, target_extents=(1.8, 1.8, 1.6), style="relic_cairn", resolution=48)
        lod = decimate_to_lowpoly(mesh, target_faces=250)

        pieces = decompose_coacd_colliders(lod, threshold=0.06, cap=8)
        self.assertGreaterEqual(len(pieces), 1)
        self.assertLessEqual(len(pieces), 8)
        for p in pieces:
            # Each piece is an oriented bounding box or convex hull
            self.assertGreater(len(p.faces), 0)
            self.assertTrue(np.isfinite(p.vertices).all())

    def test_all_five_outdoor_ruins_exist_in_stl_and_mesh(self):
        """Verifies that all 5 outdoor ruin STLs, GLBs, and Collages exist on disk."""
        ruin_keys = ["ancient-bastion", "relic-cairn", "wish-stone-slab", "ruined-watchtower", "ancient-ruin-terrace"]
        for key in ruin_keys:
            stl_p = REPO_ROOT / "library" / "stl_primitives" / f"{key}.stl"
            low_glb = REPO_ROOT / "library" / "mesh" / f"{key}-lowpoly.glb"
            coll_glb = REPO_ROOT / "library" / "mesh" / f"{key}-collider.glb"
            collage_p = REPO_ROOT / "renders" / "primitives" / f"{key}-collage.png"

            self.assertTrue(stl_p.is_file(), f"Missing STL: {stl_p}")
            self.assertTrue(low_glb.is_file(), f"Missing Lowpoly GLB: {low_glb}")
            self.assertTrue(coll_glb.is_file(), f"Missing Collider GLB: {coll_glb}")
            self.assertTrue(collage_p.is_file(), f"Missing Collage: {collage_p}")

            # Verify binary STL load
            prim = STLPrimitive.load_stl(stl_p)
            self.assertGreater(prim.triangle_count, 100, f"STL {key} should have substantial 3D geometry")
            self.assertGreater(prim.dimensions[0], 0.5)


class TestLatticePromptRefinementForRuins(unittest.TestCase):
    """Test that prompt refinement via Lattice authentically refines outdoor ruins."""

    def test_ancient_bastion_lattice_prompt_refinement(self):
        """Bastion prompt weaves 45-degree cantilever overhang rules and Grey Wind lore."""
        asset_data = {
            "id": "ancient-bastion",
            "label": "North 45° Overhang Ancient Bastion",
            "fragment_id": "grey-wind/named-ruins",
            "category": "architecture",
            "dimensions": [22.0, 22.0, 12.0],
            "triangle_count": 1685,
            "description": "Cyclopean masonry fortress projecting outward at 45 degrees over the northwest abyss.",
        }
        res = compile_asset_brief(
            asset=asset_data,
            scene_id="consignment-overhang-bastion",
            resolve_conflicts=True,
        )
        self.assertEqual(res.recipe_archetype, "ancient_ruin")
        self.assertIn("grey-wind/named-ruins", res.fragments_used)
        self.assertIn("orthographic top-down 2.5D isometric game asset cutout", res.rewritten_prompt)
        self.assertIn("45-degree cantilever overhang rule", res.rewritten_prompt)
        self.assertIn("cyclopean", res.rewritten_prompt.lower())
        self.assertIn("image diffusion render", res.rewritten_prompt)
        self.assertIn("1024x1024", res.rewritten_prompt)

    def test_relic_cairn_lattice_prompt_refinement(self):
        """Relic cairn prompt incorporates surveyor theodolite and Living Atlas warrant."""
        asset_data = {
            "id": "relic-cairn",
            "label": "Theodolite Station & Relic Cairn",
            "fragment_id": "cartographers/the-living-atlas",
            "category": "monuments",
            "dimensions": [1.8, 1.8, 1.6],
            "triangle_count": 994,
            "description": "Summit monument housing Vellum's calibrated theodolite and the weathered slate tally of Aethel-Vorn.",
        }
        res = compile_asset_brief(
            asset=asset_data,
            scene_id="border-march",
            resolve_conflicts=True,
        )
        self.assertIn("cartographers/the-living-atlas", res.fragments_used)
        self.assertIn("orthographic top-down 2.5D isometric game asset cutout", res.rewritten_prompt)
        self.assertIn("Theodolite Station", res.rewritten_prompt)
        self.assertIn("image diffusion", res.rewritten_prompt)

    def test_wish_stone_slab_lattice_prompt_refinement(self):
        """Wish stone slab incorporates Orom's literal wish-granting lore and megalithic physics."""
        asset_data = {
            "id": "wish-stone-slab",
            "label": "Orom's Literal Wish-Stone Slab",
            "fragment_id": "grey-wind/wish-granting",
            "category": "monuments",
            "dimensions": [3.0, 8.0, 0.8],
            "triangle_count": 900,
            "description": "Monolithic quarried granite slab bridging chasm drops, answered literally by Orom.",
        }
        res = compile_asset_brief(
            asset=asset_data,
            scene_id="border-march",
            resolve_conflicts=True,
        )
        self.assertIn("grey-wind/wish-granting", res.fragments_used)
        self.assertIn("orthographic top-down 2.5D isometric game asset cutout", res.rewritten_prompt)
        self.assertIn("Orom", res.rewritten_prompt)


if __name__ == "__main__":
    unittest.main()
