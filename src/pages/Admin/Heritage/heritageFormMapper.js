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
    translationEn: {
        id: '',
        title: '',
        summary: '',
        content: '',
        seoTitle: '',
        seoDescription: '',
        architectural: '',
        culturalFestival: '',
        historicalEvents: [],
    },
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
    } catch {
        return ''
    }
}

export const parseJsonField = (value, fieldLabel) => {
    if (!value?.trim()) return undefined
    try {
        return JSON.parse(value)
    } catch {
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

export const hasTranslationContent = (translation = {}) =>
    Boolean(
        translation.title?.trim() ||
        htmlToText(translation.summary || '') ||
        htmlToText(translation.content || '') ||
        translation.seoTitle?.trim() ||
        translation.seoDescription?.trim() ||
        htmlToText(translation.architectural || '') ||
        htmlToText(translation.culturalFestival || '') ||
        translation.historicalEvents?.some(
            (event) => event?.title?.trim() || htmlToText(event?.description || ''),
        ),
    )

export const buildTranslationPayload = (formData, heritageId, languageCode = 'en') => {
    const translation = formData.translationEn || {}
    const historicalEvents = (translation.historicalEvents || [])
        .filter((event) => event?.title?.trim() || htmlToText(event?.description || ''))
        .map((event) => ({
            title: event.title?.trim() || undefined,
            description: normalizeHtml(event.description || ''),
        }))

    return {
        heritageId,
        languageCode,
        title: translation.title?.trim() || undefined,
        summary: normalizeHtml(translation.summary || ''),
        content: normalizeHtml(translation.content || translation.summary || ''),
        seoTitle: (translation.seoTitle || translation.title || '').trim() || undefined,
        seoDescription: (translation.seoDescription || htmlToText(translation.summary || '')).trim() || undefined,
        additionalInfo: {
            architectural: normalizeHtml(translation.architectural || ''),
            culturalFestival: normalizeHtml(translation.culturalFestival || ''),
            historicalEvents,
        },
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

export const toFormTranslation = (translations = [], languageCode = 'en') => {
    const translation = translations.find(
        (item) => item?.languageCode === languageCode || item?.language_code === languageCode,
    )
    const additionalInfo = translation?.additionalInfo || translation?.additional_info || {}

    return {
        id: translation?.id || '',
        title: translation?.title || '',
        summary: translation?.summary || '',
        content: translation?.content || '',
        seoTitle: translation?.seoTitle || '',
        seoDescription: translation?.seoDescription || '',
        architectural: additionalInfo.architectural || '',
        culturalFestival: additionalInfo.culturalFestival || '',
        historicalEvents: (additionalInfo.historicalEvents || []).map((event) => ({
            title: event.title || '',
            description: event.description || '',
        })),
    }
}
