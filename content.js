// content.js
// console.log('Content script loaded');

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

      chrome.runtime.sendMessage({
        action: 'suggestSearchEngine',
        engine: engineInfo
      });

      break;
    }
  }
})();