import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Clock, ChevronLeft, ChevronRight, Loader2, AlertTriangle, Award, XCircle, RotateCcw, ScrollText } from 'lucide-react'
import { cn } from '~/lib/utils'
import { useLazyGetKnowledgeTestByIdQuery, useSubmitKnowledgeTestAttemptMutation } from '~/store/apis/knowledgeTestApi'
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '~/components/common/ui/Dialog'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/store/slices/authSlice'

// Constants
const DEFAULT_TIME_PER_QUESTION = 120 // 2 minutes per question
const TRANSITION_DELAY = 300

// Sub-components
const getPerformanceLabel = (score) => {
  if (score >= 90) return { label: 'Xuất sắc!', emoji: '👑', color: 'text-museum-gold-light' }
  if (score >= 75) return { label: 'Rất tốt!', emoji: '🌟', color: 'text-museum-gold' }
  if (score >= 60) return { label: 'Tốt!', emoji: '👍', color: 'text-museum-jade' }
  if (score >= 40) return { label: 'Khá', emoji: '📖', color: 'text-museum-terracotta' }
  return { label: 'Cần cố gắng thêm', emoji: '💪', color: 'text-museum-seal' }
}

const TestResults = ({ results, onClose, onRetry }) => {
  const score = results?.score ?? 0
  const { label, emoji, color } = getPerformanceLabel(score)

  return (
    <div className='space-y-6 animate-fade-in'>
      {/* Header */}
      <div className='text-center'>
        <div className='w-16 h-16 mx-auto mb-3 rounded-full bg-museum-gold/10 border-2 border-museum-gold/30 flex items-center justify-center'>
          <Award className='h-8 w-8 text-museum-gold-light' />
        </div>
        <h3 className='text-xl font-semibold text-museum-espresso dark:text-museum-ivory font-display'>
          Kết quả bài kiểm tra
        </h3>
      </div>

      {/* Score Card */}
      <div className='bg-museum-parchment/30 border border-museum-gold/20 rounded-xl p-6 text-center shadow-museum-card'>
        <div className='text-5xl font-bold font-display text-museum-gold-light mb-1 tracking-tight'>
          {score.toFixed(2)}
        </div>
        <div className='text-sm text-museum-muted mb-3'>trên 100 điểm</div>
        <div className={cn('text-lg font-semibold flex items-center justify-center gap-2', color)}>
          <span>{emoji}</span>
          <span>{label}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3'>
        <button
          onClick={onRetry}
          className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-museum-gold/50 text-museum-gold rounded-lg hover:bg-museum-gold/10 hover:border-museum-gold transition-all duration-300'
        >
          <RotateCcw className='h-4 w-4' />
          Làm lại
        </button>
        <button
          onClick={onClose}
          className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-museum-gold text-museum-charcoal rounded-lg hover:bg-museum-gold-light transition-all duration-300 font-medium'
        >
          <XCircle className='h-4 w-4' />
          Đóng
        </button>
      </div>
    </div>
  )
}

const TestError = ({ onClose }) => (
  <div className='text-center py-8 space-y-4 animate-fade-in'>
    <div className='rounded-full bg-museum-seal/10 p-3 w-16 h-16 mx-auto flex items-center justify-center border border-museum-seal/20'>
      <AlertTriangle className='h-8 w-8 text-museum-seal' />
    </div>
    <div>
      <p className='text-lg font-medium text-museum-espresso dark:text-museum-ivory'>Không thể tải bài kiểm tra</p>
      <p className='text-museum-muted mt-1'>Vui lòng thử lại sau</p>
    </div>
    <button 
      onClick={onClose} 
      className='px-6 py-2 border border-museum-gold/40 text-museum-gold rounded-lg hover:bg-museum-gold/10 transition-all duration-300'
    >
      Đóng
    </button>
  </div>
)

