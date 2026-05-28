# Page Feedback Annotator

Chrome extension for collecting visual feedback on any web page. It lets you select page elements, attach comments, and export a structured Markdown report for developers, designers, or AI agents.

## Chrome Web Store

Status: prepared for first submission.

- Current version: `1.0.0`
- Release ZIP: `dist/page-feedback-annotator-1.0.0.zip`
- Privacy policy: `PRIVACY.md`
- Store listing guide: `STORE_RELEASE_GUIDE.md`
- Chrome Web Store URL: TODO after publication

## Release UX

- The browser popup has one job: turn the annotator on or off for the current page.
- When enabled, a floating panel appears on the page.
- Copy, copy and clear, clear, color, auto-copy, and text-capture settings live inside the floating page panel.
- Closing the panel turns it off. It should not come back as a small button unless the user enables it again from the extension popup.

## Install locally

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click `Load unpacked`.
4. Select the `page_feedback_annotator` folder.
5. Pin the extension in the browser toolbar if you want quick access.

## How to Use

1. Click the Page Feedback toolbar icon.
2. Press the round `Включить` button.
3. On the page, click an element and write a comment.
4. Use `Shift` + click to add another element to the same comment group.
5. Drag a rectangle to select a group of elements.
6. Use the floating panel on the page to copy, clear, or change settings.
7. Press `Escape` or the close button to turn the annotator off.

## Export Format

The copied report is Markdown and includes:

- Page URL and viewport.
- Captured element selector and DOM path.
- Element rectangle coordinates.
- Optional short element text.
- The written feedback.

## Permissions

- `activeTab`: lets the popup talk to the current tab.
- `scripting`: injects the content script if the page did not load it yet.
- `storage`: stores comments and annotator settings locally in Chrome.
- `clipboardWrite`: copies the Markdown report.
- `<all_urls>` host permission: allows annotation on arbitrary pages.

## Privacy

All comments and settings are stored locally in Chrome storage. The extension does not send page content, comments, URLs, or settings to any external server.

See `PRIVACY.md` for the public privacy policy.

## Support

Use GitHub Issues in this repository for bugs, feature requests, and release questions.

Before reporting a bug, include:

- Chrome version.
- Extension version.
- Website URL or a reproducible test page.
- Steps to reproduce.
- Expected result.
- Actual result.

## Release Checklist

- Reload the extension in `chrome://extensions`.
- Open a normal website and turn the annotator on from the popup.
- Add one comment and copy the report from the page panel.
- Close the panel and refresh the page. The floating button should stay hidden.
- Check the toolbar icon at pinned size.
