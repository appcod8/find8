// background.js
// Handle Omnibox input
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

// Normalize URLs for flexible duplicate checking
function normalizeUrl(rawUrl) {
  try {
    const urlObj = new URL(rawUrl);
    urlObj.search = ''; // Remove query params
    return urlObj.href;
  } catch {
    return rawUrl;
  }
}

// Listen for search engine detection and addition
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'suggestSearchEngine') {
    const engine = request.engine;
    chrome.storage.local.set({ lastSuggestedEngine: engine });

    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });

    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 5000);

    sendResponse({ success: true });
  }

  if (request.action === 'addEngine') {
    const newEngine = request.engine;
    const normalizedNewUrl = normalizeUrl(newEngine.url);

    chrome.storage.local.get({ engines: [] }, (data) => {
      const engines = data.engines;

      const exists = engines.some(e => normalizeUrl(e.url) === normalizedNewUrl);
      if (!exists) {
        engines.push(newEngine);
        chrome.storage.local.set({ engines }, () => {
          console.log("Engine added:", newEngine);
          chrome.runtime.sendMessage({ action: "engineAdded", engine: newEngine });
          sendResponse({ success: true });
        });
      } else {
        console.log("Engine already exists:", newEngine);
        sendResponse({ success: false, reason: 'duplicate' });
      }
    });

    return true; // Indicate async response
  }
});