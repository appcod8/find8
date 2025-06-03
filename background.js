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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "suggestSearchEngine") {
    console.log("Suggested engine:", request.engine);
// Optional: show notification or popup to confirm adding new search engine
    chrome.storage.sync.get({ engines: [] }, (data) => {
      const engines = data.engines || [];
      const exists = engines.find(e => e.url === request.engine.url);

      if (!exists) {
        engines.push(request.engine);
        chrome.storage.sync.set({ engines });
        console.log("Engine added:", request.engine.name);
      }
    });
  }
});

// Save engines
function saveEngines(engineList) {
  chrome.storage.sync.set({ engines: engineList }, () => {
    console.log('Engines saved:', engineList);
  });
}
// Load engines
function loadEngines(callback) {
  chrome.storage.sync.get({ engines: [] }, (result) => {
    callback(result.engines || []);
  });
}

// To log message to the console
// console.log('script running');
