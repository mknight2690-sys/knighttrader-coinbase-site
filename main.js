(() => {
  const cfg = window.KT_CONFIG || {};
  const owner = cfg.githubOwner || 'mknight2690-sys';
  const repo = cfg.githubRepo || 'knighttrader-coinbase';
  const releaseApiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  let windowsUrl = `https://github.com/${owner}/${repo}/releases/latest`;
  let macUrl = windowsUrl;
  let latestTag = 'latest';

  const params = new URLSearchParams(window.location.search);
  const banner = document.getElementById('purchase-success-banner');
  if (banner && (params.get('purchase') === 'success' || params.get('utm_source') === 'stripe')) {
    banner.hidden = false;
  }

  const platformButtons = document.querySelectorAll('.platform-btn');
  const btnWindowsList = document.querySelectorAll('.btn-download-windows');
  const btnMacList = document.querySelectorAll('.btn-download-mac');
  const downloadNote = document.getElementById('download-note');
  const downloadLatest = document.getElementById('download-latest');

  function triggerDownload(url) {
    const a = document.createElement('a');
    a.href = url;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function selectPlatform(key) {
    const isMac = key === 'mac';
    platformButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.platform === key);
      btn.setAttribute('aria-checked', btn.dataset.platform === key ? 'true' : 'false');
    });
    btnWindowsList.forEach((btn) => btn.classList.toggle('hidden', isMac));
    btnMacList.forEach((btn) => btn.classList.toggle('hidden', !isMac));
    if (downloadNote) {
      downloadNote.textContent = isMac
        ? 'Mac: open the .dmg and drag KnightTrader Coinbase into Applications.'
        : 'Windows: run the Setup exe. The installer is the whole stack.';
    }
    if (downloadLatest) downloadLatest.textContent = latestTag;
  }

  btnWindowsList.forEach((btn) => { btn.onclick = () => triggerDownload(windowsUrl); });
  btnMacList.forEach((btn) => { btn.onclick = () => triggerDownload(macUrl); });
  platformButtons.forEach((btn) => {
    btn.addEventListener('click', () => selectPlatform(btn.dataset.platform));
  });

  async function updateDownloadLinks() {
    try {
      const response = await fetch(releaseApiUrl);
      if (!response.ok) throw new Error(String(response.status));
      const release = await response.json();
      const assets = release.assets || [];
      latestTag = release.tag_name || latestTag;
      const winAsset = assets.find((a) => a.name.includes('Setup') && a.name.endsWith('.exe'));
      const macAsset = assets.find((a) => a.name.endsWith('.dmg') && !a.name.includes('blockmap'));
      if (winAsset?.browser_download_url) windowsUrl = winAsset.browser_download_url;
      if (macAsset?.browser_download_url) macUrl = macAsset.browser_download_url;
    } catch (_) {}
    selectPlatform('windows');
  }

  updateDownloadLinks();
})();
