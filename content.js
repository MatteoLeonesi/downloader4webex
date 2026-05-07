const found = new Set();

function report(url) {
  if (!url || typeof url !== "string") return;
  url = url.split(/['">\s]/)[0].trim();
  if (found.has(url) || !url.startsWith("http") || !/\.mp4/i.test(url)) return;
  found.add(url);
  chrome.runtime.sendMessage({ type: "ADD_URL", url }).catch(() => {});
}

function scanText(text) {
  if (!text) return;
  const re = /https?:\/\/[^\s"'<>]+\.mp4(?:\?[^\s"'<>]*)?/gi;
  let m;
  while ((m = re.exec(text)) !== null) report(m[0]);
}

function scanMediaElements(root = document) {
  root.querySelectorAll("video, source").forEach(el => {
    report(el.src);
    report(el.currentSrc);
  });
}

function scanPage() {
  document.querySelectorAll("script:not([src])").forEach(s => scanText(s.textContent));
  scanMediaElements();
  if (found.size === 0) scanText(document.documentElement.innerHTML);
}

function extractRecordingId(url) {
  const patterns = [
    /recording\/play\/([a-f0-9-]+)/i,
    /RCID=([a-f0-9-]+)/i,
    /recordingId=([a-f0-9-]+)/i,
    /\/play\/([a-f0-9]{8,})/i,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

async function tryWebexApi() {
  const recordingId = extractRecordingId(location.href);
  if (!recordingId) return;

  const endpoints = [
    `/api/v1/recordings/${recordingId}`,
    `/webappng/api/v1/recordings/${recordingId}`,
    `/recordingservice/api/v1/recordings/${recordingId}`,
  ];

  for (const ep of endpoints) {
    if (found.size > 0) break;
    try {
      const res = await fetch(location.origin + ep, { credentials: "include" });
      if (!res.ok) continue;
      const data = await res.json();
      scanText(JSON.stringify(data));
    } catch {}
  }
}

const OrigXHR = window.XMLHttpRequest;
class PatchedXHR extends OrigXHR {
  send(...a) {
    this.addEventListener("load", () => {
      if ((this.responseType === "" || this.responseType === "text") && this.responseText) {
        scanText(this.responseText);
      }
    });
    return super.send(...a);
  }
}
window.XMLHttpRequest = PatchedXHR;

const origFetch = window.fetch;
window.fetch = async function(input, ...args) {
  const res = await origFetch.call(this, input, ...args);
  try {
    const ct = res.headers.get("content-type") || "";
    const len = parseInt(res.headers.get("content-length") || "0", 10);
    if (/json|text|javascript/i.test(ct) && (len === 0 || len < 500_000)) {
      res.clone().text().then(scanText).catch(() => {});
    }
  } catch {}
  return res;
};

new MutationObserver(mutations => {
  for (const { addedNodes } of mutations) {
    for (const node of addedNodes) {
      if (node.nodeType !== 1) continue;
      if (node.matches?.("video, source")) { report(node.src); report(node.currentSrc); }
      node.querySelectorAll?.("video, source").forEach(el => { report(el.src); report(el.currentSrc); });
    }
  }
}).observe(document.documentElement, { childList: true, subtree: true });

scanPage();
tryWebexApi();
