// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const searchEngine = document.getElementById('searchEngine');
  const searchQuery = document.getElementById('searchQuery');

  // Load engines and previously selected one
  loadEngines().then(() => {
    chrome.storage.local.get('selectedEngine', (data) => {
      if (data.selectedEngine) {
        searchEngine.value = data.selectedEngine;
        updateExtensionName();
      }
    });
  });

  // Run search
  searchBtn.addEventListener('click', () => {
    const selectedEngine = searchEngine.value;
    const query = searchQuery.value.trim();
    if (!query) return alert('Please enter a search query.');

    // Save selected engine
    chrome.storage.local.set({ selectedEngine });

    // Perform search
    window.open(selectedEngine + encodeURIComponent(query), '_blank');
  });

  // Update title
  searchEngine.addEventListener('change', () => {
    const selectedEngine = searchEngine.value;
    chrome.storage.local.set({ selectedEngine });
    updateExtensionName();
  });

  // Display name update
  function updateExtensionName() {
    const selectedEngine = searchEngine.value;
    let label = 'Find8';
    try {
      const parsed = new URL(selectedEngine);
      label += ` (${parsed.hostname})`;
    } catch (e) {}
    document.getElementById('extensionName').textContent = label;
    document.getElementById('extensionNameHeader').textContent = label;
  }

  // Handle auto-detected engine suggestion
  chrome.storage.local.get('lastSuggestedEngine', (data) => {
    if (data.lastSuggestedEngine) {
      const engine = data.lastSuggestedEngine;
      const container = document.getElementById('suggestions');
      container.innerHTML = `
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
});

// Load engines into dropdown
function loadEngines() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ engines: [] }, (result) => {
      const dropdown = document.getElementById('searchEngine');
      if (!dropdown) return resolve();

      dropdown.innerHTML = '';

      // Built-ins + dynamic
      const defaultEngines = [
        { name: "Google", url: "https://www.google.com/search?q=" },
        { name: "Brave", url: "https://search.brave.com/search?q=" },
        { name: "Bing", url: "https://www.bing.com/search?q=" },
        { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
        { name: "Wikipedia", url: "https://en.wikipedia.org/w/index.php?search=" },
        { name: "GitHub", url: "https://github.com/search?q=" },
        { name: "Stack Overflow", url: "https://stackoverflow.com/search?q=" },
        { name: "Startpage", url: "https://www.startpage.com/do/search?query=" },
        { name: "YouTube", url: "https://www.youtube.com/results?search_query=" }
      ];

      const allEngines = [...defaultEngines, ...result.engines];
      const seen = new Set();

      allEngines.forEach(engine => {
        if (!seen.has(engine.url)) {
          seen.add(engine.url);
          const option = document.createElement('option');
          option.value = engine.url;
          option.textContent = engine.name;
          dropdown.appendChild(option);
        }
      });

      resolve();
    });
  });
}