// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const searchEngine = document.getElementById('searchEngine');
  const searchQuery = document.getElementById('searchQuery');
  const extensionNameHeader = document.getElementById('extensionNameHeader');
  const suggestionsContainer = document.getElementById('suggestions');

  // Default built-in search engines (with YouTube)
  const defaultEngines = {
    "Google": "https://www.google.com/search?q=",
    "Brave": "https://search.brave.com/search?q=",
    "Bing": "https://www.bing.com/search?q=",
    "DuckDuckGo": "https://duckduckgo.com/?q=",
    "Wikipedia": "https://en.wikipedia.org/wiki/Special:Search?search=",
    "YouTube": "https://www.youtube.com/results?search_query=",
    "GitHub": "https://github.com/search?q=",
    "Stack Overflow": "https://stackoverflow.com/search?q="
  };

  function loadEngines() {
    chrome.storage.local.get({ engines: [], selectedEngineUrl: '' }, (data) => {
      const mergedEngines = { ...defaultEngines };
      data.engines.forEach(engine => {
        mergedEngines[engine.name] = engine.url;
      });

      // Clear dropdown
      searchEngine.innerHTML = '';

      // Populate dropdown
      for (const [name, url] of Object.entries(mergedEngines)) {
        const option = document.createElement('option');
        option.value = url;
        option.textContent = name;
        searchEngine.appendChild(option);
      }

      // Restore previous selection
      if (data.selectedEngineUrl) {
        searchEngine.value = data.selectedEngineUrl;
      }

      updateExtensionName();
    });
  }

  function updateExtensionName() {
    const selectedOption = searchEngine.options[searchEngine.selectedIndex];
    const label = selectedOption ? selectedOption.text : 'Find8';
    extensionNameHeader.textContent = `Find8 (${label})`;
    chrome.storage.local.set({ selectedEngineUrl: searchEngine.value });
  }

  searchEngine.addEventListener('change', updateExtensionName);

  searchBtn.addEventListener('click', () => {
    const query = searchQuery.value.trim();
    const engineUrl = searchEngine.value;

    if (!query) {
      alert('Please enter a search query.');
      return;
    }

    const fullUrl = engineUrl + encodeURIComponent(query);
    chrome.tabs.create({ url: fullUrl });
  });

  // Detect and offer new engine from content script
  chrome.storage.local.get('lastSuggestedEngine', (data) => {
    if (data.lastSuggestedEngine) {
      const engine = data.lastSuggestedEngine;
      suggestionsContainer.innerHTML = `
        <p>Detected engine: <strong>${engine.name}</strong></p>
        <button id="saveEngineBtn">Add to Find8</button>
      `;

      document.getElementById('saveEngineBtn').addEventListener('click', () => {
        chrome.storage.local.get({ engines: [] }, (result) => {
          const engines = result.engines;
          const exists = engines.some(e => e.url === engine.url);

          if (!exists) {
            engines.push(engine);
            chrome.storage.local.set({ engines }, () => {
              alert(`Added ${engine.name} to Find8`);
              chrome.storage.local.remove('lastSuggestedEngine');
              loadEngines();
            });
          } else {
            alert(`${engine.name} is already added.`);
          }
        });
      });
    }
  });

  loadEngines();
});