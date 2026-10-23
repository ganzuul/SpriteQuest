#!/usr/bin/env python3
"""
companion/stagecraft_anchoring.py

Robotics-Grounded Stagecraft & Acting Engine for SpriteQuest.

Synthesizes four frameworks from cognitive robotics and Human-Robot Interaction (HRI):
  1. Semantic Anchoring (Coradeschi & Saffiotti): Binds continuous metric pose (x, y, z)
     to symbolic stagecraft predicates (Proscenium state, Playing Area, Cue Mark).
  2. Affordance Templates (Hart & Hambuchen, NASA / DRC): Object-centric spatial workspaces
     parameterizing entry poses, reach radii, standing preconditions, and action verbs.
  3. Theatrical Joint-Action Blocking (Guy Hoffman, MIT): Separates spatial choreography
     and status differentials (Upstage Authority vs. Downstage Supplicant) from dialogue.
  4. Shared Spatial Blackboard (ROS2 / BehaviorTree): Produces deterministic snapshots and
     injectable [STAGE DIRECTION] blocks for Lattice workflows.

Stdlib + ScenePlacementEngine only.
"""

from __future__ import annotations

import json
import math
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent


@dataclass(frozen=True)
class AffordanceVerb:
    verb: str
    label: str
    stage_beat: str


@dataclass(frozen=True)
class AffordanceTemplate:
    id: str
    prop_id: str
    label: str
    world_x: float
    world_y: float
    world_z: float
    reach_radius_m: float
    required_standing: str  # "any" | "written"
    playing_area_id: str | None
    verbs: tuple[AffordanceVerb, ...] = ()


@dataclass
class SemanticAnchor:
    actor_id: str
    pose: dict[str, float]
    scene_id: str | None
    zone_id: str | None
    zone_name: str
    proscenium_state: str  # "wilderness" | "apron_threshold" | "on_stage"
    playing_area: dict[str, Any] | None
    anchored_cue_mark: dict[str, Any] | None
    status_differential: str
    active_camera_vantage: str