const TestLoading = () => (
  <div className='flex flex-col items-center justify-center py-12 animate-fade-in'>
    <div className='relative'>
      <Loader2 className='h-10 w-10 animate-spin text-museum-gold mb-4' />
      <div className='absolute inset-0 rounded-full border-2 border-museum-gold/20 border-t-museum-gold animate-spin' style={{ animationDuration: '2s' }} />
    </div>
    <p className='text-museum-muted'>Đang tải bài kiểm tra...</p>
  </div>
)

const QuestionOption = ({ option, isSelected, isCorrect, isIncorrect, showResult, onSelect }) => (
  <div
    onClick={() => {
      if (showResult) return
      onSelect()
    }}
    className={cn(
      'border rounded-xl p-4 cursor-pointer transition-all duration-300',
      showResult && isCorrect
        ? 'border-museum-jade bg-museum-jade/10 shadow-sm'
        : showResult && isIncorrect
          ? 'border-museum-seal bg-museum-seal/5 shadow-sm'
          : isSelected
            ? 'border-museum-gold bg-museum-gold/10 shadow-md'
            : 'border-museum-muted/25 bg-white/40 hover:border-museum-gold/60 hover:bg-museum-gold/5 hover:shadow-md'
    )}
  >
    <div className='flex items-center gap-3'>
      <div className={cn(
        'w-5 h-5 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all duration-300',
        showResult && isCorrect
          ? 'border-museum-jade bg-museum-jade text-white'
          : showResult && isIncorrect
            ? 'border-museum-seal bg-museum-seal text-white'
            : isSelected
              ? 'border-museum-gold bg-museum-gold/20'
              : 'border-museum-muted/40 bg-white'
      )}>
        {showResult && isCorrect && <span className='text-white text-xs'>✓</span>}
        {showResult && isIncorrect && <span className='text-white text-xs'>✕</span>}
        {!showResult && isSelected && <span className='text-museum-gold text-xs font-bold'>✓</span>}
      </div>
      <span className={cn(
        'text-base transition-colors duration-200',
        showResult && isCorrect
          ? 'text-museum-jade font-medium'
          : showResult && isIncorrect
            ? 'text-museum-seal/80'
            : 'text-museum-espresso dark:text-museum-ivory'
      )}>{option.optionText}</span>
    </div>
  </div>
)

const NavigationButtons = ({ 
  currentQuestionIndex, 
  onPrev, 
  onNext, 
  onSubmit, 
  isSubmitting, 
  isTransitioning,
  isLastQuestion 
}) => (
  <div className='flex justify-between pt-4 mt-6 border-t border-museum-gold/15'>
    <button
      onClick={onPrev}
      disabled={currentQuestionIndex === 0 || isTransitioning}
      className={cn(
        'flex items-center px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium',
        currentQuestionIndex === 0 || isTransitioning 
          ? 'border border-museum-muted/20 text-museum-muted/40 cursor-not-allowed' 
          : 'border border-museum-gold/50 text-museum-gold hover:bg-museum-gold/10 hover:border-museum-gold'
      )}
      aria-label='Câu trước'
    >
      <ChevronLeft className='h-4 w-4 mr-1.5' />
      Câu trước
    </button>

    <button
      onClick={isLastQuestion ? onSubmit : onNext}
      disabled={isSubmitting || isTransitioning}
      className={cn(
        'flex items-center px-5 py-2 rounded-lg transition-all duration-300 text-sm font-medium',
        isSubmitting || isTransitioning 
          ? 'bg-museum-gold/40 text-museum-charcoal/60 cursor-not-allowed' 
          : 'bg-museum-gold text-museum-charcoal hover:bg-museum-gold-light hover:shadow-lg hover:shadow-museum-gold/20 active:scale-95'
      )}
      aria-label={isLastQuestion ? 'Nộp bài' : 'Câu tiếp theo'}
    >
      {isSubmitting ? (
        <>
          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          Đang nộp...
        </>
      ) : isLastQuestion ? (
        'Nộp bài'
      ) : (
        <>
          Câu tiếp theo
          <ChevronRight className='h-4 w-4 ml-1.5' />
        </>
      )}
    </button>
  </div>
)

