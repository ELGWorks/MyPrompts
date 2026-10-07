interface DetectedMessage {
  type: 'AI_SITE_DETECTED'
  site: string
}

chrome.runtime.onMessage.addListener((message: DetectedMessage) => {
  if (message?.type !== 'AI_SITE_DETECTED') return

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon-128.png',
    title: 'MyPrompts is available',
    message: `You're on ${message.site}. Click the MyPrompts icon to copy a saved prompt.`,
  })
})