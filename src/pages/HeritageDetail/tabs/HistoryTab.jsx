import { Clock3 } from 'lucide-react'

const HistoryTab = ({ historicalEvents = [] }) => {
  if (!historicalEvents || historicalEvents.length === 0) {
    return <p className='text-museum-muted'>Chưa có sự kiện lịch sử nào được ghi nhận.</p>
  }

  return (
    <ol className='relative space-y-5 before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-museum-gold/18'>
      {historicalEvents.map((event, index) => (
        <li className='relative pl-14' key={index}>
          <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-museum-gold/22 bg-museum-black text-museum-gold-light'>
            <Clock3 size={18} />
          </div>
          <article className='rounded-3xl border border-museum-gold/14 bg-museum-ivory/[0.045] p-5 sm:p-6'>
            <div className='mb-3 flex items-start justify-between gap-4'>
              <h3 className='font-display text-xl font-semibold leading-snug text-museum-ivory'>{event?.title}</h3>
              <span className='shrink-0 rounded-full bg-museum-gold/12 px-2.5 py-1 text-xs font-semibold text-museum-gold-light'>
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <p className='max-w-[75ch] text-pretty leading-8 text-museum-parchment'>{event?.description}</p>
          </article>
        </li>
      ))}
    </ol>
  )
}

export default HistoryTab
