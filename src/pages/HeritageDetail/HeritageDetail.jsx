import { useNavigate, useParams } from 'react-router-dom'
import { useState, Suspense, useMemo } from 'react'
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
  HeritageInfo,
  HeritageHeader
} from '~/components/lazyComponents'
import DiscussionSection from './DiscussionSection'
import ErrorBoundary from './ErrorBoundary'
import HeritageCheckIn from './HeritageCheckIn'
import CommunityFeed from '~/pages/HeritagePassport/CommunityFeed'
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
    {
      page: 1,
      limit: 8,
      language
    },
    {
      skip: !id,
      refetchOnMountOrArgChange: false
    }
  )

  // Memoize related heritages để tránh tính toán lại khi không cần thiết
  const getRandomRelatedHeritages = useMemo(() => {
    if (!allHeritages?.heritages || !id) return []

    // Lọc bỏ di tích hiện tại
    const otherHeritages = allHeritages.heritages.filter(item => item._id !== id)

    // Trộn ngẫu nhiên mảng
    const shuffled = [...otherHeritages].sort(() => Math.random() - 0.5)

    // Lấy 3 di tích đầu tiên

    return shuffled.slice(0, 3)
  }, [allHeritages, id])

  const [activeFeature, setActiveFeature] = useState(null)

  const handleFeatureClick = (feature) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (feature === 'chatroom') {
      navigate(`/chat/heritage/${nameSlug}`, {
        state: {
          heritageName: data?.name,
          heritageId: id
        }
      })
      return
    }
    setActiveFeature(feature)
  }

  const closeFeatureDialog = () => setActiveFeature(null)

  if (isError) {
    return (
      <div className='museum-shell min-h-screen pt-navbar-mobile sm:pt-navbar'>
        <div className='lcn-container-x py-16 text-center text-museum-ivory'>
          <h2 className='mb-4 font-display text-3xl font-semibold'>{t('heritageDetail.errorOccurred')}</h2>
          <p className='mb-6 text-museum-muted'>{t('heritageDetail.unableToLoad')}</p>
          <Button onClick={() => navigate('/heritages')} className='rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light'>{t('heritageDetail.backToList')}</Button>
        </div>
      </div>
    )
  }

  if (!data && !isLoading && !isFetching) return null

  return (
    <section className='museum-shell relative min-h-screen w-full pt-navbar-mobile sm:pt-navbar'>
      {isLoading || isFetching ? (
        <HeritageDetailSkeleton />
      ) : (
        <Suspense fallback={<HeritageDetailSkeleton />}>
          <HeritageHeader data={data} />
          <div className='lcn-container-x py-10'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-8'>
              <div className='sm:col-span-2 text-museum-ivory'>
                <ErrorBoundary>
                  <HeritageDetailTabs data={data} isAuthenticated={isAuthenticated} navigate={navigate} />
                </ErrorBoundary>
                <div className='mt-10'>
                  <h3 className='mb-4 font-display text-2xl font-semibold text-museum-gold-light'>{t('heritageDetail.interactiveFeatures')}</h3>
                  <HeritageFeatures handleFeatureClick={handleFeatureClick} />
                </div>
                {!isAuthenticated && (
                  <div className='mt-6 rounded-[2rem] border border-museum-gold/20 bg-museum-ivory/6 p-6 text-center'>
                    <h4 className='text-lg font-medium mb-2'>{t('heritageDetail.loginToExperience')}</h4>
                    <p className='text-sm text-museum-muted mb-4'>
                      {t('heritageDetail.loginToUseFeatures')}
                    </p>
                    <Button onClick={() => navigate('/login')} className='rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light'>{t('heritageDetail.loginNow')}</Button>
                  </div>
                )}
                <div className='mt-10'>
                  <CommunityFeed heritageId={id} />
                </div>
                <div className='mt-10'>
                  <h3 className='mb-4 font-display text-2xl font-semibold text-museum-gold-light'>{t('heritageDetail.relatedHeritages')}</h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                    {getRandomRelatedHeritages.map((item) => (
                      <HeritageCard key={item._id} item={item} variant='museum' />
                    ))}
                  </div>
                </div>
                <DiscussionSection heritageId={id} />
              </div>
              <div className='space-y-8'>
                <HeritageCheckIn id={id} data={data} />
                <HeritageInfo data={data} />
              </div>
            </div>
          </div>
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
            <div className='py-4 overflow-auto'>
              <HeritageKnowledgeTest heritageId={id} heritageName={data?.name} />
            </div>
          </Dialog>
        </Suspense>
      )}
    </section>
  )
}

export default HeritageDetail
