// background.js
// Handle Omnibox input shortcuts
chrome.omnibox.onInputEntered.addListener((text) => {
  const [prefix, ...queryParts] = text.trim().split(' ');
  const query = queryParts.join(' ');
  let url;

  switch (prefix) {
    case 'y': url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`; break;
    case 'g': url = `https://github.com/search?q=${encodeURIComponent(query)}`; break;
    case 'b': url = `https://search.brave.com/search?q=${encodeURIComponent(query)}`; break;
    case 'w': url = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`; break;
    case 's': url = `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`; break;
    case 'd': url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`; break;
    default:  url = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
  }

  chrome.tabs.create({ url });
});

// Normalize engine URLs for comparison
function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

// Handle engine suggestion
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'suggestSearchEngine') {
    const engine = request.engine;
    chrome.storage.local.set({ lastSuggestedEngine: engine });

    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });

    setTimeout(() => chrome.action.setBadgeText({ text: "" }), 5000);
    return;
  }

  if (request.action === 'addEngine') {
    const newEngine = request.engine;
    const newNorm = normalizeUrl(newEngine.url);

    chrome.storage.local.get({ engines: [] }, (data) => {
      const exists = data.engines.some(e => normalizeUrl(e.url) === newNorm);

      if (!exists) {
        data.engines.push(newEngine);
        chrome.storage.local.set({ engines: data.engines }, () => {
          console.log("Engine added:", newEngine);
          chrome.runtime.sendMessage({ action: "engineAdded", engine: newEngine });
          sendResponse({ success: true });
        });
      } else {
        console.log("Engine already exists:", newEngine);
        sendResponse({ success: false });
      }
    });

    // Required for async response
    return true;
  }
});