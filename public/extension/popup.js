// AOY YouTube Thumb & Outlier Copilot - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const videoCard = document.getElementById('videoCard');
  const noVideoBox = document.getElementById('noVideoBox');
  const cardThumb = document.getElementById('cardThumb');
  const cardTitle = document.getElementById('cardTitle');
  const cardAvatar = document.getElementById('cardAvatar');
  const cardChannel = document.getElementById('cardChannel');
  const cardViews = document.getElementById('cardViews');
  const captureActiveBtn = document.getElementById('captureActiveBtn');
  const openStudioLink = document.getElementById('openStudioLink');
  const serverSelect = document.getElementById('serverSelect');
  const connectionBadge = document.getElementById('connectionBadge');
  const testConnBtn = document.getElementById('testConnBtn');

  // Load saved server configuration
  const stored = await chrome.storage.local.get(['targetServerUrl']);
  if (stored.targetServerUrl && serverSelect) {
    serverSelect.value = stored.targetServerUrl;
    openStudioLink.href = stored.targetServerUrl;
  }

  serverSelect.addEventListener('change', async () => {
    const chosen = serverSelect.value;
    await chrome.storage.local.set({ targetServerUrl: chosen });
    openStudioLink.href = chosen;
    checkConnection(chosen);
  });

  testConnBtn.addEventListener('click', (e) => {
    e.preventDefault();
    checkConnection(serverSelect.value);
  });

  // Check connection to AOY Studio
  async function checkConnection(url) {
    connectionBadge.innerHTML = '<span class="status-dot"></span><span>Checking...</span>';
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CHECK_CONNECTION',
        serverUrl: url
      });
      if (response && response.success) {
        connectionBadge.innerHTML = `<span class="status-dot"></span><span style="color:#10b981;">Online (${response.savedThumbnailsCount} Thumbs)</span>`;
      } else {
        connectionBadge.innerHTML = `<span class="status-dot offline"></span><span style="color:#ef4444;">Offline</span>`;
      }
    } catch (e) {
      connectionBadge.innerHTML = `<span class="status-dot offline"></span><span style="color:#ef4444;">Offline</span>`;
    }
  }

  // Initial connection test
  checkConnection(serverSelect.value);

  // Check active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isYouTubeVideo = tab && tab.url && (tab.url.includes('youtube.com/watch') || tab.url.includes('youtube.com/shorts'));

  if (!isYouTubeVideo) {
    videoCard.style.display = 'none';
    noVideoBox.style.display = 'block';
    captureActiveBtn.disabled = true;
    captureActiveBtn.innerHTML = '<span>Open a YouTube Video to Capture</span>';
    return;
  }

  // Extract video ID from active tab URL
  let videoId = '';
  try {
    const urlObj = new URL(tab.url);
    if (urlObj.searchParams.has('v')) videoId = urlObj.searchParams.get('v');
    else if (urlObj.pathname.startsWith('/shorts/')) videoId = urlObj.pathname.split('/')[2];
  } catch (e) {}

  if (videoId) {
    videoCard.style.display = 'block';
    noVideoBox.style.display = 'none';
    cardThumb.src = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    cardThumb.onerror = () => {
      cardThumb.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    };
    cardTitle.textContent = tab.title ? tab.title.replace(/ - YouTube$/, '') : 'YouTube Video Outlier';
  }

  // Query tab for detailed live DOM metadata
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ||
                        document.querySelector('#title h1 yt-formatted-string') ||
                        document.querySelector('#title h1');
        const channelNameEl = document.querySelector('#owner #channel-name a') ||
                              document.querySelector('#upload-info #channel-name a');
        const avatarEl = document.querySelector('#owner img#img') ||
                         document.querySelector('#avatar img#img');
        const viewsEl = document.querySelector('ytd-watch-metadata #view-count') ||
                        document.querySelector('#info-container #count span');

        return {
          title: titleEl ? titleEl.innerText.trim() : '',
          channelName: channelNameEl ? channelNameEl.innerText.trim() : '',
          channelAvatar: avatarEl ? avatarEl.src : '',
          views: viewsEl ? viewsEl.innerText.trim() : ''
        };
      }
    });

    if (results && results[0] && results[0].result) {
      const info = results[0].result;
      if (info.title) cardTitle.textContent = info.title;
      if (info.channelName) cardChannel.textContent = info.channelName;
      if (info.channelAvatar) cardAvatar.src = info.channelAvatar;
      if (info.views) cardViews.textContent = info.views;
    }
  } catch (err) {
    console.warn('[AOY Popup] Failed to query tab DOM:', err);
  }

  // Capture Button Click
  captureActiveBtn.addEventListener('click', async () => {
    captureActiveBtn.disabled = true;
    captureActiveBtn.innerHTML = '<span>⚡ Capturing Video & Stats...</span>';

    try {
      // 1. Tell content script on the tab to capture
      await chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_CAPTURE' });
      
      captureActiveBtn.style.background = '#10b981';
      captureActiveBtn.style.color = '#fff';
      captureActiveBtn.innerHTML = '<span>✓ Copied & Synced to AOY!</span>';

      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (sendErr) {
      // Fallback: execute capture script directly
      try {
        const fallbackResults = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const btn = document.querySelector('.aoy-capture-btn, .aoy-floating-capture-btn');
            if (btn) {
              btn.click();
              return true;
            }
            return false;
          }
        });

        if (fallbackResults && fallbackResults[0] && fallbackResults[0].result) {
          captureActiveBtn.style.background = '#10b981';
          captureActiveBtn.innerHTML = '<span>✓ Copied to AOY Thumbs!</span>';
          setTimeout(() => window.close(), 1500);
          return;
        }
      } catch (e2) {}

      captureActiveBtn.innerHTML = '<span>Copied to Clipboard!</span>';
      setTimeout(() => {
        captureActiveBtn.disabled = false;
        captureActiveBtn.style.background = '';
        captureActiveBtn.style.color = '';
        captureActiveBtn.innerHTML = '<span>⚡ Copy & Send to AOY Thumbs</span>';
      }, 2500);
    }
  });
});
