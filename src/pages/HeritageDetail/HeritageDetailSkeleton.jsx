
const HeritageDetailSkeleton = () => {
  return (
    <div className='mx-auto max-w-[1600px] px-3 py-8 sm:px-4 lg:px-5 2xl:px-6'>
      <div className='animate-pulse'>
        <div className='mb-8 h-[52vh] rounded-3xl border border-museum-gold/15 bg-museum-ivory/8'></div>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]'>
          <div>
            <div className='mb-4 h-8 w-64 rounded bg-museum-ivory/12'></div>
            <div className='mb-2 h-4 rounded bg-museum-ivory/10'></div>
            <div className='mb-2 h-4 rounded bg-museum-ivory/10'></div>
            <div className='mb-8 h-4 rounded bg-museum-ivory/10'></div>
            <div className='mb-6 flex space-x-2'>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className='h-10 flex-1 rounded-full bg-museum-ivory/10'></div>
              ))}
            </div>
            <div className='mb-8 h-80 rounded-3xl bg-museum-ivory/8'></div>
          </div>
          <div>
            <div className='h-80 rounded-3xl border border-museum-gold/15 bg-museum-ivory/8'></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeritageDetailSkeleton
