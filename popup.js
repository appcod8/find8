// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const searchBtn = document.getElementById('searchBtn');
  const searchEngine = document.getElementById('searchEngine');
  const searchQuery = document.getElementById('searchQuery');

  // Update the extension name when the page loads
  updateExtensionName();

  searchBtn.addEventListener('click', function() {
    console.log('Search button clicked!');
    const selectedEngine = searchEngine.value;
    const query = searchQuery.value.trim();
    if (!query) {
      alert('Please enter a search query.');
      return;
    }

    if (query) {
      const engineUrls = {
        "google": "https://www.google.com/search?q=",
        "brave": "https://search.brave.com/search?q=",
        "bing": "https://www.bing.com/search?q=",
        "duckduckgo": "https://duckduckgo.com/?q=",
        "github": "https://github.com/search?q=",
        "stackexchange": "https://stackexchange.com/search?q=",
        "stackoverflow": "https://stackoverflow.com/search?q=",
        "startpage": "https://www.startpage.com/do/search?query=",
        "wikipedia": "https://en.wikipedia.org/w/index.php?title=Special:Search&search=",
        // Add more engines as needed
      };

      const url = engineUrls[selectedEngine] + encodeURIComponent(query);
      window.open(url, '_blank');
    }
  });

  searchEngine.addEventListener('change', updateExtensionName);

  function updateExtensionName() {
    const selectedEngine = searchEngine.value;
    let extensionName = 'Find8';
    if (selectedEngine !== ' ') {
      extensionName += ` (${selectedEngine.charAt(0).toUpperCase() + selectedEngine.slice(1)})`;
    }
    document.getElementById('extensionName').textContent = extensionName;
    document.getElementById('extensionNameHeader').textContent = extensionName;
  }
});


// Add auto found search engine list
// Add auto found search engine list
chrome.storage.local.get('lastSuggestedEngine', (data) => {
  if (data.lastSuggestedEngine) {
    const engine = data.lastSuggestedEngine;
    const container = document.getElementById('suggestions');
    container.innerHTML = `
      <p>Detected engine: <strong>${engine.name}</strong></p>
      <button id="saveEngineBtn">Add to Find8</button>
    `;

    document.getElementById('saveEngineBtn').addEventListener('click', () => {
      // Use the same key as background.js
      chrome.storage.local.get({ engines: [] }, (result) => {
        const engines = result.engines;
        
        // Avoid duplicates
        const exists = engines.some(e => e.url === engine.url);
        if (!exists) {
          engines.push(engine);
          chrome.storage.local.set({ engines }, () => {
            alert(`Added ${engine.name} to Find8`);
            // Clear last suggestion so it doesn’t reappear
            chrome.storage.local.remove('lastSuggestedEngine');
          });
        } else {
          alert(`${engine.name} is already added.`);
        }
      });
    });
  }
});
