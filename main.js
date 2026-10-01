(() => {
  const cfg = window.KT_CONFIG || {};
  const owner = cfg.githubOwner || 'mknight2690-sys';
  const repo = cfg.githubRepo || 'knighttrader-coinbase';
  const releaseApiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  let windowsUrl = `https://github.com/${owner}/${repo}/releases/latest`;
  let macUrl = windowsUrl;
  let linuxUrl = windowsUrl;
  let linuxTarUrl = windowsUrl;
  let linuxHelperUrl = windowsUrl;
  let latestTag = 'latest';

  const params = new URLSearchParams(window.location.search);
  const banner = document.getElementById('purchase-success-banner');
  if (banner && (params.get('purchase') === 'success' || params.get('utm_source') === 'stripe')) {
    banner.hidden = false;
  }

  const platformButtons = document.querySelectorAll('.platform-btn');
  const btnWindowsList = document.querySelectorAll('.btn-download-windows');
  const btnMacList = document.querySelectorAll('.btn-download-mac');
  const btnLinuxList = document.querySelectorAll('.btn-download-linux');
  const downloadNote = document.getElementById('download-note');
  const downloadLatest = document.getElementById('download-latest');
  const linuxAltLinks = document.getElementById('linux-alt-links');

  function triggerDownload(url) {
    const a = document.createElement('a');
    a.href = url;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function selectPlatform(key) {
    platformButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.platform === key);
      btn.setAttribute('aria-checked', btn.dataset.platform === key ? 'true' : 'false');
    });
    btnWindowsList.forEach((btn) => btn.classList.toggle('hidden', key !== 'windows'));
    btnMacList.forEach((btn) => btn.classList.toggle('hidden', key !== 'mac'));
    btnLinuxList.forEach((btn) => btn.classList.toggle('hidden', key !== 'linux'));
    if (downloadNote) {
      if (key === 'mac') {
        downloadNote.textContent = 'Mac: open the .dmg and drag KnightTrader Propr into Applications.';
      } else if (key === 'linux') {
        downloadNote.textContent = 'Linux: use the AppImage with run-knighttrader-propr.sh if FUSE/libfuse2 is missing, or download the tar.gz and run ./knighttrader-propr.';
      } else {
        downloadNote.textContent = 'Windows: run the Setup exe. The installer is the whole stack.';
      }
    }
    if (linuxAltLinks) {
      linuxAltLinks.hidden = key !== 'linux';
    }
    if (downloadLatest) downloadLatest.textContent = latestTag;
  }

  btnWindowsList.forEach((btn) => { btn.onclick = () => triggerDownload(windowsUrl); });
  btnMacList.forEach((btn) => { btn.onclick = () => triggerDownload(macUrl); });
  btnLinuxList.forEach((btn) => { btn.onclick = () => triggerDownload(linuxUrl); });

  document.querySelectorAll('[data-linux-tar]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      triggerDownload(linuxTarUrl);
    });
  });
  document.querySelectorAll('[data-linux-helper]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      triggerDownload(linuxHelperUrl);
    });
  });

  platformButtons.forEach((btn) => {
    btn.addEventListener('click', () => selectPlatform(btn.dataset.platform));
  });

  function detectPlatform() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    if (/Win/i.test(platform) || /Windows/i.test(ua)) return 'windows';
    if (/Mac/i.test(platform) || /Macintosh/i.test(ua)) return 'mac';
    if (/Linux/i.test(platform) || /Linux/i.test(ua)) return 'linux';
    return 'windows';
  }

  async function updateDownloadLinks() {
    try {
      const response = await fetch(releaseApiUrl);
      if (!response.ok) throw new Error(String(response.status));
      const release = await response.json();
      const assets = release.assets || [];
      latestTag = release.tag_name || latestTag;
      const winAsset = assets.find((a) => a.name.includes('Setup') && a.name.endsWith('.exe'));
      const macAsset = assets.find((a) => a.name.endsWith('.dmg') && !a.name.includes('blockmap'));
      const linuxAsset = assets.find((a) => a.name.endsWith('.AppImage') && !a.name.includes('blockmap'));
      const tarAsset = assets.find((a) => a.name.endsWith('.tar.gz') && /linux|x64|x86_64/i.test(a.name));
      const helperAsset = assets.find((a) => a.name === 'run-knighttrader-propr.sh' || a.name === 'run-linux.sh');
      if (winAsset?.browser_download_url) windowsUrl = winAsset.browser_download_url;
      if (macAsset?.browser_download_url) macUrl = macAsset.browser_download_url;
      if (linuxAsset?.browser_download_url) linuxUrl = linuxAsset.browser_download_url;
      if (tarAsset?.browser_download_url) linuxTarUrl = tarAsset.browser_download_url;
      if (helperAsset?.browser_download_url) linuxHelperUrl = helperAsset.browser_download_url;
    } catch (_) {}
    selectPlatform(detectPlatform());
  }

  updateDownloadLinks();
})();
