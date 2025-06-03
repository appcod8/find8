// popup.js
document.addEventListener('DOMContentLoaded', function () {
  const searchBtn = document.getElementById('searchBtn');
  const searchEngine = document.getElementById('searchEngine');
  const searchQuery = document.getElementById('searchQuery');

  updateExtensionName();
  loadEngines();
  handleSuggestions();

  searchBtn.addEventListener('click', function () {
    const selectedEngine = searchEngine.value;
    const query = searchQuery.value.trim();

    if (!query) {
      alert('Please enter a search query.');
      return;
    }

    const defaultEngines = {
      "google": "https://www.google.com/search?q=",
      "brave": "https://search.brave.com/search?q=",
      "bing": "https://www.bing.com/search?q=",
      "duckduckgo": "https://duckduckgo.com/?q=",
      "github": "https://github.com/search?q=",
      "stackexchange": "https://stackexchange.com/search?q=",
      "stackoverflow": "https://stackoverflow.com/search?q=",
      "startpage": "https://www.startpage.com/do/search?query=",
       "youtube": "https://www.youtube.com/results?search_query=",
      "wikipedia": "https://en.wikipedia.org/w/index.php?title=Special:Search&search="
    };

    let searchUrl = selectedEngine.startsWith('http')
      ? selectedEngine
      : defaultEngines[selectedEngine];

    if (!searchUrl) {
      alert('Invalid search engine selected.');
      return;
    }

    const url = searchUrl + encodeURIComponent(query);
    window.open(url, '_blank');
  });

  searchEngine.addEventListener('change', updateExtensionName);

  function updateExtensionName() {
    const selectedEngine = searchEngine.value;
    let extensionName = 'Find8';
    if (selectedEngine && !selectedEngine.startsWith('http')) {
      extensionName += ` (${selectedEngine.charAt(0).toUpperCase() + selectedEngine.slice(1)})`;
    }
    document.getElementById('extensionName').textContent = extensionName;
    document.getElementById('extensionNameHeader').textContent = extensionName;
  }
});

function loadEngines() {
  chrome.storage.local.get({ engines: [] }, (result) => {
    const dropdown = document.getElementById('searchEngine');
    if (!dropdown) return;

    dropdown.innerHTML = ''; // Clear existing

    const defaultEngines = [
      { name: "Google", url: "google" },
      { name: "DuckDuckGo", url: "duckduckgo" },
      { name: "Bing", url: "bing" },
      { name: "Brave", url: "brave" },
      { name: "StartPage", url: "startpage" },
      { name: "Wikipedia", url: "wikipedia" },
      { name: "Youtube", url: "youtube" },
      { name: "GitHub", url: "github" },
      { name: "StackOverflow", url: "stackoverflow" },
      { name: "StackExchange", url: "stackexchange" }
    ];

    [...defaultEngines, ...result.engines].forEach(engine => {
      const option = document.createElement('option');
      option.value = engine.url;
      option.textContent = engine.name;
      dropdown.appendChild(option);
    });
  });
}

function handleSuggestions() {
  chrome.storage.local.get('lastSuggestedEngine', (data) => {
    if (data.lastSuggestedEngine) {
      const engine = data.lastSuggestedEngine;
      const container = document.getElementById('suggestions');
      if (!container) return;

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
              loadEngines(); // Refresh dropdown
              container.innerHTML = ''; // Clear UI after adding
            });
          } else {
            alert(`${engine.name} is already added.`);
          }
        });
      });
    }
  });
}
