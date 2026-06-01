import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { BookOpen, Building2, Calendar, MapPin, PartyPopper, Sparkles } from 'lucide-react'

import HeritageDetailSkeleton from './HeritageDetailSkeleton'
import { Button } from '~/components/common/ui/Button'
import { selectCurrentUser } from '~/store/slices/authSlice'
import { HeritageDetailTabs, HeritageHeader } from '~/components/lazyComponents'
import ErrorBoundary from './ErrorBoundary'
import { useLanguage } from '~/hooks/useLanguage'
import { useGetHeritagesBySlugQuery } from '~/store/apis/heritageApi'
import { cn } from '~/lib/utils'

const getHtmlValue = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.description || ''
}

const getDetailSections = (data) => [
  { id: 'overview', label: 'Tổng quan', icon: <Sparkles className='h-4 w-4' />, enabled: true },
  { id: 'history', label: 'Lịch sử', icon: <BookOpen className='h-4 w-4' />, enabled: Boolean(data?.history || data?.additionalInfo?.historicalEvents?.length) },
  { id: 'architecture', label: 'Kiến trúc', icon: <Building2 className='h-4 w-4' />, enabled: Boolean(data?.architecture || data?.culturalSignificance || getHtmlValue(data?.legends)) },
  { id: 'timeline', label: 'Dòng thời gian', icon: <Calendar className='h-4 w-4' />, enabled: Boolean(data?.timelines?.length || data?.additionalInfo?.historicalEvents?.length) },
  { id: 'festivals', label: 'Lễ hội', icon: <PartyPopper className='h-4 w-4' />, enabled: Boolean(getHtmlValue(data?.festivals)) },
  { id: 'gallery', label: 'Thư viện ảnh', icon: <Sparkles className='h-4 w-4' />, enabled: Boolean(data?.images?.length || data?.media?.some((item) => !item?.type || item.type === 'image')) },
  { id: 'location', label: 'Vị trí', icon: <MapPin className='h-4 w-4' />, enabled: Boolean(data?.location || data?.primaryLocation || data?.coordinates) },
]

const HeritageDetail = () => {
  const { nameSlug } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [activeSection, setActiveSection] = useState('overview')
  const { data, isFetching, isLoading, isError } = useGetHeritagesBySlugQuery(
    { nameSlug, language },
    { refetchOnMountOrArgChange: false },
  )
  const userInfo = useSelector(selectCurrentUser)
  const isAuthenticated = !!userInfo

  const detailSections = useMemo(
    () => getDetailSections(data).filter((section) => section.enabled),
    [data],
  )

  useEffect(() => {
    if (!detailSections.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible?.target?.id) {
          setActiveSection(visible.target.id)
        }
      },
      { rootMargin: '-34% 0px -54% 0px', threshold: [0.12, 0.24, 0.4] },
    )

    detailSections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [detailSections])

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  if (isError) {
    return (
      <div className='museum-shell flex min-h-screen flex-col items-center justify-center px-4 pt-navbar-mobile text-museum-ivory sm:pt-navbar'>
        <div className='text-center'>
          <h2 className='mb-4 font-display text-3xl font-semibold'>{t('heritageDetail.errorOccurred')}</h2>
          <p className='mb-6 text-museum-muted'>{t('heritageDetail.unableToLoad')}</p>
          <Button onClick={() => navigate('/heritages')} className='rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light'>
            {t('heritageDetail.backToList')}
          </Button>
        </div>
      </div>
    )
  }

  if (!data && !isLoading && !isFetching) return null

  if (isLoading || isFetching) {
    return (
      <section className='museum-shell relative min-h-screen w-full pt-navbar-mobile sm:pt-navbar'>
        <HeritageDetailSkeleton />
      </section>
    )
  }

  return (
    <section className='museum-shell relative min-h-screen w-full pt-navbar-mobile text-museum-ivory sm:pt-navbar'>
      <HeritageHeader data={data} isAuthenticated={isAuthenticated} />

      <div className='sticky top-navbar-mobile z-30 border-b border-museum-gold/14 bg-museum-black/86 backdrop-blur-xl sm:top-navbar'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <nav className='museum-scrollbar flex gap-1 overflow-x-auto py-3' aria-label='Điều hướng nội dung di sản'>
            {detailSections.map(({ id: sectionId, label, icon }) => (
              <button
                key={sectionId}
                type='button'
                onClick={() => scrollToSection(sectionId)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  activeSection === sectionId
                    ? 'scale-105 bg-museum-gold text-museum-black shadow-museum-card'
                    : 'text-museum-muted hover:bg-museum-ivory/8 hover:text-museum-gold-light',
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <ErrorBoundary>
          <HeritageDetailTabs data={data} isAuthenticated={isAuthenticated} navigate={navigate} />
        </ErrorBoundary>
      </main>
    </section>
  )
}

export default HeritageDetail
