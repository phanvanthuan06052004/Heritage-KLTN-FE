export const toApiStatus = (status) => (status === 'INACTIVE' ? 'draft' : 'published')

export const toFormStatus = (status) => {
    const normalized = status?.toString().toLowerCase()
    return normalized === 'draft' || normalized === 'archived' ? 'INACTIVE' : 'ACTIVE'
}

export const getResponseData = (response) => response?.data || response

export const emptyHeritageForm = {
    name: '',
    type: 'cultural',
    description: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    alternativeNamesText: '',
    history: '',
    architecture: '',
    culturalSignificance: '',
    constructionPeriod: '',
    founder: '',
    recognitionText: '',
    festivalsText: '',
    legends: '',
    sourceUrl: '',
    location: '',
    images: [],
    coordinates: { latitude: '', longitude: '' },
    status: 'ACTIVE',
    additionalInfo: { historicalEvents: [] },
}

export const htmlToText = (value = '') =>
    value
        .toString()
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

export const normalizeHtml = (value = '') => {
    const trimmed = value.trim()
    if (!trimmed) return ''
    return /<[^>]+>/.test(trimmed) ? trimmed : `<p>${trimmed.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>')}</p>`
}

export const formatJsonField = (value) => {
    if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) return ''
    try {
        return JSON.stringify(value, null, 2)
    } catch (_error) {
        return ''
    }
}

export const parseJsonField = (value, fieldLabel) => {
    if (!value?.trim()) return undefined
    try {
        return JSON.parse(value)
    } catch (_error) {
        throw new Error(`${fieldLabel} must be valid JSON`)
    }
}

export const parseAlternativeNames = (value = '') =>
    value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

export const buildHeritagePayload = (formData) => {
    const status = toApiStatus(formData.status)
    const content = normalizeHtml(formData.content || formData.description)
    const summary = normalizeHtml(formData.description)

    return {
        title: formData.name.trim(),
        summary,
        content,
        type: formData.type || 'cultural',
        status,
        publishedAt: status === 'published' ? new Date().toISOString() : undefined,
        seoTitle: (formData.seoTitle || formData.name).trim(),
        seoDescription: (formData.seoDescription || htmlToText(formData.description)).trim(),
        alternativeNames: parseAlternativeNames(formData.alternativeNamesText),
        history: normalizeHtml(formData.history),
        architecture: normalizeHtml(formData.architecture),
        culturalSignificance: normalizeHtml(formData.culturalSignificance),
        constructionPeriod: formData.constructionPeriod.trim(),
        founder: formData.founder.trim(),
        recognition: parseJsonField(formData.recognitionText, 'Recognition'),
        festivals: parseJsonField(formData.festivalsText, 'Festivals'),
        legends: normalizeHtml(formData.legends),
        sourceUrl: formData.sourceUrl.trim(),
    }
}

export const buildLocationPayload = (formData, heritageId) => ({
    heritageId,
    name: formData.location.trim(),
    address: formData.location.trim(),
    latitude: Number(formData.coordinates.latitude),
    longitude: Number(formData.coordinates.longitude),
    countryCode: 'VN',
})

export const buildTimelinePayload = (event, heritageId) => {
    const payload = {
        heritageId,
        description: normalizeHtml(event.description),
    }
    if (event.eventDate) payload.eventDate = event.eventDate
    return payload
}

export const isValidTimelineEvent = (event) =>
    Boolean(event?.eventDate || htmlToText(event?.description || ''))

export const toFormTimelineEvents = (timelines = []) =>
    timelines.map((event) => ({
        id: event.id,
        eventDate: event.eventDate ? event.eventDate.toString().slice(0, 10) : '',
        description: event.description || '',
    }))
