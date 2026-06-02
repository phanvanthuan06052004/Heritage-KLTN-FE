import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Clock, ChevronLeft, ChevronRight, Loader2, AlertTriangle, Check, X as XIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import { useLazyGetKnowledgeTestByIdQuery, useSubmitKnowledgeTestAttemptMutation } from '~/store/apis/knowledgeTestApi'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/store/slices/authSlice'

const TIME_PER_QUESTION = 120

const KnowledgeTestDialog = ({ open, onClose, testId, testInfo, heritageName }) => {
  const [step, setStep] = useState('loading')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [results, setResults] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const timerRef = useRef(null)
  const userInfo = useSelector(selectCurrentUser)

  const [fetchTest, { data: apiTest, isLoading, error }] = useLazyGetKnowledgeTestByIdQuery()
  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitKnowledgeTestAttemptMutation()

  const test = useMemo(() => apiTest?.data || apiTest, [apiTest])
  const questions = test?.questions || []
  const totalQuestions = questions.length
  const current = questions[currentIdx] || { id: '', content: '', options: [], explanation: '' }
  const isLast = currentIdx === totalQuestions - 1
  const answeredCount = Object.keys(answers).length
  const progress = totalQuestions > 0 ? ((currentIdx + 1) / totalQuestions) * 100 : 0
  const canSubmit = answeredCount === totalQuestions

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    return `${m}:${(s % 60).toString().padStart(2, '0')}`
  }

  const reset = useCallback(() => {
    setAnswers({}); setCurrentIdx(0); setResults(null)
    setSubmitted(false); setShowExplanation(false)
    setStep('loading'); setTimeLeft(null)
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const goTo = (idx) => {
    if (idx >= 0 && idx < totalQuestions) { setCurrentIdx(idx); setShowExplanation(false) }
  }

  const handleSelect = (questionId, optionId) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: [optionId] }))
    setShowExplanation(true)
  }

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || submitted || !test) return
    const formatted = Object.entries(answers).map(([questionId, optionIds]) => ({
      questionId, selectedOptionIds: optionIds || [],
    }))
    try {
      setSubmitted(true)
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
      const r = await submitAttempt({
        userId: userInfo?._id, userName: userInfo?.displayname, testId: test.id, answers: formatted,
      }).unwrap()
      const resultData = r?.data || r
      setResults(resultData)
      setStep('result')
      toast.success(`Hoàn thành! Điểm: ${Number(resultData?.score || 0).toFixed(0)}/100`)
    } catch { setSubmitted(false); toast.error('Có lỗi khi nộp bài.') }
  }, [isSubmitting, submitted, test, answers, submitAttempt, userInfo])

  useEffect(() => { if (open && testId) { reset(); fetchTest(testId) } return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [open, testId])

  useEffect(() => {
    if (test && !error && step === 'loading') { setStep('quiz'); setTimeLeft(totalQuestions * TIME_PER_QUESTION) }
    if (error && step === 'loading') setStep('error')
  }, [test, error, step, totalQuestions])

  useEffect(() => {
    if (step !== 'quiz' || !timeLeft || timeLeft <= 0 || submitted) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0 }
        if (prev === 60) toast.warning('Còn 1 phút!')
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [step, timeLeft, submitted])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const label = heritageName || testInfo?.heritageName || ''
  const title = test?.title || testInfo?.title || 'Bài kiểm tra'
  const subtitle = test?.content || testInfo?.content || ''

  return createPortal(
    <div className='fixed inset-0 z-[70] flex items-center justify-center bg-museum-black/88 p-3 backdrop-blur-md sm:p-6'>
      <button
        type='button'
        onClick={onClose}
        aria-label='Đóng bài kiểm tra'
        className='absolute inset-0 cursor-default bg-transparent'
      />

      <div className='relative z-10 flex w-full max-w-5xl min-h-[min(86dvh,860px)] max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[2rem] border border-museum-gold/20 bg-museum-black text-museum-ivory shadow-[0_28px_80px_rgba(0,0,0,0.48)] sm:rounded-[2.25rem]'>
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(216,162,74,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(111,174,141,0.13),_transparent_26%),linear-gradient(180deg,rgba(27,19,12,0.98),rgba(11,10,7,1))]' />

        <div className='relative grid min-h-0 flex-1 lg:grid-cols-[292px_minmax(0,1fr)]'>
          <aside className='flex min-h-0 flex-col justify-between gap-5 border-b border-museum-gold/10 px-5 py-5 sm:px-7 lg:border-b-0 lg:border-r lg:px-6 lg:py-6'>
            <div className='space-y-4'>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-museum-gold-light/90'>Bài kiểm tra</p>
                  <h2 className='mt-2 text-balance font-display text-[1.95rem] font-semibold leading-tight text-museum-ivory sm:text-[2.1rem]'>
                    {title}
                  </h2>
                  {label && <p className='mt-2 text-sm leading-6 text-museum-terracotta-light'>{label}</p>}
                </div>
                <button
                  onClick={onClose}
                  className='inline-flex shrink-0 items-center justify-center rounded-full border border-museum-gold/25 bg-museum-ivory/5 p-2.5 text-museum-ivory transition hover:border-museum-gold/45 hover:bg-museum-gold hover:text-museum-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light'
                  aria-label='Đóng'
                >
                  <XIcon className='h-4 w-4' />
                </button>
              </div>

              <p className='max-w-[18rem] text-sm leading-6 text-museum-parchment/80'>
                {subtitle || 'Chọn đáp án cẩn thận, theo dõi tiến độ và hoàn thành bài để xem kết quả ngay trong hộp thoại này.'}
              </p>

              <div className='grid grid-cols-2 gap-2.5'>
                <div className='rounded-2xl border border-museum-gold/10 bg-museum-ivory/5 p-3.5'>
                  <p className='text-[11px] uppercase tracking-[0.22em] text-museum-muted'>Câu hỏi</p>
                  <p className='mt-2 font-display text-[1.9rem] font-semibold text-museum-gold-light'>{totalQuestions}</p>
                </div>
                <div className='rounded-2xl border border-museum-gold/10 bg-museum-ivory/5 p-3.5'>
                  <p className='text-[11px] uppercase tracking-[0.22em] text-museum-muted'>Đã trả lời</p>
                  <p className='mt-2 font-display text-[1.9rem] font-semibold text-museum-gold-light'>{answeredCount}</p>
                </div>
                <div className='rounded-2xl border border-museum-gold/10 bg-museum-ivory/5 p-3.5'>
                  <p className='text-[11px] uppercase tracking-[0.22em] text-museum-muted'>Thời gian</p>
                  <p className='mt-2 font-display text-[1.9rem] font-semibold text-museum-gold-light'>
                    {step === 'quiz' && timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                  </p>
                </div>
                <div className='rounded-2xl border border-museum-gold/10 bg-museum-ivory/5 p-3.5'>
                  <p className='text-[11px] uppercase tracking-[0.22em] text-museum-muted'>Tiến độ</p>
                  <p className='mt-2 font-display text-[1.9rem] font-semibold text-museum-gold-light'>{Math.round(progress)}%</p>
                </div>
              </div>
            </div>

            <div className='rounded-[1.5rem] border border-museum-gold/10 bg-museum-black/30 p-4'>
              <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-museum-gold-light/80'>Cách làm</p>
              <ul className='mt-3 space-y-2 text-sm leading-6 text-museum-parchment/80'>
                <li>• Chọn một đáp án cho mỗi câu.</li>
                <li>• Có thể quay lại câu trước để sửa.</li>
                <li>• Nộp bài khi đã trả lời đủ.</li>
              </ul>
            </div>
          </aside>

          <main className='flex min-h-0 flex-col'>
            {step === 'loading' && (
              <div className='flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12 text-center'>
                <Loader2 className='h-10 w-10 animate-spin text-museum-gold-light' />
                <p className='text-sm text-museum-muted'>Đang tải câu hỏi...</p>
              </div>
            )}

            {step === 'error' && (
              <div className='flex flex-1 flex-col items-center justify-center gap-5 px-8 py-12 text-center'>
                <div className='rounded-full border border-museum-seal/20 bg-museum-seal/15 p-4'>
                  <AlertTriangle className='h-8 w-8 text-museum-gold-light' />
                </div>
                <p className='text-base text-museum-ivory'>Không thể tải bài kiểm tra</p>
                <p className='-mt-2 text-sm text-museum-muted'>Vui lòng thử lại sau</p>
                <button
                  onClick={onClose}
                  className='mt-2 rounded-full border border-museum-gold/35 bg-museum-ivory/8 px-6 py-2.5 text-sm text-museum-ivory transition-colors hover:bg-museum-gold hover:text-museum-black'
                >
                  Đóng
                </button>
              </div>
            )}

            {step === 'quiz' && (
              <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5 sm:px-7 sm:py-6'>
                <div className='mx-auto flex w-full max-w-[44rem] flex-1 flex-col'>
                  <div className='mb-5 flex items-center justify-between gap-4 rounded-2xl border border-museum-gold/10 bg-museum-ivory/5 px-4 py-3'>
                    <div className='min-w-0'>
                      <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-museum-gold-light/80'>Đang làm bài</p>
                      <p className='mt-1 text-sm text-museum-parchment/75'>
                        Câu {currentIdx + 1} <span className='text-museum-muted'>/ {totalQuestions}</span>
                      </p>
                    </div>
                    {timeLeft !== null && (
                      <span className={cn(
                        'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
                        timeLeft < 60 ? 'bg-museum-seal/15 text-museum-gold-light' : 'bg-museum-gold/15 text-museum-gold-light'
                      )}>
                        <Clock className='h-4 w-4' />
                        {formatTime(timeLeft)}
                      </span>
                    )}
                  </div>

                  <div className='mb-7'>
                    <div className='mb-3 flex items-center justify-between text-sm'>
                      <span className='font-medium text-museum-ivory'>Câu {currentIdx + 1}</span>
                      <span className='text-museum-muted'>{answeredCount}/{totalQuestions} đã trả lời</span>
                    </div>
                    <div className='h-1.5 w-full overflow-hidden rounded-full bg-museum-ivory/8'>
                      <div className='h-full w-full origin-left rounded-full bg-museum-gold transition-transform duration-400' style={{ transform: `scaleX(${progress / 100})` }} />
                    </div>
                  </div>

                  <div className='mb-7 rounded-[1.75rem] border border-museum-gold/10 bg-museum-ivory/4 p-5 sm:p-6'>
                    <h3 className='text-balance text-[1.35rem] font-semibold leading-relaxed text-museum-ivory sm:text-[1.65rem]'>
                      {current.content}
                    </h3>
                    {current.image && (
                      <img src={current.image} alt='' width={400} height={288} className='mt-5 max-h-72 w-full rounded-2xl object-cover' loading='lazy' />
                    )}
                  </div>

                  <div className='space-y-4'>
                    {current.options.map((opt, i) => {
                      const isSelected = answers[current.id]?.includes(opt.id)
                      return (
                        <button
                          key={opt.id}
                          type='button'
                          onClick={() => handleSelect(current.id, opt.id)}
                          disabled={submitted}
                          className={cn(
                            'group flex w-full items-center gap-4 rounded-[1.35rem] border-2 p-4 text-left transition-all duration-200 sm:gap-5 sm:p-4',
                            isSelected
                              ? 'border-museum-gold bg-museum-gold/10 shadow-museum-gold'
                              : 'border-museum-gold/10 bg-museum-ivory/3 hover:border-museum-gold/25 hover:bg-museum-ivory/6',
                            submitted && 'pointer-events-none opacity-70'
                          )}
                        >
                          <span className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold transition-all duration-200',
                            isSelected
                              ? 'bg-museum-gold text-museum-black shadow-museum-gold'
                              : 'border-2 border-museum-gold/20 bg-transparent text-museum-muted group-hover:border-museum-gold/40'
                          )}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className='text-base leading-relaxed text-museum-ivory sm:text-lg'>{opt.optionText}</span>
                        </button>
                      )
                    })}
                  </div>

                  {showExplanation && current.explanation && answers[current.id] && (
                    <div className='mt-6 rounded-2xl border border-museum-jade/25 bg-museum-jade/10 p-5 text-sm leading-relaxed text-museum-jade-light'>
                      <span className='text-xs font-semibold uppercase tracking-wider text-museum-jade-light/70'>Giải thích</span>
                      <p className='mt-1'>{current.explanation}</p>
                    </div>
                  )}

                  <div className='mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-museum-gold/10 pt-5'>
                    <button
                      onClick={() => goTo(currentIdx - 1)}
                      disabled={currentIdx === 0}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors',
                        currentIdx === 0 ? 'cursor-not-allowed text-museum-muted/25' : 'text-museum-muted hover:bg-museum-ivory/5 hover:text-museum-gold-light'
                      )}
                    >
                      <ChevronLeft className='h-5 w-5' /> Trước
                    </button>

                    <div className='flex gap-2 sm:hidden'>
                      {questions.map((q, i) => (
                        <span
                          key={q.id}
                          className={cn(
                            'h-2.5 w-2.5 rounded-full transition-colors',
                            i === currentIdx ? 'bg-museum-gold' : answers[q.id] ? 'bg-museum-gold/35' : 'bg-museum-ivory/12'
                          )}
                        />
                      ))}
                    </div>

                    {isLast ? (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || submitted || !canSubmit}
                        className={cn(
                          'rounded-full px-8 py-3 text-sm font-semibold transition-all duration-200',
                          isSubmitting || submitted
                            ? 'cursor-not-allowed bg-museum-gold/20 text-museum-black/30'
                            : canSubmit
                              ? 'bg-museum-gold text-museum-black shadow-museum-gold hover:bg-museum-gold-light hover:scale-105'
                              : 'cursor-not-allowed bg-museum-gold/25 text-museum-black/40'
                        )}
                      >
                        {isSubmitting ? <span className='flex items-center gap-2'><Loader2 className='h-4 w-4 animate-spin' /> Đang nộp...</span> : 'Nộp bài'}
                      </button>
                    ) : (
                      <button
                        onClick={() => goTo(currentIdx + 1)}
                        className='inline-flex items-center gap-2 rounded-full bg-museum-gold px-6 py-3 text-sm font-semibold text-museum-black shadow-museum-gold transition-all duration-200 hover:scale-105 hover:bg-museum-gold-light'
                      >
                        Tiếp <ChevronRight className='h-5 w-5' />
                      </button>
                    )}
                  </div>

                  {!canSubmit && isLast && (
                    <p className='mt-3 text-center text-xs text-museum-muted'>
                      Cần trả lời tất cả {totalQuestions} câu để nộp bài
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 'result' && results && (() => {
              const score = Number(results.score || 0).toFixed(0)
              const correct = results.correctAnswers || 0
              const total = results.totalQuestions || 0
              const isGreat = Number(score) >= 80
              const isGood = Number(score) >= 50

              return (
                <div className='flex flex-1 flex-col items-center justify-center px-6 py-12 text-center sm:px-12'>
                  <div className={cn(
                    'mb-6 rounded-full p-5',
                    isGreat ? 'bg-museum-jade/15' : isGood ? 'bg-museum-gold/15' : 'bg-museum-seal/15'
                  )}>
                    {isGreat ? <Check className='h-12 w-12 text-museum-jade-light' />
                      : isGood ? <Check className='h-12 w-12 text-museum-gold-light' />
                        : <XIcon className='h-12 w-12 text-museum-gold-light' />}
                  </div>

                  <div className={cn(
                    'text-7xl font-display font-semibold sm:text-8xl',
                    isGreat ? 'text-museum-jade-light' : 'text-museum-gold-light'
                  )}>
                    {score}
                    <span className='text-2xl text-museum-muted sm:text-3xl'>/100</span>
                  </div>

                  <p className='mt-3 text-base text-museum-ivory'>
                    Đúng <span className='font-semibold text-museum-gold-light'>{correct}</span>/{total} câu
                  </p>

                  <p className='mt-2 max-w-sm text-sm text-museum-muted'>
                    {isGreat ? 'Xuất sắc! Bạn rất am hiểu về di tích này.'
                      : isGood ? 'Khá tốt! Hãy tiếp tục tìm hiểu thêm nhé.'
                        : 'Đừng nản! Hãy khám phá thêm và thử lại.'}
                  </p>

                  <button
                    onClick={onClose}
                    className='mt-10 rounded-full bg-museum-gold px-8 py-3.5 text-base font-semibold text-museum-black shadow-museum-gold transition-all duration-200 hover:scale-105 hover:bg-museum-gold-light'
                  >
                    Hoàn thành
                  </button>
                </div>
              )
            })()}
          </main>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default KnowledgeTestDialog