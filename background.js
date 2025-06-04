// background.js
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
    const newEngine = request.engine;

    chrome.storage.local.get({ engines: [] }, (data) => {
      const exists = data.engines.some(e => e.url === newEngine.url);
      if (!exists) {
        const updated = [...data.engines, newEngine];
        chrome.storage.local.set({ engines: updated }, () => {
          console.log("Engine added:", newEngine);
          chrome.runtime.sendMessage({ action: 'engineAdded', engine: newEngine });
        });
      } else {
        console.log("Engine already exists:", newEngine);
      }
    });

    // Badge feedback
    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });
    setTimeout(() => chrome.action.setBadgeText({ text: "" }), 5000);

    sendResponse({ success: true });
  }
});