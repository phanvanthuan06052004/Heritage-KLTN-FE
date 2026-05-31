import { ArrowLeft, Share, Star, MapPin, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { Button } from '~/components/common/ui/Button'
import { cn } from '~/lib/utils'
import {
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} from '~/store/apis/favoritesSlice'
import { setFavoriteStatus } from '~/store/slices/favoriteSlice'
import { selectFavoriteMap } from '~/store/slices/favoriteSlice'

const HeritageHeader = ({ data, isAuthenticated }) => {
  const dispatch = useDispatch()
  const favoriteMap = useSelector(selectFavoriteMap)
  const isFavorited = !!favoriteMap[data?._id]

  const [addToFavorites] = useAddToFavoritesMutation()
  const [removeFromFavorites] = useRemoveFromFavoritesMutation()

  const hasCoordinates =
    typeof data?.coordinates?.latitude === 'number' &&
    typeof data?.coordinates?.longitude === 'number'

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: data?.name,
        text: `Khám phá ${data?.name}`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link đã được sao chép')
    }
  }

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu yêu thích')
      return
    }
    const newState = !isFavorited
    dispatch(setFavoriteStatus({ heritageId: data._id, isFavorited: newState }))
    try {
      if (newState) {
        await addToFavorites({ heritageId: data._id }).unwrap()
        toast.success('Đã thêm vào yêu thích')
      } else {
        await removeFromFavorites({ heritageId: data._id }).unwrap()
        toast.success('Đã xóa khỏi yêu thích')
      }
    } catch {
      dispatch(setFavoriteStatus({ heritageId: data._id, isFavorited: !newState }))
      toast.error('Có lỗi xảy ra, thử lại sau')
    }
  }

  const rating = data?.stats?.averageRating || data?.averageRating || 0
  const totalReviews = data?.stats?.totalReviews || data?.totalReviews || 0

  return (
    <div className='relative overflow-hidden border-b border-museum-gold/20'>
      {/* Hero Image */}
      <div className='absolute inset-0'>
        <img
          src={data?.images?.[0] || 'https://placehold.co/1600x900/0B0A07/F7EFE2?text=Di+tích'}
          alt={data?.name}
          className='h-full w-full object-cover'
        />
        {/* Depth gradients */}
        <div className='absolute inset-0 bg-gradient-to-t from-museum-black via-museum-black/70 to-museum-black/35' />
        <div className='absolute inset-0 bg-gradient-to-r from-museum-black/90 via-museum-black/50 to-transparent' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(216,162,74,0.22),transparent_24rem),radial-gradient(circle_at_80%_20%,rgba(47,107,85,0.12),transparent_20rem)]' />
      </div>

      {/* Content overlay */}
      <div className='relative flex min-h-[65vh] flex-col justify-end pb-10 pt-28 sm:pt-36'>
        <div className='lcn-container-x'>
          {/* Back link */}
          <Link to='/heritages' className='mb-6 inline-flex items-center gap-2 text-sm text-museum-muted transition-colors hover:text-museum-gold-light'>
            <ArrowLeft size={16} />
            <span>Danh sách di tích</span>
          </Link>

          <div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
            <div className='max-w-2xl space-y-4'>
              {/* Province & Dynasty badges */}
              {(data?.province || data?.dynasty) && (
                <div className='flex flex-wrap gap-2'>
                  {data.province && (
                    <span className='rounded-full border border-museum-gold/30 bg-museum-gold/15 px-3 py-1 text-xs font-semibold text-museum-gold-light backdrop-blur-sm'>
                      {data.province}
                    </span>
                  )}
                  {data.dynasty && (
                    <span className='rounded-full border border-museum-seal/30 bg-museum-seal/15 px-3 py-1 text-xs font-semibold text-museum-gold-light backdrop-blur-sm'>
                      {data.dynasty}
                    </span>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className='font-display text-4xl font-semibold leading-[1.1] text-museum-ivory sm:text-5xl lg:text-6xl'>
                {data?.name}
              </h1>

              {/* Location + Rating row */}
              <div className='flex flex-wrap items-center gap-4 text-sm'>
                {data?.location && (
                  <span className='inline-flex items-center gap-1.5 text-museum-muted'>
                    <MapPin size={15} className='text-museum-gold-light' />
                    {data.location}
                  </span>
                )}
                {rating > 0 && (
                  <span className='inline-flex items-center gap-1.5 text-museum-muted'>
                    <Star size={15} className='fill-museum-gold-light text-museum-gold-light' />
                    <span className='font-medium text-museum-ivory'>{rating}</span>
                    <span>({totalReviews} đánh giá)</span>
                  </span>
                )}
                {hasCoordinates && (
                  <span className='rounded-full border border-museum-gold/20 bg-museum-ivory/8 px-2.5 py-0.5 text-xs text-museum-muted'>
                    {data.coordinates.latitude}, {data.coordinates.longitude}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex gap-3'>
              <Button
                variant='outline'
                size='icon'
                onClick={handleFavorite}
                className={cn(
                  'rounded-full border-museum-gold/35 bg-museum-ivory/10 text-museum-ivory backdrop-blur-sm hover:bg-museum-gold hover:text-museum-black',
                  isFavorited && 'border-museum-seal bg-museum-seal/20 text-museum-seal hover:bg-museum-seal hover:text-museum-ivory'
                )}
                aria-label={isFavorited ? 'Xóa yêu thích' : 'Thêm yêu thích'}
              >
                <Heart size={18} className={cn(isFavorited && 'fill-current')} />
              </Button>
              <Button
                variant='outline'
                onClick={handleShare}
                className='rounded-full border-museum-gold/35 bg-museum-ivory/10 text-museum-ivory backdrop-blur-sm hover:bg-museum-gold hover:text-museum-black'
              >
                <Share size={16} />
                <span>Chia sẻ</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeritageHeader