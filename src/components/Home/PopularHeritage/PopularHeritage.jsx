import { ArrowRight, Landmark, MoveRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import Title from '~/components/common/Title'
import HeritageList from '~/components/Heritage/HeritageList'
import HeritageSkeleton from '~/components/Heritage/HeritageSkeleton'
import { Button } from '~/components/common/ui/Button'
import { useGetHeritagesQuery } from '~/store/apis/heritageApi'
import { useLanguage, useLanguageChange } from '~/hooks/useLanguage'

const PopularHeritage = () => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [randomHeritages, setRandomHeritages] = useState([])
  
  // Fetch tất cả di tích
  const { data: response, isLoading, error, refetch } = useGetHeritagesQuery({
    page: 1,
    limit: 10,
    language
  })

  // Refetch when language changes
  useLanguageChange(() => {
    refetch()
  })

  useEffect(() => {
    if (response?.heritages) {
      // Logic để random di tích
      const shuffleArray = (array) => {
        const newArray = [...array]
        for (let i = newArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
        }
        return newArray
      }

      // Random và lấy 6 di tích
      const shuffledHeritages = shuffleArray(response.heritages)
      const selectedHeritages = shuffledHeritages.slice(0, 6)
      
      setRandomHeritages(selectedHeritages)
    }
  }, [response])

  return (
    <section>
      <div className='flex justify-between mb-10'>
        <Title icon={Landmark} title={t('home.popularHeritage')} />
        <Link to='/heritages' className='hidden sm:flex text-heritage items-center gap-2 hover:underline'>
          <span>{t('home.viewAll')}</span>
          <ArrowRight size={16} />
        </Link>
      </div>
      {
        isLoading ? (
          <HeritageSkeleton count={6} />
        ) : error ? (
          <div className='text-center py-12 text-destructive'>
            {t('home.loadingError')}
          </div>
        ) : (
          <>
            <HeritageList heritages={randomHeritages} />
            <Link to='/heritages' className='sm:hidden w-full'>
              <Button className='w-full mt-8'>
                {t('home.viewAllSites')}
                <MoveRight className='ml-2' size={16} />
              </Button>
            </Link>
          </>
        )
      }
    </section>
  )
}

export default PopularHeritage
