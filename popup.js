const list = document.getElementById("list");
const dot = document.getElementById("dot");
const statusTxt = document.getElementById("status-txt");

let lastKey = "";

function getPathname(url) {
  try { return new URL(url).pathname.split("/").pop() || ""; }
  catch { return ""; }
}

function makeItem(url) {
  const name = getPathname(url) || url.slice(-50);

  const item = document.createElement("div");
  item.className = "item";

  const nameEl = document.createElement("div");
  nameEl.className = "item-name";
  nameEl.textContent = name;

  const btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = `Download ${name}`;
  btn.addEventListener("click", () => {
    const fname = /\.mp4$/i.test(name) ? name : `webex_${Date.now()}.mp4`;
    chrome.runtime.sendMessage({ type: "DOWNLOAD", url, filename: fname });
    btn.textContent = "Starting download...";
    btn.disabled = true;
  });

  item.append(nameEl, btn);
  return item;
}

function render(urls) {
  const key = urls.join("\0");
  if (key === lastKey) return;
  lastKey = key;

  if (!urls.length) {
    dot.className = "dot";
    statusTxt.textContent = "Listening...";
    list.innerHTML = `<div class="empty"><div class="empty-icon">▶</div><div class="empty-title">Play the video first</div><div class="empty-sub">Press play for a few seconds,<br>then come back here to download.</div></div>`;
    return;
  }

  dot.className = "dot on";
  statusTxt.textContent = `${urls.length} MP4 file${urls.length !== 1 ? "s" : ""} found`;

  const frag = document.createDocumentFragment();
  urls.forEach(url => frag.appendChild(makeItem(url)));
  list.replaceChildren(frag);
}

async function load() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  const res = await chrome.runtime.sendMessage({ type: "GET_URLS", tabId: tab.id });
  render(res?.urls ?? []);
}

chrome.runtime.onMessage.addListener(async msg => {
  if (msg.type !== "URL_UPDATE") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && msg.tabId === tab.id) load();
});

document.getElementById("btn-help").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("onboarding.html") });
});

load();
