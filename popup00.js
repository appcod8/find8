// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const searchEngine = document.getElementById('searchEngine');
  const searchQuery = document.getElementById('searchQuery');

  loadEngines();

  // Load previously selected engine
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

    chrome.storage.local.set({ selectedEngine }); // Remember choice
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

function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname;
  } catch {
    return url;
  }
}

function loadEngines() {
  const defaultEngines = [
    { name: "Google", url: "https://www.google.com/search?q=" },
    { name: "Brave", url: "https://search.brave.com/search?q=" },
    { name: "Bing", url: "https://www.bing.com/search?q=" },
    { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
    { name: "GitHub", url: "https://github.com/search?q=" },
    { name: "StackOverflow", url: "https://stackoverflow.com/search?q=" },
    { name: "Stackexchange", url: "https://stackexchange.com/search?q=" },
    { name: "Startpage", url: "https://www.startpage.com/do/search?query=" },
    { name: "Wikipedia", url: "https://en.wikipedia.org/w/index.php?title=Special:Search&search=" },
    { name: "YouTube", url: "https://www.youtube.com/results?search_query=" },
  ];

  chrome.storage.local.get({ engines: [] }, (data) => {
    const combined = [...defaultEngines, ...data.engines];
    const seen = new Set();
    const unique = [];

    for (const engine of combined) {
      const norm = normalizeUrl(engine.url);
      if (!seen.has(norm)) {
        seen.add(norm);
        unique.push(engine);
      }
    }

    const dropdown = document.getElementById('searchEngine');
    dropdown.innerHTML = '';

    unique.forEach(engine => {
      const option = document.createElement('option');
      option.value = engine.url;
      option.textContent = engine.name;
      dropdown.appendChild(option);
    });
  });
}

// Show suggestion if not already saved
chrome.storage.local.get(['lastSuggestedEngine', 'engines'], (data) => {
  const container = document.getElementById('suggestions');
  const suggested = data.lastSuggestedEngine;
  const savedEngines = data.engines || [];

  if (!suggested) return;

  const normSuggested = normalizeUrl(suggested.url);
  const alreadyExists = savedEngines.some(e => normalizeUrl(e.url) === normSuggested);

  if (alreadyExists) {
    // Clear suggestion if already saved
    chrome.storage.local.remove('lastSuggestedEngine');
    return;
  }

  // Show prompt to add
  container.innerHTML = `
    <p>Detected engine: <strong>${suggested.name}</strong></p>
    <button id="saveEngineBtn">Add to Find8</button>
  `;

  document.getElementById('saveEngineBtn').addEventListener('click', () => {
    chrome.storage.local.get({ engines: [] }, (result) => {
      const current = result.engines || [];
      const isDuplicate = current.some(e => normalizeUrl(e.url) === normSuggested);

      if (isDuplicate) {
        alert(`${suggested.name} is already added.`);
        chrome.storage.local.remove('lastSuggestedEngine');
        return;
      }

      current.push(suggested);
      chrome.storage.local.set({ engines: current }, () => {
        alert(`Added ${suggested.name} to Find8`);
        chrome.storage.local.remove('lastSuggestedEngine');
        loadEngines(); // Refresh dropdown
        document.getElementById('suggestions').innerHTML = '';
      });
    });
  });
});