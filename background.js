// background.js

// Omnibox command handler (top-level)
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

// Message listener for popup-initiated searches
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "search") {
    handleSearchRequest(request.query, request.url, sendResponse);
  }
});

function handleSearchRequest(query, url, sendResponse) {
  chrome.tabs.create({ url: url + encodeURIComponent(query) });
  sendResponse({ message: "Search result opened in a new tab." });
}


// Suggest/Auto add found new search engine 
// Show engines
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'suggestSearchEngine') {
    console.log("Detected engine:", request.engine);

  // Optional: store in storage or session for now
  chrome.storage.local.set({ lastSuggestedEngine: request.engine });

    // Show a badge with a dot or letter
    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });

    // Optional: remove badge after 5 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 5000);
  }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "suggestSearchEngine") {
    const newEngine = request.engine;
    console.log("Detected engine:", newEngine);

    // Show a badge (✓) for feedback
    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });

    // Auto-clear badge after 5 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 5000);

    // Save to local storage
    chrome.storage.local.get({ engines: [] }, (data) => {
      const engines = data.engines;

      // Avoid duplicates
      const exists = engines.some(e => e.url === newEngine.url);
      if (!exists) {
        engines.push(newEngine);
        chrome.storage.local.set({ engines }, () => {
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

// Test script runs log message to console
console.log('f8 bg script running');
