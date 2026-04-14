import { lazy, Suspense } from 'react'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Title from '~/components/common/Title'
import { featuredData } from './featuredData'

const FeatureItem = lazy(() => import('./FeatureItem'))

const FeatureHighlight = () => {
  const { t } = useTranslation()
  
  const translatedFeatures = [
    {
      ...featuredData[0],
      title: t('home.features.knowledgeQuiz.title'),
      description: t('home.features.knowledgeQuiz.description')
    },
    {
      ...featuredData[1],
      title: t('home.features.rolePlay.title'),
      description: t('home.features.rolePlay.description')
    },
    {
      ...featuredData[2],
      title: t('home.features.mapExplore.title'),
      description: t('home.features.mapExplore.description')
    }
  ]
  
  return (
    <section>
      <Title icon={Sparkles} title={t('home.features.title')} />
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10'>
        {translatedFeatures?.map((item) => (
          <div key={item._id} className='h-full'>
            <Suspense fallback={<div className='animate-pulse bg-gray-200 rounded-lg h-[300px] w-full' />}>
              <FeatureItem item={item} className='h-full'/>
            </Suspense>
          </div>   
        ))}
      </div>
    </section>
  )
}

export default FeatureHighlight
