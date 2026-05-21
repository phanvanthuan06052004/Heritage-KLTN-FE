import { useTranslation } from 'react-i18next'


const HeritageInfo = ({ data }) => {
  const { t } = useTranslation()
  const hasCoordinates =
    typeof data?.coordinates?.latitude === 'number' &&
    typeof data?.coordinates?.longitude === 'number'

  return (
    <div className='border rounded-lg p-6 sticky top-24'>
      <h3 className='lcn-heritage-detail-title mb-4'>{t('heritageInfo.titlee')}</h3>
      <dl className='space-y-4'>
        <div>
          <dt className='text-sm text-muted-foreground'>{t('heritageInfo.address')}</dt>
          <dd className='font-medium'>{data?.location}</dd>
        </div>
        <div>
          <dt className='text-sm text-muted-foreground'>{t('heritageInfo.title')}</dt>
          <dd className='font-medium'>National Heritage Site</dd>
        </div>
        <div>
          <dt className='text-sm text-muted-foreground'>{t('heritageInfo.coordinates')}</dt>
          <dd className='font-medium'>
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
