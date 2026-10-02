// AOY YouTube Thumb & Outlier Copilot - Background Service Worker

const DEFAULT_SERVER_URLS = [
  'http://localhost:3000',
  'https://ais-dev-thubckioqfock7hxdpimxb-326873678260.europe-west2.run.app',
  'http://127.0.0.1:3000'
];

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[AOY Background] Extension installed.');
  const stored = await chrome.storage.local.get(['targetServerUrl']);
  if (!stored.targetServerUrl) {
    await chrome.storage.local.set({ targetServerUrl: 'http://localhost:3000' });
  }
});

// Watch for tab URL changes and notify content script to ensure button presence
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && (tab.url.includes('youtube.com/watch') || tab.url.includes('youtube.com/shorts'))) {
    if (changeInfo.status === 'complete' || changeInfo.url) {
      chrome.tabs.sendMessage(tabId, { action: 'INJECT_AOY_BUTTON' }).catch(() => {
        // Tab may not have content script ready yet
      });
    }
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_THUMBNAIL') {
    handleSyncThumbnail(message.payload)
      .then(res => sendResponse(res))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // async response
  }

  if (message.type === 'CHECK_CONNECTION') {
    handleCheckConnection(message.serverUrl)
      .then(res => sendResponse(res))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function getCandidateEndpoints() {
  const stored = await chrome.storage.local.get(['targetServerUrl', 'customServerUrl']);
  const list = [];
  if (stored.customServerUrl && stored.customServerUrl.trim()) {
    list.push(stored.customServerUrl.trim());
  }
  if (stored.targetServerUrl && stored.targetServerUrl.trim()) {
    list.push(stored.targetServerUrl.trim());
  }
  for (const url of DEFAULT_SERVER_URLS) {
    if (!list.includes(url)) list.push(url);
  }
  return list.map(base => base.replace(/\/+$/, '') + '/api/thumbs/import');
}

async function handleSyncThumbnail(data) {
  const endpoints = await getCandidateEndpoints();
  let synced = false;
  let successfulUrl = '';
  let lastError = null;

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const json = await response.json();
        synced = true;
        successfulUrl = url;
        break;
      }
    } catch (e) {
      lastError = e;
    }
  }

  // Update extension badge
  try {
    if (synced) {
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    } else {
      chrome.action.setBadgeText({ text: '📋' });
      chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
    }
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 4000);
  } catch (badgeErr) {
    // Ignore badge errors
  }

  return {
    success: synced,
    syncedUrl: successfulUrl,
    error: synced ? null : (lastError ? lastError.message : 'Could not reach AOY server')
  };
}

async function handleCheckConnection(serverUrl) {
  const base = (serverUrl || 'http://localhost:3000').replace(/\/+$/, '');
  try {
    const res = await fetch(`${base}/api/workspace`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        savedThumbnailsCount: data.savedThumbnails ? data.savedThumbnails.length : 0,
        url: base
      };
    }
  } catch (e) {
    return { success: false, error: e.message, url: base };
  }
  return { success: false, error: 'Non-200 response', url: base };
}
