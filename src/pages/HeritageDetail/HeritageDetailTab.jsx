import { useState, useCallback, useMemo } from 'react'
import { Star, Loader2, MoreVertical, Trash2, ThumbsUp } from 'lucide-react'
import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/ui/Tabs'
import { Button } from '~/components/common/ui/Button'
import { HistoryTab, GalleryTab } from '~/components/lazyComponents'
import WriteReviewModal from '~/components/WriteReviewModal'
import { useGetAllCommentQuery } from '~/store/apis/commentApi'
import Avatar from '~/components/common/Avatar'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/store/slices/authSlice'
import { useDeleteCommentMutation, useLikeCommentMutation } from '~/store/apis/commentApi'
import { toast } from 'react-toastify'
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '~/components/common/ui/Dialog'
import { useTranslation } from 'react-i18next'

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

const HeritageDetailTabs = ({ data, isAuthenticated, navigate }) => {
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ open: false, commentId: null })
  const currentUser = useSelector(selectCurrentUser)
  const [deleteComment] = useDeleteCommentMutation()
  const [likeComment] = useLikeCommentMutation()
  const { t } = useTranslation()

  // Sử dụng useMemo để memoize query options, tránh re-render không cần thiết
  const queryOptions = useMemo(() => ({
    heritageId: data?._id,
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'desc',
  }), [data?._id])

  const { data: commentData, isLoading: isCommentsLoading } = useGetAllCommentQuery(
    queryOptions,
    { skip: !data?._id, refetchOnMountOrArgChange: false }
  )

  const comments = useMemo(() => commentData?.comments || [], [commentData?.comments])
  console.log('Fetched comments:', comments)

  const hasComments = comments.length > 0

  const calculatedAverageRating = useMemo(() => {
    return hasComments
      ? comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length
      : 0
  }, [comments, hasComments])

  const averageRating = data?.stats?.averageRating || calculatedAverageRating
  const overviewHtml = useMemo(
    () => sanitizeHtml(data?.content || data?.summary || data?.history || data?.description || ''),
    [data?.content, data?.summary, data?.history, data?.description]
  )

  const handleWriteReview = () => setShowWriteReview(true)

  const handleReviewSubmit = useCallback(() => {
    setShowWriteReview(false) // Đóng modal sau khi submit thành công
  }, [])

  const openDeleteModal = (commentId) => {
    setDeleteModal({ open: true, commentId })
    setOpenMenuId(null)
  }

  const confirmDelete = async () => {
    try {
      await deleteComment(deleteModal.commentId).unwrap()
      setDeleteModal({ open: false, commentId: null })
    } catch {
      toast.error('Failed to delete comment!')
    }
  }

  const closeDeleteModal = () => setDeleteModal({ open: false, commentId: null })

  const handleLike = async (commentId) => {
    try {
      await likeComment(commentId).unwrap()
    } catch {
      toast.error('Failed to like!')
    }
  }

  return (
    <Tabs defaultValue="overview" variant="museum">
      <TabsList>
        <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
        <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
        <TabsTrigger value="gallery">{t("tabs.gallery")}</TabsTrigger>
        <TabsTrigger value="review">{t("tabs.reviews")}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <h3 className="font-display text-2xl font-semibold text-museum-gold-light">{t("tabs.introduction")}</h3>
        <div
          className="space-y-4 text-justify leading-8 text-museum-parchment [&_a]:text-museum-gold-light [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-museum-gold/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: overviewHtml }}
        />
        <p className="text-justify leading-8 text-museum-parchment">
          When visiting {data?.name}, visitors will be able to admire unique architectural works, learn about the
          formation and development history of the site, as well as discover interesting stories related to this heritage.
        </p>
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <h3 className="font-display text-2xl font-semibold text-museum-gold-light">{t("tabs.historicalEvents")}</h3>
        <Suspense fallback={<div>Loading...</div>}>
          <HistoryTab historicalEvents={data?.additionalInfo?.historicalEvents} />
        </Suspense>
      </TabsContent>

      <TabsContent value="gallery" className="space-y-6">
        <h3 className="font-display text-2xl font-semibold text-museum-gold-light">{t("tabs.gallery")}</h3>
        <Suspense fallback={<div>Loading...</div>}>
          <GalleryTab images={data?.images} name={data?.name} />
        </Suspense>
      </TabsContent>

      <TabsContent value="review" className="space-y-6">
        <h3 className="font-display text-2xl font-semibold text-museum-gold-light">{t("tabs.reviews")}</h3>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="text-3xl font-bold mr-2">{averageRating.toFixed(1)}</div>
            <div className="flex flex-col">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${star <= Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-museum-muted">{data?.stats?.totalReviews || comments.length} reviews</span>
            </div>
          </div>
          {isAuthenticated && (
            <Button onClick={handleWriteReview} className="rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light">
              Write Review
            </Button>
          )}
        </div>

        {isCommentsLoading ? (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            <p className="text-sm text-museum-muted">Loading reviews...</p>
          </div>
        ) : hasComments ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="border-b border-museum-gold/15 pb-6">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={comment?.user?.avatar}
                      name={comment?.user?.displayName}
                      size="md"
                    />
                    <div>
                      <div className="font-medium">{comment.user?.displayName || comment.user?.id || 'Anonymous'}</div>
                      <div className="text-sm text-museum-muted">
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${star <= comment.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    {/* Like button */}
                    <button
                      className={`ml-2 flex items-center gap-1 rounded-full border px-2 py-1 transition ${comment.likes?.includes(currentUser?._id) ? 'border-museum-gold bg-museum-gold text-museum-black' : 'border-museum-gold/20 bg-museum-ivory/8 text-museum-muted'} hover:bg-museum-gold/20`}
                      onClick={() => handleLike(comment._id)}
                      disabled={!isAuthenticated}
                    >
                      <ThumbsUp size={16} />
                      <span>{comment.likesCount || 0}</span>
                    </button>
                    {/* 3 dots menu for owner */}
                    {currentUser?._id === comment.user?.id && (
                      <div className="relative ml-2">
                        <button onClick={() => setOpenMenuId(openMenuId === comment._id ? null : comment._id)} className="p-1 rounded-full hover:bg-museum-ivory/10">
                          <MoreVertical size={18} />
                        </button>
                        {openMenuId === comment._id && (
                          <div className="absolute right-0 z-10 mt-2 w-28 rounded-xl border border-museum-gold/20 bg-museum-black p-1 shadow-museum-card">
                            <button
                              onClick={() => { setOpenMenuId(null); openDeleteModal(comment._id) }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-museum-gold-light hover:bg-museum-ivory/10"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-justify">{comment.content}</p>
                {comment.images && comment.images.length > 0 && (
                  <div className="mt-2">
                    {comment.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="max-w-[150px] rounded-lg mt-2"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-museum-gold/25 py-12 text-center">
            <Star size={40} className="mx-auto mb-4 text-museum-gold-light opacity-70" />
            <p className="text-museum-muted">No reviews yet for this heritage site.</p>
            {!isAuthenticated && (
              <div className="mt-4">
                <p className="text-sm mb-3">Login to write a review about your experience</p>
                <Button onClick={() => navigate('/login')} className="rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light">Login</Button>
              </div>
            )}
          </div>
        )}
        {showWriteReview && (
          <WriteReviewModal
            heritageId={data?._id}
            onClose={() => setShowWriteReview(false)}
            onSubmit={handleReviewSubmit}
          />
        )}
        <Dialog open={deleteModal.open} onClose={closeDeleteModal}>
          <DialogHeader>
            <DialogTitle>Confirm Delete Comment</DialogTitle>
            <DialogDescription>Are you sure you want to delete this comment? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 p-4">
            <Button variant="outline" onClick={closeDeleteModal}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </div>
        </Dialog>
      </TabsContent>
    </Tabs>
  )
}

export default HeritageDetailTabs
