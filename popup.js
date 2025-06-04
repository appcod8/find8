// popup.js
document.addEventListener('DOMContentLoaded', function () {
  const searchBtn = document.getElementById('searchBtn');
  const searchEngine = document.getElementById('searchEngine');
  const searchQuery = document.getElementById('searchQuery');

  // Load engines and set last used engine
  loadEngines();

  searchBtn.addEventListener('click', function () {
    const selectedEngineUrl = searchEngine.value;
    const query = searchQuery.value.trim();

    if (!query) {
      alert('Please enter a search query.');
      return;
    }

    // Persist selected engine
    chrome.storage.local.set({ lastUsedEngine: selectedEngineUrl });

    const finalUrl = selectedEngineUrl + encodeURIComponent(query);
    window.open(finalUrl, '_blank');
  });

  searchEngine.addEventListener('change', () => {
    const selected = searchEngine.value;
    chrome.storage.local.set({ lastUsedEngine: selected });
  });

  // Load and populate engine dropdown
  function loadEngines() {
    chrome.storage.local.get(['engines', 'lastUsedEngine'], (result) => {
      const dropdown = document.getElementById('searchEngine');
      dropdown.innerHTML = '';

      const engines = result.engines || [];
      const lastUsed = result.lastUsedEngine;

      engines.forEach(engine => {
        const option = document.createElement('option');
        option.value = engine.url;
        option.textContent = engine.name;
        dropdown.appendChild(option);
      });

      // Restore previous selection
      if (lastUsed) dropdown.value = lastUsed;
    });
  }

  // Load suggestion (if any)
  chrome.storage.local.get('lastSuggestedEngine', (data) => {
    if (data.lastSuggestedEngine) {
      const engine = data.lastSuggestedEngine;
      const container = document.getElementById('suggestions');
      container.innerHTML = `
        <p>Detected engine: <strong>${engine.name}</strong></p>
        <button id="saveEngineBtn">Add to Find8</button>
      `;

      document.getElementById('saveEngineBtn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'addEngine', engine }, (response) => {
          if (response && response.success) {
            alert(`Added ${engine.name} to Find8`);
            chrome.storage.local.remove('lastSuggestedEngine');
            loadEngines();
          } else {
            alert(`${engine.name} is already added.`);
          }
        });
      });
    }
  });
});