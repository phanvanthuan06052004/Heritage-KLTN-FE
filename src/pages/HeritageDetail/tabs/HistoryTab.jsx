import { Gavel } from 'lucide-react'

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
          <p className='text-justify leading-relaxed text-museum-parchment'>{event?.description}</p>
        </li>
      ))}
    </ul>
  )
}

export default HistoryTab
