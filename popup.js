// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const searchEngine = document.getElementById('searchEngine');
  const searchQuery = document.getElementById('searchQuery');

  loadEngines();

  // Load selected engine from storage
  chrome.storage.local.get('selectedEngine', (data) => {
    if (data.selectedEngine) {
      searchEngine.value = data.selectedEngine;
      updateExtensionName(data.selectedEngine);
    }
  });

  searchBtn.addEventListener('click', () => {
    const selectedEngine = searchEngine.value;
    const query = searchQuery.value.trim();
    if (!query) {
      alert('Please enter a search query.');
      return;
    }

    chrome.storage.local.set({ selectedEngine }); // Persist selected engine

    window.open(selectedEngine + encodeURIComponent(query), '_blank');
  });

  searchEngine.addEventListener('change', () => {
    const selected = searchEngine.value;
    chrome.storage.local.set({ selectedEngine: selected });
    updateExtensionName(selected);
  });

  function updateExtensionName(url) {
    const label = searchEngine.selectedOptions[0]?.textContent || 'Find8';
    const extensionName = `Find8 (${label})`;
    document.getElementById('extensionName').textContent = extensionName;
    document.getElementById('extensionNameHeader').textContent = extensionName;
  }
});

// Load engines into dropdown
function loadEngines() {
  const defaultEngines = [
    { name: "Google", url: "https://www.google.com/search?q=" },
    { name: "Brave", url: "https://search.brave.com/search?q=" },
    { name: "Bing", url: "https://www.bing.com/search?q=" },
    { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
    { name: "GitHub", url: "https://github.com/search?q=" },
    { name: "StackOverflow", url: "https://stackoverflow.com/search?q=" },
    { name: "Startpage", url: "https://www.startpage.com/do/search?query=" },
    { name: "Wikipedia", url: "https://en.wikipedia.org/w/index.php?title=Special:Search&search=" },
    { name: "YouTube", url: "https://www.youtube.com/results?search_query=" },
  ];

  chrome.storage.local.get({ engines: [] }, (data) => {
    const engines = [...defaultEngines, ...data.engines];
    const seen = new Set();
    const uniqueEngines = engines.filter(e => {
      if (seen.has(e.url)) return false;
      seen.add(e.url);
      return true;
    });

    const dropdown = document.getElementById('searchEngine');
    dropdown.innerHTML = '';
    uniqueEngines.forEach(engine => {
      const option = document.createElement('option');
      option.value = engine.url;
      option.textContent = engine.name;
      dropdown.appendChild(option);
    });
  });
}

// Display suggestion and allow manual save
chrome.storage.local.get('lastSuggestedEngine', (data) => {
  const container = document.getElementById('suggestions');
  if (data.lastSuggestedEngine) {
    const engine = data.lastSuggestedEngine;
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
  } else {
    container.innerHTML = ''; // Clear if no suggestion
  }
});