const ALLOWED_HTML_TAGS = new Set([
  'P',
  'BR',
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'UL',
  'OL',
  'LI',
  'A',
  'BLOCKQUOTE',
  'H2',
  'H3',
  'H4',
  'TABLE',
  'THEAD',
  'TBODY',
  'TR',
  'TH',
  'TD',
])

export const sanitizeHtml = (html = '') => {
  if (!html) return ''

  const document = new DOMParser().parseFromString(html, 'text/html')
  const elements = Array.from(document.body.querySelectorAll('*'))

  elements.forEach((element) => {
    if (!ALLOWED_HTML_TAGS.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes))
      return
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value || ''
      const isSafeLink =
        element.tagName === 'A' &&
        name === 'href' &&
        /^(https?:|mailto:|#)/i.test(value)

      if (!isSafeLink) {
        element.removeAttribute(attribute.name)
      }
    })

    if (element.tagName === 'A') {
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noreferrer')
    }
  })

  return document.body.innerHTML
}
