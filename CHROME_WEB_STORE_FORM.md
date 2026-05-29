# Chrome Web Store Form

Extension draft:

- Name: `Page Feedback Annotator`
- Status: `Draft`
- Extension ID: `ejadoalkgjcjifnademeeodkbdminknb`
- Version: `1.0.0`
- Package upload: `dist/page-feedback-annotator-1.0.0.zip`

## Store Listing

### Product Details

Title from package:

```text
Page Feedback Annotator
```

Summary from package:

```text
Select elements on any page, attach visual comments, and copy structured feedback for developers or AI agents.
```

Description:

```text
Page Feedback Annotator helps you collect precise visual feedback directly on any website.

Click the extension icon, turn the annotator on, select page elements, write comments, and export a structured Markdown report with selectors, DOM paths, element coordinates, page URL, viewport, and optional element text.

It is useful for:
• website QA and bug reports
• UI/UX reviews
• developer handoff
• design feedback
• AI-assisted page analysis
• product and content review

Key features:
• One-click on/off browser popup
• Floating on-page feedback panel
• Click any element to attach a comment
• Shift-click to group multiple elements
• Drag to select a group of elements
• Copy feedback as structured Markdown
• Copy and clear in one action
• Optional element text capture
• Local-only storage
• No account, tracking, analytics, or external server

Privacy-first by design:
Your comments and settings are stored locally in Chrome storage. The extension does not send page content, comments, URLs, or settings to any external service.
```

Category:

```text
Tools
```

Language:

```text
English (United States)
```

Mature content:

```text
No
```

Item support:

```text
On
```

## Graphic Assets

Upload these files:

- Store icon, 128x128 PNG: `store-assets/icon-128.png`
- Screenshot 1, 1280x800 JPEG: `store-assets/screenshots/01-start-popup.jpg`
- Screenshot 2, 1280x800 JPEG: `store-assets/screenshots/02-select-comment.jpg`
- Screenshot 3, 1280x800 JPEG: `store-assets/screenshots/03-markdown-report.jpg`
- Screenshot 4, 1280x800 JPEG: `store-assets/screenshots/04-local-privacy.jpg`
- Screenshot 5, 1280x800 JPEG: `store-assets/screenshots/05-workflow.jpg`
- Small promo tile, 440x280 JPEG: `store-assets/promo/small-promo-tile-440x280.jpg`
- Marquee promo tile, 1400x560 JPEG: `store-assets/promo/marquee-promo-tile-1400x560.jpg`

Promo video:

```text
Leave empty for first release.
```

## Additional Fields

Official URL:

```text
None
```

Homepage URL:

```text
https://github.com/x-mp/page-feedback-annotator
```

Support URL:

```text
https://github.com/x-mp/page-feedback-annotator/issues
```

Privacy Policy URL:

```text
https://github.com/x-mp/page-feedback-annotator/blob/main/PRIVACY.md
```

Chrome Web Store listing URL after publication:

```text
https://chromewebstore.google.com/detail/page-feedback-annotator/ejadoalkgjcjifnademeeodkbdminknb
```

## Privacy

Single purpose:

```text
Page Feedback Annotator lets users select elements on web pages, attach local feedback comments, and copy the resulting structured Markdown report for QA, UI review, developer handoff, or AI-assisted page analysis.
```

Data collection:

```text
The extension does not collect or transmit user data to the developer or any third party.
```

Local data explanation:

```text
The extension stores user-created comments, selected element metadata, page URL, viewport, and settings locally in Chrome storage so the user can continue a feedback session on the current page.
```

Remote code:

```text
No remote code is used.
```

Analytics:

```text
No analytics are used.
```

Ads:

```text
No ads are used.
```

Limited Use statement:

```text
The use of information received from Chrome APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements. Data accessed by the extension is used only to provide the user-facing page feedback and report-copying features. The extension does not transfer, sell, or use user data for advertising.
```

## Permission Justifications

`activeTab`:

```text
Required so the popup can communicate with the currently active tab when the user turns the annotator on or off.
```

`scripting`:

```text
Required to inject the content script into the active page if the page did not already load it, so the user can start annotating from the toolbar popup.
```

`storage`:

```text
Required to store feedback notes and extension settings locally in Chrome storage for the current page.
```

`clipboardWrite`:

```text
Required so the user can copy the generated Markdown feedback report from the on-page panel.
```

Host permission `<all_urls>`:

```text
Required because the extension's single purpose is to let users annotate arbitrary websites they choose to review. The content script needs access to the current page DOM to identify selected elements, element positions, selectors, and text snippets for the local feedback report.
```

## Distribution

Recommended first release:

```text
Visibility: Unlisted
Pricing: Free
Regions: All available regions
```

Switch to `Public` after the first review if you want the listing to appear in store search.

## Test Instructions

```text
No login or test account is required.

Testing steps:
1. Install the extension.
2. Open any regular web page, for example https://example.com.
3. Click the Page Feedback Annotator toolbar icon.
4. Press the round "Включить" button.
5. Click an element on the page and add a comment.
6. Use the floating panel to copy the Markdown report.
7. Close the panel or press Escape to turn the annotator off.

Expected behavior:
The extension creates local visual feedback notes and copies a Markdown report. It does not send data to any external server.
```

## Upload Order

1. Build: upload `dist/page-feedback-annotator-1.0.0.zip`.
2. Store listing: paste description and upload image assets.
3. Privacy: paste privacy and permission justifications.
4. Distribution: choose visibility and regions.
5. Test instructions: paste the text above.
6. Submit for review.
