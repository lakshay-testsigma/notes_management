# Proposal: docs-cross-browser (pages 9-10)

Sources added: firefox-devtools-user-docs (flag digest), webkit-web-inspector-docs, chrome-devtools-remote-debugging-docs.
Base URL FF: https://firefox-source-docs.mozilla.org/devtools-user/

## Concepts
- firefox-safari-devtools: firefox-devtools-user-docs + webkit-web-inspector-docs. Prereq: browser-devtools basics. FF index; WebKit index https://webkit.org/web-inspector/ (tabs: Elements, Network, Sources, Timelines, Audit...).
- firefox-layout-and-font-tools: firefox-devtools-user-docs.
  - .../page_inspector/how_to/examine_grid_layouts/index.html (grid overlay, line numbers, area names, extend lines, mini grid view)
  - .../page_inspector/how_to/examine_flexbox_layouts/index.html
  - .../page_inspector/how_to/edit_fonts/index.html (fonts used, variable font axes, all fonts on page, live preview)
  - .../accessibility_inspector/index.html
- safari-web-inspector: webkit-web-inspector-docs. https://webkit.org/web-inspector/enabling-web-inspector/ (Mac: Settings > Advanced > Show features for web developers; iOS: Settings > Safari > Advanced > Web Inspector).
- remote-device-debugging: parent of the three below. Prereq: firefox-safari-devtools.
- android-chrome-inspect: chrome-devtools-remote-debugging-docs https://developer.chrome.com/docs/devtools/remote-debugging (USB debugging, chrome://inspect#devices, Discover USB devices, accept prompt, Inspect). Also Firefox: .../about_colon_debugging/index.html (Enable USB Devices, Remote Debugging via USB in Firefox for Android, Connect, Inspect).
- ios-safari-remote-inspection: webkit-web-inspector-docs enabling page: cable or Xcode wireless; device name appears under Safari Develop menu.
- device-clouds-and-low-end-devices: NO verified source. Mention only (BrowserStack, LambdaTest, Sauce Labs); none verified. Open question.

## Child concepts
None proposed; sources do not show more that matters.

## Out of scope
- Apple developer.apple.com "Inspecting iOS and iPadOS" page: renders title only to fetch (JS); not verified, not cited.
- Device cloud vendors: marketing, no tier B evidence checked.
- Evidence for existing source: no prior Chrome DevTools source existed at check time; remote-debugging page added as its own source.

## Open questions
- Low-end device testing advice (CPU throttling vs real device) needs a source from another unit.
- Firefox Accessibility inspector page content not read in detail.

## Visual candidates
See /Users/lakshay.goyal/Desktop/Learning/notes_management/.cache/tmp/browser-devtools-mastery/visual-candidates-docs-cross-browser.md
