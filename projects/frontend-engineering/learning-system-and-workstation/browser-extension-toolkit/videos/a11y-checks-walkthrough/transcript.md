# Pass, fail or incomplete: contrast and heading checks

An accessibility scan gives three answers: pass, fail or incomplete. The contrast ratio is (L1 + 0.05) / (L2 + 0.05). Normal text needs at least 4.5:1, large text at least 3:1. Gray #767676 on white scores 4.54 and passes; #777777 scores 4.47 and fails, because axe rounds down. A background image, an overlapping element, one-character text or an empty input gives incomplete. Heading order fails when a heading is more than one level deeper than the one before it. A person still judges text on images, heading meaning, and keyboard and screen reader use.

**00:00 One scan, three answers.** One accessibility scan gives three answers: pass, fail, or incomplete. Incomplete means the tool cannot decide, so a person must review it.

**00:09 The contrast ratio.** The contrast ratio compares two colors. L1 is the relative luminance of the lighter color, and L2 is the luminance of the darker color.

**00:18 Two thresholds.** Normal text needs a ratio of at least 4.5 to 1. Large text, 18 point or 14 point bold, needs at least 3 to 1.

**00:28 No rounding up.** Gray 767676 on white scores 4.54 and passes. Gray 777777 scores 4.47 and fails. Axe rounds down, so 4.47 never shows as 4.5.

**00:38 When the tool cannot tell.** Some cases return incomplete: text on a background image, an overlapping element, one-character text, or an empty input field.

**00:46 Heading order.** Heading order checks each heading against the one before it. After h2, an h4 skips a level and fails. Change it to h3, and it passes.

**00:56 What rules cannot judge.** A rule decides plain color contrast and skipped heading levels. A person judges text on images, heading meaning, and keyboard and screen reader use.

Sources:

- dequelabs/axe-core — https://github.com/dequelabs/axe-core
- W3C WAI: Selecting evaluation tools, Evaluation Tools List, and page-structure tutorials (headings, regions) — https://www.w3.org/WAI/test-evaluate/tools/selecting/
- Understanding SC 1.4.3: Contrast (Minimum) (WCAG 2.2) — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
