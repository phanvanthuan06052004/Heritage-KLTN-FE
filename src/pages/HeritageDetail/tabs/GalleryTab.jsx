const GalleryTab = ({ images = [], name = 'Di tích' }) => {
  if (!images || images.length === 0) {
    return <div className='col-span-3 py-8 text-center text-museum-muted'>Chưa có hình ảnh cho di tích này.</div>
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      {images.map((image, index) => (
        <div
          key={index}
          className='flex items-center justify-center overflow-hidden rounded-2xl border border-museum-gold/15 bg-museum-ivory/8'
          style={{ width: '264px', height: '168px', maxWidth: '100%' }}
        >
          <img
            src={image || 'https://placehold.co/600x400?text=Di+t%C3%ADch+L%E1%BB%8Bch+s%E1%BB%AD&font=roboto'}
            alt={`${name} - Ảnh ${index + 1}`}
            className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
            loading='lazy'
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        </div>
      ))}
    </div>
  )
}

export default GalleryTab