const QuestionPagination = ({ 
  questions, 
  currentIndex, 
  answeredQuestions, 
  onSelectQuestion 
}) => (
  <div className='flex flex-wrap gap-2 justify-center pt-4'>
    {questions.map((question, index) => (
      <button
        key={question.questionId}
        onClick={() => onSelectQuestion(index)}
        className={cn(
          'w-8 h-8 rounded-full text-xs font-medium transition-all duration-300 border-2',
          index === currentIndex
            ? 'bg-museum-gold border-museum-gold text-museum-charcoal shadow-md shadow-museum-gold/20'
            : answeredQuestions[question.questionId]
              ? 'bg-museum-jade/10 border-museum-jade/40 text-museum-jade'
              : 'bg-transparent border-museum-muted/25 text-museum-muted hover:border-museum-gold/50 hover:text-museum-gold'
        )}
        aria-label={`Câu hỏi ${index + 1}`}
        aria-current={index === currentIndex ? 'true' : 'false'}
      >
        {index + 1}
      </button>
    ))}
  </div>
)

// Main component
const KnowledgeTestDialog = ({ open, onClose, testId, testInfo }) => {
  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [results, setResults] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const userInfo = useSelector(selectCurrentUser)

  // Refs
  const contentRef = useRef(null)
  const timerRef = useRef(null)
  
  // API hooks
  const [fetchTest, { data: test, isLoading, isFetching, error }] = useLazyGetKnowledgeTestByIdQuery()
  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitKnowledgeTestAttemptMutation()

  const testData = test?.data

  // Memoized values
  const currentQuestion = useMemo(() => {
    console.log('Current question data:', testData?.questions?.[currentQuestionIndex]) // Debug dữ liệu câu hỏi
    return testData?.questions?.[currentQuestionIndex] || { questionId: '', options: [] }
  }, [testData, currentQuestionIndex])
  
  const totalQuestions = useMemo(() => 
    testData?.questions?.length || 0, 
    [testData]
  )
  
  const progressPercentage = useMemo(() => 
    ((currentQuestionIndex + 1) / (totalQuestions || 1)) * 100, 
    [currentQuestionIndex, totalQuestions]
  )
  
  const isLastQuestion = useMemo(() => 
    currentQuestionIndex === totalQuestions - 1, 
    [currentQuestionIndex, totalQuestions]
  )

  // Helper functions
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const resetTest = useCallback(() => {
    setResults(null)
    setSelectedAnswers({})
    setCurrentQuestionIndex(0)
    setTimeLeft(null)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTransition = useCallback((callback) => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      callback()
      setIsTransitioning(false)
    }, TRANSITION_DELAY)
  }, [isTransitioning])

  // Event handlers
  const handleAnswerSelect = useCallback((questionId, optionId) => {
    if (results) return // Prevent changes after submission
    console.log('Selecting answer:', { questionId, optionId }) // Debug chọn đáp án

    setSelectedAnswers(prev => {
      const updated = {
        ...prev,
        [questionId]: [optionId], // Handle single choice selection
      }
      console.log('Updated selectedAnswers:', updated) // Debug state sau khi cập nhật
      return updated
    })
  }, [results])

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      startTransition(() => setCurrentQuestionIndex(prev => prev + 1))
    }
  }, [currentQuestionIndex, totalQuestions, startTransition])

  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      startTransition(() => setCurrentQuestionIndex(prev => prev - 1))
    }
  }, [currentQuestionIndex, startTransition])

  const handleSelectQuestion = useCallback((index) => {
    startTransition(() => setCurrentQuestionIndex(index))
  }, [startTransition])

  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting || !testData) return

    try {
      console.log('Submitting with selectedAnswers:', selectedAnswers) // Debug state trước khi gửi
      const formattedAnswers = Object.entries(selectedAnswers).map(([questionId, optionIds]) => ({
        questionId,
        selectedOptionIds: optionIds || [], // Đảm bảo không undefined
      }))
      console.log('Formatted answers:', formattedAnswers) // Debug dữ liệu gửi lên server

      const result = await submitAttempt({
        testId: testData._id,
        answers: formattedAnswers ,
      }).unwrap()

      setResults(result?.data)
      toast.success(`Chúc mừng! Bạn đã hoàn thành bài kiểm tra với điểm số ${result?.data?.score || 0}/100`)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    } catch (err) {
      console.error('Error submitting test:', err)
      toast.error('Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại.')
    }
  }, [isSubmitting, testData, selectedAnswers, submitAttempt, userInfo])

  // Side effects
  useEffect(() => {
    if (testId) {
      resetTest()
      fetchTest(testId)
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [testId, fetchTest, resetTest]) // Chỉ reset khi testId thay đổi

  useEffect(() => {
    if (testData && open) {
      const defaultTimeLimit = totalQuestions * DEFAULT_TIME_PER_QUESTION
      setTimeLeft(defaultTimeLimit)
    }
  }, [testData, open, totalQuestions])

  useEffect(() => {
    if (!open || !timeLeft || timeLeft <= 0 || results) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          toast.warning('Đã hết giờ!')
          handleSubmitTest()
          return 0
        }
        if (prev === 60) {
          toast.warning('Còn 1 phút!')
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [open, timeLeft, results, handleSubmitTest])

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0
  }, [currentQuestionIndex])

  if (!open) return null

  // Conditional rendering based on state
  const renderContent = () => {
    if (isLoading || isFetching) return <TestLoading />
    if (error) return <TestError onClose={onClose} />
    if (results) return <TestResults results={results} onClose={onClose} onRetry={resetTest} />
    
    return (
      <div className='space-y-5'>
        {/* Header — test title */}
        <div className='pb-4 border-b border-museum-gold/15'>
          <div className='flex items-center gap-2 mb-1'>
            <div className='w-8 h-8 rounded-full bg-museum-gold/10 border border-museum-gold/30 flex items-center justify-center flex-shrink-0'>
              <ScrollText className='h-4 w-4 text-museum-gold' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-museum-espresso dark:text-museum-ivory font-display leading-tight'>
                {testData?.title || testInfo?.title || 'Bài kiểm tra di sản'}
              </h3>
              <p className='text-xs text-museum-muted mt-0.5 line-clamp-1'>
                {testData?.content || testInfo?.content}
              </p>
            </div>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={onClose}
          className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-museum-muted border border-museum-muted/20 rounded-lg hover:border-museum-gold/40 hover:text-museum-gold hover:bg-museum-gold/5 transition-all duration-300'
          aria-label='Quay lại chọn bài kiểm tra'
        >
          <ChevronLeft className='h-3.5 w-3.5' />
          Quay lại chọn bài kiểm tra
        </button>
        
        {/* Question info and timer */}
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <span className='w-7 h-7 rounded-full bg-museum-gold/15 border border-museum-gold/30 flex items-center justify-center text-xs font-bold text-museum-gold'>
              {currentQuestionIndex + 1}
            </span>
            <span className='text-sm text-museum-muted'>/ {totalQuestions} câu</span>
          </div>
          <div className={cn(
            'flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300', 
            timeLeft && timeLeft < 60 
              ? 'bg-museum-seal/15 text-museum-seal ring-1 ring-museum-seal/30 animate-pulse' 
              : 'bg-museum-gold/10 text-museum-gold border border-museum-gold/20'
          )}>
            <Clock className={cn(
              'h-4 w-4 mr-1.5',
              timeLeft && timeLeft < 60 && 'animate-pulse'
            )} />
            <span className='tabular-nums'>{formatTime(timeLeft || 0)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div 
          className='w-full h-2 bg-museum-parchment/40 rounded-full overflow-hidden border border-museum-muted/15' 
          role='progressbar' 
          aria-valuemin='0' 
          aria-valuemax='100' 
          aria-valuenow={progressPercentage}
        >
          <div
            className='h-full rounded-full transition-all duration-500 ease-out'
            style={{ 
              width: `${progressPercentage}%`,
              background: 'linear-gradient(90deg, #C88A3E 0%, #D8A24A 40%, #F2C66D 100%)'
            }}
          ></div>
        </div>

        {/* Current question — parchment card */}
        {currentQuestion && (
          <div className={cn(
            'space-y-5 transition-opacity duration-300 bg-museum-parchment/25 border border-museum-gold/15 rounded-xl p-5 shadow-inner',
            'before:block before:h-0.5 before:bg-gradient-to-r before:from-museum-gold/60 before:via-museum-gold-light/40 before:to-transparent before:rounded-full before:mb-1',
            isTransitioning ? 'opacity-0' : 'opacity-100'
          )}>
            {/* Gold top accent line */}
            <div className='h-0.5 bg-gradient-to-r from-museum-gold via-museum-gold-light/40 to-transparent rounded-full -mx-5 -mt-5 mb-3' style={{ width: 'calc(100% + 2.5rem)' }} />

            {/* Question number badge + text */}
            <div className='flex items-start gap-3'>
              <div className='w-8 h-8 rounded-full bg-museum-gold/15 border-2 border-museum-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span className='text-xs font-bold text-museum-gold'>{currentQuestionIndex + 1}</span>
              </div>
              <h3 className='text-base font-medium text-museum-espresso dark:text-museum-ivory leading-relaxed pt-1'>
                {currentQuestion.content}
              </h3>
            </div>

            {currentQuestion.image && (
              <div className='mb-4 rounded-lg overflow-hidden border border-museum-gold/10 shadow-sm'>
                <img 
                  src={currentQuestion.image || '/placeholder.svg'} 
                  alt='Hình ảnh câu hỏi' 
                  className='w-full object-cover max-h-52' 
                  loading='lazy'
                />
              </div>
            )}

            <div className='space-y-2.5'>
              {currentQuestion.options.map((option) => (
                <QuestionOption
                  key={option.optionId}
                  option={option}
                  isSelected={selectedAnswers[currentQuestion.questionId]?.includes(option.optionId) || false}
                  isCorrect={results ? option.isCorrect : false}
                  isIncorrect={results ? (selectedAnswers[currentQuestion.questionId]?.includes(option.optionId) && !option.isCorrect) : false}
                  showResult={!!results}
                  onSelect={() => handleAnswerSelect(currentQuestion.questionId, option.optionId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <NavigationButtons
          currentQuestionIndex={currentQuestionIndex}
          onPrev={handlePrevQuestion}
          onNext={handleNextQuestion}
          onSubmit={handleSubmitTest}
          isSubmitting={isSubmitting}
          isTransitioning={isTransitioning}
          isLastQuestion={isLastQuestion}
        />

        {/* Question pagination */}
        {testData?.questions && (
          <QuestionPagination
            questions={testData.questions}
            currentIndex={currentQuestionIndex}
            answeredQuestions={selectedAnswers}
            onSelectQuestion={handleSelectQuestion}
          />
        )}
      </div>
    )
  }

  return (
    <div 
      ref={contentRef} 
      className='w-full max-h-[75vh] overflow-y-auto pr-1 rounded-xl bg-[#F5F0E8] border border-museum-gold/20 shadow-museum-card'
      style={{ 
        backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(216,162,74,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(122,31,31,0.04) 0%, transparent 50%)' 
      }}
    >
      {/* Seal-red accent bar at top */}
      <div className='h-1 bg-museum-seal rounded-t-xl sticky top-0 z-10' />
      <div className='p-6'>
        {renderContent()}
      </div>
    </div>
  )
}

export default KnowledgeTestDialog