import { Gavel } from 'lucide-react'
import { sanitizeHtml } from '~/utils/htmlSanitizer'

const HistoryTab = ({ historicalEvents = [] }) => {
  if (!historicalEvents || historicalEvents.length === 0) {
    return <p className='text-museum-muted'>Chưa có sự kiện lịch sử nào được ghi nhận.</p>
  }

  return (
    <ul className='space-y-2'>
      {historicalEvents.map((event, index) => (
        <li className='mb-6 rounded-2xl border border-museum-gold/15 bg-museum-ivory/6 p-5 transition-transform hover:scale-[1.005]' key={index}>
          <div className='flex items-center mb-3'>
            <div className='w-10 h-10 flex items-center justify-center text-museum-gold-light bg-museum-gold/10 rounded-full flex-shrink-0'>
              <Gavel size={20} />
            </div>
            <h3 className='ml-4 text-lg font-semibold text-museum-ivory'>{event?.title}</h3>
          </div>
          <div
            className='space-y-3 text-justify leading-relaxed text-museum-parchment [&_a]:text-museum-gold-light [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-museum-gold/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_li]:ml-5 [&_ol]:list-decimal [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-museum-gold/20 [&_td]:p-2 [&_th]:border [&_th]:border-museum-gold/20 [&_th]:p-2 [&_ul]:list-disc'
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(event?.description || '') }}
          />
        </li>
      ))}
    </ul>
  )
}

export default HistoryTab
