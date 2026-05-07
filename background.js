const tabUrls = new Map();
const tabNotified = new Set();

chrome.action.setBadgeBackgroundColor({ color: "#00BCEB" });

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL)
    chrome.tabs.create({ url: chrome.runtime.getURL("onboarding.html") });
});

function addUrl(tabId, url) {
  if (!url || !/\.mp4/i.test(url)) return;
  if (!tabUrls.has(tabId)) tabUrls.set(tabId, new Set());

  const set = tabUrls.get(tabId);
  if (set.has(url)) return;
  set.add(url);

  chrome.action.setBadgeText({ text: String(set.size), tabId });

  if (!tabNotified.has(tabId)) {
    tabNotified.add(tabId);
    notify(tabId, set.size);
  }

  chrome.runtime.sendMessage({ type: "URL_UPDATE", tabId }).catch(() => {});
}

function notify(tabId, count) {
  chrome.notifications.create(`webex-${tabId}`, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Ready to download",
    message: `${count} MP4 file${count !== 1 ? "s" : ""} detected on this page.`,
    silent: true,
  });
}

chrome.webRequest.onBeforeRequest.addListener(
  ({ tabId, url }) => { if (tabId >= 0) addUrl(tabId, url); },
  { urls: ["<all_urls>"] },
  []
);

chrome.notifications.onClicked.addListener((id) => {
  chrome.notifications.clear(id);
  chrome.action.openPopup().catch(() => {});
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const tabId = sender.tab?.id ?? msg.tabId;

  if (msg.type === "ADD_URL") {
    if (tabId != null) addUrl(tabId, msg.url);
    return;
  }

  if (msg.type === "GET_URLS") {
    const urls = tabUrls.has(tabId) ? [...tabUrls.get(tabId)] : [];
    sendResponse({ urls });
    return true;
  }

  if (msg.type === "CLEAR") {
    if (tabId != null) {
      tabUrls.delete(tabId);
      tabNotified.delete(tabId);
      chrome.action.setBadgeText({ text: "", tabId });
    }
    sendResponse({});
    return true;
  }

  if (msg.type === "DOWNLOAD") {
    chrome.downloads.download({ url: msg.url, filename: msg.filename, saveAs: true });
    return;
  }
});

chrome.tabs.onRemoved.addListener(id => {
  tabUrls.delete(id);
  tabNotified.delete(id);
});
