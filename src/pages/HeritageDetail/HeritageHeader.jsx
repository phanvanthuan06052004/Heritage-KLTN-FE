import { ArrowLeft, Share, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '~/components/common/ui/Button'

const HeritageHeader = ({ data }) => {
  const hasCoordinates =
    typeof data?.coordinates?.latitude === 'number' &&
    typeof data?.coordinates?.longitude === 'number'
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: data?.name,
        text: `Khám phá ${data?.name} - ${data?.description}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error))
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className='relative h-[52vh] min-h-[470px] overflow-hidden border-b border-museum-gold/20 sm:h-[58vh]'>
      <div className='absolute inset-0'>
        <img
          src={data?.images[0] || 'https://placehold.co/600x400?text=Di+t%C3%ADch+L%E1%BB%8Bch+s%E1%BB%AD&font=roboto'}
          alt={data?.name}
          loading='lazy'
          className='aspect-video w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(11,10,7,0.92)_0%,rgba(11,10,7,0.66)_48%,rgba(11,10,7,0.38)_100%)]'></div>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_28%_72%,rgba(216,162,74,0.28),transparent_22rem),radial-gradient(circle_at_78%_18%,rgba(47,107,85,0.18),transparent_24rem)]'></div>
      </div>
      <div className='absolute inset-x-0 bottom-0 lcn-container-x py-10'>
        <Link to='/heritages'>
          <Button variant='ghost' size='sm' className='mb-5 rounded-full text-museum-ivory hover:bg-museum-ivory/12 hover:text-museum-gold-light'>
            <ArrowLeft size={16} />
            <span>Back to heritage list</span>
          </Button>
        </Link>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <div className='flex items-center space-x-2 mb-2'>
              {hasCoordinates && (
                <>
                  <span className='rounded-full bg-museum-gold px-3 py-1 text-xs font-semibold text-museum-black'>
                    {data.coordinates.latitude}
                  </span>
                  <span className='rounded-full border border-museum-gold/25 bg-museum-ivory/10 px-3 py-1 text-xs font-semibold text-museum-ivory backdrop-blur-sm'>
                    {data.coordinates.longitude}
                  </span>
                </>
              )}
            </div>
            <h1 className='font-display text-4xl font-semibold text-museum-ivory sm:text-5xl lg:text-6xl'>
              {data?.name}
            </h1>
            <div className='mt-3 flex items-center text-museum-ivory'>
              <Star size={20} className='mr-1 fill-museum-gold-light text-museum-gold-light'/>
              <span className='font-medium'>{data?.stats?.averageRating || 0.0}</span>
              <span className='ml-1 text-sm text-museum-muted'>({data?.stats?.totalReviews || 0})</span>
            </div>
          </div>
          <div>
            <Button
              variant='outline'
              className='rounded-full border-museum-gold/35 bg-museum-ivory/10 text-museum-ivory backdrop-blur-sm hover:bg-museum-gold hover:text-museum-black'
              onClick={handleShare}
            >
              <Share size={16} />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeritageHeader
