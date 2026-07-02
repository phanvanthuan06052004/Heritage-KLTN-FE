import { useTranslation } from 'react-i18next'


const HeritageInfo = ({ data }) => {
  const { t } = useTranslation()
  const hasCoordinates =
    typeof data?.coordinates?.latitude === 'number' &&
    typeof data?.coordinates?.longitude === 'number'

  return (
    <div className='museum-card sticky top-24 rounded-[2rem] p-6 text-museum-ivory'>
      <h3 className='font-display text-2xl font-semibold text-museum-gold-light mb-5'>{t('heritageInfo.titlee')}</h3>
      <dl className='space-y-5'>
        <div>
          <dt className='text-sm text-museum-muted'>{t('heritageInfo.address')}</dt>
          <dd className='mt-1 font-medium'>{data?.location}</dd>
        </div>
        <div>
          <dt className='text-sm text-museum-muted'>{t('heritageInfo.title')}</dt>
          <dd className='mt-1 font-medium'>National Heritage Site</dd>
        </div>
        <div>
          <dt className='text-sm text-museum-muted'>{t('heritageInfo.coordinates')}</dt>
          <dd className='mt-1 font-medium'>
            {hasCoordinates
              ? `${data.coordinates.latitude}, ${data.coordinates.longitude}`
              : 'Chưa có tọa độ'}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export default HeritageInfo
