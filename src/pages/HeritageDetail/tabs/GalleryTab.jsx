import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const GalleryTab = ({ images = [], name = 'Di tích' }) => {
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    if (!selectedImage) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedImage(null)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedImage])

  if (!images || images.length === 0) {
    return <div className='col-span-3 py-8 text-center text-museum-muted'>Chưa có hình ảnh cho di tích này.</div>
  }

  return (
    <>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {images.map((image, index) => {
          const imageSrc = image || 'https://placehold.co/600x400?text=Di+t%C3%ADch+L%E1%BB%8Bch+s%E1%BB%AD&font=roboto'

          return (
            <button
              key={index}
              type='button'
              onClick={() => setSelectedImage({ src: imageSrc, index })}
              className='group relative aspect-[4/3] overflow-hidden rounded-3xl border border-museum-gold/15 bg-museum-ivory/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light'
              aria-label={`Phóng to ${name} - Ảnh ${index + 1}`}
            >
              <img
                src={imageSrc}
                alt={`${name} - ${index + 1}`}
                className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]'
                loading='lazy'
                decoding='async'
              />
              <span className='absolute bottom-3 left-3 rounded-full bg-museum-black/72 px-3 py-1 text-xs font-semibold text-museum-ivory'>
                Ảnh {index + 1}
              </span>
            </button>
          )
        })}
      </div>

      {selectedImage && (
        <div className='fixed inset-0 z-[100]'>
          <button
            type='button'
            onClick={() => setSelectedImage(null)}
            aria-label='Close image'
            className='fixed inset-0 bg-museum-black/95 backdrop-blur-sm'
          />

          <div
            className='relative z-10 flex h-dvh w-dvw items-center justify-center'
            role='dialog'
            aria-modal='true'
            aria-label={`${name} - ${selectedImage.index + 1}`}
          >
          <button
            type='button'
            onClick={() => setSelectedImage(null)}
            className='absolute right-4 top-4 rounded-full border border-museum-gold/25 bg-museum-black/70 p-3 text-museum-ivory transition hover:bg-museum-gold hover:text-museum-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light'
            aria-label='Đóng ảnh phóng to'
          >
            <X className='h-5 w-5' />
          </button>

          <div className='max-w-full max-h-full'>
            <img
              src={selectedImage.src}
              alt={`${name} - ${selectedImage.index + 1}`}
              className='h-dvh w-dvw object-contain shadow-[0_32px_90px_rgba(0,0,0,0.55)]'
            />
          </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GalleryTab
