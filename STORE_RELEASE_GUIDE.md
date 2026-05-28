# Chrome Web Store Release Guide

Last updated: 2026-05-28

## Package

- Extension name in manifest: `Page Feedback Annotator`
- Recommended public GitHub repository name: `page-feedback-annotator`
- Manifest version: `3`
- Release version: `1.0.0`
- Upload ZIP: `dist/page-feedback-annotator-1.0.0.zip`
- Main icon: `icons/icon.svg`
- Privacy policy file: `PRIVACY.md`

Official publishing flow: upload the ZIP in Chrome Developer Dashboard, then fill `Store Listing`, `Privacy`, `Distribution`, and `Test instructions`.

## Store Listing

### Public Repository

Create a public GitHub repository with this name:

```text
page-feedback-annotator
```

Recommended repository description:

```text
Chrome extension for visual website feedback, page annotation, QA comments, and Markdown developer handoff.
```

Recommended repository topics:

```text
chrome-extension, website-feedback, visual-feedback, page-annotation, qa, ux-review, developer-tools, markdown
```

After the repository is public, use these URLs in the Chrome Web Store listing:

```text
Homepage URL: https://github.com/<owner>/page-feedback-annotator
Support URL: https://github.com/<owner>/page-feedback-annotator/issues
Privacy Policy URL: https://github.com/<owner>/page-feedback-annotator/blob/main/PRIVACY.md
```

### Extension Name

Primary:

```text
Page Feedback Annotator
```

Alternative if a more SEO-focused name is needed:

```text
Page Feedback Annotator: Visual Website Comments
```

Keep the manifest name and store name aligned unless there is a clear branding reason.

### Short Description

Use this:

```text
Select elements on any page, add visual feedback comments, and copy a structured Markdown report for developers and AI agents.
```

### Detailed Description

Use this:

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

### Category

Recommended:

```text
Developer Tools
```

Alternative:

```text
Productivity
```

Use `Developer Tools` because the output is designed for developer handoff and AI/developer workflows.

### Language

Recommended listing language:

```text
English
```

Reason: broader search coverage for `website feedback`, `visual feedback`, `bug report`, `developer handoff`.

If you publish a Russian-localized listing later, use:

```text
Аннотатор страниц для визуальных комментариев, QA и передачи правок разработчикам.
```

### Search Keywords

Chrome Web Store does not always expose a separate keyword field. Use these naturally inside the title/description, not as spam:

```text
website feedback, visual feedback, page annotation, website annotation, bug report, QA feedback, UI review, UX review, design feedback, developer handoff, Markdown report, element selector, AI agent feedback
```

### Promotional Text

If the dashboard asks for promo text, use:

```text
Collect precise website feedback as structured Markdown.
```

### Support URL

Use the project repository or a simple support page if available. Do not use a placeholder.

```text
TODO: add public support URL before publishing
```

### Homepage URL

Use a public project page if available. If there is no public page yet, leave blank if Chrome allows it.

```text
TODO: add public homepage URL before publishing
```

### Privacy Policy URL

Chrome Web Store requires a URL in the dashboard, not just a local file. Publish `PRIVACY.md` somewhere public first.

Options:

```text
GitHub repository PRIVACY.md URL
GitHub Pages privacy page
Personal/company website privacy page
```

Do not submit with a fake privacy URL.

## Screenshots and Assets

Prepare screenshots before submitting:

- Popup with the round `Включить` button.
- Floating page panel opened on a neutral demo page.
- Element selection/comment composer.
- Markdown report copied into a text editor or preview.

Recommended screenshots:

```text
1280x800 or 640x400 PNG/JPEG
Clear browser UI
No private/customer data
No misleading claims
```

Recommended captions:

```text
Turn on visual feedback from the browser toolbar.
Select page elements and attach comments in context.
Copy a structured Markdown report for developers or AI agents.
Keep feedback local with no accounts or external servers.
```

Need before final submission:

```text
TODO: create screenshot assets in screenshots/
TODO: optionally create a promotional tile if the dashboard requests it
```

## Privacy Tab

### Single Purpose

Use this:

```text
Page Feedback Annotator lets users select elements on web pages, attach local feedback comments, and copy the resulting structured report for review or developer handoff.
```

### Data Collection Disclosure

Recommended answer:

```text
The extension does not collect or transmit user data to the developer or any third party.
```

Local data handled by the extension:

```text
The extension stores user-created comments, selected element metadata, page URL, viewport, and settings locally in Chrome storage so the user can continue their feedback session.
```

Important wording:

```text
Stored locally, not collected by the developer.
```

### Limited Use Disclosure

Use this in the public privacy policy:

```text
The use of information received from Chrome APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements. Data accessed by the extension is used only to provide the user-facing page feedback and report-copying features. The extension does not transfer, sell, or use user data for advertising.
```

### Remote Code

Answer:

```text
No remote code is used.
```

### Analytics

Answer:

```text
No analytics are used.
```

### Ads

Answer:

```text
No ads are used.
```

## Permission Justifications

Use these in the dashboard permission justification fields.

### `activeTab`

```text
Required so the popup can communicate with the currently active tab when the user turns the annotator on or off.
```

### `scripting`

```text
Required to inject the content script into the active page if the page did not already load it, so the user can start annotating from the toolbar popup.
```

### `storage`

```text
Required to store feedback notes and extension settings locally in Chrome storage for the current page.
```

### `clipboardWrite`

```text
Required so the user can copy the generated Markdown feedback report from the on-page panel.
```

### Host permission `<all_urls>`

```text
Required because the extension's single purpose is to let users annotate arbitrary websites they choose to review. The content script needs access to the current page DOM to identify selected elements, element positions, selectors, and text snippets for the local feedback report.
```

Risk note:

```text
This is the broadest permission in the extension. If Chrome review pushes back, consider changing the product to use optional host permissions or activeTab-only injection in a later version.
```

## Distribution

Recommended for first release:

```text
Visibility: Unlisted or Public
Pricing: Free
Regions: All regions where you can support the product
```

Use `Unlisted` for a controlled first review/test audience. Use `Public` when screenshots, support URL, privacy URL, and copy are final.

## Test Instructions

Use this:

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

## Pre-Submission Checklist

- `manifest.json` version is correct: `1.0.0`.
- ZIP exists: `dist/page-feedback-annotator-1.0.0.zip`.
- Popup has only one on/off action.
- Floating panel contains export/settings actions.
- Toolbar icon is not the old template icon.
- Privacy policy is published at a public URL.
- Store listing does not claim cloud sync, screenshots, recording, AI processing, or collaboration features that do not exist.
- Permission justifications match the actual manifest.
- Screenshots do not contain private data.
- Extension has been reloaded and manually tested in `chrome://extensions`.

## Official References

- Publish flow: https://developer.chrome.com/docs/webstore/publish/
- Best practices: https://developer.chrome.com/docs/webstore/best-practices
- Program policies: https://developer.chrome.com/docs/webstore/program-policies/policies
- User data FAQ: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
