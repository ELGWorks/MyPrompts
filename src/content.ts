import { detectSite } from './lib/sites'

const site = detectSite(window.location.hostname)

function showBanner(siteName: string) {
  const banner = document.createElement('div')
  banner.textContent = `MyPrompts is available on ${siteName}. Click the MyPrompts icon in your toolbar to copy a saved prompt.`

  Object.assign(banner.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '2147483647',
    maxWidth: '300px',
    padding: '12px 16px',
    background: '#4f46e5',
    color: '#ffffff',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '14px',
    lineHeight: '1.4',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
  })

  // Click the banner to dismiss it
  banner.addEventListener('click', () => banner.remove())

  document.body.appendChild(banner)

  // Remove it automatically after 8 seconds
  setTimeout(() => banner.remove(), 8000)
}

const FLAG = 'myprompts-notified'

if (site) {
  console.log(`[MyPrompts] Detected ${site.name}`)

  // sessionStorage is separate for each tab, so this shows once per tab
  if (!sessionStorage.getItem(FLAG)) {
    sessionStorage.setItem(FLAG, '1')
    showBanner(site.name)

    // Tell the service worker so it can raise a notification too.
    // Safe to skip outside the installed extension (e.g. vite dev).
    try {
      chrome.runtime?.sendMessage({
        type: 'AI_SITE_DETECTED',
        site: site.name,
      })
    } catch {
      // no extension context available
    }
  }
}