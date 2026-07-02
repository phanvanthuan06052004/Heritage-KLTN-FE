import { useState, useRef, useEffect } from 'react'
import { Send, ImageIcon, X, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { cn } from '~/lib/utils'
import { Button } from '~/components/common/ui/Button'
import { useIsMobile } from '~/hooks/useIsMobile'
import { BASE_URL } from '~/constants/fe.constant'

// Giới hạn ảnh đầu vào (trước nén): 8MB
const MAX_INPUT_BYTES = 8 * 1024 * 1024
// Đích sau khi nén để lọt giới hạn 1MB của BE
const TARGET_BYTES = 950 * 1024

/** Nén ảnh về JPEG, hạ dần chất lượng để < TARGET_BYTES (lọt giới hạn 1MB của BE). */
async function compressImage(file, maxSize = 1600) {
  const dataUrl = await new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(fr.result)
    fr.onerror = rej
    fr.readAsDataURL(file)
  })
  const img = await new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = dataUrl
  })
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)

  let quality = 0.85
  let blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality))
  while (blob && blob.size > TARGET_BYTES && quality > 0.4) {
    quality -= 0.12
    blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality))
  }
  return blob
}

export function MessageInput({ onSendMessage, onSendImage, onInputChange, placeholder = 'Type a message...', disabled = false }) {
  const [message, setMessage] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef(null)
  const fileRef = useRef(null)
  const isMobile = useIsMobile()

  // Thiết lập chiều cao ban đầu khi component mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px'
    }
  }, [])

  // Tự động điều chỉnh chiều cao của textarea khi nhập
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px'
      if (message.trim()) {
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
      }
    }
  }, [message, isMobile])

  const resetImage = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const onPickImage = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      toast.error('Chỉ hỗ trợ gửi ảnh.')
      return
    }
    if (f.size > MAX_INPUT_BYTES) {
      toast.error('Ảnh quá lớn (tối đa 8MB).')
      return
    }
    setImageFile(f)
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(f)
    })
  }

  const uploadImage = async () => {
    const blob = await compressImage(imageFile).catch(() => imageFile)
    if (blob && blob.size > 1024 * 1024) {
      throw new Error('Ảnh sau khi nén vẫn quá lớn.')
    }
    const fd = new FormData()
    fd.append('image', blob, 'chat-image.jpg')
    const res = await fetch(`${BASE_URL}/media/upload`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error('upload_failed')
    const json = await res.json()
    return json.imageUrl || json?.data?.imageUrl || null
  }

  const handleSend = async () => {
    // Gửi ảnh (kèm caption nếu có)
    if (imageFile) {
      if (uploading) return
      setUploading(true)
      try {
        const url = await uploadImage()
        if (!url) throw new Error('no_url')
        onSendImage?.(url, message.trim())
        setMessage('')
        resetImage()
      } catch (err) {
        toast.error(err.message === 'Ảnh sau khi nén vẫn quá lớn.' ? err.message : 'Gửi ảnh thất bại, thử lại.')
      } finally {
        setUploading(false)
      }
      return
    }

    // Gửi văn bản
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e) => {
    setMessage(e.target.value)
    if (onInputChange) onInputChange()
  }

  const canSend = (message.trim() || imageFile) && !uploading

  return (
    <div className='flex flex-col gap-2 animate-fade-in'>
      {/* Xem trước ảnh đính kèm */}
      {imagePreview && (
        <div className='relative w-fit animate-fade-in'>
          <img
            src={imagePreview}
            alt='preview'
            className='max-h-40 rounded-xl border border-museum-gold/25 object-cover'
          />
          <button
            type='button'
            onClick={resetImage}
            className='absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-museum-seal text-white shadow-md hover:bg-museum-seal/80'
            aria-label='Bỏ ảnh'
          >
            <X className='h-3.5 w-3.5' />
          </button>
          {uploading && (
            <div className='absolute inset-0 flex items-center justify-center rounded-xl bg-museum-black/60'>
              <Loader2 className='h-6 w-6 animate-spin text-museum-gold-light' />
            </div>
          )}
        </div>
      )}

      {/* Input chính */}
      <div className='flex items-center gap-2 rounded-2xl border border-museum-gold/25 bg-museum-black/50 p-2'>
        <input
          ref={fileRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={onPickImage}
        />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          disabled={disabled || uploading}
          className='h-8 w-8 flex-shrink-0 rounded-full text-museum-muted hover:text-museum-gold-light'
          onClick={() => fileRef.current?.click()}
          title='Gửi ảnh'
        >
          <ImageIcon className='h-4 w-4' />
        </Button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={imageFile ? 'Thêm chú thích (tuỳ chọn)…' : placeholder}
          disabled={disabled}
          className='min-h-[40px] max-h-[120px] flex-1 resize-none bg-transparent px-1 py-2 text-sm text-museum-ivory placeholder:text-museum-muted focus:outline-none disabled:opacity-60'
          rows={1}
        />

        <Button
          onClick={handleSend}
          disabled={!canSend}
          size='icon'
          className={cn(
            'h-9 w-9 shrink-0 rounded-full bg-museum-gold text-museum-black transition-all hover:bg-museum-gold-light',
            canSend ? 'opacity-100 scale-100' : 'opacity-60 scale-95',
          )}
        >
          {uploading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
        </Button>
      </div>
    </div>
  )
}
