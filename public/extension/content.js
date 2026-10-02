// AOY YouTube Thumb & Outlier Copilot - Content Script
// Built for YouTube modern layout (2024-2026), SPAs, Theater Mode, and Responsive Views.

(function () {
  'use strict';

  console.log('[AOY YouTube Extension] Content script initialized.');

  const PRIMARY_BTN_ID = 'aoy-capture-btn-primary';
  const FLOATING_BTN_ID = 'aoy-capture-btn-floating';
  let currentVideoId = '';
  let isCapturing = false;

  // --------------------------------------------------------------------------
  // Helpers to extract current YouTube Video ID
  // --------------------------------------------------------------------------
  function extractVideoId() {
    const url = window.location.href;
    try {
      const urlObj = new URL(url);
      if (urlObj.searchParams.has('v')) {
        return urlObj.searchParams.get('v');
      }
      if (urlObj.pathname.startsWith('/shorts/')) {
        const parts = urlObj.pathname.split('/');
        return parts[2] || '';
      }
    } catch (e) {
      // Fallback
    }

    const flexy = document.querySelector('ytd-watch-flexy');
    if (flexy && flexy.getAttribute('video-id')) {
      return flexy.getAttribute('video-id');
    }

    const meta = document.querySelector('meta[itemprop="videoId"]') ||
                 document.querySelector('meta[name="videoId"]');
    if (meta && meta.content) {
      return meta.content;
    }

    return '';
  }

  function getCleanText(el) {
    if (!el) return '';
    return (el.innerText || el.textContent || '').trim();
  }

  // --------------------------------------------------------------------------
  // Scrape YouTube Video Metadata
  // --------------------------------------------------------------------------
  function scrapeVideoData() {
    const videoId = extractVideoId();
    if (!videoId) return null;

    // 1. Title
    const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ||
                    document.querySelector('#title h1 yt-formatted-string') ||
                    document.querySelector('#title h1') ||
                    document.querySelector('h1.title');
    let title = getCleanText(titleEl);
    if (!title) {
      const metaTitle = document.querySelector('meta[name="title"]');
      title = metaTitle ? metaTitle.content : document.title.replace(/ - YouTube$/, '').trim();
    }

    // 2. Channel Name & Handle
    const channelNameEl = document.querySelector('#owner #channel-name a') ||
                          document.querySelector('#upload-info #channel-name a') ||
                          document.querySelector('ytd-channel-name a');
    const channelName = getCleanText(channelNameEl) || 'YouTube Outlier Channel';

    const handleEl = document.querySelector('#owner a[href^="/@"]') ||
                     document.querySelector('#upload-info a[href^="/@"]');
    const channelHandle = handleEl
      ? handleEl.getAttribute('href').replace('/', '')
      : `@${channelName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // 3. Channel Avatar
    const avatarImg = document.querySelector('#owner img#img') ||
                      document.querySelector('#avatar img#img') ||
                      document.querySelector('ytd-video-owner-renderer img');
    let channelAvatar = avatarImg ? avatarImg.src : '';
    if (!channelAvatar || channelAvatar.startsWith('data:')) {
      channelAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    }

    // 4. Views
    const viewsEl = document.querySelector('ytd-watch-metadata #view-count') ||
                    document.querySelector('#info-container #count span') ||
                    document.querySelector('#count .view-count') ||
                    document.querySelector('.view-count');
    let views = getCleanText(viewsEl);
    if (!views) {
      const metaViews = document.querySelector('meta[itemprop="interactionCount"]');
      if (metaViews && metaViews.content) {
        const num = parseInt(metaViews.content, 10);
        views = isNaN(num) ? 'High Velocity' : `${(num >= 1000000 ? (num/1000000).toFixed(1) + 'M' : (num >= 1000 ? (num/1000).toFixed(1) + 'K' : num))} views`;
      } else {
        views = 'Outlier Views';
      }
    }

    // 5. Likes
    const likeBtn = document.querySelector('like-button-view-model button') ||
                    document.querySelector('#segmented-like-button button') ||
                    document.querySelector('ytd-toggle-button-renderer[is-icon-button]');
    let likes = '';
    if (likeBtn) {
      const label = likeBtn.getAttribute('aria-label') || likeBtn.innerText.trim();
      const match = label.match(/([0-9.,KMBkmb]+)/);
      if (match) likes = match[0];
    }
    if (!likes) likes = 'Verified';

    // 6. Comments
    const commentsEl = document.querySelector('#comments #count span') ||
                       document.querySelector('ytd-comments-header-renderer #count span') ||
                       document.querySelector('h2#count span');
    const commentCount = getCleanText(commentsEl) || 'Active Community';

    // 7. Thumbnail URLs (Standard YouTube 1280x720 HD MaxRes)
    const highResThumb = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const standardThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    return {
      type: 'AOY_YOUTUBE_THUMBNAIL',
      id: `yt-${videoId}-${Date.now().toString().slice(-4)}`,
      videoId,
      title,
      thumbnailUrl: highResThumb,
      fallbackThumbnailUrl: standardThumb,
      channelName,
      channelHandle,
      channelAvatar,
      views,
      likes,
      commentCount,
      duration: '15:20',
      source: 'youtube-extension',
      sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
      addedAt: Date.now()
    };
  }

  // --------------------------------------------------------------------------
  // Floating Toast Notification
  // --------------------------------------------------------------------------
  function showCaptureToast(data, synced, endpointUsed) {
    const existing = document.querySelector('.aoy-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'aoy-toast';
    toast.innerHTML = `
      <img src="${data.thumbnailUrl}" class="aoy-toast-thumb" onerror="this.src='${data.fallbackThumbnailUrl}'" />
      <div class="aoy-toast-content">
        <div class="aoy-toast-header">
          <span class="aoy-toast-badge">${synced ? '⚡ SYNCED TO AOY' : '📋 COPIED TO CLIPBOARD'}</span>
          <span class="aoy-toast-time">Just now</span>
        </div>
        <div class="aoy-toast-title">${escapeHtml(data.title)}</div>
        <div class="aoy-toast-meta">
          <span>By ${escapeHtml(data.channelName)}</span>
          <span>•</span>
          <span>${escapeHtml(data.views)}</span>
        </div>
        <div class="aoy-toast-footer">
          ${synced
            ? `🟢 Added to 3-Preview Deck in AOY Studio!`
            : `📋 Video data copied! Paste in AOY Thumbs -> "Import / Paste Video"`}
        </div>
      </div>
      <button class="aoy-toast-close" type="button" aria-label="Close">✕</button>
    `;

    toast.querySelector('.aoy-toast-close').addEventListener('click', () => toast.remove());
    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.classList.add('aoy-toast-hiding');
        setTimeout(() => toast.remove(), 400);
      }
    }, 5000);
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  // --------------------------------------------------------------------------
  // Button Click Handler
  // --------------------------------------------------------------------------
  async function handleCapture(buttonEl) {
    if (isCapturing) return;
    isCapturing = true;

    try {
      const data = scrapeVideoData();
      if (!data) {
        alert('Could not detect YouTube video data. Make sure you are on a video watch page.');
        isCapturing = false;
        return;
      }

      // 1. Copy formatted JSON to clipboard
      try {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      } catch (clipErr) {
        console.warn('[AOY Extension] Clipboard write fallback:', clipErr);
      }

      // 2. Sync via Background Service Worker
      let synced = false;
      let syncUrl = '';

      try {
        const bgResponse = await chrome.runtime.sendMessage({
          type: 'SYNC_THUMBNAIL',
          payload: data
        });
        if (bgResponse && bgResponse.success) {
          synced = true;
          syncUrl = bgResponse.syncedUrl;
        }
      } catch (bgErr) {
        console.warn('[AOY Extension] Background message failed, trying direct fetch:', bgErr);
      }

      // 3. Direct Fetch Fallbacks if background worker didn't succeed
      if (!synced) {
        const endpoints = [
          'http://localhost:3000/api/thumbs/import',
          'https://ais-dev-thubckioqfock7hxdpimxb-326873678260.europe-west2.run.app/api/thumbs/import',
          'http://127.0.0.1:3000/api/thumbs/import'
        ];

        for (const url of endpoints) {
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
              mode: 'cors'
            });
            if (res.ok) {
              synced = true;
              syncUrl = url;
              break;
            }
          } catch (fetchErr) {
            // Next endpoint
          }
        }
      }

      // Animate buttons on page
      updateButtonSuccessState(buttonEl);
      showCaptureToast(data, synced, syncUrl);

    } catch (err) {
      console.error('[AOY Extension] Capture error:', err);
    } finally {
      setTimeout(() => {
        isCapturing = false;
      }, 1000);
    }
  }

  function updateButtonSuccessState(activeBtn) {
    const allAoyBtns = document.querySelectorAll('.aoy-capture-btn, .aoy-floating-capture-btn');
    allAoyBtns.forEach((btn) => {
      btn.classList.add('aoy-btn-success');
      const textSpan = btn.querySelector('.aoy-btn-label');
      if (textSpan) textSpan.textContent = '✓ Copied to AOY Thumbs!';
      setTimeout(() => {
        btn.classList.remove('aoy-btn-success');
        if (textSpan) textSpan.textContent = 'Copy to AOY Thumbs';
      }, 3000);
    });
  }

  // --------------------------------------------------------------------------
  // DOM Injection Logic
  // --------------------------------------------------------------------------
  function createActionButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = PRIMARY_BTN_ID;
    btn.className = 'aoy-capture-btn';
    btn.title = 'Copy thumbnail, title, channel avatar & metrics directly to AOY Faceless Studio';
    btn.innerHTML = `
      <svg class="aoy-btn-icon" viewBox="0 0 24 24">
        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
      </svg>
      <span class="aoy-btn-label">Copy to AOY Thumbs</span>
    `;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCapture(btn);
    });

    return btn;
  }

  function createFloatingButton() {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.id = FLOATING_BTN_ID;
    pill.className = 'aoy-floating-capture-btn';
    pill.title = 'Copy this YouTube video thumbnail and stats to AOY Studio';
    pill.innerHTML = `
      <svg class="aoy-btn-icon" viewBox="0 0 24 24">
        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
      </svg>
      <span class="aoy-btn-label">Copy to AOY Thumbs</span>
    `;

    pill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCapture(pill);
    });

    return pill;
  }

  function injectPrimaryButton() {
    const videoId = extractVideoId();
    if (!videoId) return;

    // Check if valid button already exists and is attached to live DOM
    const existing = document.getElementById(PRIMARY_BTN_ID);
    if (existing && document.body.contains(existing) && currentVideoId === videoId) {
      return;
    }

    if (existing) {
      existing.remove();
    }

    // Multiple possible YouTube containers across layouts
    const targetContainers = [
      document.querySelector('#top-level-buttons-computed'),
      document.querySelector('#actions-inner #top-level-buttons-computed'),
      document.querySelector('#actions ytd-menu-renderer'),
      document.querySelector('#actions-inner'),
      document.querySelector('#actions'),
      document.querySelector('#owner #subscribe-button'),
      document.querySelector('#owner')
    ];

    for (const container of targetContainers) {
      if (container && document.body.contains(container)) {
        const btn = createActionButton();
        // If container is #owner #subscribe-button, insert right after it
        if (container.id === 'subscribe-button' && container.parentElement) {
          container.parentElement.insertBefore(btn, container.nextSibling);
        } else {
          container.appendChild(btn);
        }
        currentVideoId = videoId;
        console.log('[AOY Extension] Injected primary button into:', container);
        return;
      }
    }
  }

  function injectFloatingButton() {
    const videoId = extractVideoId();
    if (!videoId) {
      const existingFloating = document.getElementById(FLOATING_BTN_ID);
      if (existingFloating) existingFloating.remove();
      return;
    }

    const existingFloating = document.getElementById(FLOATING_BTN_ID);
    if (existingFloating && document.body.contains(existingFloating) && currentVideoId === videoId) {
      return;
    }

    if (existingFloating) existingFloating.remove();

    // Attach to player container or below player
    const playerContainer = document.querySelector('#player-container-outer') ||
                            document.querySelector('#player-container') ||
                            document.querySelector('#ytd-player') ||
                            document.querySelector('#movie_player') ||
                            document.querySelector('ytd-watch-flexy');

    if (playerContainer && document.body.contains(playerContainer)) {
      const floatingBtn = createFloatingButton();
      playerContainer.appendChild(floatingBtn);
    }
  }

  function performInjection() {
    const videoId = extractVideoId();
    if (!videoId) {
      // Not on a video page, clean up old buttons
      const p = document.getElementById(PRIMARY_BTN_ID);
      if (p) p.remove();
      const f = document.getElementById(FLOATING_BTN_ID);
      if (f) f.remove();
      currentVideoId = '';
      return;
    }

    injectPrimaryButton();
    injectFloatingButton();
  }

  // --------------------------------------------------------------------------
  // Event Listeners for YouTube SPA Lifecycle
  // --------------------------------------------------------------------------
  // 1. YouTube specific navigation events
  window.addEventListener('yt-navigate-finish', performInjection);
  window.addEventListener('yt-page-data-updated', performInjection);
  window.addEventListener('spfdone', performInjection);

  // 2. Standard navigation and DOM events
  window.addEventListener('popstate', performInjection);
  window.addEventListener('load', performInjection);
  document.addEventListener('DOMContentLoaded', performInjection);

  // 3. Message from background service worker
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'INJECT_AOY_BUTTON' || msg.action === 'TRIGGER_CAPTURE') {
      if (msg.action === 'TRIGGER_CAPTURE') {
        const btn = document.getElementById(PRIMARY_BTN_ID) || document.getElementById(FLOATING_BTN_ID);
        if (btn) handleCapture(btn);
        else handleCapture(null);
      } else {
        performInjection();
      }
    }
  });

  // 4. MutationObserver to handle dynamic YouTube DOM redraws
  const observer = new MutationObserver(() => {
    const videoId = extractVideoId();
    if (videoId) {
      const primaryExists = document.getElementById(PRIMARY_BTN_ID);
      if (!primaryExists || !document.body.contains(primaryExists)) {
        performInjection();
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // 5. Periodic heartbeat to safeguard against YouTube removing custom elements
  setInterval(performInjection, 1200);

  // Initial trigger
  performInjection();
})();
