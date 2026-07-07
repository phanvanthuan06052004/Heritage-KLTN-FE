import { apiSlice } from './apiSlice'

const PLACEHOLDER_IMAGE = '/images/placeholder.webp'

const getCurrentLanguage = () => localStorage.getItem('lang') || 'vi'

const isVietnamese = (language) => !language || language.toLowerCase().startsWith('vi')

const normalizeArg = (arg = {}) =>
  typeof arg === 'string' ? { id: arg } : arg || {}

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

const stripHtml = (value = '') =>
  value
    .toString()
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()

const getBestMediaUrl = (media) => media?.url || media?.thumbnailUrl

const getTranslatedAdditionalInfo = (translation) =>
  translation?.additionalInfo || translation?.additional_info || null

const getEmbeddedExtras = (heritage, language) => ({
  media: heritage?.media || [],
  locations: heritage?.locations || [],
  timelines: heritage?.timelines || [],
  translations: heritage?.translations || [],
  language,
})

const hasEmbeddedCardExtras = (heritage) =>
  Array.isArray(heritage?.media) || Array.isArray(heritage?.locations)

const hasEmbeddedDetailExtras = (heritage) =>
  hasEmbeddedCardExtras(heritage) &&
  (Array.isArray(heritage?.timelines) || Array.isArray(heritage?.translations))

const normalizeHistoricalEvents = (timelines = [], heritage) => {
  const translatedEvents = heritage?.additionalInfo?.historicalEvents
  if (Array.isArray(translatedEvents) && translatedEvents.length) {
    return translatedEvents
      .filter((event) => event?.title || event?.description)
      .map((event) => ({
        title: event.title || 'History',
        description: stripHtml(event.description || ''),
      }))
  }

  const timelineEvents = timelines
    .filter((event) => event?.description)
    .map((event) => ({
      title: event.eventDate
        ? new Date(event.eventDate).getFullYear().toString()
        : 'Lịch sử',
      description: stripHtml(event.description),
    }))

  if (timelineEvents.length) return timelineEvents
  if (heritage?.history) {
    return [{ title: 'Lịch sử', description: stripHtml(heritage.history) }]
  }
  return []
}

const applyTranslation = (heritage, translations = [], language) => {
  if (!language || language === 'vi') return heritage

  const translation = translations.find(
    (item) => item?.languageCode === language || item?.language_code === language,
  )

  if (!translation) return heritage

  return {
    ...heritage,
    title: translation.title || heritage.title,
    summary: translation.summary || heritage.summary,
    content: translation.content || heritage.content,
    additionalInfo: getTranslatedAdditionalInfo(translation) || heritage.additionalInfo,
  }
}

export const normalizeHeritage = (
  heritage,
  { media = [], locations = [], timelines = [], translations = [], language } = {},
) => {
  if (!heritage) return null

  const translatedHeritage = applyTranslation(heritage, translations, language)
  const effectiveMedia = media.length ? media : heritage.media || []
  const effectiveLocations = locations.length ? locations : heritage.locations || []
  const effectiveTimelines = timelines.length ? timelines : heritage.timelines || []
  const primaryLocation = effectiveLocations?.[0]
  const images = effectiveMedia
    .filter((item) => !item?.type || item.type === 'image')
    .map(getBestMediaUrl)
    .filter(Boolean)

  const latitude = toNumber(primaryLocation?.latitude)
  const longitude = toNumber(primaryLocation?.longitude)
  const location = primaryLocation?.address || primaryLocation?.name || ''
  const description = stripHtml(
    translatedHeritage.summary ||
    translatedHeritage.content ||
    translatedHeritage.history ||
    translatedHeritage.culturalSignificance ||
    '',
  )

  return {
    ...translatedHeritage,
    _id: translatedHeritage.id,
    name: translatedHeritage.title,
    nameSlug: translatedHeritage.slug,
    description,
    location,
    images: images.length ? images : [PLACEHOLDER_IMAGE],
    coordinates:
      latitude !== undefined && longitude !== undefined
        ? { latitude, longitude }
        : undefined,
    additionalInfo: {
      historicalEvents: normalizeHistoricalEvents(effectiveTimelines, translatedHeritage),
    },
    stats: translatedHeritage.stats || { averageRating: 0, totalReviews: 0 },
  }
}

const getPagination = ({ total = 0, page = 1, limit = 10 }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
})

const buildHeritageListUrl = ({
  page = 1,
  limit = 9,
  name = '',
  status,
  type,
  sort = 'title',
  order = 'asc',
} = {}) => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  if (name) params.append('name', name)
  if (status && status !== 'ALL') params.append('status', status)
  if (type) params.append('type', type)
  if (sort) params.append('sort', sort === 'name' ? 'title' : sort)
  if (order) params.append('order', order)
  return `/heritage?${params.toString()}`
}

