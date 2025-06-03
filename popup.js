// popup.js

document.addEventListener('DOMContentLoaded', () => {
  loadEngines();

  chrome.storage.local.get('selectedEngine', (data) => {
    const dropdown = document.getElementById('searchEngine');
    if (data.selectedEngine && dropdown) {
      dropdown.value = data.selectedEngine;
      updateExtensionName(data.selectedEngine);
    }
  });

  document.getElementById('searchEngine').addEventListener('change', (e) => {
    const selected = e.target.value;
    chrome.storage.local.set({ selectedEngine: selected });
    updateExtensionName(selected);
  });

  document.getElementById('searchBtn').addEventListener('click', () => {
    const engineURL = document.getElementById('searchEngine').value;
    const query = document.getElementById('searchQuery').value.trim();
    if (!query) {
      alert("Please enter a search query.");
      return;
    }
    window.open(engineURL + encodeURIComponent(query), '_blank');
  });
});

function updateExtensionName(selected) {
  let extensionName = 'Find8';
  if (selected) {
    try {
      const parsed = new URL(selected);
      extensionName += ` (${parsed.hostname})`;
    } catch {
      extensionName += ` (${selected.charAt(0).toUpperCase() + selected.slice(1)})`;
    }
  }
  document.getElementById('extensionName').textContent = extensionName;
  document.getElementById('extensionNameHeader').textContent = extensionName;
}

function loadEngines() {
  const dropdown = document.getElementById('searchEngine');
  dropdown.innerHTML = '';

  chrome.storage.local.get({ engines: [] }, (result) => {
    const defaultEngines = [
      { name: 'Google', url: 'https://www.google.com/search?q=' },
      { name: 'Brave', url: 'https://search.brave.com/search?q=' },
      { name: 'Bing', url: 'https://www.bing.com/search?q=' },
      { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
      { name: 'Youtube', url: 'https://www.youtube.com/results?search_query=' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Search?search=' }
    ];

    const allEngines = [...defaultEngines];

    result.engines.forEach(custom => {
      if (!allEngines.some(e => e.url === custom.url)) {
        allEngines.push(custom);
      }
    });

    allEngines.forEach(engine => {
      const option = document.createElement('option');
      option.value = engine.url;
      option.textContent = engine.name;
      dropdown.appendChild(option);
    });
  });
}

// Detected engine from content script
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
            loadEngines();
            chrome.storage.local.remove('lastSuggestedEngine');
          });
        } else {
          alert(`${engine.name} is already added.`);
        }
      });
    });
  }
});