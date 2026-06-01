import { BookOpen, Building2, Calendar, ExternalLink, MapPin, Sparkles } from 'lucide-react'

const getHost = (url) => {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

const InfoItem = ({ icon, label, children }) => {
  if (!children) return null

  return (
    <div className='rounded-2xl border border-museum-gold/12 bg-museum-ivory/[0.045] p-4'>
      <dt className='flex items-center gap-2 text-xs font-medium text-museum-muted'>
        {icon}
        {label}
      </dt>
      <dd className='mt-2 text-sm font-medium leading-6 text-museum-ivory'>{children}</dd>
    </div>
  )
}

const HeritageInfo = ({ data }) => {
  const hasCoordinates =
    typeof data?.coordinates?.latitude === 'number' &&
    typeof data?.coordinates?.longitude === 'number'
  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${data.coordinates.latitude},${data.coordinates.longitude}`
    : ''
  const location = data?.primaryLocation?.address || data?.primaryLocation?.name || data?.location
  const sourceHost = getHost(data?.sourceUrl)
  const sections = [
    ['overview', 'Tổng quan'],
    ['values', 'Kiến trúc & văn hóa'],
    ['history', 'Lịch sử'],
    ['gallery', 'Hình ảnh'],
    ['reviews', 'Đánh giá'],
    ['discussion', 'Hỏi đáp'],
  ]

  return (
    <aside className='sticky top-24 space-y-4 text-museum-ivory'>
      <nav className='rounded-3xl border border-museum-gold/14 bg-museum-black/36 p-3' aria-label='Nội dung trang'>
        {sections.map(([href, label]) => (
          <a
            key={href}
            href={`#${href}`}
            className='flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium text-museum-muted transition hover:bg-museum-gold/10 hover:text-museum-gold-light'
          >
            {label}
          </a>
        ))}
      </nav>

      <div className='rounded-3xl border border-museum-gold/18 bg-museum-black/42 p-5'>
        <h3 className='font-display text-xl font-semibold text-museum-gold-light'>Thông tin nhanh</h3>
        <dl className='mt-5 space-y-3'>
          <InfoItem icon={<Building2 className='h-4 w-4 text-museum-gold-light' />} label='Loại di sản'>{data?.type}</InfoItem>
          <InfoItem icon={<MapPin className='h-4 w-4 text-museum-gold-light' />} label='Địa điểm'>{location}</InfoItem>
          <InfoItem icon={<Sparkles className='h-4 w-4 text-museum-gold-light' />} label='Tọa độ'>
            {hasCoordinates ? `${data.coordinates.latitude}, ${data.coordinates.longitude}` : 'Chưa có tọa độ'}
          </InfoItem>
          <InfoItem icon={<Calendar className='h-4 w-4 text-museum-gold-light' />} label='Thời kỳ xây dựng'>{data?.constructionPeriod}</InfoItem>
          <InfoItem icon={<BookOpen className='h-4 w-4 text-museum-gold-light' />} label='Người sáng lập'>{data?.founder}</InfoItem>
          <InfoItem icon={<Sparkles className='h-4 w-4 text-museum-gold-light' />} label='Công nhận'>{data?.recognition}</InfoItem>
        </dl>
      </div>

      {(mapUrl || data?.sourceUrl) && (
        <div className='rounded-3xl border border-museum-gold/14 bg-museum-ivory/[0.045] p-3'>
          {mapUrl && (
            <a
              href={mapUrl}
              target='_blank'
              rel='noreferrer'
              className='flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold text-museum-ivory transition hover:bg-museum-gold/12 hover:text-museum-gold-light'
            >
              Mở bản đồ
              <ExternalLink className='h-4 w-4' />
            </a>
          )}
          {data?.sourceUrl && (
            <a
              href={data.sourceUrl}
              target='_blank'
              rel='noreferrer'
              className='flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold text-museum-ivory transition hover:bg-museum-gold/12 hover:text-museum-gold-light'
            >
              {sourceHost || 'Nguồn tham khảo'}
              <ExternalLink className='h-4 w-4' />
            </a>
          )}
        </div>
      )}
    </aside>
  )
}

export default HeritageInfo
