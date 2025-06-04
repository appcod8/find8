// background.js
// Handle Omnibox input shortcuts
chrome.omnibox.onInputEntered.addListener((text) => {
  const [prefix, ...queryParts] = text.trim().split(' ');
  const query = queryParts.join(' ');
  let url;

  switch (prefix) {
    case 'y':
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`; break;
    case 'g':
      url = `https://github.com/search?q=${encodeURIComponent(query)}`; break;
    case 'b':
      url = `https://search.brave.com/search?q=${encodeURIComponent(query)}`; break;
    case 'w':
      url = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`; break;
    case 's':
      url = `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`; break;
    case 'd':
      url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`; break;
    default:
      url = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
  }

  chrome.tabs.create({ url });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'suggestSearchEngine') {
    const engine = request.engine;
    chrome.storage.local.set({ lastSuggestedEngine: engine });

    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });
    setTimeout(() => chrome.action.setBadgeText({ text: "" }), 5000);

    sendResponse({ success: true });
  }

  if (request.action === 'addEngine') {
    const newEngine = request.engine;
    const newHost = new URL(newEngine.url).hostname;
    const newKey = getQueryKey(newEngine.url);

    chrome.storage.local.get({ engines: [] }, (data) => {
      const exists = data.engines.some(e => {
        try {
          const host = new URL(e.url).hostname;
          const key = getQueryKey(e.url);
          return host === newHost && key === newKey;
        } catch {
          return false;
        }
      });

      if (!exists) {
        data.engines.push(newEngine);
        chrome.storage.local.set({ engines: data.engines }, () => {
          console.log("Engine added:", newEngine);
          chrome.runtime.sendMessage({ action: "engineAdded", engine: newEngine });
        });
      } else {
        console.log("Engine already exists:", newEngine);
      }
    });

    sendResponse({ success: true });
  }
});

function getQueryKey(url) {
  try {
    const queryPart = url.split('?')[1];
    if (queryPart) {
      const pairs = queryPart.split('&');
      for (const pair of pairs) {
        if (pair.endsWith('=')) {
          return pair.replace('=', '');
        }
      }
    }
  } catch {}
  return '';
}