// content.js

// console.log('Content script loaded');

// Exmpl: Changing background color 
document.body.style.backgroundColor = "lightblue";

(function () {
  const forms = document.querySelectorAll('form[method="get"], form:not([method])');

  for (const form of forms) {
    const inputs = form.querySelectorAll('input[name]');
    let queryInput = null;

    for (const input of inputs) {
      const type = input.getAttribute('type') || 'text';
      if (type === 'text' || type === 'search') {
        queryInput = input;
        break;
      }
    }

    if (queryInput) {
      const action = form.getAttribute('action') || window.location.href;
      const queryName = queryInput.getAttribute('name');
      const baseUrl = new URL(action, window.location.origin).href;

      const engineInfo = {
        name: window.location.hostname,
        url: `${baseUrl}?${queryName}=`
      };

      chrome.storage.local.get({ engines: [] }, (data) => {
        const exists = data.engines.some(e => e.url === engineInfo.url);
        if (!exists) {
          chrome.storage.local.set({ lastSuggestedEngine: engineInfo }, () => {
            chrome.runtime.sendMessage({ action: 'suggestSearchEngine', engine: engineInfo });
          });
        }
      });

      break;
    }
  }
})();