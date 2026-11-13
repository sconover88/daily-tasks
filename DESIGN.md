# DESIGN.md

The design contract for Daily Tasks. Every new screen reads this first and matches it. Change values here before changing code (`app/globals.css` mirrors them).

## The look (exact specs, as given)

- **Colour.** Background: #fcfcfd; Brand colour: #2563eb; Button colour: #111113; Brand colour use: None; Where colour appears: Status only (keep images neutral; use colour only for status, such as success or error).
- **Type.** Two sans-serif fonts: Host Grotesk for display, Instrument Sans for body; Headline size: 5.0 × body; Headline emphasis: None.
- **Shape.** Corners: Round; Button shape: Pill.
- **Layout.** Page width: Regular; Section spacing: Regular; Section backgrounds: One background; Dividers: None; Cards: Inset.
- **Imagery.** UI only (no photography); framed.

## Starting values (exact, as given)

| Token | Value |
|---|---|
| page ground | #fcfcfd |
| alternate ground | #f4f3f4 |
| primary text | #141314 |
| secondary text | #454545 |
| muted text | #5c5c5c |
| inverse ground | #141314 |
| inverse text | #fcfcfd |
| accent | #2563eb |
| primary action fill | #111113 |
| primary action label | #fcfcfd |
| surface | #f4f3f4 |
| hairline | #dddddd |
| display type at 1440 px | 80px |
| display type at 390 px | 60px |
| body type | 16px |
| display weight | 500 |
| container width | 1200px |
| page margin | 24px |
| band padding at 1440 px, top | 96px |
| band padding at 1440 px, bottom | 64px |
| band padding at 390 px, top | 64px |
| band padding at 390 px, bottom | 48px |
| surface corner | 16px |
| control corner | 9999px |

Every text pairing among them clears WCAG AA and APCA Lc 75. Keep that true.

## What the app adds

Two tokens, both needed for accessibility:

| Token | Value | Why |
|---|---|---|
| control edge | #858585 | Outlines on inputs and unselected pills. The hairline (#dddddd) is only 1.3:1, which is too faint to identify a control (WCAG 1.4.11 needs 3:1). |
| danger | #991b1b | Error status: validation messages, "Overdue", Delete. |

## Rules