const fetchJson = async (fetchWithBQ, url) => {
  const result = await fetchWithBQ(url)
  if (result.error) return { data: undefined, error: result.error }
  return { data: result.data }
}

const fetchHeritageExtras = async (fetchWithBQ, heritageId, language) => {
  const [media, locations, timelines, translations] = await Promise.all([
    fetchJson(fetchWithBQ, `/media/heritage/${heritageId}`),
    fetchJson(fetchWithBQ, `/location/heritage/${heritageId}`),
    fetchJson(fetchWithBQ, `/timeline/heritage/${heritageId}`),
    fetchJson(fetchWithBQ, `/translation/heritage/${heritageId}`),
  ])

  return {
    media: media.data || [],
    locations: locations.data || [],
    timelines: timelines.data || [],
    translations: translations.data || [],
    language,
  }
}

const fetchHeritageCardExtras = async (fetchWithBQ, heritageId, language) => {
  const shouldFetchTranslations = !isVietnamese(language)
  const [media, locations, translations] = await Promise.all([
    fetchJson(fetchWithBQ, `/media/heritage/${heritageId}`),
    fetchJson(fetchWithBQ, `/location/heritage/${heritageId}`),
    shouldFetchTranslations
      ? fetchJson(fetchWithBQ, `/translation/heritage/${heritageId}`)
      : Promise.resolve({ data: [] }),
  ])

  return {
    media: media.data || [],
    locations: locations.data || [],
    translations: translations.data || [],
    language,
  }
}

const enrichHeritageCards = async (fetchWithBQ, heritages, language) => {
  return Promise.all(
    heritages.map(async (heritage) => {
      const needsTranslationFetch =
        !isVietnamese(language) && !Array.isArray(heritage?.translations)

      if (hasEmbeddedCardExtras(heritage) && !needsTranslationFetch) {
        return normalizeHeritage(heritage, getEmbeddedExtras(heritage, language))
      }

      const extras = await fetchHeritageCardExtras(fetchWithBQ, heritage.id, language)
      return normalizeHeritage(heritage, extras)
    }),
  )
}

const distanceInKm = (from, heritage) => {
  const lat2 = heritage?.coordinates?.latitude
  const lon2 = heritage?.coordinates?.longitude
  if (typeof lat2 !== 'number' || typeof lon2 !== 'number') return Infinity

  const toRad = (value) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRad(lat2 - from.latitude)
  const dLon = toRad(lon2 - from.longitude)
  const lat1 = toRad(from.latitude)
  const lat2Rad = toRad(lat2)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const heritageSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHeritages: builder.query({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const language = arg?.language || getCurrentLanguage()
        const page = arg?.page || 1
        const limit = arg?.limit || 9
        const result = await fetchWithBQ(buildHeritageListUrl(arg))

        if (result.error) return { error: result.error }

        const rawItems = result.data?.items || result.data?.heritages || []
        const total = result.data?.total ?? rawItems.length
        const heritages = await enrichHeritageCards(fetchWithBQ, rawItems, language)

        return {
          data: {
            heritages,
            items: heritages,
            total,
            pagination: getPagination({ total, page, limit }),
          },
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.heritages.map(({ _id }) => ({ type: 'Heritages', id: _id })),
              { type: 'Heritages', id: 'LIST' },
            ]
          : [{ type: 'Heritages', id: 'LIST' }],
    }),

    getHeritagesById: builder.query({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { id, language } = normalizeArg(arg)
        const result = await fetchWithBQ(`/heritage/${id}`)

        if (result.error) return { error: result.error }

        const currentLanguage = language || getCurrentLanguage()
        const extras = hasEmbeddedDetailExtras(result.data)
          ? getEmbeddedExtras(result.data, currentLanguage)
          : await fetchHeritageExtras(fetchWithBQ, result.data.id, currentLanguage)

        return { data: normalizeHeritage(result.data, extras) }
      },
      providesTags: (_result, _error, arg) => [
        { type: 'Heritages', id: normalizeArg(arg).id },
      ],
    }),

    getAllHeritageNames: builder.query({
      async queryFn(_language, _queryApi, _extraOptions, fetchWithBQ) {
        // Chỉ cần id + tên (+ slug cho trang Graph). KHÔNG chạy enrichHeritageCards
        // như trang Khám phá — tránh xử lý thừa và lấy đủ toàn bộ danh sách di sản.
        const result = await fetchWithBQ('/heritage?page=1&limit=1000&sort=title&order=asc')

        if (result.error) return { error: result.error }

        const names = (result.data?.items || []).map((item) => ({
          _id: item.id,
          id: item.id,
          name: item.title,
          title: item.title,
          slug: item.slug,
          nameSlug: item.slug,
        }))

        return { data: names }
      },
      providesTags: [{ type: 'Heritages', id: 'NAMES' }],
    }),

    getHeritagesBySlug: builder.query({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { nameSlug, language } = normalizeArg(arg)
        const result = await fetchWithBQ(`/heritage/slug/${nameSlug}`)

        if (result.error) return { error: result.error }

        const currentLanguage = language || getCurrentLanguage()
        const extras = hasEmbeddedDetailExtras(result.data)
          ? getEmbeddedExtras(result.data, currentLanguage)
          : await fetchHeritageExtras(fetchWithBQ, result.data.id, currentLanguage)

        return { data: normalizeHeritage(result.data, extras) }
      },
      providesTags: (result) => [{ type: 'Heritages', id: result?._id }],
    }),

    getNearestHeritages: builder.query({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const language = arg?.language || getCurrentLanguage()
        const limit = arg?.limit || 6
        const result = await fetchWithBQ('/heritage?page=1&limit=100&sort=title&order=asc')

        if (result.error) return { error: result.error }

        const heritages = await enrichHeritageCards(
          fetchWithBQ,
          result.data?.items || [],
          language,
        )
        const from = {
          latitude: Number(arg?.latitude),
          longitude: Number(arg?.longitude),
        }

        const nearest = heritages
          .map((heritage) => ({
            ...heritage,
            distanceKm: distanceInKm(from, heritage),
          }))
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, limit)

        return { data: { heritages: nearest } }
      },
      providesTags: [{ type: 'Heritages', id: 'NEAREST' }],
    }),

    createHeritage: builder.mutation({
      query: (arg) => {
        const data = arg?.data || arg
        return {
        url: '/heritage',
        method: 'POST',
        body: data,
        }
      },
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Heritages'],
    }),

    updateHeritage: builder.mutation({
      query: (arg) => {
        const { id, data } = arg || {}
        return {
          url: `/heritage/${id}`,
          method: 'PUT',
          body: data,
        }
      },
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (_result, _error, arg) => [{ type: 'Heritages', id: arg.id }],
    }),

    deleteHeritage: builder.mutation({
      query: (arg) => ({
        url: `/heritage/${arg?.id || arg}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Heritages'],
    }),

    uploadHeritageImg: builder.mutation({
      query: (data) => ({
        url: '/media/upload',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
    }),

    createHeritageMedia: builder.mutation({
      query: (data) => ({
        url: '/media',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (_result, _error, { heritageId }) => [{ type: 'Heritages', id: heritageId }],
    }),

    updateHeritageMedia: builder.mutation({
      query: ({ id, data }) => ({
        url: `/media/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
    }),

    deleteHeritageMedia: builder.mutation({
      query: (id) => ({
        url: `/media/${id}`,
        method: 'DELETE',
      }),
    }),

    createHeritageLocation: builder.mutation({
      query: (data) => ({
        url: '/location',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (_result, _error, { heritageId }) => [{ type: 'Heritages', id: heritageId }],
    }),

    updateHeritageLocation: builder.mutation({
      query: ({ id, data }) => ({
        url: `/location/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
    }),

    createHeritageTimeline: builder.mutation({
      query: (data) => ({
        url: '/timeline',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (_result, _error, { heritageId }) => [{ type: 'Heritages', id: heritageId }],
    }),

    updateHeritageTimeline: builder.mutation({
      query: ({ id, data }) => ({
        url: `/timeline/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
    }),

    deleteHeritageTimeline: builder.mutation({
      query: (id) => ({
        url: `/timeline/${id}`,
        method: 'DELETE',
      }),
    }),

    createHeritageTranslation: builder.mutation({
      query: (data) => ({
        url: '/translation',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (_result, _error, { heritageId }) => [{ type: 'Heritages', id: heritageId }],
    }),

    updateHeritageTranslation: builder.mutation({
      query: ({ id, data }) => ({
        url: `/translation/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (_result, _error, arg) => [{ type: 'Heritages', id: arg?.data?.heritageId }],
    }),
  }),
})

export const {
  useGetHeritagesQuery,
  useLazyGetHeritagesQuery,
  useGetHeritagesByIdQuery,
  useGetHeritagesBySlugQuery,
  useLazyGetNearestHeritagesQuery,
  useCreateHeritageMutation,
  useUpdateHeritageMutation,
  useDeleteHeritageMutation,
  useUploadHeritageImgMutation,
  useCreateHeritageMediaMutation,
  useUpdateHeritageMediaMutation,
  useDeleteHeritageMediaMutation,
  useCreateHeritageLocationMutation,
  useUpdateHeritageLocationMutation,
  useCreateHeritageTimelineMutation,
  useUpdateHeritageTimelineMutation,
  useDeleteHeritageTimelineMutation,
  useCreateHeritageTranslationMutation,
  useUpdateHeritageTranslationMutation,
  useGetAllHeritageNamesQuery,
} = heritageSlice
