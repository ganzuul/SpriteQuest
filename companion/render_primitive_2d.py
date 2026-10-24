#!/usr/bin/env python3
"""
companion/render_primitive_2d.py

2D Image Synthesis & Technical Blueprint Renderer for Terrain & Scene STL Primitives.
Provides crisp 2D orthographic/isometric asset previews, blueprint graphics,
and data URLs for the 2.5D Parallax Web Viewer and SillyTavern extensions.

Pure Python stdlib + numpy + Pillow. Zero external heavy dependencies.
"""

from __future__ import annotations

import base64
import html
import io
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parent.parent
RENDERS_DIR = REPO_ROOT / "renders" / "primitives"


@dataclass
class Primitive2DVisual:
    id: str
    name: str
    fragment_id: str
    category: str
    dimensions: tuple[float, float, float]
    triangle_count: int
    svg_data_url: str
    png_path: Path | None = None
    png_data_url: str | None = None
    diffusion_prompt: str = ""


# Detailed vector SVG blueprints for every primitive
PRIMITIVE_VECTOR_SCHEMAS: dict[str, dict[str, Any]] = {
    "ancient-bastion": {
        "title": "Ancient 45° Stepped Bastion",
        "category": "architecture",
        "color_accent": "#f59e0b",
        "color_bg": "#1c1813",
        "color_lines": "#d97706",
        "svg_inner": """
            <!-- 4 stepped tiers with 45-degree overhang -->
            <polygon points="50,220 350,220 330,180 70,180" fill="#2d261e" stroke="#78593a" stroke-width="2"/>
            <polygon points="70,180 330,180 310,140 90,140" fill="#3d3328" stroke="#a37a4c" stroke-width="2"/>
            <polygon points="90,140 310,140 280,100 120,100" fill="#4d4032" stroke="#d49b5a" stroke-width="2"/>
            <polygon points="120,100 280,100 250,60 150,60" fill="#665440" stroke="#f59e0b" stroke-width="2.5"/>
            <!-- 45-degree angle guides -->
            <line x1="50" y1="220" x2="150" y2="60" stroke="#22d3ee" stroke-width="1.5" stroke-dasharray="4 3"/>
            <line x1="350" y1="220" x2="250" y2="60" stroke="#22d3ee" stroke-width="1.5" stroke-dasharray="4 3"/>
            <!-- Callouts -->
            <text x="32" y="145" fill="#22d3ee" font-size="9" font-family="monospace">45° OVERHANG</text>
            <text x="200" y="85" fill="#fef08a" font-size="10" font-family="monospace" font-weight="700" text-anchor="middle">TIER 4 (SUMMIT)</text>
            <text x="200" y="205" fill="#d49b5a" font-size="9" font-family="monospace" text-anchor="middle">BASE: 22m × 22m</text>
        """,
    },
    "relic-cairn": {
        "title": "Cartographer Relic Cairn & Theodolite",
        "category": "monuments",
        "color_accent": "#38bdf8",
        "color_bg": "#101720",
        "color_lines": "#0284c7",
        "svg_inner": """
            <!-- Conical dry-stone cairn -->
            <polygon points="90,220 310,220 280,175 120,175" fill="#1e293b" stroke="#475569" stroke-width="2"/>
            <polygon points="120,175 280,175 255,135 145,135" fill="#334155" stroke="#64748b" stroke-width="2"/>
            <polygon points="145,135 255,135 230,100 170,100" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
            <!-- Bronze mounting post and theodolite -->
            <rect x="193" y="60" width="14" height="40" fill="#ca8a04" stroke="#eab308" stroke-width="1.5"/>
            <circle cx="200" cy="55" r="16" fill="#ca8a04" stroke="#eab308" stroke-width="2"/>
            <line x1="175" y1="55" x2="225" y2="55" stroke="#eab308" stroke-width="3" stroke-linecap="round"/>
            <circle cx="200" cy="55" r="5" fill="#38bdf8"/>
            <text x="200" y="240" fill="#94a3b8" font-size="9" font-family="monospace" text-anchor="middle">DRY-STONE FOUNDATION (1.8m × 1.8m)</text>
            <text x="200" y="38" fill="#38bdf8" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">CALIBRATED THEODOLITE</text>
        """,
    },
    "wish-stone-slab": {
        "title": "Orom's Literal Wish-Stone Slab",
        "category": "monuments",
        "color_accent": "#a855f7",
        "color_bg": "#19121e",
        "color_lines": "#9333ea",
        "svg_inner": """
            <!-- Megalithic Bridge Slab -->
            <polygon points="60,110 340,110 320,170 40,170" fill="#2e1065" stroke="#7e22ce" stroke-width="2.5"/>
            <polygon points="40,170 320,170 320,205 40,205" fill="#1e1b4b" stroke="#6b21a8" stroke-width="2"/>
            <!-- Chiseled runes on lateral face -->
            <text x="80" y="192" fill="#c084fc" font-size="14" font-family="serif">ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ</text>
            <text x="200" y="145" fill="#e9d5ff" font-size="10" font-family="monospace" font-weight="700" text-anchor="middle">SOLID QUARRIED SLATE BRIDGE (3m × 8m × 0.6m)</text>
            <line x1="60" y1="95" x2="340" y2="95" stroke="#a855f7" stroke-width="1" stroke-dasharray="3 2"/>
            <text x="200" y="88" fill="#c084fc" font-size="8.5" font-family="monospace" text-anchor="middle">SPAN CAPACITY: 12 METRIC TONS</text>
        """,
    },
    "cryo-entropy-beacon": {
        "title": "Cryo-Entropy Beacon Monolith",
        "category": "hazards",
        "color_accent": "#06b6d4",
        "color_bg": "#0c151c",
        "color_lines": "#0891b2",
        "svg_inner": """
            <!-- Obsidian obelisk shaft -->
            <polygon points="170,220 230,220 215,80 185,80" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
            <!-- Pyramidion apex -->
            <polygon points="185,80 215,80 200,45" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
            <!-- Spiked base collar -->
            <polygon points="150,220 250,220 235,245 165,245" fill="#1e293b" stroke="#334155" stroke-width="2"/>
            <!-- Coolant channels -->
            <line x1="200" y1="80" x2="200" y2="220" stroke="#06b6d4" stroke-width="3"/>
            <circle cx="200" cy="45" r="4" fill="#67e8f9"/>
            <text x="200" y="32" fill="#67e8f9" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">-273.15°C (ABSOLUTE ZERO)</text>
            <text x="200" y="260" fill="#38bdf8" font-size="8.5" font-family="monospace" text-anchor="middle">OBSIDIAN ENTROPY MATRIX</text>
        """,
    },
    "glass-column-fluted": {
        "title": "Fluted Asteroid-Glass Cathedral Column",
        "category": "architecture",
        "color_accent": "#2dd4bf",
        "color_bg": "#0f1717",
        "color_lines": "#0d9488",
        "svg_inner": """
            <!-- Fluted column shaft -->
            <rect x="155" y="60" width="90" height="150" fill="#134e4a" stroke="#14b8a6" stroke-width="1.5" opacity="0.6"/>
            <!-- 16 flutes vertical lines -->
            <line x1="162" y1="60" x2="162" y2="210" stroke="#2dd4bf" stroke-width="1.5"/>
            <line x1="172" y1="60" x2="172" y2="210" stroke="#5eead4" stroke-width="2"/>
            <line x1="182" y1="60" x2="182" y2="210" stroke="#2dd4bf" stroke-width="1.5"/>
            <line x1="192" y1="60" x2="192" y2="210" stroke="#5eead4" stroke-width="2"/>
            <line x1="200" y1="60" x2="200" y2="210" stroke="#99f6e4" stroke-width="2.5"/>
            <line x1="208" y1="60" x2="208" y2="210" stroke="#5eead4" stroke-width="2"/>
            <line x1="218" y1="60" x2="218" y2="210" stroke="#2dd4bf" stroke-width="1.5"/>
            <line x1="228" y1="60" x2="228" y2="210" stroke="#5eead4" stroke-width="2"/>
            <line x1="238" y1="60" x2="238" y2="210" stroke="#2dd4bf" stroke-width="1.5"/>
            <!-- Base torus and plinth -->
            <polygon points="140,210 260,210 270,235 130,235" fill="#042f2e" stroke="#2dd4bf" stroke-width="2"/>
            <!-- Capital flare -->
            <polygon points="140,60 260,60 275,35 125,35" fill="#042f2e" stroke="#2dd4bf" stroke-width="2"/>
            <text x="200" y="25" fill="#5eead4" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">CAPITAL (3.75m DIA · 45m HEIGHT)</text>
            <text x="200" y="250" fill="#2dd4bf" font-size="8.5" font-family="monospace" text-anchor="middle">SPUN ASTEROID SILICA</text>
        """,
    },
    "solar-focus-lens": {
        "title": "High Chancel Solar Focus Lens & Dais",
        "category": "instruments",
        "color_accent": "#f59e0b",
        "color_bg": "#1c1810",
        "color_lines": "#d97706",
        "svg_inner": """
            <!-- 3 stepped circular dais tiers -->
            <polygon points="70,225 330,225 315,200 85,200" fill="#2d2212" stroke="#b45309" stroke-width="2"/>
            <polygon points="85,200 315,200 295,175 105,175" fill="#3d3018" stroke="#d97706" stroke-width="2"/>
            <polygon points="105,175 295,175 270,150 130,150" fill="#52401f" stroke="#f59e0b" stroke-width="2"/>
            <!-- Gimbal ring -->
            <circle cx="200" cy="95" r="48" fill="none" stroke="#f59e0b" stroke-width="3.5"/>
            <!-- Biconvex lens -->
            <ellipse cx="200" cy="95" rx="36" ry="46" fill="#38bdf8" opacity="0.45" stroke="#bae6fd" stroke-width="1.5"/>
            <!-- Altar cradle -->
            <rect x="165" y="130" width="70" height="20" fill="#1c1917" stroke="#ca8a04" stroke-width="1.5"/>
            <text x="200" y="98" fill="#fef08a" font-size="11" font-weight="900" font-family="monospace" text-anchor="middle">☀️ FOCUS</text>
            <text x="200" y="245" fill="#f59e0b" font-size="8.5" font-family="monospace" text-anchor="middle">HIGH CHANCEL DAIS (6m × 6m × 5.5m)</text>
        """,
    },
    "solarium-mirror": {
        "title": "Solarium Articulated Alignment Mirror",
        "category": "instruments",
        "color_accent": "#eab308",
        "color_bg": "#181710",
        "color_lines": "#ca8a04",
        "svg_inner": """
            <!-- Pedestal base -->
            <polygon points="140,225 260,225 250,165 150,165" fill="#292518" stroke="#ca8a04" stroke-width="2"/>
            <!-- Fork stanchions -->
            <rect x="150" y="110" width="16" height="55" fill="#423b20" stroke="#eab308" stroke-width="1.5"/>
            <rect x="234" y="110" width="16" height="55" fill="#423b20" stroke="#eab308" stroke-width="1.5"/>
            <!-- Concave parabolic dish tilted 45 deg -->
            <ellipse cx="200" cy="90" rx="50" ry="24" transform="rotate(-20 200 90)" fill="#fef08a" opacity="0.4" stroke="#fde047" stroke-width="3"/>
            <circle cx="200" cy="90" r="10" fill="#ca8a04" stroke="#eab308" stroke-width="1"/>
            <text x="200" y="245" fill="#eab308" font-size="8.5" font-family="monospace" text-anchor="middle">PARABOLIC DISH (3.0m DIA · 3.8m HEIGHT)</text>
        """,
    },
    "glass-stasis-coffin": {
        "title": "Hexagonal Borosilicate Stasis Coffin",
        "category": "vessels",
        "color_accent": "#0284c7",
        "color_bg": "#0c1522",
        "color_lines": "#0369a1",
        "svg_inner": """
            <!-- Hexagonal crystal casket -->
            <polygon points="120,80 280,80 320,150 280,220 120,220 80,150" fill="#0f172a" stroke="#0284c7" stroke-width="3"/>
            <polygon points="125,88 275,88 310,150 275,212 125,212 90,150" fill="#0369a1" opacity="0.35"/>
            <!-- Internal silhouette and conduits -->
            <ellipse cx="200" cy="130" rx="20" ry="24" fill="#38bdf8" opacity="0.5"/>
            <rect x="175" y="160" width="50" height="40" rx="4" fill="#38bdf8" opacity="0.4"/>
            <line x1="80" y1="150" x2="320" y2="150" stroke="#bae6fd" stroke-width="1" stroke-dasharray="4 2"/>
            <text x="200" y="70" fill="#38bdf8" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">CRYO COFFIN #00-NULL</text>
            <text x="200" y="238" fill="#7dd3fc" font-size="8.5" font-family="monospace" text-anchor="middle">DIMENSIONS: 0.85m × 2.20m × 0.76m</text>
        """,
    },
    "r6-ship-crate": {
        "title": "R6-SHIP Standard Bounding Crate",
        "category": "containers",
        "color_accent": "#f59e0b",
        "color_bg": "#1c1712",
        "color_lines": "#b45309",
        "svg_inner": """
            <rect x="120" y="70" width="160" height="150" rx="4" fill="#6b4423" stroke="#3d220f" stroke-width="3"/>
            <line x1="120" y1="120" x2="280" y2="120" stroke="#4a2c13" stroke-width="3" stroke-dasharray="2 1"/>
            <line x1="120" y1="170" x2="280" y2="170" stroke="#4a2c13" stroke-width="3" stroke-dasharray="2 1"/>
            <line x1="125" y1="75" x2="275" y2="215" stroke="#262626" stroke-width="8" stroke-linecap="round"/>
            <line x1="125" y1="75" x2="275" y2="215" stroke="#737373" stroke-width="4" stroke-linecap="round"/>
            <rect x="120" y="70" width="30" height="30" fill="#171717" stroke="#404040" stroke-width="2"/>
            <circle cx="128" cy="78" r="2.5" fill="#a3a3a3"/>
            <rect x="250" y="70" width="30" height="30" fill="#171717" stroke="#404040" stroke-width="2"/>
            <circle cx="272" cy="78" r="2.5" fill="#a3a3a3"/>
            <rect x="120" y="190" width="30" height="30" fill="#171717" stroke="#404040" stroke-width="2"/>
            <circle cx="128" cy="212" r="2.5" fill="#a3a3a3"/>
            <rect x="250" y="190" width="30" height="30" fill="#171717" stroke="#404040" stroke-width="2"/>
            <circle cx="272" cy="212" r="2.5" fill="#a3a3a3"/>
            <rect x="135" y="130" width="130" height="32" rx="3" fill="#1c1917" opacity="0.85"/>
            <text x="200" y="152" fill="#f59e0b" font-size="16" font-family="monospace" font-weight="900" text-anchor="middle" letter-spacing="2">R6-SHIP</text>
            <circle cx="245" cy="100" r="14" fill="#dc2626" stroke="#991b1b" stroke-width="2" opacity="0.9"/>
            <text x="245" y="103" fill="#fef2f2" font-size="7" font-weight="900" text-anchor="middle">PASSED</text>
            <text x="200" y="180" fill="#d97706" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">NET: 42.5 KG</text>
        """,
    },
    "frontier-brazier": {
        "title": "Frontier Cast-Iron Brazier",
        "category": "hearth",
        "color_accent": "#ef4444",
        "color_bg": "#1c1414",
        "color_lines": "#dc2626",
        "svg_inner": """
            <!-- Cast-iron basin -->
            <polygon points="120,110 280,110 250,170 150,170" fill="#262626" stroke="#52525b" stroke-width="3"/>
            <!-- Tripod legs -->
            <line x1="160" y1="170" x2="135" y2="230" stroke="#18181b" stroke-width="6" stroke-linecap="round"/>
            <line x1="240" y1="170" x2="265" y2="230" stroke="#18181b" stroke-width="6" stroke-linecap="round"/>
            <line x1="200" y1="170" x2="200" y2="235" stroke="#27272a" stroke-width="6" stroke-linecap="round"/>
            <!-- Glowing embers -->
            <ellipse cx="200" cy="115" rx="60" ry="15" fill="#f97316"/>
            <circle cx="180" cy="112" r="8" fill="#fde047"/>
            <circle cx="215" cy="114" r="10" fill="#ef4444"/>
            <circle cx="200" cy="110" r="12" fill="#fbbf24"/>
            <text x="200" y="85" fill="#f87171" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">CHARCOAL HEARTH</text>
            <text x="200" y="250" fill="#a1a1aa" font-size="8.5" font-family="monospace" text-anchor="middle">CAST-IRON TRIPOD (1.2m DIA · 1.0m H)</text>
        """,
    },
    "border-signpost": {
        "title": "Border Milestone Signpost",
        "category": "markers",
        "color_accent": "#ca8a04",
        "color_bg": "#191612",
        "color_lines": "#a16207",
        "svg_inner": """
            <!-- Vertical wooden post -->
            <rect x="190" y="50" width="20" height="185" rx="3" fill="#543820" stroke="#382414" stroke-width="2"/>
            <!-- Pointing arm East -->
            <polygon points="190,75 295,75 320,95 295,115 190,115" fill="#784e2d" stroke="#452a16" stroke-width="2"/>
            <text x="245" y="99" fill="#fef3c7" font-size="10" font-family="serif" font-weight="900" text-anchor="middle">PASS ➔</text>
            <circle cx="200" cy="95" r="4" fill="#a1a1aa" stroke="#52525b" stroke-width="1"/>
            <text x="200" y="252" fill="#a8947f" font-size="8.5" font-family="monospace" text-anchor="middle">WEATHERED OAK (2.2m HEIGHT)</text>
        """,
    },
    "common-table": {
        "title": "Quartermaster Ledger Desk",
        "category": "furniture",
        "color_accent": "#d97706",
        "color_bg": "#1c1712",
        "color_lines": "#92400e",
        "svg_inner": """
            <polygon points="90,110 310,110 330,145 70,145" fill="#543820" stroke="#382414" stroke-width="2.5"/>
            <rect x="95" y="145" width="16" height="75" fill="#382414" stroke="#231409" stroke-width="2"/>
            <rect x="289" y="145" width="16" height="75" fill="#382414" stroke="#231409" stroke-width="2"/>
            <!-- Ledger book on top -->
            <polygon points="150,118 250,118 255,138 145,138" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
            <line x1="200" y1="118" x2="200" y2="138" stroke="#78350f" stroke-width="1.5"/>
            <circle cx="235" cy="128" r="5" fill="#dc2626"/>
            <text x="200" y="95" fill="#f59e0b" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">OAK DESK (1.6m × 2.0m × 1.4m)</text>
        """,
    },
    "common-chair": {
        "title": "Quartermaster Clerk Chair",
        "category": "furniture",
        "color_accent": "#ca8a04",
        "color_bg": "#191512",
        "color_lines": "#854d0e",
        "svg_inner": """
            <!-- High back -->
            <rect x="160" y="60" width="80" height="90" rx="3" fill="#543820" stroke="#382414" stroke-width="2"/>
            <line x1="180" y1="60" x2="180" y2="150" stroke="#382414" stroke-width="2"/>
            <line x1="200" y1="60" x2="200" y2="150" stroke="#382414" stroke-width="2"/>
            <line x1="220" y1="60" x2="220" y2="150" stroke="#382414" stroke-width="2"/>
            <!-- Seat -->
            <polygon points="150,150 250,150 260,180 140,180" fill="#784e2d" stroke="#382414" stroke-width="2"/>
            <!-- Legs -->
            <line x1="150" y1="180" x2="145" y2="235" stroke="#382414" stroke-width="4" stroke-linecap="round"/>
            <line x1="250" y1="180" x2="255" y2="235" stroke="#382414" stroke-width="4" stroke-linecap="round"/>
            <text x="200" y="252" fill="#ca8a04" font-size="8.5" font-family="monospace" text-anchor="middle">CARVED CLERK SEAT (1.0m × 1.0m × 1.7m)</text>
        """,
    },
    "common-bookcase": {
        "title": "Archive Bookcase",
        "category": "furniture",
        "color_accent": "#d97706",
        "color_bg": "#1c1712",
        "color_lines": "#92400e",
        "svg_inner": """
            <rect x="130" y="50" width="140" height="175" rx="3" fill="#382414" stroke="#231409" stroke-width="2.5"/>
            <!-- Shelves -->
            <line x1="130" y1="90" x2="270" y2="90" stroke="#784e2d" stroke-width="4"/>
            <line x1="130" y1="135" x2="270" y2="135" stroke="#784e2d" stroke-width="4"/>
            <line x1="130" y1="180" x2="270" y2="180" stroke="#784e2d" stroke-width="4"/>
            <!-- Books rows -->
            <rect x="140" y="60" width="14" height="28" fill="#dc2626"/>
            <rect x="156" y="62" width="12" height="26" fill="#2563eb"/>
            <rect x="170" y="58" width="16" height="30" fill="#d97706"/>
            <rect x="188" y="64" width="10" height="24" fill="#16a34a"/>
            <rect x="200" y="60" width="14" height="28" fill="#ca8a04"/>
            <rect x="140" y="105" width="14" height="28" fill="#0284c7"/>
            <rect x="156" y="103" width="16" height="30" fill="#9333ea"/>
            <text x="200" y="245" fill="#d97706" font-size="8.5" font-family="monospace" text-anchor="middle">TALL ARCHIVE SHELVES (1.3m × 0.7m × 1.8m)</text>
        """,
    },
    "common-cabinet": {
        "title": "Sealed Stamp & Seal Cabinet",
        "category": "furniture",
        "color_accent": "#ca8a04",
        "color_bg": "#191512",
        "color_lines": "#854d0e",
        "svg_inner": """
            <rect x="135" y="65" width="130" height="155" rx="3" fill="#452a16" stroke="#231409" stroke-width="2.5"/>
            <line x1="200" y1="65" x2="200" y2="220" stroke="#231409" stroke-width="2"/>
            <circle cx="188" cy="140" r="4" fill="#ca8a04"/>
            <circle cx="212" cy="140" r="4" fill="#ca8a04"/>
            <!-- Iron hinges -->
            <rect x="130" y="80" width="12" height="16" fill="#18181b"/>
            <rect x="130" y="185" width="12" height="16" fill="#18181b"/>
            <rect x="258" y="80" width="12" height="16" fill="#18181b"/>
            <rect x="258" y="185" width="12" height="16" fill="#18181b"/>
            <text x="200" y="245" fill="#ca8a04" font-size="8.5" font-family="monospace" text-anchor="middle">DOUBLE-DOOR CABINET (1.4m × 0.8m × 1.4m)</text>
        """,
    },
    "common-dresser": {
        "title": "Weigh Scale Inspection Station",
        "category": "instruments",
        "color_accent": "#f59e0b",
        "color_bg": "#1c1712",
        "color_lines": "#b45309",
        "svg_inner": """
            <rect x="120" y="110" width="160" height="110" rx="3" fill="#452a16" stroke="#231409" stroke-width="2"/>
            <!-- Zinc counter top -->
            <polygon points="110,110 290,110 295,95 105,95" fill="#71717a" stroke="#a1a1aa" stroke-width="1.5"/>
            <!-- Balance scale on counter -->
            <rect x="196" y="55" width="8" height="40" fill="#ca8a04"/>
            <line x1="165" y1="58" x2="235" y2="58" stroke="#eab308" stroke-width="3"/>
            <polygon points="160,78 175,78 167,82" fill="#ca8a04"/>
            <polygon points="225,78 240,78 232,82" fill="#ca8a04"/>
            <text x="200" y="245" fill="#f59e0b" font-size="8.5" font-family="monospace" text-anchor="middle">ZINC WEIGH BENCH (1.6m × 0.8m × 1.2m)</text>
        """,
    },
    "common-bench": {
        "title": "Intake Supplicant Bench",
        "category": "furniture",
        "color_accent": "#ca8a04",
        "color_bg": "#191512",
        "color_lines": "#854d0e",
        "svg_inner": """
            <polygon points="80,135 320,135 330,160 70,160" fill="#543820" stroke="#382414" stroke-width="2"/>
            <line x1="100" y1="160" x2="95" y2="215" stroke="#382414" stroke-width="6" stroke-linecap="round"/>
            <line x1="300" y1="160" x2="305" y2="215" stroke="#382414" stroke-width="6" stroke-linecap="round"/>
            <text x="200" y="115" fill="#ca8a04" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">SCARRED WOODEN BENCH</text>
            <text x="200" y="240" fill="#a8947f" font-size="8.5" font-family="monospace" text-anchor="middle">BENCH PLANK (0.4m × 1.0m × 0.4m)</text>
        """,
    },
    "common-wardrobe": {
        "title": "Forfeit Storage Wardrobe",
        "category": "furniture",
        "color_accent": "#71717a",
        "color_bg": "#18181b",
        "color_lines": "#52525b",
        "svg_inner": """
            <rect x="135" y="45" width="130" height="185" rx="3" fill="#27272a" stroke="#18181b" stroke-width="3"/>
            <line x1="200" y1="45" x2="200" y2="230" stroke="#18181b" stroke-width="2"/>
            <rect x="194" y="130" width="12" height="18" fill="#ca8a04" stroke="#78350f" stroke-width="1"/>
            <rect x="150" y="70" width="35" height="15" fill="#fef08a" stroke="#ca8a04" stroke-width="1" transform="rotate(-5 150 70)"/>
            <text x="167" y="81" fill="#78350f" font-size="7" font-weight="900" font-family="monospace" text-anchor="middle" transform="rotate(-5 150 70)">FORFEIT</text>
            <text x="200" y="250" fill="#a1a1aa" font-size="8.5" font-family="monospace" text-anchor="middle">IMPOUND WARDROBE (0.5m × 1.1m × 1.5m)</text>
        """,
    },
}


