# Storyboard: Pass, fail or incomplete: contrast and heading checks

**Purpose.** See how an automated accessibility check decides pass, fail or incomplete for color contrast and heading order, and what it leaves for a person.

**Why a video.** Each result depends on a measured value and a threshold, so the walkthrough builds the rule one part at a time and pauses for predictions.

**Length.** 66.0 s, 7 scenes.

## 1. One scan, three answers (0.0–9.0 s)

**On screen.** Title card with "pass · fail · incomplete".

**Narration and caption.** One accessibility scan gives three answers: pass, fail, or incomplete. Incomplete means the tool cannot decide, so a person must review it.

**Sources.** dequelabs-axe-core-repo

## 2. The contrast ratio (9.0–18.0 s)

**On screen.** The expression ratio = (L1 + 0.05) / (L2 + 0.05) with "L1", "L2", "0.05" highlighted in turn and explained.

**Narration and caption.** The contrast ratio compares two colors. L1 is the relative luminance of the lighter color, and L2 is the luminance of the darker color.

**Sources.** w3c-wcag22-understanding-contrast-minimum, dequelabs-axe-core-repo

## 3. Two thresholds (18.0–28.0 s)

**On screen.** Two columns, "Normal text" and "Large text", fill in pairs; verdict: Larger text may use lower contrast..

**Narration and caption.** Normal text needs a ratio of at least 4.5 to 1. Large text, 18 point or 14 point bold, needs at least 3 to 1.

**Sources.** w3c-wcag22-understanding-contrast-minimum, dequelabs-axe-core-repo

## 4. No rounding up (28.0–38.0 s)

**On screen.** Bars grow for #767676 on white 4.54:1, Threshold, normal text 4.5:1, #777777 on white 4.47:1.

**Narration and caption.** Gray 767676 on white scores 4.54 and passes. Gray 777777 scores 4.47 and fails. Axe rounds down, so 4.47 never shows as 4.5.

**Sources.** w3c-wcag22-understanding-contrast-minimum, dequelabs-axe-core-repo

## 5. When the tool cannot tell (38.0–46.0 s)

**On screen.** Numbered steps appear one at a time: Text on a background image → Another element overlaps the text → Text of one character → An empty input field.

**Narration and caption.** Some cases return incomplete: text on a background image, an overlapping element, one-character text, or an empty input field.

**Sources.** dequelabs-axe-core-repo

## 6. Heading order (46.0–56.0 s)

**On screen.** A timeline reveals h1 → h2 → h4 → h4 changed to h3.

**Narration and caption.** Heading order checks each heading against the one before it. After h2, an h4 skips a level and fails. Change it to h3, and it passes.

**Sources.** dequelabs-axe-core-repo

## 7. What rules cannot judge (56.0–66.0 s)

**On screen.** Two columns, "A rule decides" and "A person judges", fill in pairs; verdict: Zero violations does not mean accessible..

**Narration and caption.** A rule decides plain color contrast and skipped heading levels. A person judges text on images, heading meaning, and keyboard and screen reader use.

**Sources.** w3c-wai-selecting-evaluation-tools, dequelabs-axe-core-repo
