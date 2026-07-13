import { BookOpen, Loader2, ScrollText } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useGetKnowledgeTestsByHeritageQuery } from '~/store/apis/knowledgeTestApi'
import KnowledgeTestDialog from './KnowledgeTestDialog'
import { toast } from 'react-toastify'

const KnowledgeTestItem = ({ test, onClick }) => (
  <div
    onClick={() => onClick(test)}
    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(test)}
    className='bg-museum-parchment/30 border border-museum-gold/15 rounded-xl p-5 hover:border-museum-gold/50 hover:bg-museum-gold/5 cursor-pointer transition-all duration-300 flex items-start shadow-sm hover:shadow-museum-card border-l-4 border-l-museum-gold group'
    role='button'
    tabIndex={0}
    aria-label={`Bài kiểm tra ${test?.title}`}
  >
    {/* Seal icon prefix */}
    <div className='w-10 h-10 rounded-full bg-museum-gold/10 border border-museum-gold/30 flex items-center justify-center flex-shrink-0 mr-4 mt-0.5 group-hover:bg-museum-gold/20 transition-colors duration-300'>
      <ScrollText className='h-5 w-5 text-museum-gold' />
    </div>
    <div className='flex-1 min-w-0'>
      <h4 className='font-semibold text-lg mb-1.5 text-museum-espresso dark:text-museum-ivory group-hover:text-museum-gold transition-colors duration-300 font-display'>
        {test?.title}
      </h4>
      <p className='text-sm text-museum-muted line-clamp-3 mb-4 leading-relaxed'>{test?.content}</p>
      <div className='flex items-center text-sm text-museum-muted'>
        <span className='mr-5 flex items-center gap-1.5'>
          <i className="ri-file-list-2-line text-museum-gold text-base"></i>
          <span>{test?.totalAttempts || 0} lượt làm</span>
        </span>
        <span className='flex items-center gap-1.5'>
          <i className="ri-bar-chart-2-line text-museum-gold text-base"></i>
          <span>Điểm trung bình:</span>
          <span className='ml-1 font-semibold text-museum-gold'>
            {Number(test?.averageScore || 0).toFixed(2)}/100
          </span>
        </span>
      </div>
    </div>
  </div>
)

// Error message component
const ErrorMessage = ({ message, onRetry }) => (
  <div className='text-center py-6'>
    <p className='text-museum-seal font-medium'>{message}</p>
    <button
      onClick={onRetry}
      className='mt-4 px-5 py-2 border border-museum-gold/40 text-museum-gold rounded-lg hover:bg-museum-gold/10 transition-all duration-300'
    >
      Thử lại
    </button>
  </div>
)

// Loading component
const LoadingState = () => (
  <div className='flex justify-center items-center py-8'>
    <Loader2 className='h-6 w-6 animate-spin text-museum-gold' />
    <span className='ml-2 text-museum-muted'>Đang tải...</span>
  </div>
)

// Empty state component
const EmptyState = () => (
  <div className='flex flex-col items-center justify-center py-6 text-museum-muted'>
    <BookOpen className='h-8 w-8 mb-2' />
    <p>Chưa có bài kiểm tra nào cho di sản này.</p>
  </div>
)

const HeritageKnowledgeTest = ({ heritageId, heritageName }) => {
  const [activeTest, setActiveTest] = useState(null)

  // Use the custom hook with the heritageId
  const { data, isLoading, error, refetch } = useGetKnowledgeTestsByHeritageQuery(heritageId, {
    refetchOnMountOrArgChange: true,
  });

  const openTest = (test) => {
    setActiveTest(test)
    toast.info(`Bắt đầu bài kiểm tra: ${test?.title}`, { position: 'top-right' })
  }

  const closeTest = () => {
    setActiveTest(null)
    toast.info('Đã hoàn thành bài kiểm tra')
  }

  // Memoized tests list from data
  const availableTests = useMemo(() => (
    data?.data || []
  ), [data?.data])

  if (error) {
    const errorMessage = error?.data?.message || error?.error || 'An error occurred.'
    toast.error(errorMessage)
    return <ErrorMessage message={errorMessage} onRetry={refetch} />
  }

  return (
    <div className='overflow-auto pr-1'>
      {activeTest ? (
        <KnowledgeTestDialog
          open={Boolean(activeTest)}
          onClose={closeTest}
          testId={activeTest._id}
          testInfo={activeTest}
          heritageName={heritageName}
        />
      ) : isLoading ? (
        <LoadingState />
      ) : availableTests.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex justify-center items-center max-h-[70vh]">
          <KnowledgeTestItem
            key={availableTests[0]?._id}
            test={availableTests[0]}
            onClick={openTest}
          />
        </div>
      )}
    </div>
  )
}

export default HeritageKnowledgeTest
