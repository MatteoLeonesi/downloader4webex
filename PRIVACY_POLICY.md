# Privacy Policy — Video Downloader for Webex

_Last updated: May 7, 2025_

## Overview

Video Downloader for Webex is a Chrome extension that detects MP4 video stream URLs on Webex recording pages and lets you download them with one click. This policy explains what data the extension accesses and how it is handled.

## Data Collection

**We collect no user data.**

The extension does not collect, store, transmit, or share any personal information, browsing history, or usage data — neither to the developer nor to any third party.

## What the Extension Accesses

To perform its single function, the extension:

- **Observes network request URLs** on Webex pages to detect `.mp4` file addresses. Only the URL string is inspected; request bodies, response bodies, cookies, and credentials are never read.
- **Scans JSON/text responses** already fetched by the Webex page itself, looking for MP4 URL strings. No content is copied, stored, or sent anywhere.
- **Stores detected MP4 URLs in memory** (not on disk) for the duration of the browser session, scoped to the specific tab. This data is discarded when the tab is closed.

All processing happens entirely within your browser. No data ever leaves your device through the extension.

## Permissions

| Permission | Why it is needed |
|---|---|
| `webRequest` | Intercept request URLs on Webex pages to detect video stream addresses |
| `downloads` | Save the MP4 file to your computer when you click Download |
| `activeTab` | Identify the current tab so results are scoped to the page you are viewing |
| `scripting` | Inject the content script that monitors the page for video URLs |
| `notifications` | Show a desktop notification when a video is ready to download |
| `storage` | Retain detected URLs while the popup is closed and reopened |

## Third-Party Services

The extension does not communicate with any external server, API, or analytics service operated by the developer. Video files are downloaded directly from Webex's own CDN servers (the same servers your browser already contacts when you press play).

## Changes to This Policy

If this policy is updated, the _Last updated_ date at the top will change. Continued use of the extension after any update constitutes acceptance of the revised policy.

## Contact

For questions or concerns, open an issue at [github.com/MatteoLeonesi/downloader4webex](https://github.com/MatteoLeonesi/downloader4webex).
