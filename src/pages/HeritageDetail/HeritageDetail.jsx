import { useNavigate, useParams } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useGetHeritagesBySlugQuery, useGetHeritagesQuery } from '~/store/apis/heritageApi'
import HeritageCard from '~/components/Heritage/HeritageCard'
import HeritageDetailSkeleton from './HeritageDetailSkeleton'
import { Button } from '~/components/common/ui/Button'
import { selectCurrentUser } from '~/store/slices/authSlice'
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '~/components/common/ui/Dialog'
import {
  LeaderboardTable,
  HeritageKnowledgeTest,
  HeritageDetailTabs,
  HeritageFeatures,
  HeritageHeader
} from '~/components/lazyComponents'
import DiscussionSection from './DiscussionSection'
import ErrorBoundary from './ErrorBoundary'
import { useLanguage } from '~/hooks/useLanguage'

const HeritageDetail = () => {
  const { nameSlug } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { data, isFetching, isLoading, isError } = useGetHeritagesBySlugQuery(
    { nameSlug, language },
    { refetchOnMountOrArgChange: false }
  )
  const id = data?._id
  const userInfo = useSelector(selectCurrentUser)
  const isAuthenticated = !!userInfo
  const { data: allHeritages } = useGetHeritagesQuery(
    { page: 1, limit: 8, language },
    { skip: !id, refetchOnMountOrArgChange: false }
  )

  const related = useMemo(() => {
    if (!allHeritages?.heritages || !id) return []
    return [...allHeritages.heritages]
      .filter(item => item._id !== id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
  }, [allHeritages, id])

  const [activeFeature, setActiveFeature] = useState(null)

  const handleFeatureClick = (feature) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (feature === 'chatroom') {
      navigate(`/chat/heritage/${nameSlug}`, {
        state: { heritageName: data?.name, heritageId: id }
      })
      return
    }
    setActiveFeature(feature)
  }

  const closeFeatureDialog = () => setActiveFeature(null)

  if (isError) {
    return (
      <div className='museum-shell flex min-h-screen flex-col items-center justify-center px-4 pt-navbar-mobile sm:pt-navbar'>
        <div className='text-center text-museum-ivory'>
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
    <section className='museum-shell relative min-h-screen w-full pt-navbar-mobile sm:pt-navbar'>
      {/* ── Hero Header ── */}
      <HeritageHeader data={data} isAuthenticated={isAuthenticated} />

      {/* ── Tabs Content ── */}
      <div className='lcn-container-x'>
        <ErrorBoundary>
          <HeritageDetailTabs data={data} isAuthenticated={isAuthenticated} navigate={navigate} />
        </ErrorBoundary>
      </div>

      {/* ── Interactive Features ── */}
      <div className='lcn-container-x py-8'>
        <h2 className='mb-5 font-display text-xl font-semibold text-museum-ivory xl:sr-only sm:text-2xl'>
          {t('heritageDetail.interactiveFeatures')}
        </h2>
        <HeritageFeatures handleFeatureClick={handleFeatureClick} isAuthenticated={isAuthenticated} />
      </div>

      {/* ── Related Heritages ── */}
      {related.length > 0 && (
        <div className='lcn-container-x py-12'>
          <div className='mb-6'>
            <h2 className='font-display text-2xl font-semibold text-museum-ivory sm:text-3xl'>
              {t('heritageDetail.relatedHeritages')}
            </h2>
          </div>
          <div className='-mx-4 flex gap-5 overflow-x-auto px-4 pb-4 museum-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4'>
            {related.map((item) => (
              <div key={item._id} className='w-[280px] shrink-0 sm:w-auto'>
                <HeritageCard item={item} variant='museum' />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Discussion ── */}
      <div className='lcn-container-x py-12'>
        <DiscussionSection heritageId={id} />
      </div>

      {/* ── Dialogs ── */}
      <Dialog open={activeFeature === 'leaderboard'} onClose={closeFeatureDialog}>
        <DialogHeader>
          <DialogTitle>{t('heritageDetail.leaderboardTitle')}</DialogTitle>
          <DialogDescription>
            {t('heritageDetail.leaderboardDescription')} {data?.name}
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <LeaderboardTable
            heritageId={id}
            heritageName={data?.name}
            isOpen={activeFeature === 'leaderboard'}
          />
        </div>
      </Dialog>

      <Dialog open={activeFeature === 'knowledge-test'} onClose={closeFeatureDialog} className='max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>{t('heritageDetail.knowledgeTestTitle')}</DialogTitle>
          <DialogDescription>{t('heritageDetail.knowledgeTestDescription')} {data?.name}</DialogDescription>
        </DialogHeader>
        <div className='overflow-auto py-4'>
          <HeritageKnowledgeTest heritageId={id} heritageName={data?.name} />
        </div>
      </Dialog>
    </section>
  )
}

export default HeritageDetail