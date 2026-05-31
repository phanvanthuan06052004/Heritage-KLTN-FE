import { BookOpen, Loader2, FileText, BarChart3, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useGetKnowledgeTestsByHeritageQuery } from '~/store/apis/knowledgeTestApi'
import KnowledgeTestDialog from './KnowledgeTestDialog'

const HeritageKnowledgeTest = ({ heritageId, heritageName }) => {
  const [activeTest, setActiveTest] = useState(null)

  const { data, isLoading, error, refetch } = useGetKnowledgeTestsByHeritageQuery(heritageId, {
    skip: !heritageId,
  })

  const tests = useMemo(() => (
    Array.isArray(data?.data) ? data.data : []
  ), [data])

  const openTest = (test) => setActiveTest(test)
  const closeTest = () => setActiveTest(null)

  if (error) {
    return (
      <div className='museum-card relative overflow-hidden rounded-[2rem] border border-museum-seal/25 bg-museum-black/70 px-6 py-8 text-center text-museum-ivory'>
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(165,82,45,0.16),_transparent_30%)]' />
        <div className='relative flex flex-col items-center gap-3'>
          <div className='rounded-full border border-museum-seal/20 bg-museum-seal/15 p-3 text-museum-gold-light'>
            <AlertTriangle className='h-6 w-6' />
          </div>
          <p className='text-sm text-museum-gold-light'>Không thể tải bài kiểm tra</p>
          <button
            onClick={refetch}
            className='rounded-full border border-museum-gold/35 bg-museum-ivory/8 px-4 py-2 text-xs text-museum-ivory transition-colors hover:bg-museum-gold hover:text-museum-black'
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center gap-3 rounded-[2rem] border border-museum-gold/10 bg-museum-ivory/4 py-10'>
        <Loader2 className='h-5 w-5 animate-spin text-museum-gold-light' />
        <span className='text-sm text-museum-muted'>Đang tải bài kiểm tra...</span>
      </div>
    )
  }

  if (tests.length === 0) {
    return (
      <div className='museum-card relative overflow-hidden rounded-[2rem] border border-museum-gold/15 bg-museum-black/70 px-6 py-10 text-center text-museum-ivory'>
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,162,74,0.11),_transparent_26%)]' />
        <div className='relative flex flex-col items-center gap-3'>
          <div className='rounded-full border border-museum-gold/15 bg-museum-gold/10 p-3'>
            <BookOpen className='h-6 w-6 text-museum-gold-light' />
          </div>
          <p className='text-sm text-museum-muted'>Chưa có bài kiểm tra cho di tích này</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-5'>
      <div className='museum-card relative overflow-hidden rounded-[2rem] border border-museum-gold/20 bg-museum-black/75 p-6 text-museum-ivory shadow-museum-card'>
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(216,162,74,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(111,174,141,0.1),_transparent_24%)]' />
        <div className='relative flex items-start gap-4'>
          <div className='rounded-2xl border border-museum-gold/20 bg-museum-gold/10 p-3 text-museum-gold-light'>
            <Sparkles className='h-6 w-6' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-museum-gold-light/85'>Bài kiểm tra kiến thức</p>
            <h3 className='mt-2 font-display text-3xl font-semibold leading-tight text-museum-ivory'>
              Khám phá hiểu biết của bạn
            </h3>
            <p className='mt-3 max-w-2xl text-sm leading-6 text-museum-parchment/80'>
              Chọn một bài để bắt đầu, theo dõi tiến độ ngay trong hộp thoại và xem kết quả sau khi nộp.
            </p>
          </div>
        </div>
      </div>

      {tests.map((test) => (
        <button
          key={test.id}
          type='button'
          onClick={() => openTest(test)}
          className='group w-full rounded-[1.6rem] border border-museum-gold/15 bg-museum-ivory/5 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-museum-gold/40 hover:bg-museum-gold/8 hover:shadow-museum-gold'
        >
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <h4 className='mb-1.5 text-lg font-semibold text-museum-ivory transition-colors group-hover:text-museum-gold-light'>
                {test.title}
              </h4>
              <p className='line-clamp-2 text-sm leading-relaxed text-museum-muted'>
                {test.content}
              </p>
              <div className='mt-3 flex flex-wrap items-center gap-4 text-xs text-museum-muted'>
                <span className='inline-flex items-center gap-1.5'>
                  <FileText className='h-3.5 w-3.5 text-museum-gold-light' />
                  {test.totalAttempts || 0} lượt làm
                </span>
                <span className='inline-flex items-center gap-1.5'>
                  <BarChart3 className='h-3.5 w-3.5 text-museum-gold-light' />
                  {Number(test.averageScore || 0).toFixed(0)} điểm TB
                </span>
              </div>
            </div>
            <ArrowRight className='mt-1 h-5 w-5 shrink-0 text-museum-gold-light opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1' />
          </div>
        </button>
      ))}

      {activeTest && (
        <KnowledgeTestDialog
          open={Boolean(activeTest)}
          onClose={closeTest}
          testId={activeTest.id}
          testInfo={activeTest}
          heritageName={heritageName}
        />
      )}
    </div>
  )
}

export default HeritageKnowledgeTest