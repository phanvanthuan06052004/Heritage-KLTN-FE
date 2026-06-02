import { useState, useRef } from 'react'
import { Star, X, Loader2, Check } from 'lucide-react'
import { Button } from '~/components/common/ui/Button'
import { Textarea } from '~/components/common/ui/Textarea'
import { useCreateNewMutation } from '~/store/apis/commentApi'
import { toast } from 'react-toastify'

const WriteReviewModal = ({ heritageId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [errors, setErrors] = useState({})
  const hasSubmitted = useRef(false)

  const [createNew, { isLoading: isSubmitting }] = useCreateNewMutation()

  const handleRating = (value) => {
    setRating(value)
    if (errors.rating) setErrors((prev) => ({ ...prev, rating: null }))
  }

  const handleContentChange = (e) => {
    setContent(e.target.value)
    if (errors.content) setErrors((prev) => ({ ...prev, content: null }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff']
    const maxSize = 1 * 1024 * 1024

    const validFiles = files.filter((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`File ${file.name} is invalid. Only JPEG, PNG, GIF, WEBP, BMP, TIFF are accepted.`)
        return false
      }
      if (file.size > maxSize) {
        toast.error(`File ${file.name} exceeds the 1MB size limit.`)
        return false
      }
      return true
    })

    setImages((prevImages) => [...prevImages, ...validFiles].slice(0, 5))
  }

  const handleDeleteImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors = {}
    if (rating === 0) newErrors.rating = 'Please select a star rating'
    if (!content.trim()) newErrors.content = 'Review content cannot be empty'
    else if (content.length < 10) newErrors.content = 'Review content must be at least 10 characters'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0]
      const errorElement = document.getElementById(firstErrorField)
      if (errorElement) errorElement.focus()
      toast.error('Please check the information entered')
    }
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting || hasSubmitted.current || !validateForm()) return

    hasSubmitted.current = true
    const formData = new FormData()
    formData.append('heritageId', heritageId)
    formData.append('rating', rating)
    formData.append('content', content)
    images.forEach((image) => formData.append('images', image))

    try {
      const newComment = await createNew(formData).unwrap()
      toast.success('Review submitted successfully!')
      onSubmit({ rating, comment: content, images })
      onClose()
    } catch (err) {
      hasSubmitted.current = false
      console.error('Error submitting comment:', err)
      toast.error(`Failed to submit review: ${err?.data?.message || err.message || 'An error occurred'}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-museum-black/78 px-4 backdrop-blur-sm">
      <div className="museum-card relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-museum-gold/25 bg-museum-black/92 p-6 text-museum-ivory shadow-museum-card">
        <div className="museum-pattern pointer-events-none absolute inset-0 opacity-[0.08]" />
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 z-20 rounded-full border border-museum-gold/35 bg-museum-black/70 p-2 text-museum-ivory transition hover:bg-museum-gold hover:text-museum-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light disabled:opacity-50"
          aria-label="Close review modal"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative mb-6 pr-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-museum-gold-light">
            Heritage Review
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold text-museum-ivory">
            Write Review
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="relative space-y-5">
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-museum-parchment">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRating(star)}
                  className="rounded-full p-0.5 transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    size={26}
                    className={`transition ${star <= rating ? 'fill-museum-gold text-museum-gold-light drop-shadow-[0_0_10px_rgba(216,162,74,0.38)]' : 'text-museum-muted/55'}`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && <p id="rating-error" className="mt-1 text-sm text-museum-gold-light">{errors.rating}</p>}
          </div>
          <div className="mb-4">
            <Textarea
              id="content"
              placeholder="Write your review..."
              value={content}
              onChange={handleContentChange}
              className={`min-h-32 resize-none rounded-2xl border-museum-gold/30 bg-museum-black/70 px-4 py-3 text-museum-ivory caret-museum-gold-light placeholder:text-museum-muted shadow-inner focus:border-museum-gold focus:bg-museum-black/80 focus:text-museum-ivory focus:ring-museum-gold-light ${errors.content ? 'border-museum-seal' : ''}`}
              aria-invalid={!!errors.content}
              aria-describedby={errors.content ? 'content-error' : undefined}
            />
            {errors.content && <p id="content-error" className="mt-1 text-sm text-museum-gold-light">{errors.content}</p>}
          </div>
          <div className="mb-4">
              <label htmlFor="images" className="mb-2 block text-sm font-medium text-museum-parchment">Upload images (optional, max 5 images)</label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full rounded-2xl border border-museum-gold/20 bg-museum-ivory/8 p-2 text-sm text-museum-muted file:mr-3 file:rounded-full file:border-0 file:bg-museum-gold file:px-4 file:py-2 file:text-sm file:font-semibold file:text-museum-black hover:file:bg-museum-gold-light"
              />
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index}`}
                      className="h-20 w-20 rounded-xl border border-museum-gold/20 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(index)}
                      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-museum-seal text-museum-ivory shadow-lg transition hover:bg-museum-gold hover:text-museum-black"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full border-museum-gold/35 bg-museum-ivory/8 text-museum-ivory hover:bg-museum-ivory/14"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-museum-gold text-museum-black shadow-museum-gold hover:bg-museum-gold-light"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WriteReviewModal