class StagecraftAnchoringEngine:
    """Projects floorplan stagecraft into world space and evaluates semantic anchors & affordances."""

    def __init__(self, scene_engine: Any):
        self.scene_engine = scene_engine
        self.terrain = scene_engine.terrain
        self.map_data = scene_engine.map_data

        self.proscenium_line: dict[str, Any] | None = None
        self.playing_areas: list[dict[str, Any]] = []
        self.cue_marks: list[dict[str, Any]] = []
        self.sightlines: list[dict[str, Any]] = []
        self.affordance_templates: list[AffordanceTemplate] = []

        self._project_stagecraft_primitives()
        self._build_affordance_templates()

    def _project_stagecraft_primitives(self) -> None:
        """Transform floorplan stagecraft coordinates onto world build plates."""
        for plate in self.scene_engine.build_plates:
            fp_rel = plate.get("scene_floorplan")
            if not fp_rel:
                continue
            fp_path = REPO_ROOT / fp_rel
            if not fp_path.exists():
                continue

            fp_data = json.loads(fp_path.read_text(encoding="utf-8"))
            scene_id = fp_data.get("scene_id", plate.get("id"))
            anchor = plate.get("anchor", {})
            anc_x = float(anchor.get("center_x", 0.0))
            anc_y = float(anchor.get("center_y", 0.0))
            anc_z = float(anchor.get("elevation", 0.0))

            scale_info = fp_data.get("scale", {})
            center_xz = scale_info.get("center_xz", [0.0, 30.0])
            cx, cz = float(center_xz[0]), float(center_xz[1])

            sc = fp_data.get("stagecraft", {})
            if not sc:
                continue

            # 1. Proscenium Line
            prosc = sc.get("proscenium_line")
            if prosc:
                s = prosc.get("start", [-16.0, 0.0, 16.0])
                e = prosc.get("end", [16.0, 0.0, 16.0])
                self.proscenium_line = {
                    "scene_id": scene_id,
                    "start": [
                        round(anc_x + (float(s[0]) - cx), 2),
                        round(anc_y + (float(s[2]) - cz), 2),
                        round(anc_z + float(s[1]), 2),
                    ],
                    "end": [
                        round(anc_x + (float(e[0]) - cx), 2),
                        round(anc_y + (float(e[2]) - cz), 2),
                        round(anc_z + float(e[1]), 2),
                    ],
                    "facing_angle_deg": float(prosc.get("facing_angle_deg", 0.0)),
                    "description": prosc.get("description", ""),
                }

            # 2. Playing Areas
            for pa_id, pa in sc.get("playing_areas", {}).items():
                wx = round(anc_x + (float(pa.get("x", 0.0)) - cx), 2)
                wy = round(anc_y + (float(pa.get("z", 0.0)) - cz), 2)
                wz = round(anc_z + float(pa.get("y", 0.0)), 2)
                self.playing_areas.append({
                    "id": pa_id,
                    "scene_id": scene_id,
                    "world_x": wx,
                    "world_y": wy,
                    "world_z": wz,
                    "radius": float(pa.get("radius", 3.0)),
                    "blocking_label": pa.get("blocking_label", pa_id),
                })

            # 3. Actor Cue Marks
            for cm in sc.get("cue_marks", []):
                wx = round(anc_x + (float(cm.get("x", 0.0)) - cx), 2)
                wy = round(anc_y + (float(cm.get("z", 0.0)) - cz), 2)
                wz = round(anc_z + float(cm.get("y", 0.0)), 2)
                cm_id = cm["id"]
                req_standing = "written" if "hollis" in cm_id or float(cm.get("y", 0.0)) >= 0.5 else "any"
                self.cue_marks.append({
                    "id": cm_id,
                    "scene_id": scene_id,
                    "label": cm.get("label", cm_id),
                    "world_x": wx,
                    "world_y": wy,
                    "world_z": wz,
                    "facing": cm.get("facing", "stage_right"),
                    "description": cm.get("description", ""),
                    "required_standing": req_standing,
                    "capture_radius_m": 3.5,
                })

            # 4. Theatrical Camera Sightlines
            for sl in sc.get("sightlines", []):
                pos = sl.get("position", [0.0, 1.8, 14.0])
                tgt = sl.get("target", [0.0, 1.4, 30.0])
                self.sightlines.append({
                    "id": sl["id"],
                    "scene_id": scene_id,
                    "type": sl.get("type", "camera_vantage"),
                    "position": [
                        round(anc_x + (float(pos[0]) - cx), 2),
                        round(anc_y + (float(pos[2]) - cz), 2),
                        round(anc_z + float(pos[1]), 2),
                    ],
                    "target": [
                        round(anc_x + (float(tgt[0]) - cx), 2),
                        round(anc_y + (float(tgt[2]) - cz), 2),
                        round(anc_z + float(tgt[1]), 2),
                    ],
                    "fov_deg": float(sl.get("fov_deg", 60.0)),
                    "description": sl.get("description", ""),
                })

    def _build_affordance_templates(self) -> None:
        """Bind NASA-style Affordance Templates to stage fixtures and props."""
        prop_by_id = {p.id: p for p in self.scene_engine.props}
        portal_by_id = {p.id: p for p in self.scene_engine.portals}

        # 1. Weigh Table & Two-Pan Balance Scale (Center Counter)
        if "weigh_table" in prop_by_id:
            p = prop_by_id["weigh_table"]
            self.affordance_templates.append(
                AffordanceTemplate(
                    id="at-weigh-scale",
                    prop_id=p.id,
                    label="Inspection Weigh Table & Balance Scale",
                    world_x=p.world_x,
                    world_y=p.world_y,
                    world_z=p.world_z,
                    reach_radius_m=5.5,
                    required_standing="any",
                    playing_area_id="center_counter",
                    verbs=(
                        AffordanceVerb(
                            verb="weigh_cargo",
                            label="Place crated assets on the balance pan",
                            stage_beat="hefts the crated asset onto the zinc weigh pan; the iron beam clatters to equilibrium",
                        ),
                        AffordanceVerb(
                            verb="present_manifest",
                            label="Slide shipping slip across the zinc counter",
                            stage_beat="slides the shipping slip across the scarred zinc counter toward the quartermaster's grille",
                        ),
                    ),
                )
            )

        # 2. Quartermaster's Ledger Desk (Upstage Authority Dais)
        if "quartermaster_desk" in prop_by_id:
            p = prop_by_id["quartermaster_desk"]
            self.affordance_templates.append(
                AffordanceTemplate(
                    id="at-quartermaster-desk",
                    prop_id=p.id,
                    label="Hollis's Quartermaster Ledger Desk",
                    world_x=p.world_x,
                    world_y=p.world_y,
                    world_z=p.world_z,
                    reach_radius_m=4.5,
                    required_standing="written",
                    playing_area_id="upstage_quartermaster",
                    verbs=(
                        AffordanceVerb(
                            verb="inscribe_ledger",
                            label="Inscribe ruling in the two-column ledger",
                            stage_beat="dips the nib and inscribes a binding line into the two-column ledger",
                        ),
                        AffordanceVerb(
                            verb="strike_seal",
                            label="Strike the brass clearance stamp",
                            stage_beat="brings the brass clearance stamp down upon the manifest with a decisive thud",
                        ),
                        AffordanceVerb(
                            verb="grant_clearance",
                            label="Issue warrant of standing",
                            stage_beat="countersigns the warrant and slides it back through the iron grille",
                        ),
                    ),
                )
            )

        # 3. Forfeit Wicket (Upstage Left Wings)
        if "gate-forfeit-wicket" in portal_by_id:
            pt = portal_by_id["gate-forfeit-wicket"]
            self.affordance_templates.append(
                AffordanceTemplate(
                    id="at-forfeit-wicket",
                    prop_id=pt.id,
                    label="The Forfeit Wicket (Riveted Iron Door)",
                    world_x=pt.world_x,
                    world_y=pt.world_y,
                    world_z=pt.world_z,
                    reach_radius_m=4.5,
                    required_standing="any",
                    playing_area_id="forfeit_door",
                    verbs=(
                        AffordanceVerb(
                            verb="retreat_to_wings",
                            label="Step through the forfeit wicket into the yard",
                            stage_beat="withdraws Upstage Left through the riveted iron forfeit wicket into the uncredited yard",
                        ),
                    ),
                )
            )

        # 4. Cleared Transit Turnstile Gate (Upstage Right Egress)
        if "gate-cleared-barrier" in portal_by_id:
            pt = portal_by_id["gate-cleared-barrier"]
            self.affordance_templates.append(
                AffordanceTemplate(
                    id="at-cleared-barrier",
                    prop_id=pt.id,
                    label="Cleared Transit Boom Gate",
                    world_x=pt.world_x,
                    world_y=pt.world_y,
                    world_z=pt.world_z,
                    reach_radius_m=4.5,
                    required_standing="written",
                    playing_area_id=None,
                    verbs=(
                        AffordanceVerb(
                            verb="raise_boom_gate",
                            label="Unclamp seal and raise the counterbalanced boom gate",
                            stage_beat="releases the seal clamp and raises the counterbalanced timber boom toward the kingdom road",
                        ),
                    ),
                )
            )

        # 5. Outdoor Wilderness Fixtures
        for op in self.scene_engine.get_outdoor_props():
            self.affordance_templates.append(
                AffordanceTemplate(
                    id=f"at-{op.id}",
                    prop_id=op.id,
                    label=op.label,
                    world_x=op.world_x,
                    world_y=op.world_y,
                    world_z=op.world_z,
                    reach_radius_m=4.5,
                    required_standing="any",
                    playing_area_id=None,
                    verbs=(
                        AffordanceVerb(
                            verb="inspect_fixture",
                            label=f"Examine {op.label}",
                            stage_beat=f"pauses to examine the {op.label.lower()}",
                        ),
                    ),
                )
            )

    def anchor_actor(
        self,
        actor_id: str,
        x: float,
        y: float,
        facing_deg: float = 0.0,
        written: bool = False,
        disposition: str = "unreliable",
    ) -> SemanticAnchor:
        """
        Compute Coradeschi & Saffiotti's Semantic Anchor for an actor at (x, y).
        """
        z = float(self.terrain.sample_elevation(x, y)) if self.terrain is not None else 6.0
        zone = self.scene_engine.get_zone_at(x, y)
        if zone is not None:
            z = max(z, zone.elevation)

        # 1. Proscenium state evaluation
        proscenium_state = "wilderness"
        if self.proscenium_line is not None:
            px_min = min(self.proscenium_line["start"][0], self.proscenium_line["end"][0])
            px_max = max(self.proscenium_line["start"][0], self.proscenium_line["end"][0])
            py_line = self.proscenium_line["start"][1]

            if px_min <= x <= px_max and py_line <= y <= 95.0:
                proscenium_state = "on_stage"
            elif zone is not None and y < py_line:
                proscenium_state = "apron_threshold"

        # 2. Playing Area evaluation
        active_pa: dict[str, Any] | None = None
        best_pa_dist = float("inf")
        for pa in self.playing_areas:
            d = math.hypot(x - pa["world_x"], y - pa["world_y"])
            if d <= pa["radius"] + 1.5 and d < best_pa_dist:
                best_pa_dist = d
                active_pa = {
                    "id": pa["id"],
                    "label": pa["blocking_label"],
                    "distance_m": round(d, 2),
                }

        # 3. Actor Cue Mark & Standing Gate evaluation
        anchored_cm: dict[str, Any] | None = None
        best_cm_dist = float("inf")
        for cm in self.cue_marks:
            d = math.hypot(x - cm["world_x"], y - cm["world_y"])
            if d <= cm["capture_radius_m"] and d < best_cm_dist:
                best_cm_dist = d
                if cm["required_standing"] == "written" and not written:
                    verdict = "unwritten_usurpation"
                else:
                    verdict = "authorized"
                anchored_cm = {
                    "id": cm["id"],
                    "label": cm["label"],
                    "facing": cm["facing"],
                    "distance_m": round(d, 2),
                    "required_standing": cm["required_standing"],
                    "standing_verdict": verdict,
                }

        # 4. Dramatic Status Differential & Camera Vantage
        if anchored_cm and anchored_cm["id"] == "mark_hollis":
            if anchored_cm["standing_verdict"] == "authorized":
                status_diff = "authority_at_dais"
            else:
                status_diff = "unwritten_on_authority_mark"
            cam_vantage = "cam_hollis_over_shoulder"
        elif proscenium_state == "on_stage":
            status_diff = "supplicant_to_authority"
            cam_vantage = "cam_proscenium_dialogue"
        elif proscenium_state == "apron_threshold":
            status_diff = "entrant_at_threshold"
            cam_vantage = "cam_proscenium_dialogue"
        else:
            status_diff = "roving_observer"
            cam_vantage = "macro_exploration"

        return SemanticAnchor(
            actor_id=actor_id,
            pose={"x": round(x, 2), "y": round(y, 2), "z": round(z, 2), "facing_deg": round(facing_deg, 1)},
            scene_id=zone.scene_id if zone else ("customs-house" if proscenium_state != "wilderness" else None),
            zone_id=zone.id if zone else None,
            zone_name=zone.name if zone else "Border Approach (Wilderness)",
            proscenium_state=proscenium_state,
            playing_area=active_pa,
            anchored_cue_mark=anchored_cm,
            status_differential=status_diff,
            active_camera_vantage=cam_vantage,
        )

    def evaluate_affordances(
        self,
        x: float,
        y: float,
        written: bool = False,
        disposition: str = "unreliable",
    ) -> list[dict[str, Any]]:
        """
        Evaluate NASA Affordance Templates within reach of (x, y) against actor standing.
        """
        results: list[dict[str, Any]] = []
        for at in self.affordance_templates:
            dist = math.hypot(x - at.world_x, y - at.world_y)
            if dist > at.reach_radius_m:
                continue

            if at.required_standing == "written" and not written:
                status = "standing_refused"
                reason = "Requires written standing (role.authored) in the Hollis Ledger"
            else:
                status = "available"
                reason = "Within reach and standing verified"

            results.append({
                "id": at.id,
                "prop_id": at.prop_id,
                "label": at.label,
                "distance_m": round(dist, 2),
                "required_standing": at.required_standing,
                "status": status,
                "reason": reason,
                "verbs": [asdict(v) for v in at.verbs],
            })
        results.sort(key=lambda item: item["distance_m"])
        return results

    def compose_stage_direction(
        self,
        anchor: SemanticAnchor,
        affordances: list[dict[str, Any]],
        written: bool = False,
        disposition: str = "unreliable",
    ) -> str:
        """
        Synthesize Guy Hoffman's Theatrical Stage Direction block for LLM prompt injection.
        """
        lines = [
            f"[STAGE DIRECTION · VANTAGE: {anchor.active_camera_vantage} · ZONE: {anchor.zone_name}]"
        ]

        # 1. Proscenium & Blocking line
        if anchor.proscenium_state == "wilderness":
            lines.append(
                f"- Spatial Blocking: Actor '{anchor.actor_id}' is roving in the unscripted wilderness "
                f"at ({anchor.pose['x']}m, {anchor.pose['y']}m, elev {anchor.pose['z']}m) outside the proscenium threshold."
            )
        elif anchor.proscenium_state == "apron_threshold":
            lines.append(
                f"- Spatial Blocking: Actor '{anchor.actor_id}' stands in the {anchor.zone_name} "
                f"approaching the proscenium line before the inspection hall."
            )
        else:
            pa_label = anchor.playing_area["label"] if anchor.playing_area else "Active Stage"
            lines.append(
                f"- Spatial Blocking: Actor '{anchor.actor_id}' has crossed the Proscenium Line into {pa_label} "
                f"at ({anchor.pose['x']}m, {anchor.pose['y']}m, elev {anchor.pose['z']}m)."
            )

        # 2. Cue Mark & Standing Gate
        if anchor.anchored_cue_mark:
            cm = anchor.anchored_cue_mark
            if cm["standing_verdict"] == "authorized":
                lines.append(
                    f"- Cue Mark Hit: Anchored at {cm['label']} facing {cm['facing']}. "
                    f"Standing gate: AUTHORIZED ({anchor.status_differential})."
                )
            else:
                lines.append(
                    f"- Cue Mark Fault: Actor stepped onto {cm['label']} (+0.6m dais) without a written part! "
                    f"Standing gate: UNWRITTEN USURPATION. The actor has no authority to operate the ledger and must yield to the wings."
                )

        # 3. Co-Actor Joint-Action Reference
        if anchor.proscenium_state in ("on_stage", "apron_threshold"):
            lines.append(
                "- Co-Actor Orientation: Upstage Right at Mark H (63.0m, 69.0m, +6.6m dais), "
                "Quartermaster Hollis presides behind the cast-iron grille over the open two-column ledger."
            )

        # 4. Active Affordance Templates
        avail = [a for a in affordances if a["status"] == "available"]
        refused = [a for a in affordances if a["status"] == "standing_refused"]

        if avail:
            verb_strs = []
            for a in avail:
                for v in a["verbs"]:
                    verb_strs.append(f"{v['verb']} ({v['label']})")
            lines.append(f"- Active Affordance Templates (In Reach): {'; '.join(verb_strs)}.")
        else:
            lines.append("- Active Affordance Templates (In Reach): None within arm's reach; move to a cue mark or fixture.")

        if refused:
            ref_labels = [f"{r['label']} [LOCKED: {r['reason']}]" for r in refused]
            lines.append(f"- Refused Affordances: {'; '.join(ref_labels)}.")

        return "\n".join(lines)

    def build_blackboard(
        self,
        actor_id: str = "player",
        x: float = 35.0,
        y: float = 65.0,
        facing_deg: float = 90.0,
        written: bool = False,
        disposition: str = "unreliable",
    ) -> dict[str, Any]:
        """Build complete ROS2/BT-style Shared Spatial Blackboard snapshot for Lattice."""
        anchor = self.anchor_actor(
            actor_id=actor_id,
            x=x,
            y=y,
            facing_deg=facing_deg,
            written=written,
            disposition=disposition,
        )
        affordances = self.evaluate_affordances(
            x=x, y=y, written=written, disposition=disposition
        )
        stage_direction = self.compose_stage_direction(
            anchor=anchor,
            affordances=affordances,
            written=written,
            disposition=disposition,
        )
        return {
            "anchor": asdict(anchor),
            "affordances": affordances,
            "stage_direction": stage_direction,
        }

    def export_stagecraft_manifest(self) -> dict[str, Any]:
        """Export projected stagecraft geometry and affordance templates for the 2.5D web viewer."""
        return {
            "proscenium_line": self.proscenium_line,
            "playing_areas": self.playing_areas,
            "cue_marks": self.cue_marks,
            "sightlines": self.sightlines,
            "affordance_templates": [asdict(at) for at in self.affordance_templates],
        }


def load_stagecraft_engine(map_path: Path) -> StagecraftAnchoringEngine:
    from companion.scene_placement import load_and_place_map_scenes

    _, scene_engine = load_and_place_map_scenes(map_path)
    return StagecraftAnchoringEngine(scene_engine)
