// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const searchBtn = document.getElementById('searchBtn');
  const searchEngine = document.getElementById('searchEngine');
  const searchQuery = document.getElementById('searchQuery');

  // Update the extension name when the page loads
  updateExtensionName();

  searchBtn.addEventListener('click', function() {
    console.log('Search button clicked!');
    const selectedEngine = searchEngine.value;
    const query = searchQuery.value.trim();
    if (!query) {
      alert('Please enter a search query.');
      return;
    }

    if (query) {
      const engineUrls = {
        "brave": "https://search.brave.com/search?q=",
        "startpage": "https://www.startpage.com/do/search?query=",
        "google": "https://www.google.com/search?q=",
        "duckduckgo": "https://duckduckgo.com/?q=",
        "bing": "https://www.bing.com/search?q=",
        // Add more engines as needed
      };

      const url = engineUrls[selectedEngine] + encodeURIComponent(query);
      window.open(url, '_blank');
    }
  });

  searchEngine.addEventListener('change', updateExtensionName);

  function updateExtensionName() {
    const selectedEngine = searchEngine.value;
    let extensionName = 'MetaverseSearch';
    if (selectedEngine !== ' ') {
      extensionName += ` (${selectedEngine.charAt(0).toUpperCase() + selectedEngine.slice(1)})`;
    }

    document.getElementById('extensionName').textContent = extensionName;
    document.getElementById('extensionNameHeader').textContent = extensionName;
  }
});