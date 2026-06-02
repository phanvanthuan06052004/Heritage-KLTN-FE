import { memo, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Heart,
  Languages,
  MapPin,
  Share2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import { Button } from '~/components/common/ui/Button'
import { cn } from '~/lib/utils'
import { useLanguage } from '~/hooks/useLanguage'
import {
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} from '~/store/apis/favoritesSlice'
import { setFavoriteStatus } from '~/store/slices/favoriteSlice'
import { selectFavoriteMap } from '~/store/slices/favoriteSlice'

const FALLBACK_HERO = 'https://placehold.co/1800x1200/5f3b1d/f8f1e7?text=Di+san+Viet+Nam'

const HeritageHeader = memo(({ data, isAuthenticated }) => {
  const dispatch = useDispatch()
  const favoriteMap = useSelector(selectFavoriteMap)
  const isFavorited = !!favoriteMap[data?._id]
  const { language, changeLanguage } = useLanguage()
  const heroRef = useRef(null)

  const [addToFavorites] = useAddToFavoritesMutation()
  const [removeFromFavorites] = useRemoveFromFavoritesMutation()

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    let rafId = null
    const handleScroll = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        const y = window.scrollY
        hero.style.setProperty('--scroll-y', `${y * 0.35}px`)
        hero.style.transform = `translate3d(0, ${y * 0.25}px, 0)`
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [])

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

  const toggleLanguage = () => {
    const nextLanguage = language === 'vi' ? 'en' : 'vi'
    changeLanguage(nextLanguage)
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: nextLanguage } }))
  }

  const heroImage = data?.images?.[0] || data?.media?.find((item) => !item?.type || item.type === 'image')?.url || FALLBACK_HERO
  const locationName = data?.primaryLocation?.address || data?.primaryLocation?.name || data?.location
  const typeLabel = data?.type || 'Di sản văn hóa'

  return (
    <section className='relative h-[80vh] min-h-[520px] w-full overflow-hidden'>
      <div
        ref={heroRef}
        className='absolute inset-0 bg-cover bg-center will-change-transform'
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />
      <div className='absolute inset-0 bg-gradient-to-b from-museum-black/35 via-museum-black/42 to-museum-black' />
      <div className='absolute top-20 left-10 h-32 w-32 rounded-full bg-museum-gold/18 blur-3xl' />
      <div className='absolute bottom-32 right-16 h-48 w-48 rounded-full bg-museum-jade/20 blur-3xl' />

      <div className='relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6 lg:px-8'>
        <Link
          to='/heritages'
          className='mb-8 inline-flex w-fit items-center gap-2 rounded-full bg-museum-ivory/10 px-4 py-2 text-sm font-medium text-museum-ivory backdrop-blur-md transition-colors hover:bg-museum-ivory/20'
        >
          <ArrowLeft className='h-4 w-4' />
          Quay lại khám phá
        </Link>

        <div className='mb-5 flex flex-wrap gap-3'>
          <span className='inline-flex items-center gap-2 rounded-full bg-museum-gold px-4 py-2 text-sm font-semibold text-museum-black shadow-lg'>
            <Building2 className='h-4 w-4' />
            {typeLabel}
          </span>
          {locationName && (
            <span className='inline-flex items-center gap-2 rounded-full bg-museum-ivory/15 px-4 py-2 text-sm font-medium text-museum-ivory backdrop-blur-md'>
              <MapPin className='h-4 w-4' />
              {locationName}
            </span>
          )}
        </div>

        <h1 className='max-w-4xl text-balance font-display text-4xl font-bold leading-tight text-museum-ivory drop-shadow-lg sm:text-6xl md:text-7xl'>
          {data?.name}
        </h1>

        <div className='mt-8 flex flex-wrap gap-3'>
          <Button
            type='button'
            onClick={handleFavorite}
            className={cn(
              'rounded-full bg-museum-ivory/15 px-5 text-museum-ivory backdrop-blur-md hover:bg-museum-ivory/25',
              isFavorited && 'bg-museum-gold text-museum-black hover:bg-museum-gold-light',
            )}
          >
            <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
            {isFavorited ? 'Đã lưu' : 'Yêu thích'}
          </Button>
          <Button
            type='button'
            onClick={handleShare}
            className='rounded-full bg-museum-ivory/15 px-5 text-museum-ivory backdrop-blur-md hover:bg-museum-ivory/25'
          >
            <Share2 className='h-5 w-5' />
            Chia sẻ
          </Button>
          <Button
            type='button'
            onClick={toggleLanguage}
            className='rounded-full bg-museum-ivory/15 px-5 text-museum-ivory backdrop-blur-md hover:bg-museum-ivory/25'
          >
            <Languages className='h-5 w-5' />
            {language === 'vi' ? 'VI' : 'EN'}
          </Button>
        </div>

        <div className='absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-museum-ivory/80'>
          <ChevronRight className='h-8 w-8 rotate-90' />
        </div>
      </div>
    </section>
  )
})

export default HeritageHeader
