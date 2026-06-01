import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  BookOpen,
  Building2,
  Calendar,
  ExternalLink,
  Loader2,
  MapPin,
  MoreVertical,
  PartyPopper,
  Sparkles,
  Star,
  ThumbsUp,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'react-toastify'

import Avatar from '~/components/common/Avatar'
import { Button } from '~/components/common/ui/Button'
import WriteReviewModal from '~/components/WriteReviewModal'
import {
  commentSlice,
  useDeleteCommentMutation,
  useGetAllCommentQuery,
  useLikeCommentMutation,
} from '~/store/apis/commentApi'
import { selectCurrentUser } from '~/store/slices/authSlice'

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
])

const sanitizeHtml = (html = '') => {
  if (!html) return ''

  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const elements = Array.from(parsed.body.querySelectorAll('*'))

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

  return parsed.body.innerHTML
}

const stripHtml = (html = '') => {
  if (!html) return ''
  return new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() || ''
}

const getHtmlValue = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.description || ''
}

const getTimelineTitle = (html, index) => {
  const parsed = new DOMParser().parseFromString(html || '', 'text/html')
  return parsed.querySelector('strong')?.textContent?.trim() || `Giai đoạn ${index + 1}`
}

const getTimelineDescription = (html) => {
  const parsed = new DOMParser().parseFromString(html || '', 'text/html')
  parsed.querySelector('strong')?.parentElement?.remove()
  return sanitizeHtml(parsed.body.innerHTML)
}

const getTimelineExcerpt = (html) => {
  const text = stripHtml(html)
  if (text.length <= 180) return text
  return `${text.slice(0, 180).trim()}...`
}

const SectionTitle = ({ icon, title, subtitle }) => (
  <div className='mb-8 text-center'>
    <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-museum-gold/20 bg-museum-gold/10 text-museum-gold-light'>
      {icon}
    </div>
    <h2 className='font-display text-3xl font-bold tracking-tight text-museum-ivory sm:text-4xl'>{title}</h2>
    {subtitle && <p className='mx-auto mt-3 max-w-2xl text-museum-muted'>{subtitle}</p>}
  </div>
)

const RichText = ({ html, lead = false, inverted = false }) => {
  if (!html) return null

  return (
    <div
      className={[
        'space-y-4 text-pretty',
        lead ? 'text-lg leading-9' : 'text-base leading-8',
        inverted ? 'text-museum-parchment' : 'text-museum-parchment',
        '[&_a]:text-museum-gold-light [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-museum-gold/30 [&_blockquote]:pl-4 [&_blockquote]:italic',
        '[&_li]:ml-5 [&_ol]:list-decimal [&_strong]:font-semibold [&_strong]:text-museum-ivory [&_ul]:list-disc',
      ].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

const InfoRow = ({ label, value, icon }) => {
  if (!value) return null

  return (
    <div className='flex gap-3 border-b border-museum-gold/12 pb-4 last:border-0 last:pb-0'>
      <div className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-museum-gold/10 text-museum-gold-light'>
        {icon}
      </div>
      <div className='min-w-0'>
        <p className='text-xs font-semibold uppercase tracking-wide text-museum-muted'>{label}</p>
        <p className='mt-1 break-words text-sm font-medium text-museum-ivory'>{value}</p>
      </div>
    </div>
  )
}

const TimelineItem = ({ item, index }) => {
  const html = item?.description || item?.content || ''
  const title = item?.title || getTimelineTitle(html, index)
  const description = item?.descriptionText ? sanitizeHtml(item.descriptionText) : getTimelineDescription(html)
  const date = item?.eventDate || item?.date || ''
  const dateLabel = date ? new Date(date).toLocaleDateString('vi-VN') : `Mốc ${String(index + 1).padStart(2, '0')}`
  const isRight = index % 2 === 0

  return (
    <div className='relative md:grid md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] md:items-center'>
      <span className='absolute left-6 top-9 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full border border-museum-gold/45 bg-museum-terracotta shadow-[0_0_0_5px_rgba(216,162,74,0.08)] md:left-1/2 md:top-1/2 md:-translate-y-1/2' />
      <article
        className={[
          'relative ml-14 overflow-hidden rounded-[1.5rem] border border-museum-gold/16 bg-museum-black/28 p-5 shadow-museum-card backdrop-blur-sm transition-colors hover:border-museum-gold/32 sm:p-6 md:ml-0',
          isRight ? 'md:col-start-3' : 'md:col-start-1',
        ].join(' ')}
      >
        <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/30 to-transparent' />
        <span className='mb-4 inline-flex rounded-full bg-museum-gold/10 px-3 py-1 text-xs font-semibold text-museum-gold-light'>
          {dateLabel}
        </span>
        <h3 className='mb-2 font-display text-lg font-semibold leading-tight text-museum-ivory'>{title}</h3>
        <p className='text-sm leading-7 text-museum-parchment'>{getTimelineExcerpt(description)}</p>
      </article>
    </div>
  )
}

const ReviewStars = ({ value = 0, size = 16 }) => (
  <div className='flex items-center gap-0.5' aria-label={`${value} / 5`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={star <= Math.floor(value) ? 'fill-museum-gold text-museum-gold' : 'text-museum-muted/35'}
      />
    ))}
  </div>
)

const HeritageDetailTabs = ({ data, isAuthenticated, navigate }) => {
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ open: false, commentId: null })
  const [lightboxImage, setLightboxImage] = useState(null)
  const currentUser = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation()
  const [likeComment] = useLikeCommentMutation()

  const queryOptions = useMemo(
    () => ({
      heritageId: data?._id,
      page: 1,
      limit: 10,
      sort: 'createdAt',
      order: 'desc',
    }),
    [data?._id],
  )

  const { data: commentData, isLoading: isCommentsLoading } = useGetAllCommentQuery(queryOptions, {
    skip: !data?._id,
    refetchOnMountOrArgChange: false,
  })

  const comments = useMemo(() => commentData?.data?.comments || [], [commentData?.data?.comments])
  const hasComments = comments.length > 0
  const averageRating = useMemo(() => {
    if (data?.stats?.averageRating) return data.stats.averageRating
    if (!hasComments) return 0
    return comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length
  }, [comments, data?.stats?.averageRating, hasComments])

  const overview = useMemo(
    () => sanitizeHtml(data?.summary || data?.content || data?.description || ''),
    [data?.content, data?.description, data?.summary],
  )
  const history = useMemo(() => sanitizeHtml(data?.history || ''), [data?.history])
  const architecture = useMemo(() => sanitizeHtml(data?.architecture || ''), [data?.architecture])
  const significance = useMemo(() => sanitizeHtml(data?.culturalSignificance || ''), [data?.culturalSignificance])
  const festival = useMemo(() => sanitizeHtml(getHtmlValue(data?.festivals)), [data?.festivals])
  const legends = useMemo(() => sanitizeHtml(getHtmlValue(data?.legends)), [data?.legends])

  const timelineItems = useMemo(() => {
    if (data?.timelines?.length) return data.timelines
    return data?.additionalInfo?.historicalEvents || []
  }, [data?.additionalInfo?.historicalEvents, data?.timelines])

  const images = useMemo(() => {
    const mediaImages = data?.media
      ?.filter((item) => !item?.type || item.type === 'image')
      .map((item) => ({
        url: item.url,
        caption: item.caption || data?.name,
      })) || []

    if (mediaImages.length) return mediaImages

    return (data?.images || []).map((url) => ({ url, caption: data?.name }))
  }, [data?.images, data?.media, data?.name])

  const primaryLocation = data?.primaryLocation || data?.locations?.[0]
  const latitude = Number(primaryLocation?.latitude ?? data?.coordinates?.latitude)
  const longitude = Number(primaryLocation?.longitude ?? data?.coordinates?.longitude)
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)
  const locationName = primaryLocation?.address || primaryLocation?.name || data?.location
  const mapUrl = hasCoordinates ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}` : ''
  const googleMapUrl = hasCoordinates ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}` : ''

  const handleReviewSubmit = useCallback(() => {
    setShowWriteReview(false)
  }, [])

  const openDeleteModal = (commentId) => {
    setDeleteModal({ open: true, commentId })
    setOpenMenuId(null)
  }

  const closeDeleteModal = () => setDeleteModal({ open: false, commentId: null })

  const confirmDelete = async () => {
    try {
      await deleteComment(deleteModal.commentId).unwrap()
      setDeleteModal({ open: false, commentId: null })
      toast.success('Đã xóa đánh giá')
    } catch {
      toast.error('Không thể xóa đánh giá')
    }
  }

  const handleLike = async (commentId) => {
    if (!isAuthenticated) return
    const uid = currentUser?._id

    const patchResult = dispatch(
      commentSlice.util.updateQueryData('getAllComment', queryOptions, (draft) => {
        const list = draft?.data?.comments
        if (!list) return
        const target = list.find((comment) => comment._id === commentId || comment.id === commentId)
        if (!target) return

        const liked = target.likes?.includes(uid)
        if (liked) {
          target.likes = target.likes.filter((id) => id !== uid)
          target.likesCount = Math.max(0, (target.likesCount || 1) - 1)
        } else {
          target.likes = [...(target.likes || []), uid]
          target.likesCount = (target.likesCount || 0) + 1
        }
      }),
    )

    try {
      await likeComment(commentId).unwrap()
    } catch {
      patchResult.undo()
      toast.error('Không thể thích đánh giá')
    }
  }

  return (
    <div className='space-y-20'>
      <section id='overview' className='scroll-mt-28'>
        <div className='grid gap-8 lg:grid-cols-3'>
          <article className='lg:col-span-2'>
            <SectionTitle icon={<Sparkles className='h-7 w-7 text-museum-gold-light' />} title='Tổng quan' subtitle='Câu chuyện, bối cảnh và giá trị nổi bật của di sản' />
            <div className='museum-card rounded-[2rem] bg-museum-ivory/7 p-8'>
              <RichText html={overview} lead />
            </div>
          </article>

          <aside className='space-y-6'>
            <div className='museum-card rounded-[2rem] bg-museum-ivory/7 p-6'>
              <h3 className='mb-5 font-display text-xl font-bold text-museum-ivory'>Thông tin nhanh</h3>
              <div className='space-y-4'>
                <InfoRow icon={<Building2 className='h-4 w-4' />} label='Loại hình' value={data?.type || 'Di sản văn hóa'} />
                <InfoRow icon={<MapPin className='h-4 w-4' />} label='Địa điểm' value={locationName} />
                <InfoRow icon={<Calendar className='h-4 w-4' />} label='Công nhận' value={data?.recognition || data?.constructionPeriod} />
                <InfoRow icon={<BookOpen className='h-4 w-4' />} label='Nguồn' value={data?.sourceUrl ? stripHtml(data.sourceUrl) : null} />
              </div>
              {data?.sourceUrl && (
                <a
                  href={data.sourceUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='mt-5 inline-flex items-center gap-2 text-sm font-semibold text-museum-gold-light hover:underline'
                >
                  Xem nguồn tư liệu
                  <ExternalLink className='h-4 w-4' />
                </a>
              )}
            </div>
          </aside>
        </div>
      </section>

      {history && (
        <section id='history' className='scroll-mt-28'>
          <SectionTitle icon={<BookOpen className='h-7 w-7 text-museum-gold-light' />} title='Lịch sử' subtitle='Những mốc phát triển và dấu ấn lịch sử quan trọng' />
          <article className='museum-card mx-auto max-w-4xl rounded-[2rem] bg-museum-ivory/7 p-8'>
            <RichText html={history} lead />
          </article>
        </section>
      )}

      {(architecture || significance || legends) && (
        <section id='architecture' className='scroll-mt-28'>
          <SectionTitle icon={<Building2 className='h-7 w-7 text-museum-gold-light' />} title='Kiến trúc' subtitle='Không gian, chất liệu và các lớp giá trị văn hóa' />
          <div className='museum-card overflow-hidden rounded-[2rem] bg-museum-black/35 p-6 md:p-8'>
            <div className='grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start'>
              <div className='relative min-h-56 overflow-hidden rounded-[1.5rem] border border-museum-gold/12 bg-museum-espresso/45'>
                <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/55 to-transparent' />
                <div className='absolute -right-14 -top-14 h-40 w-40 rounded-full bg-museum-gold/10 blur-3xl' />
                <div className='relative flex h-full min-h-56 flex-col justify-between p-6'>
                  <Building2 className='h-14 w-14 text-museum-gold-light' />
                  <div>
                    <p className='text-xs font-semibold uppercase tracking-[0.2em] text-museum-muted'>Không gian</p>
                    <p className='mt-2 font-display text-2xl font-semibold text-museum-ivory'>Kiến trúc di sản</p>
                  </div>
                </div>
              </div>
              <div className='space-y-6 rounded-[1.5rem] border border-museum-gold/10 bg-museum-ivory/[0.035] p-5 sm:p-6'>
                {architecture && <RichText html={architecture} />}
                {significance && <RichText html={significance} />}
                {legends && <RichText html={legends} />}
              </div>
            </div>
          </div>
        </section>
      )}

      {timelineItems.length > 0 && (
        <section id='timeline' className='scroll-mt-28'>
          <div className='mb-10 flex items-center gap-4'>
            <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-museum-gold/10 text-museum-gold-light'>
              <Calendar className='h-5 w-5' />
            </span>
            <h2 className='font-display text-3xl font-bold tracking-tight text-museum-ivory sm:text-4xl'>
              Dòng thời gian
            </h2>
          </div>
          <div className='relative mx-auto max-w-6xl space-y-10 py-2'>
            <div className='absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-museum-terracotta via-museum-gold/65 to-museum-terracotta md:left-1/2' />
            {timelineItems.map((item, index) => (
              <TimelineItem
                key={item.id || item._id || index}
                item={item}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {festival && (
        <section id='festivals' className='scroll-mt-28'>
          <div className='museum-card relative overflow-hidden rounded-[2rem] bg-museum-black/35 p-6 md:p-8'>
            <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-museum-jade-light/50 to-transparent' />
            <div className='relative grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start'>
              <div className='rounded-[1.5rem] border border-museum-jade-light/18 bg-museum-jade/12 p-6'>
                <div className='mb-10 flex h-16 w-16 items-center justify-center rounded-full bg-museum-jade-light/14 text-museum-jade-light'>
                  <PartyPopper className='h-9 w-9' />
                </div>
                <p className='text-xs font-semibold uppercase tracking-[0.2em] text-museum-muted'>Sinh hoạt cộng đồng</p>
                <h2 className='mt-2 font-display text-2xl font-semibold text-museum-ivory'>Lễ hội văn hóa</h2>
              </div>
              <div className='rounded-[1.5rem] border border-museum-jade-light/12 bg-museum-ivory/[0.035] p-5 sm:p-6'>
                <div className='mb-4 flex items-center gap-3'>
                  <span className='h-px w-10 bg-museum-jade-light/45' />
                  <span className='text-sm font-semibold text-museum-jade-light'>Lễ hội và sinh hoạt văn hóa</span>
                </div>
                <RichText html={festival} />
              </div>
            </div>
          </div>
        </section>
      )}

      {images.length > 0 && (
        <section id='gallery' className='scroll-mt-28'>
          <SectionTitle icon={<Sparkles className='h-7 w-7 text-museum-gold-light' />} title='Thư viện ảnh' subtitle='Những hình ảnh tư liệu nổi bật của di sản' />
          <div className='grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {images.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type='button'
                onClick={() => setLightboxImage(image)}
                className={`group relative overflow-hidden rounded-lg text-left shadow-sm ${index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}
              >
                <img
                  src={image.url}
                  alt={image.caption || data?.name}
                  className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding='async'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-museum-black/65 via-museum-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                <p className='absolute bottom-4 left-4 right-4 translate-y-2 text-sm font-semibold text-museum-ivory opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100'>
                  {image.caption || data?.name}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {(locationName || hasCoordinates) && (
        <section id='location' className='scroll-mt-28'>
          <SectionTitle icon={<MapPin className='h-7 w-7 text-museum-gold-light' />} title='Vị trí' subtitle='Địa điểm và chỉ dẫn bản đồ' />
          <div className='museum-card grid gap-6 overflow-hidden rounded-[2rem] bg-museum-ivory/7 lg:grid-cols-[1.3fr_0.7fr]'>
            <div className='min-h-[360px] bg-museum-black/45'>
              {hasCoordinates ? (
                <iframe
                  title={`Bản đồ ${data?.name}`}
                  src={mapUrl}
                  className='h-full min-h-[360px] w-full border-0'
                  loading='lazy'
                />
              ) : (
                <div className='flex h-full min-h-[360px] items-center justify-center text-museum-muted'>
                  Chưa có tọa độ bản đồ
                </div>
              )}
            </div>
            <div className='flex flex-col justify-center p-6'>
              <h3 className='mb-3 font-display text-2xl font-bold text-museum-ivory'>{data?.name}</h3>
              {locationName && (
                <p className='mb-5 flex gap-2 text-museum-muted'>
                  <MapPin className='mt-1 h-5 w-5 shrink-0 text-museum-gold-light' />
                  <span>{locationName}</span>
                </p>
              )}
              {hasCoordinates && (
                <p className='mb-5 text-sm text-museum-muted'>
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              )}
              {googleMapUrl && (
                <a
                  href={googleMapUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex w-fit items-center justify-center gap-2 rounded-full bg-museum-gold px-4 py-2 text-sm font-semibold text-museum-black transition-colors hover:bg-museum-gold-light'
                >
                  Mở trong Google Maps
                  <ExternalLink className='h-4 w-4' />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <section id='reviews' className='scroll-mt-28'>
        <SectionTitle icon={<Star className='h-7 w-7 text-museum-gold-light' />} title='Đánh giá từ cộng đồng' subtitle='Góc nhìn và cảm nhận của người tham quan' />
        <div className='museum-card rounded-[2rem] bg-museum-ivory/7 p-6'>
          <div className='mb-6 flex flex-col gap-4 border-b border-museum-gold/12 pb-5 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-museum-gold text-2xl font-bold text-museum-black'>
                {averageRating.toFixed(1)}
              </div>
              <div>
                <ReviewStars value={averageRating} size={18} />
                <p className='mt-1 text-sm text-museum-muted'>
                  {data?.stats?.totalReviews || comments.length} đánh giá
                </p>
              </div>
            </div>
            {isAuthenticated ? (
              <Button onClick={() => setShowWriteReview(true)} className='rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light'>
                Viết đánh giá
              </Button>
            ) : (
              <Button onClick={() => navigate('/login')} variant='outline' className='rounded-full border-museum-gold/30 bg-museum-ivory/5 text-museum-ivory hover:bg-museum-gold/12'>
                Đăng nhập để đánh giá
              </Button>
            )}
          </div>

          {isCommentsLoading ? (
            <div className='space-y-4'>
              {[1, 2, 3].map((item) => (
                <div key={item} className='h-24 animate-pulse rounded-2xl bg-museum-ivory/8' />
              ))}
            </div>
          ) : hasComments ? (
            <div className='divide-y divide-museum-gold/12'>
              {comments.map((comment) => (
                <article key={comment._id} className='py-5 first:pt-0 last:pb-0'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                    <div className='flex items-center gap-3'>
                      <Avatar src={comment?.user?.avatar} name={comment?.user?.displayName} size='md' />
                      <div>
                        <div className='font-medium text-museum-ivory'>
                          {comment.user?.displayName || comment.user?.id || 'Anonymous'}
                        </div>
                        <div className='text-sm text-museum-muted'>
                          {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <ReviewStars value={comment.rating} />
                      <button
                        type='button'
                        className={`ml-2 flex items-center gap-1 rounded-full border px-2 py-1 text-sm transition ${
                          comment.likes?.includes(currentUser?._id)
                            ? 'border-museum-gold bg-museum-gold text-museum-black'
                            : 'border-museum-gold/20 text-museum-muted hover:bg-museum-gold/10 hover:text-museum-gold-light'
                        }`}
                        onClick={() => handleLike(comment._id)}
                        disabled={!isAuthenticated}
                      >
                        <ThumbsUp size={15} />
                        <span>{comment.likesCount || 0}</span>
                      </button>
                      {currentUser?._id === comment.user?.id && (
                        <div className='relative'>
                          <button
                            type='button'
                            onClick={() => setOpenMenuId(openMenuId === comment._id ? null : comment._id)}
                            className='rounded-full p-1 text-museum-muted hover:bg-museum-ivory/10 hover:text-museum-ivory'
                            aria-label='Mở menu đánh giá'
                          >
                            <MoreVertical size={18} />
                          </button>
                          {openMenuId === comment._id && (
                            <div className='absolute right-0 z-10 mt-2 w-32 rounded-2xl border border-museum-gold/20 bg-museum-black/95 p-1 shadow-museum-card'>
                              <button
                                type='button'
                                onClick={() => openDeleteModal(comment._id)}
                                className='flex w-full items-center gap-2 rounded-xl px-3 py-2 text-museum-seal hover:bg-museum-ivory/10'
                              >
                                <Trash2 size={16} /> Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className='mt-4 max-w-[72ch] text-sm leading-7 text-museum-parchment'>{comment.content}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className='rounded-2xl border border-dashed border-museum-gold/20 px-5 py-10 text-center text-museum-muted'>
              <Star size={36} className='mx-auto mb-3 text-museum-gold-light' />
              Chưa có đánh giá cho di sản này.
            </div>
          )}
        </div>
      </section>

      {showWriteReview && (
        <WriteReviewModal
          heritageId={data?._id}
          onClose={() => setShowWriteReview(false)}
          onSubmit={handleReviewSubmit}
        />
      )}

      {deleteModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-museum-black/60 px-4 backdrop-blur-sm'>
          <div className='museum-card relative w-full max-w-md rounded-[2rem] bg-museum-black/95 p-6 text-museum-ivory shadow-museum-card'>
            <h3 className='mb-2 font-display text-2xl font-semibold'>Xóa đánh giá</h3>
            <p className='mb-6 text-sm leading-6 text-museum-parchment'>
              Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác.
            </p>
            <div className='flex justify-end gap-3'>
              <Button type='button' variant='outline' onClick={closeDeleteModal} disabled={isDeleting} className='border-museum-gold/30 bg-museum-ivory/5 text-museum-ivory hover:bg-museum-gold/12'>
                Hủy
              </Button>
              <Button type='button' onClick={confirmDelete} disabled={isDeleting} className='bg-museum-seal text-museum-ivory hover:bg-museum-seal/90'>
                {isDeleting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}

      {lightboxImage && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-museum-black/90 p-4'>
          <button
            type='button'
            onClick={() => setLightboxImage(null)}
            className='absolute right-5 top-5 rounded-full bg-museum-ivory/10 p-3 text-museum-ivory backdrop-blur hover:bg-museum-ivory/20'
            aria-label='Đóng ảnh'
          >
            <X className='h-6 w-6' />
          </button>
          <figure className='max-h-full max-w-5xl'>
            <img src={lightboxImage.url} alt={lightboxImage.caption || data?.name} className='max-h-[82vh] w-auto rounded-lg object-contain' />
            {lightboxImage.caption && <figcaption className='mt-4 text-center text-sm text-museum-ivory/80'>{lightboxImage.caption}</figcaption>}
          </figure>
        </div>
      )}
    </div>
  )
}

export default HeritageDetailTabs
