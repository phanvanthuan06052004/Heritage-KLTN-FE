const VisionItem = ({ icon, title, description }) => (
  <div className='museum-card flex items-start rounded-3xl p-5'>
    <div className='mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-museum-gold/25 bg-museum-gold/10 text-museum-gold-light'>
      {icon}
    </div>
    <div>
      <h3 className='mb-2 font-display text-xl font-semibold text-museum-ivory'>{title}</h3>
      <p className='text-sm leading-7 text-museum-muted'>{description}</p>
    </div>
  </div>
)

export default VisionItem
