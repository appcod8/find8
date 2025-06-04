// popup.js
document.addEventListener('DOMContentLoaded', function () {
  const searchBtn = document.getElementById('searchBtn');
  const searchEngine = document.getElementById('searchEngine');
  const searchQuery = document.getElementById('searchQuery');

  // Load last selected engine
  chrome.storage.local.get('selectedEngine', (data) => {
    if (data.selectedEngine) {
      searchEngine.value = data.selectedEngine;
      updateExtensionName();
    }
  });

  // Search button handler
  searchBtn.addEventListener('click', function () {
    const selectedEngine = searchEngine.value;
    const query = searchQuery.value.trim();
    if (!query) {
      alert('Please enter a search query.');
      return;
    }
    chrome.storage.local.set({ selectedEngine }); // Save selected engine

    window.open(selectedEngine + encodeURIComponent(query), '_blank');
  });

  searchEngine.addEventListener('change', updateExtensionName);

  function updateExtensionName() {
    const selectedUrl = searchEngine.value;
    const name = selectedUrl.includes('youtube.com') ? 'YouTube' :
                 selectedUrl.includes('brave.com') ? 'Brave' :
                 selectedUrl.includes('bing.com') ? 'Bing' :
                 selectedUrl.includes('duckduckgo.com') ? 'DuckDuckGo' :
                 selectedUrl.includes('wikipedia.org') ? 'Wikipedia' :
                 selectedUrl.includes('github.com') ? 'GitHub' :
                 selectedUrl.includes('stackoverflow.com') ? 'StackOverflow' :
                 selectedUrl.includes('startpage.com') ? 'StartPage' : 'Find8';

    const extensionName = `Find8 (${name})`;
    document.getElementById('extensionName').textContent = extensionName;
    document.getElementById('extensionNameHeader').textContent = extensionName;
  }

  // Load dropdown
  loadEngines();
});

// Add detected engine with de-dupe
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

        // Normalize and check for existing engine
        const normalized = normalizeUrl(engine.url);
        const exists = engines.some(e => normalizeUrl(e.url) === normalized);

        if (!exists) {
          engines.push(engine);
          chrome.storage.local.set({ engines }, () => {
            alert(`Added ${engine.name} to Find8`);
            loadEngines();
            chrome.storage.local.remove('lastSuggestedEngine');
          });
        } else {
          alert(`${engine.name} is already in your list.`);
        }
      });
    });
  }
});

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`.replace(/\/$/, '');
  } catch (e) {
    return url;
  }
}

function loadEngines() {
  const dropdown = document.getElementById('searchEngine');
  if (!dropdown) return;

  chrome.storage.local.get({ engines: [] }, (result) => {
    dropdown.innerHTML = '';

    result.engines.forEach(engine => {
      const option = document.createElement('option');
      option.value = engine.url;
      option.textContent = engine.name;
      dropdown.appendChild(option);
    });
  });
}