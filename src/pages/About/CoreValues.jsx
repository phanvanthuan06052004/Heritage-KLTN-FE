import { useTranslation } from 'react-i18next'
import { coreValues } from './data/coreValuesData'

const CoreValues = () => {
  const { t } = useTranslation()

  const translatedValues = [
    { ...coreValues[0], title: t('about.coreValuesItems.accuracy.title'), description: t('about.coreValuesItems.accuracy.description') },
    { ...coreValues[1], title: t('about.coreValuesItems.preservation.title'), description: t('about.coreValuesItems.preservation.description') },
    { ...coreValues[2], title: t('about.coreValuesItems.innovation.title'), description: t('about.coreValuesItems.innovation.description') },
    { ...coreValues[3], title: t('about.coreValuesItems.collaboration.title'), description: t('about.coreValuesItems.collaboration.description') },
    { ...coreValues[4], title: t('about.coreValuesItems.accessibility.title'), description: t('about.coreValuesItems.accessibility.description') },
    { ...coreValues[5], title: t('about.coreValuesItems.education.title'), description: t('about.coreValuesItems.education.description') }
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
      {translatedValues.map((value, index) => (
        <div key={index} className='bg-white border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow h-full'>
          <div className='text-4xl mb-4 text-center' aria-hidden='true'>{value.icon}</div>
          <h3 className='text-xl font-bold mb-3 text-center text-heritage-dark'>{value.title}</h3>
          <p className='text-justify'>{value.description}</p>
        </div>
      ))}
    </div>
  )
}

export default CoreValues
