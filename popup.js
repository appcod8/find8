// popup.js
document.addEventListener('DOMContentLoaded', function () {
  const searchBtn = document.getElementById('searchBtn');
  const searchEngine = document.getElementById('searchEngine');
  const searchQuery = document.getElementById('searchQuery');

  // Load user-added and built-in engines
  loadEngines();

  // Update the header based on selected engine
  searchEngine.addEventListener('change', updateExtensionName);
  updateExtensionName();

  // Perform search when button clicked
  searchBtn.addEventListener('click', function () {
    const selectedUrl = searchEngine.value;
    const query = searchQuery.value.trim();
    if (!query) {
      alert('Please enter a search query.');
      return;
    }
    window.open(selectedUrl + encodeURIComponent(query), '_blank');
  });

  // Display last suggested engine (from content.js via background)
  chrome.storage.local.get('lastSuggestedEngine', (data) => {
    if (data.lastSuggestedEngine) {
      const engine = data.lastSuggestedEngine;
      const container = document.getElementById('suggestions');
      container.innerHTML = `
        <p>Detected engine: <strong>${engine.name}</strong></p>
        <button id="saveEngineBtn">Add to Find8</button>
      `;

      document.getElementById('saveEngineBtn').addEventListener('click', () => {
        // Ask background to persist the engine
        chrome.runtime.sendMessage({ action: 'addEngine', engine }, (response) => {
          if (response && response.success) {
            alert(`Added ${engine.name} to Find8`);
            chrome.storage.local.remove('lastSuggestedEngine');
            container.innerHTML = '';
            loadEngines(); // Refresh list
          } else {
            alert(`${engine.name} is already added.`);
          }
        });
      });
    }
  });

  function updateExtensionName() {
    const selectedUrl = searchEngine.value;
    const selectedOption = searchEngine.options[searchEngine.selectedIndex];
    const label = selectedOption ? selectedOption.textContent : 'Find8';
    const extName = `Find8 (${label})`;
    document.getElementById('extensionName').textContent = extName;
    document.getElementById('extensionNameHeader').textContent = extName;
  }

  function loadEngines() {
    const builtInEngines = [
      { name: "Google", url: "https://www.google.com/search?q=" },
      { name: "Brave", url: "https://search.brave.com/search?q=" },
      { name: "Bing", url: "https://www.bing.com/search?q=" },
      { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
      { name: "YouTube", url: "https://www.youtube.com/results?search_query=" },
      { name: "GitHub", url: "https://github.com/search?q=" },
      { name: "StackOverflow", url: "https://stackoverflow.com/search?q=" },
      { name: "StackExchange", url: "https://stackexchange.com/search?q=" },
      { name: "StartPage", url: "https://www.startpage.com/do/search?query=" },
      { name: "Wikipedia", url: "https://en.wikipedia.org/w/index.php?title=Special:Search&search=" }
    ];

    chrome.storage.local.get({ engines: [] }, (data) => {
      const dropdown = document.getElementById('searchEngine');
      dropdown.innerHTML = '';

      const added = new Set();

      // Merge built-in + custom
      const allEngines = [...builtInEngines, ...data.engines];

      allEngines.forEach(engine => {
        if (!added.has(engine.url)) {
          added.add(engine.url);
          const option = document.createElement('option');
          option.value = engine.url;
          option.textContent = engine.name;
          dropdown.appendChild(option);
        }
      });
    });
  }
});