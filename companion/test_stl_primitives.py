#!/usr/bin/env python3
"""
companion/test_stl_primitives.py

Automated unit tests for Fragment-to-3D-to-STL Primitive Pipeline,
procedural generators, coordinate normalization, spatial placement,
and composite terrain STL export.
Offline, stdlib + numpy only.
"""

from __future__ import annotations

import math
import struct
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.stl_primitives import (
    PlacedSTLPrimitive,
    STLPrimitive,
    composite_terrain_and_primitives_stl,
    ensure_default_stl_primitives,
    extrude_floorplan_walls,
    extrude_wall_box,
    generate_ancient_bastion_primitive,
    generate_brazier_primitive,
    generate_crate_primitive,
    generate_entropy_beacon_primitive,
    generate_glass_column_primitive,
    generate_relic_cairn_primitive,
    generate_signpost_primitive,
    generate_solar_focus_primitive,
    generate_solarium_mirror_primitive,
    generate_stasis_coffin_primitive,
    generate_wish_stone_primitive,
)
from companion.terrain_mesh import TerrainMesh, build_terrain_with_scene


class TestSTLPrimitives(unittest.TestCase):
    def test_generate_crate_primitive(self):
        crate = generate_crate_primitive(1.2, 1.2, 1.0, "test-crate", "customs-house/r6-ship")
        self.assertEqual(crate.id, "test-crate")
        self.assertEqual(crate.fragment_id, "customs-house/r6-ship")
        self.assertEqual(crate.triangle_count, 12)
        self.assertEqual(crate.dimensions, (1.2, 1.2, 1.0))

        # Base must be at Z=0.0
        v = crate.triangles.reshape(-1, 3)
        self.assertAlmostEqual(float(v[:, 2].min()), 0.0)
        self.assertAlmostEqual(float(v[:, 2].max()), 1.0)
        # Centered at (0, 0)
        self.assertAlmostEqual(float(v[:, 0].min() + v[:, 0].max()), 0.0)
        self.assertAlmostEqual(float(v[:, 1].min() + v[:, 1].max()), 0.0)

    def test_generate_ancient_bastion_primitive_overhang_compliance(self):
        bastion = generate_ancient_bastion_primitive(
            base_width=20.0,
            base_length=20.0,
            height=12.0,
            steps=4,
            overhang_angle_deg=45.0,
            primitive_id="test-bastion",
            fragment_id="grey-wind/named-ruins",
        )
        self.assertEqual(bastion.id, "test-bastion")
        self.assertEqual(bastion.fragment_id, "grey-wind/named-ruins")
        self.assertGreater(bastion.triangle_count, 10)

        # Check dimensions
        self.assertEqual(bastion.dimensions, (20.0, 20.0, 12.0))
        v = bastion.triangles.reshape(-1, 3)
        self.assertAlmostEqual(float(v[:, 2].min()), 0.0)
        self.assertAlmostEqual(float(v[:, 2].max()), 12.0)

    def test_save_and_load_binary_stl(self):
        crate = generate_crate_primitive(1.0, 1.0, 0.8)
        with tempfile.TemporaryDirectory() as tmp_dir:
            out_p = Path(tmp_dir) / "crate.stl"
            crate.save(out_p)
            self.assertTrue(out_p.is_file())

            # Binary STL formula: 84 + 50 * triangles
            expected_size = 84 + 50 * 12
            self.assertEqual(out_p.stat().st_size, expected_size)

            # Reload
            loaded = STLPrimitive.load_stl(out_p, "reloaded-crate", "customs-house/r6-ship")
            self.assertEqual(loaded.id, "reloaded-crate")
            self.assertEqual(loaded.triangle_count, 12)
            self.assertEqual(loaded.dimensions, (1.0, 1.0, 0.8))

    def test_spatial_placement_and_transformation(self):
        crate = generate_crate_primitive(1.0, 1.0, 1.0)
        # Place at (50.0, 60.0, 8.0) with yaw 90° and scale 2.0
        placed = PlacedSTLPrimitive(
            primitive=crate,
            world_x=50.0,
            world_y=60.0,
            world_z=8.0,
            yaw_deg=90.0,
            scale=2.0,
            id="placed-crate",
        )

        w_tris = placed.get_world_triangles()
        self.assertEqual(w_tris.shape, (12, 3, 3))
        v = w_tris.reshape(-1, 3)

        # Min elevation must be world_z (8.0m)
        self.assertAlmostEqual(float(v[:, 2].min()), 8.0)
        # Height is 1.0 * scale 2.0 = 2.0m -> max is 10.0m
        self.assertAlmostEqual(float(v[:, 2].max()), 10.0)

        # Center in world coordinates
        mid_x = (v[:, 0].min() + v[:, 0].max()) / 2.0
        mid_y = (v[:, 1].min() + v[:, 1].max()) / 2.0
        self.assertAlmostEqual(float(mid_x), 50.0)
        self.assertAlmostEqual(float(mid_y), 60.0)

    def test_composite_terrain_and_primitives_stl(self):
        tm = TerrainMesh(40.0, 40.0, grid_step_m=2.0, base_elevation_m=2.0)
        crate = generate_crate_primitive(2.0, 2.0, 2.0)

        placed = [
            PlacedSTLPrimitive(primitive=crate, world_x=20.0, world_y=20.0, world_z=2.0, yaw_deg=0.0, scale=1.0),
            PlacedSTLPrimitive(primitive=crate, world_x=10.0, world_y=10.0, world_z=2.0, yaw_deg=45.0, scale=1.5),
        ]

        # Stamp primitives onto terrain heightfield
        for p in placed:
            p.stamp_onto_terrain_mesh(tm)

        with tempfile.TemporaryDirectory() as tmp_dir:
            out_composite = Path(tmp_dir) / "composite.stl"
            tri_count = composite_terrain_and_primitives_stl(tm, placed, out_composite, solid_base=True)

            self.assertTrue(out_composite.is_file())
            # Terrain: 20x20 cells * 2 = 800 top triangles + solid skirt (4*20*2 + 2 = 162) = 962
            # Primitives: 2 * 12 = 24
            # Total >= 986
            self.assertGreaterEqual(tri_count, 986)

    def test_default_stl_primitives_catalog(self):
        catalog = ensure_default_stl_primitives()
        self.assertIn("r6-ship-crate", catalog)
        self.assertIn("ancient-bastion", catalog)
        self.assertIn("border-signpost", catalog)
        self.assertIn("frontier-brazier", catalog)

        # Campaign primitives
        self.assertIn("glass-stasis-coffin", catalog)
        self.assertIn("relic-cairn", catalog)
        self.assertIn("wish-stone-slab", catalog)
        self.assertIn("cryo-entropy-beacon", catalog)
        self.assertIn("glass-column-fluted", catalog)
        self.assertIn("solarium-mirror", catalog)
        self.assertIn("solar-focus-lens", catalog)

        # Check fragment linkage
        self.assertEqual(catalog["r6-ship-crate"].fragment_id, "customs-house/r6-ship")
        self.assertEqual(catalog["ancient-bastion"].fragment_id, "grey-wind/named-ruins")
        self.assertEqual(catalog["glass-stasis-coffin"].fragment_id, "space-vampires/glass-stasis-coffin")
        self.assertEqual(catalog["relic-cairn"].fragment_id, "cartographers/epistemic-survey")
        self.assertEqual(catalog["wish-stone-slab"].fragment_id, "grey-wind/wish-granting")
        self.assertEqual(catalog["cryo-entropy-beacon"].fragment_id, "space-vampires/glyph-entropy-matrix")
        self.assertEqual(catalog["glass-column-fluted"].fragment_id, "wizard-tower/glass-cathedral")
        self.assertEqual(catalog["solarium-mirror"].fragment_id, "wizard-tower/three-registers")
        self.assertEqual(catalog["solar-focus-lens"].fragment_id, "wizard-tower/first-cast-beats")

    def test_campaign_primitives_generators_grounding_and_bounds(self):
        generators = [
            (generate_stasis_coffin_primitive, (0.85, 2.2, 0.7), "space-vampires/glass-stasis-coffin"),
            (generate_relic_cairn_primitive, (1.8, 1.8, 1.6), "cartographers/epistemic-survey"),
            (generate_wish_stone_primitive, (3.0, 8.0, 0.6), "grey-wind/wish-granting"),
            (generate_entropy_beacon_primitive, (0.9, 3.2), "space-vampires/glyph-entropy-matrix"),
            (generate_glass_column_primitive, (1.5, 45.0), "wizard-tower/glass-cathedral"),
            (generate_solarium_mirror_primitive, (3.0, 3.8), "wizard-tower/three-registers"),
            (generate_solar_focus_primitive, (6.0, 5.5), "wizard-tower/first-cast-beats"),
        ]
        for fn, args, frag_id in generators:
            prim = fn(*args)
            self.assertGreater(prim.triangle_count, 0)
            self.assertEqual(prim.fragment_id, frag_id)
            v = prim.triangles.reshape(-1, 3)
            # Must sit flush at z=0.0
            self.assertAlmostEqual(float(v[:, 2].min()), 0.0, places=3, msg=f"{prim.id} min Z")
            self.assertGreater(float(v[:, 2].max()), 0.5, msg=f"{prim.id} max Z")

    def test_extrude_wall_box_geometry_and_normals(self):
        """Verify extrude_wall_box produces exactly 12 triangles with correct normals."""
        # 10m long wall segment from (0, 0) to (10, 0), thickness 0.5m, height 3.5m, base at z=2.0
        tris = extrude_wall_box(0.0, 0.0, 10.0, 0.0, z_bottom=2.0, z_top=5.5, thickness=0.5)
        self.assertEqual(len(tris), 12)

        arr = np.array(tris, dtype=np.float32)
        v = arr.reshape(-1, 3)

        self.assertAlmostEqual(float(v[:, 2].min()), 2.0)
        self.assertAlmostEqual(float(v[:, 2].max()), 5.5)

        # Top rim face normal (triangles 2 and 3) must point straight up +Z
        top_tri = arr[2]
        ab = top_tri[1] - top_tri[0]
        ac = top_tri[2] - top_tri[0]
        normal_top = np.cross(ab, ac)
        normal_top = normal_top / np.linalg.norm(normal_top)
        self.assertAlmostEqual(float(normal_top[0]), 0.0, places=4)
        self.assertAlmostEqual(float(normal_top[1]), 0.0, places=4)
        self.assertAlmostEqual(float(normal_top[2]), 1.0, places=4)

        # Bottom face normal (triangles 0 and 1) must point straight down -Z
        bot_tri = arr[0]
        ab_b = bot_tri[1] - bot_tri[0]
        ac_b = bot_tri[2] - bot_tri[0]
        normal_bot = np.cross(ab_b, ac_b)
        normal_bot = normal_bot / np.linalg.norm(normal_bot)
        self.assertAlmostEqual(float(normal_bot[2]), -1.0, places=4)

    def test_extrude_floorplan_walls_customs_house_open_roof(self):
        """Verify Customs House floorplan extrudes into 3D walls with open roof and doorway openings."""
        customs_fp = REPO_ROOT / "library" / "floorplans" / "customs-house.json"
        wall_prim = extrude_floorplan_walls(
            customs_fp,
            anchor_x=0.0,
            anchor_y=0.0,
            base_z=0.0,
            default_wall_height=4.0,
            cut_portals=True,
            primitive_id="customs-house-test-walls",
        )

        self.assertEqual(wall_prim.id, "customs-house-test-walls")
        self.assertGreater(wall_prim.triangle_count, 100)
        self.assertIn("No Ceiling", wall_prim.name)

        v = wall_prim.triangles.reshape(-1, 3)
        self.assertAlmostEqual(float(v[:, 2].min()), 0.0, places=2)
        # Wall height up to 4.0m
        self.assertAlmostEqual(float(v[:, 2].max()), 4.0, places=2)

        # Verify doorway portal cut: intake outer gate is at local x=-8, z=0 (rel x=-8.0, rel y=-30.0)
        # At exactly the door centerline, there should NOT be a solid wall blocking the passage at z=1.0
        # Check that no vertex sits at the blocked center of the doorway [x=-8, y=-30, z=1.0]
        door_x, door_y = -8.0, -30.0
        dists = np.hypot(v[:, 0] - door_x, v[:, 1] - door_y)
        # Mid-height vertices (z between 0.5 and 2.5) should be cleared away from door center
        mid_mask = (v[:, 2] > 0.5) & (v[:, 2] < 2.5)
        if np.any(mid_mask):
            self.assertGreater(float(dists[mid_mask].min()), 0.2, "Doorway center at mid-height must be clear")

    def test_build_terrain_with_scene_pipeline(self):
        """Verify end-to-end composite build of terrain + decorative cairn primitive + customs house walls."""
        map_path = REPO_ROOT / "library" / "maps" / "border-march.json"
        customs_fp = REPO_ROOT / "library" / "floorplans" / "customs-house.json"

        with tempfile.TemporaryDirectory() as tmp_dir:
            out_dir = Path(tmp_dir) / "test_scene_build"
            report = build_terrain_with_scene(
                map_path=map_path,
                floorplan_path=customs_fp,
                primitive_ids=["relic-cairn"],
                out_dir=out_dir,
            )

            self.assertEqual(report["map_id"], "border-march")
            self.assertGreater(report["triangles"], 130000)
            self.assertGreater(report["stl_primitives_placed"], 5)

            # Check output files exist
            stl_p = out_dir / "border-march.stl"
            self.assertTrue(stl_p.is_file())
            self.assertGreater(stl_p.stat().st_size, 5_000_000)

            relief_p = out_dir / "topdown_relief.png"
            self.assertTrue(relief_p.is_file())

            depth_p = out_dir / "depth_map.png"
            self.assertTrue(depth_p.is_file())

            # Check GLB export
            glb_p = out_dir / "border-march.glb"
            if glb_p.is_file():
                self.assertGreater(glb_p.stat().st_size, 1_000_000)


if __name__ == "__main__":
    unittest.main()
