# Video Downloader for Webex

A Chrome extension that detects and downloads MP4 recordings from Webex pages with one click.

## How it works

1. Open a Webex recording and press play
2. Wait a few seconds for the stream to load
3. Click the extension icon in the toolbar
4. Hit **Download** — the MP4 is saved to your computer

A badge counter and desktop notification appear automatically when a video is detected.

## Installation

soon

## Permissions

| Permission | Purpose |
|---|---|
| `webRequest` | Intercept network requests to capture the MP4 stream URL |
| `downloads` | Save the file to disk |
| `activeTab` | Show results for the current tab only |
| `scripting` | Inject the content script into Webex pages |
| `notifications` | Notify when a video is ready to download |
| `storage` | Persist detected URLs across popup open/close cycles |

## Privacy

No data is collected, stored, or transmitted. The extension only reads URL strings of network requests on Webex pages to detect video files.

