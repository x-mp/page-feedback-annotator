# Chrome Web Store Publish Kit

Extension:

- Name: `Page Feedback Annotator`
- Status: `Draft`
- Extension ID: `ejadoalkgjcjifnademeeodkbdminknb`
- Version: `1.0.0`
- Package: `dist/page-feedback-annotator-1.0.0.zip`

Use this file as the source of truth for the Chrome Web Store dashboard.

## 1. Build

Package upload:

```text
dist/page-feedback-annotator-1.0.0.zip
```

## 2. Store Listing

### Title from package

```text
Page Feedback Annotator
```

### Summary from package

```text
Select elements on any page, attach visual comments, and copy structured feedback for developers or AI agents.
```

### Description

```text
Page Feedback Annotator is a focused browser extension for visual page feedback.

Turn it on from the popup, click or drag elements on any website, add comments in context, and copy a structured Markdown report for QA, UI review, developer handoff, or AI-assisted page analysis.

The report includes selectors, DOM paths, element coordinates, page URL, viewport, and optional short element text.

Why users install it:
• to report UI bugs faster
• to review design changes in context
• to hand off page feedback to developers
• to create AI-ready page context
• to keep feedback local and under user control

Key features:
• One-click on/off popup
• Floating on-page feedback panel
• Click any element to attach a comment
• Shift-click to build a group of elements
• Drag to select multiple elements
• Copy Markdown feedback
• Copy and clear in one action
• Optional element text capture
• Local-only storage
• No account, tracking, analytics, or external server

Privacy-first by design:
Comments and settings stay in Chrome storage on the user’s device. The extension does not send page content, comments, URLs, or settings to any external service.
```

### Category

```text
Tools
```

### Language

```text
English (United States)
```

### Mature content

```text
No
```

### Item support

```text
On
```

## 3. Graphic Assets

Upload these files:

- Store icon 128x128: `store-assets/icon-128.png`
- Screenshot 1: `store-assets/screenshots/01-start-popup.jpg`
- Screenshot 2: `store-assets/screenshots/02-select-comment.jpg`
- Screenshot 3: `store-assets/screenshots/03-markdown-report.jpg`
- Screenshot 4: `store-assets/screenshots/04-local-privacy.jpg`
- Screenshot 5: `store-assets/screenshots/05-workflow.jpg`
- Small promo tile 440x280: `store-assets/promo/small-promo-tile-440x280.jpg`
- Marquee promo tile 1400x560: `store-assets/promo/marquee-promo-tile-1400x560.jpg`

Promo video:

```text
Leave empty for first release.
```

## 4. Additional Fields

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

Privacy policy URL:

```text
https://github.com/x-mp/page-feedback-annotator/blob/main/PRIVACY.md
```

## 5. Privacy

### Single purpose description

```text
Page Feedback Annotator lets users select elements on web pages, attach local feedback comments, and copy the resulting structured Markdown report for QA, UI review, developer handoff, or AI-assisted page analysis.
```

### Permission justification

`activeTab`

```text
Required so the popup can communicate with the currently active tab when the user turns the annotator on or off.
```

`scripting`

```text
Required to inject the content script into the active page if the page did not already load it, so the user can start annotating from the toolbar popup.
```

`storage`

```text
Required to store feedback notes and extension settings locally in Chrome storage for the current page.
```

`clipboardWrite`

```text
Required so the user can copy the generated Markdown feedback report from the on-page panel.
```

`<all_urls>`

```text
Required because the extension’s single purpose is to let users annotate arbitrary websites they choose to review. The content script needs access to the current page DOM to identify selected elements, element positions, selectors, and text snippets for the local feedback report.
```

### Remote code

```text
No, I am not using Remote code
```

Justification:

```text
No remote code is used. All JavaScript, HTML, CSS, and assets are packaged inside the extension.
```

## 6. Data Usage

### What user data do you plan to collect now or in the future?

Select:

- `Website content`
- `Web history`

Optional only if the dashboard requires a broader disclosure:

- `User activity`

Do not select categories you do not actually use.

### Why these categories

```text
Website content is collected because the extension captures selected element metadata, optional short text, selectors, DOM paths, and element rectangles needed to create the feedback report.

Web history is disclosed because the report includes the current page URL and page context when the user creates a note.

User activity is only needed if the dashboard interprets click and drag-based page selection as a data category to disclose.
```

### Required certifications

Check all three:

```text
I do not sell or transfer user data to third parties, outside of the approved use cases
I do not use or transfer user data for purposes that are unrelated to my item's single purpose
I do not use or transfer user data to determine creditworthiness or for lending purposes
```

## 7. Privacy Policy

Privacy policy URL:

```text
https://github.com/x-mp/page-feedback-annotator/blob/main/PRIVACY.md
```

Public privacy text already lives in [PRIVACY.md](/Users/denikuchero/Documents/pet/openai-api/chrome_extentions/page_feedback_annotator/PRIVACY.md).

## 8. Distribution

Recommended for first submission:

```text
Visibility: Unlisted
Pricing: Free
Regions: All available regions
```

Switch to public after the first review if you want store search visibility.

## 9. Test Instructions

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

## 10. Upload Order

1. Upload the package ZIP.
2. Paste the Store listing text.
3. Upload the store icon, screenshots, and promo assets.
4. Fill the privacy fields and permission justifications.
5. Add the privacy policy URL.
6. Fill distribution and test instructions.
7. Submit for review.
