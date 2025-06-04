// popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const searchBtn = document.getElementById('searchBtn');
  const searchEngine = document.getElementById('searchEngine');
  const searchQuery = document.getElementById('searchQuery');

  loadEngines();
  restoreSelectedEngine();
  updateExtensionName();

  searchBtn.addEventListener('click', () => {
    const selectedUrl = searchEngine.value;
    const query = searchQuery.value.trim();
    if (!query) {
      alert('Please enter a search query.');
      return;
    }

    chrome.storage.local.set({ selectedEngineUrl: selectedUrl });

    const url = selectedUrl + encodeURIComponent(query);
    window.open(url, '_blank');
  });

  searchEngine.addEventListener('change', () => {
    const selected = searchEngine.value;
    chrome.storage.local.set({ selectedEngineUrl: selected });
    updateExtensionName();
  });

  // Handle last detected engine
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

          const normalizedNewUrl = normalizeUrl(engine.url);
          const exists = engines.some(e => normalizeUrl(e.url) === normalizedNewUrl);

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

  function normalizeUrl(url) {
    try {
      const u = new URL(url);
      u.searchParams.sort(); // Normalize query order
      return u.origin + u.pathname;
    } catch (e) {
      return url;
    }
  }

  function loadEngines() {
    chrome.storage.local.get({ engines: [] }, (data) => {
      const dropdown = document.getElementById('searchEngine');
      if (!dropdown) return;

      dropdown.innerHTML = '';

      // Built-in defaults
      const defaults = [
        { name: "Google", url: "https://www.google.com/search?q=" },
        { name: "YouTube", url: "https://www.youtube.com/results?search_query=" },
        { name: "Brave", url: "https://search.brave.com/search?q=" },
        { name: "Bing", url: "https://www.bing.com/search?q=" },
        { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
        { name: "GitHub", url: "https://github.com/search?q=" },
        { name: "StackExchange", url: "https://stackexchange.com/search?q=" },
        { name: "StackOverflow", url: "https://stackoverflow.com/search?q=" },
        { name: "Wikipedia", url: "https://en.wikipedia.org/w/index.php?title=Special:Search&search=" },
        { name: "Startpage", url: "https://www.startpage.com/do/search?query=" }
      ];

      const fullList = [...defaults];

      // Avoid duplicates by normalizing
      const existingNormalized = new Set(defaults.map(e => normalizeUrl(e.url)));
      for (const e of data.engines) {
        if (!existingNormalized.has(normalizeUrl(e.url))) {
          fullList.push(e);
          existingNormalized.add(normalizeUrl(e.url));
        }
      }

      fullList.forEach(engine => {
        const option = document.createElement('option');
        option.value = engine.url;
        option.textContent = engine.name;
        dropdown.appendChild(option);
      });

      restoreSelectedEngine(); // ensure correct engine stays selected
    });
  }

  function restoreSelectedEngine() {
    chrome.storage.local.get('selectedEngineUrl', (data) => {
      const dropdown = document.getElementById('searchEngine');
      if (dropdown && data.selectedEngineUrl) {
        dropdown.value = data.selectedEngineUrl;
        updateExtensionName();
      }
    });
  }

  function updateExtensionName() {
    const selectedName = searchEngine.options[searchEngine.selectedIndex]?.text || 'Find8';
    const extName = `Find8 (${selectedName})`;
    document.getElementById('extensionName').textContent = extName;
    document.getElementById('extensionNameHeader').textContent = extName;
  }
});