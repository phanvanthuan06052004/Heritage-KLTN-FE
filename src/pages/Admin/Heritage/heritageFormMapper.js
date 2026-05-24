const VIETNAMESE_CHAR_MAP = {
    a: 'áàảãạăắằẳẵặâấầẩẫậ',
    d: 'đ',
    e: 'éèẻẽẹêếềểễệ',
    i: 'íìỉĩị',
    o: 'óòỏõọôốồổỗộơớờởỡợ',
    u: 'úùủũụưứừửữự',
    y: 'ýỳỷỹỵ',
}

export const slugify = (value = '') => {
    let slug = value.toLowerCase().trim()

    Object.entries(VIETNAMESE_CHAR_MAP).forEach(([ascii, chars]) => {
        slug = slug.replace(new RegExp(`[${chars}]`, 'g'), ascii)
    })

    return slug
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

export const toApiStatus = (status) => (status === 'INACTIVE' ? 'draft' : 'published')

export const toFormStatus = (status) => {
    const normalized = status?.toString().toLowerCase()
    return normalized === 'draft' || normalized === 'archived' ? 'INACTIVE' : 'ACTIVE'
}

export const getResponseData = (response) => response?.data || response

export const buildHeritagePayload = (formData) => {
    const status = toApiStatus(formData.status)

    return {
        slug: formData.slug || slugify(formData.name),
        title: formData.name.trim(),
        summary: formData.description.trim(),
        content: formData.description.trim(),
        type: formData.type || 'cultural',
        status,
        publishedAt: status === 'published' ? new Date().toISOString() : undefined,
        seoTitle: formData.name.trim(),
        seoDescription: formData.description.trim(),
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

export const buildTimelinePayload = (event, heritageId) => ({
    heritageId,
    description: [event.title, event.description].filter(Boolean).join('\n\n').trim(),
})

export const isValidTimelineEvent = (event) =>
    Boolean(event?.title?.trim() || event?.description?.trim())