**Colour**
- One background: the page ground, everywhere. Cards are inset on the surface (#f4f3f4). There are no dividers anywhere. Space and surfaces separate things.
- The primary action is #111113 with a #fcfcfd label. This is the main button, the add button, the active tab, selected pills and checked boxes.
- The blue accent (#2563eb) is status only, and rare. It's used for the **"Done today"** badge (daily goal met). Nothing decorative is blue. A checked box is ink, not blue, so the badge stays the one blue signal on the screen.
- Danger red is status only. It's used for errors, "Overdue" and the destructive confirm button.

**Type**
- Host Grotesk 500 is for display: page titles, section headings and the streak number. Instrument Sans is for everything you read.
- Scale: display 60px (the streak number, matching "display at 390px"), title 32px, heading 20px, body 16px, small 14px, label 13px. The phone is the target, so 60px is the one display size. At desktop widths 80px would apply, but the app stays phone-width.
- There's no headline emphasis (no italics, no colour). The streak uses tabular figures.

**Shape**
- Surfaces (cards, panels, textarea) use 16px corners. Every control (buttons, inputs, pills, tabs, checkboxes) uses 9999px, so it's a pill or circle.

**Layout (app adaptation)**
- The landing-page container of 1200px doesn't suit a phone app. Content is a single column, max 576px (`max-w-xl`), with a 24px page margin on both sides.
- The band padding values are for marketing bands. The app uses a tighter rhythm: 24px from the top (plus the safe area), 24px under page headers, 32–40px between sections and 8px between cards.
- The navigation floats at the bottom in thumb reach. It's a surface pill with three tabs and a round add button, and it respects the iPhone safe area.

**Controls and states**
- Tap targets are at least 44×44px (checkbox 44, tabs 48, buttons 44–48).
- Focus is one treatment everywhere: a 2px ink outline with a 3px offset. Pill toggles draw it on the pill when their hidden input has focus.
- Toggles are real radio/checkbox inputs styled as pills, so the keyboard and screen readers work normally.
- Every field has a visible label (placeholders are never the label). Errors appear under the field in danger red, with `aria-invalid`, a summary alert, and focus moved to the first problem.
- States: loading uses surface skeletons, there's an error panel with "Try again", and every list has an empty state. Saving and deleting buttons show "Saving…" and "Deleting…".
- The date field uses the phone's native date picker on purpose (it's the best picker on iOS and Android). It's styled as a pill input, with Today, Tomorrow and Clear shortcuts.
- Selection is ink with a ground-coloured label, and the caret is ink.

**Motion**
- Only colour and press feedback (about 150ms) and the loading pulse. With `prefers-reduced-motion`, these are effectively off.

**Imagery**
- There's no photography. The app icon is a white check on #111113.

## Measured contrast

These come from `npm run contrast`, which computes the actual hex pairings the app renders. WCAG 2 and APCA (0.0.98G-4g) are separate instruments, and an APCA result is not a WCAG 2 conformance claim.

| Text | On | Size / weight | WCAG 2 | APCA |
|---|---|---|---|---|
| Primary text `#141314` | Page ground `#fcfcfd` | 16px / 400 | 18.08:1 | Lc 103.4 |
| Primary text `#141314` | Surface `#f4f3f4` | 16px / 400 | 16.75:1 | Lc 98.2 |
| Secondary text `#454545` | Page ground `#fcfcfd` | 14px / 500 | 9.35:1 | Lc 90.5 |
| Secondary text `#454545` | Surface `#f4f3f4` | 16px / 400 | 8.66:1 | Lc 85.2 |
| Muted text `#5c5c5c` | Page ground `#fcfcfd` | 14px / 500 | 6.52:1 | Lc 81.3 |
| Muted text `#5c5c5c` | Surface `#f4f3f4` | 13px / 400 | 6.04:1 | Lc 76.1 |
| Action label `#fcfcfd` | Action fill `#111113` | 14–16px / 500 | 18.40:1 | Lc -105.4 |
| Inverse text `#fcfcfd` | Accent `#2563eb` (Done today) | 14px / 600 | 5.04:1 | Lc -78.3 |
| Danger text `#991b1b` | Page ground `#fcfcfd` | 14px / 500 | 8.10:1 | Lc 85.3 |
| Danger text `#991b1b` | Surface `#f4f3f4` | 13px / 600 | 7.51:1 | Lc 80.1 |
| Inverse text `#fcfcfd` | Danger fill `#991b1b` | 14px / 600 | 8.10:1 | Lc -89.9 |

| Non-text (needs 3:1) | On | WCAG 2 |
|---|---|---|
| Control edge `#858585` | Page ground `#fcfcfd` | 3.60:1 |
| Control edge `#858585` | Surface `#f4f3f4` | 3.33:1 |
| Checked fill `#111113` | Surface `#f4f3f4` | 17.04:1 |
| Focus ring `#141314` | Page ground `#fcfcfd` | 18.08:1 |
| Focus ring `#141314` | Surface `#f4f3f4` | 16.75:1 |

**Results**
- Every text pairing passes WCAG 2 AA (4.5:1) and reaches at least |Lc| 75.
- Open item: the 13px / 400 muted metadata (times, "Due Nov 20") is at Lc 76.1. That meets the Lc 75 floor, but APCA's size tables suggest more for long reading at 13px. It's short spot-reading text, so it's accepted. Revisit if more 13px text appears.
- Not yet verified: these numbers come from token values, not from screenshots of the running app. Check the rendering on a real phone.
- Disabled buttons drop to 70% (Save) or 60% (Do today, Undo) opacity, which lowers their contrast. WCAG 2 exempts inactive controls, and they're only disabled while a save is in progress.
