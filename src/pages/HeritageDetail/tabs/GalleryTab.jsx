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
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {images.map((image, index) => {
          const imageSrc = image || 'https://placehold.co/600x400?text=Di+t%C3%ADch+L%E1%BB%8Bch+s%E1%BB%AD&font=roboto'

          return (
            <button
              key={index}
              type='button'
              onClick={() => setSelectedImage({ src: imageSrc, index })}
              className='flex items-center justify-center overflow-hidden rounded-2xl border border-museum-gold/15 bg-museum-ivory/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light'
              style={{ width: '264px', height: '168px', maxWidth: '100%' }}
              aria-label={`Phóng to ${name} - Ảnh ${index + 1}`}
            >
              <img
                src={imageSrc}
                alt={`${name} - Ảnh ${index + 1}`}
                className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                loading='lazy'
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </button>
          )
        })}
      </div>

      {selectedImage && (
        <div
          className='fixed inset-0 z-[100] flex h-dvh w-dvw items-center justify-center bg-museum-black/95 backdrop-blur-sm'
          role='dialog'
          aria-modal='true'
          aria-label={`${name} - Ảnh ${selectedImage.index + 1}`}
          onClick={() => setSelectedImage(null)}
        >
          <button
            type='button'
            onClick={() => setSelectedImage(null)}
            className='absolute right-4 top-4 rounded-full border border-museum-gold/25 bg-museum-black/70 p-3 text-museum-ivory transition hover:bg-museum-gold hover:text-museum-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light'
            aria-label='Đóng ảnh phóng to'
          >
            <X className='h-5 w-5' />
          </button>

          <img
            src={selectedImage.src}
            alt={`${name} - Ảnh ${selectedImage.index + 1}`}
            className='h-dvh w-dvw object-contain shadow-[0_32px_90px_rgba(0,0,0,0.55)]'
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

export default GalleryTab
