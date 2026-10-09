# Ember — approved Lattice theme

Status: **Approved by the user on 2026-10-09.** The user selected the final Ember render and requested that it be locked in and communicated to the “Finish Lattice native-only cleanup” Codex chat.

## Approved references

- Full workspace: [ember-workspace.png](../../images/themes/ember-workspace.png)
- Enlarged nodes: [ember-nodes.png](../../images/themes/ember-nodes.png)
- Exact captured values: [2026-10-09-ember-theme-tokens.json](2026-10-09-ember-theme-tokens.json)

These are screenshots of the real Lattice workbench with preview-only styling, captured from the primary checkout's production UI bundle. Product theme implementation has **not** been changed in this chat. The cleanup chat should apply the approved visual treatment in its own checkout and verify it against these images.

## Visual settings

| Role | Approved value |
| --- | --- |
| Theme name | Ember |
| Panels and menubar | SillyTavern `--SmartThemeBlurTintColor` |
| Canvas | `#0F0F0F` — neutral gray, with no blue undertone |
| Node fill | `rgba(40, 40, 40, 0.75)` — `#282828` at 75% opacity |
| Node border | None |
| Node corner radius | `6px` |
| Unselected node shadow | `0 1px 2px #00000050` — 1px downward offset, 2px blur, zero spread |
| Main text | SillyTavern `--SmartThemeBodyColor` |
| Quiet text | SillyTavern `--SmartThemeEmColor` |
| Orange accent and selection | SillyTavern `--SmartThemeQuoteColor` |
| Fields | SillyTavern `--SmartThemeUserMesBlurTintColor` |
| Raised controls and shelf surfaces | SillyTavern `--SmartThemeBotMesBlurTintColor` |
| General UI borders | SillyTavern `--SmartThemeBorderColor` |

The approved host theme was **Dark Lite**: panels `#171717`, main text `#DCDCD2`, quiet text `#919191`, orange `#E18A24`, message surfaces `rgba(30, 30, 30, 0.9)`, and general borders `rgba(0, 0, 0, 0.5)`. Use the host's theme variables for those inherited roles; the JSON freezes the values used for the approved reference.

Apply 75% opacity to the **fill only**, not to the entire node. Labels, symbols, pins, selection highlights, and execution states retain their own opacity. Do not add an ordinary outline, bevel, inset highlight, or a zero-blur spread shadow around unselected nodes. Keep the orange selected-node ring visible, and preserve the meaning and priority of execution-state styling.

## Brighter category text and symbols

The approved node headings, aliases, pin labels, shelf labels, and shelf category icons use:

```css
color-mix(in srgb, <original-role-color> 68%, var(--SmartThemeBodyColor) 32%)
```

This applies to the equivalents of `.pc-native-heading`, `.pc-native-alias`, `.pc-native-pin-label`, `.pc-family-row`, and `.pc-family-row svg`. Preserve the existing category hues and disabled shelf states. Icons inside a heading inherit its brightened color. Use the original semantic role as the source; do not compound the mix during updates.

Pin dots use their original semantic color mixed with theme body text at **86% original / 14% theme text**. Existing wire hues remain unchanged.

For the rendered workflow, original family colors were Input `#96AD52`, Shaping `#589AAB`, Surface `#92C9AD`, Transpose `#9080B6`, Derive `#B65B9E`, Output `#C96D82`, and Subgraphs `#A3AA99`. Original pin colors were context `#72ADC0`, guidance `#C190BE`, draft `#92C9AD`, findings/patches `#B65B9E`, text `#A5BFA0`, data `#7E9BC5`, and candidate `#CCA56D`.

## Implementation and acceptance

- Preserve the existing layout, node geometry, category meanings, and orange accent. Ember is the chosen visual theme, not a request for a layout redesign.
- Make this work with real SillyTavern theme variables, including controls and menubar currently using fixed colors. Scope styling to Lattice; do not overwrite the host's theme.
- Implement through normal theme/CSS/component tokens. The preview used a one-time computed-color mix to explore the result; do not ship that DOM mutation loop or the capture harness as product code.
- Compare the native workbench and an enlarged unselected-node view against the approved references. Verify orange selection, running/failure states, compact nodes, shelf labels/icons, and supported narrow layouts in the cleanup checkout.

Capture evidence for the approved render: zero browser errors, four wires with no connection-check failures, and a successful synthetic workflow with zero provider calls. This verifies the preview; the cleanup implementation still needs its own checks.
