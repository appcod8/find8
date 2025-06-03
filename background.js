// background.js

// Omnibox command handler
chrome.omnibox.onInputEntered.addListener((text) => {
  const [prefix, ...queryParts] = text.trim().split(' ');
  const query = queryParts.join(' ');
  let url;

  switch (prefix) {
    case 'y':
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      break;
    case 'g':
      url = `https://github.com/search?q=${encodeURIComponent(query)}`;
      break;
    case 'b':
      url = `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
      break;
    case 'w':
      url = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
      break;
    case 's':
      url = `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`;
      break;
    case 'd':
      url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
      break;
    default:
      url = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
  }

  chrome.tabs.create({ url });
});

// Handle omnibox or popup search
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "search") {
    handleSearchRequest(request.query, request.url, sendResponse);
  }

  // Handle suggested engine from content script
  else if (request.action === 'suggestSearchEngine') {
    const newEngine = request.engine;
    console.log("Suggested engine:", newEngine);

    // Save it temporarily
    chrome.storage.local.set({ lastSuggestedEngine: newEngine }, () => {
      console.log("Stored for confirmation");
    });

    // Notify with badge
    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });

    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 5000);

    sendResponse({ success: true });
  }
});

function handleSearchRequest(query, url, sendResponse) {
  chrome.tabs.create({ url: url + encodeURIComponent(query) });
  sendResponse({ message: "Search result opened in a new tab." });
}

// Log to confirm script loaded
console.log('Find8 background script running');