def render_primitive_svg(primitive_id: str, prim_data: dict[str, Any] | None = None) -> str:
    """Generate high-contrast standalone SVG vector blueprint markup for a primitive."""
    schema = PRIMITIVE_VECTOR_SCHEMAS.get(primitive_id, {})
    title = schema.get("title", prim_data.get("name", primitive_id) if prim_data else primitive_id)
    accent = schema.get("color_accent", "#2dd4bf")
    bg = schema.get("color_bg", "#141210")
    lines = schema.get("color_lines", "#0d9488")
    inner = schema.get("svg_inner", "")

    if not inner:
        # Fallback procedural shape
        inner = f"""
            <rect x="110" y="70" width="180" height="150" rx="6" fill="#1c1917" stroke="{accent}" stroke-width="2.5"/>
            <circle cx="200" cy="145" r="40" fill="none" stroke="{accent}" stroke-width="1.5" stroke-dasharray="4 2"/>
            <text x="200" y="152" fill="{accent}" font-size="14" font-family="monospace" font-weight="700" text-anchor="middle">3D STL ASSET</text>
            <text x="200" y="245" fill="#a8947f" font-size="8.5" font-family="monospace" text-anchor="middle">{html.escape(primitive_id)}</text>
        """

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="{bg}"/>
          <stop offset="100%" stop-color="#090807"/>
        </linearGradient>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2a241e" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(#bgGrad)"/>
      <rect width="400" height="300" fill="url(#grid)" opacity="0.45"/>
      <rect x="6" y="6" width="388" height="288" rx="6" fill="none" stroke="#383028" stroke-width="1.5"/>

      <!-- Header technical callouts -->
      <text x="14" y="24" fill="#a8947f" font-size="9" font-family="monospace" letter-spacing="1">SPRITEQUEST · 2D PRIMITIVE SPECIFICATION</text>
      <text x="386" y="24" fill="{accent}" font-size="9" font-family="monospace" font-weight="700" text-anchor="end">FLUX 3 KLEIN READY</text>
      <line x1="6" y1="34" x2="394" y2="34" stroke="#383028" stroke-width="1"/>

      <!-- Graphic -->
      {inner}

      <!-- Bottom footer bar -->
      <rect x="6" y="268" width="388" height="26" fill="#0d0b0a" opacity="0.95"/>
      <line x1="6" y1="268" x2="394" y2="268" stroke="#383028" stroke-width="1"/>
      <text x="14" y="285" fill="#f5eedf" font-size="10" font-family="monospace" font-weight="700">{html.escape(title[:34])}</text>
      <text x="386" y="285" fill="{accent}" font-size="9.5" font-family="monospace" font-weight="700" text-anchor="end">ID: {html.escape(primitive_id)}</text>
    </svg>"""
    return svg


def get_primitive_2d_data_url(primitive_id: str, prim_data: dict[str, Any] | None = None) -> str:
    """Return inline SVG data URL for the primitive."""
    svg = render_primitive_svg(primitive_id, prim_data)
    return "data:image/svg+xml;charset=utf-8," + io.BytesIO(svg.encode("utf-8")).getvalue().decode("utf-8")


def ensure_primitive_2d_assets() -> dict[str, str]:
    """
    Ensure all default catalog primitives have 2D images in renders/primitives/
    and return mapping primitive_id -> data_url.
    """
    RENDERS_DIR.mkdir(parents=True, exist_ok=True)
    results: dict[str, str] = {}

    for pid in PRIMITIVE_VECTOR_SCHEMAS.keys():
        svg = render_primitive_svg(pid)
        svg_file = RENDERS_DIR / f"{pid}.svg"
        svg_file.write_text(svg, encoding="utf-8")
        results[pid] = "data:image/svg+xml;charset=utf-8," + io.BytesIO(svg.encode("utf-8")).getvalue().decode("utf-8")

    return results


def main() -> int:
    urls = ensure_primitive_2d_assets()
    print(f"Generated {len(urls)} 2D primitive blueprints in {RENDERS_DIR}")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
