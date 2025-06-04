// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const searchEngine = document.getElementById('searchEngine');
  const searchQuery = document.getElementById('searchQuery');
  const extensionName = document.getElementById('extensionName');
  const extensionNameHeader = document.getElementById('extensionNameHeader');

  function updateExtensionName(url) {
    let name = 'Find8';
    if (url) {
      try {
        const domain = new URL(url).hostname;
        name += ` (${domain})`;
      } catch (e) {}
    }
    extensionName.textContent = name;
    extensionNameHeader.textContent = name;
  }

  function loadEngines() {
    chrome.storage.local.get({ engines: [], selectedEngine: '' }, (data) => {
      searchEngine.innerHTML = '';
      data.engines.forEach(engine => {
        const option = document.createElement('option');
        option.value = engine.url;
        option.textContent = engine.name;
        searchEngine.appendChild(option);
      });

      if (data.selectedEngine) {
        searchEngine.value = data.selectedEngine;
        updateExtensionName(data.selectedEngine);
      }
    });
  }

  searchBtn.addEventListener('click', () => {
    const selectedURL = searchEngine.value;
    const query = searchQuery.value.trim();
    if (!query) {
      alert('Please enter a search query.');
      return;
    }

    chrome.storage.local.set({ selectedEngine: selectedURL });
    const fullURL = selectedURL + encodeURIComponent(query);
    window.open(fullURL, '_blank');
  });

  searchEngine.addEventListener('change', () => {
    const selectedURL = searchEngine.value;
    chrome.storage.local.set({ selectedEngine: selectedURL });
    updateExtensionName(selectedURL);
  });

  // Load detected engine suggestion
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
          const exists = result.engines.some(e =>
            new URL(e.url).hostname === new URL(engine.url).hostname &&
            e.url.includes(getQueryKey(engine.url))
          );

          if (!exists) {
            result.engines.push(engine);
            chrome.storage.local.set({ engines: result.engines }, () => {
              alert(`Added ${engine.name} to Find8`);
              loadEngines();
              chrome.storage.local.remove('lastSuggestedEngine');
              container.innerHTML = '';
            });
          } else {
            alert(`${engine.name} is already added.`);
          }
        });
      });
    }
  });

  function getQueryKey(url) {
    try {
      const queryPart = url.split('?')[1];
      if (queryPart) {
        const pairs = queryPart.split('&');
        for (const pair of pairs) {
          if (pair.endsWith('=')) {
            return pair.replace('=', '');
          }
        }
      }
    } catch {}
    return '';
  }

  loadEngines();
});