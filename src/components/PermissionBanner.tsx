import { useEffect, useState } from 'react'
import { AI_ORIGINS } from '../lib/sites'

const canCheck = typeof chrome !== 'undefined' && !!chrome.permissions

export default function PermissionBanner() {
  const [granted, setGranted] = useState(true) // hidden until we know

  useEffect(() => {
    if (!canCheck) return
    chrome.permissions.contains({ origins: AI_ORIGINS }).then(setGranted)
  }, [])

  if (granted) return null

  const handleClick = async () => {
    const ok = await chrome.permissions.request({ origins: AI_ORIGINS })
    setGranted(ok)
  }

  return (
    <div className="mb-3 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
      <p className="mb-2">
        Allow MyPrompts to run on AI sites so it can tell you when it's
        available. After allowing, refresh any open AI tabs.
      </p>
      <button
        onClick={handleClick}
        className="px-2 py-1 rounded bg-amber-600 text-white cursor-pointer"
      >
        Allow access
      </button>
    </div>
  )
}