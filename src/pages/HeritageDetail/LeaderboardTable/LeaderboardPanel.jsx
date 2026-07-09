import { useCallback, useEffect, useRef, useState } from 'react'
import { Crown, Medal, RefreshCw, Star, Trophy, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/common/ui/Button'
import { Spinner } from '~/components/common/ui/Spinner'
import { useGetLeaderboardByHeritageIdQuery } from '~/store/apis/leaderboardApi'

const formatScore = (score) => {
  const value = Number(score)
  if (!Number.isFinite(value)) return '0'
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

const displayNameOf = (ranking, fallbackName) => ranking?.displayName || fallbackName

const avatarOf = (ranking) => ranking?.avatarUrl || ranking?.avatar

const initialsOf = (name) => {
  if (!name) return 'ND'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

const StatBlock = ({ children, label, value }) => (
  <div className='rounded-lg border border-museum-gold/15 bg-museum-ivory/[0.06] px-4 py-3'>
    <div className='flex items-center gap-2 text-xs font-semibold uppercase text-museum-muted'>
      {children}
      {label}
    </div>
    <div className='mt-2 text-2xl font-semibold text-museum-ivory'>{value}</div>
  </div>
)

const Avatar = ({ fallbackName, ranking, size = 'md' }) => {
  const avatar = avatarOf(ranking)
  const name = displayNameOf(ranking, fallbackName)
  const sizeClass = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'

  return (
    <div className={`${sizeClass} shrink-0 overflow-hidden rounded-full border border-museum-gold/30 bg-museum-black`}>
      {avatar ? (
        <img loading='lazy' src={avatar} alt={name} className='h-full w-full object-cover' />
      ) : (
        <span className='flex h-full w-full items-center justify-center text-sm font-semibold text-museum-gold-light'>
          {initialsOf(name)}
        </span>
      )}
    </div>
  )
}

const TopRankCard = ({ labels, ranking }) => {
  const rank = ranking?.rank
  const styles = {
    1: 'border-museum-gold/60 bg-museum-gold/15 text-museum-gold-light',
    2: 'border-museum-ivory/35 bg-museum-ivory/10 text-museum-ivory',
    3: 'border-museum-terracotta-light/50 bg-museum-terracotta/15 text-museum-terracotta-light',
  }

  return (
    <div className={`rounded-lg border p-4 ${styles[rank] || 'border-museum-gold/15 bg-museum-ivory/[0.06] text-museum-ivory'}`}>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <Avatar fallbackName={labels.explorer} ranking={ranking} size='lg' />
          <div className='min-w-0'>
            <div className='truncate font-semibold text-museum-ivory'>{displayNameOf(ranking, labels.explorer)}</div>
            <div className='mt-1 text-xs text-museum-muted'>{labels.rank} {rank}</div>
          </div>
        </div>
        {rank === 1 ? <Crown className='h-5 w-5 shrink-0' /> : <Medal className='h-5 w-5 shrink-0' />}
      </div>
      <div className='mt-4 flex items-baseline gap-1'>
        <span className='text-3xl font-bold text-museum-gold-light'>{formatScore(ranking?.score)}</span>
        <span className='text-xs font-semibold uppercase text-museum-muted'>{labels.points}</span>
      </div>
    </div>
  )
}

const RankBadge = ({ rank }) => {
  const rankClass = {
    1: 'bg-museum-gold/20 text-museum-gold-light ring-museum-gold/40',
    2: 'bg-museum-ivory/10 text-museum-ivory ring-museum-ivory/30',
    3: 'bg-museum-terracotta/20 text-museum-terracotta-light ring-museum-terracotta-light/35',
  }[rank] || 'bg-museum-ivory/[0.06] text-museum-muted ring-museum-gold/15'

  return (
    <div className={`mx-auto flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-bold ring-1 ${rankClass}`}>
      {rank <= 3 ? <Trophy className='h-4 w-4' /> : rank}
    </div>
  )
}

const RankingRow = ({ labels, ranking }) => {
  const completedDate = ranking?.completeDate || ranking?.completedAt

  return (
    <div className='grid grid-cols-[64px_minmax(0,1fr)_86px] items-center rounded-lg border border-museum-gold/12 bg-museum-ivory/[0.045] px-3 py-3 transition-colors hover:border-museum-gold/30 hover:bg-museum-ivory/[0.075] sm:grid-cols-[84px_minmax(0,1fr)_130px] sm:px-4'>
      <RankBadge rank={ranking?.rank} />
      <div className='flex min-w-0 items-center gap-3'>
        <Avatar fallbackName={labels.explorer} ranking={ranking} />
        <div className='min-w-0'>
          <div className='truncate font-semibold text-museum-ivory'>{displayNameOf(ranking, labels.explorer)}</div>
          <div className='mt-1 text-xs text-museum-muted'>
            {completedDate ? `${labels.completed}: ${formatDate(completedDate)}` : labels.noCompletedDate}
          </div>
        </div>
      </div>
      <div className='text-right'>
        <div className='text-lg font-bold text-museum-gold-light'>{formatScore(ranking?.score)}</div>
        <div className='text-[11px] font-semibold uppercase text-museum-muted'>{labels.points}</div>
      </div>
    </div>
  )
}

const LoadingRows = () => (
  <div className='space-y-3 p-5 sm:p-7'>
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className='flex items-center rounded-lg border border-museum-gold/15 bg-museum-ivory/[0.06] p-3'>
        <div className='h-8 w-10 animate-pulse rounded-full bg-museum-ivory/10' />
        <div className='mx-3 h-10 w-10 animate-pulse rounded-full bg-museum-ivory/10' />
        <div className='flex-1'>
          <div className='mb-2 h-5 w-1/2 animate-pulse rounded bg-museum-ivory/10' />
          <div className='h-4 w-1/3 animate-pulse rounded bg-museum-ivory/10' />
        </div>
        <div className='h-6 w-16 animate-pulse rounded bg-museum-ivory/10' />
      </div>
    ))}
  </div>
)

const LeaderboardPanel = ({ heritageId, heritageName = 'Di tich lich su', isOpen = false }) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [rankings, setRankings] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef(null)
  const dialogStateRef = useRef({ wasOpen: false, prevHeritageId: null })

  const resetLeaderboard = useCallback(() => {
    setPage(1)
    setRankings([])
    setHasMore(true)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      dialogStateRef.current.wasOpen = false
      return
    }

    const needsReset =
      !dialogStateRef.current.wasOpen ||
      dialogStateRef.current.prevHeritageId !== heritageId

    if (needsReset) resetLeaderboard()

    dialogStateRef.current.wasOpen = true
    dialogStateRef.current.prevHeritageId = heritageId
  }, [isOpen, heritageId, resetLeaderboard])

  const { data, isLoading, isFetching, error, refetch } = useGetLeaderboardByHeritageIdQuery(
    { heritageId, page, limit: 20 },
    { skip: !heritageId || !isOpen }
  )

  useEffect(() => {
    if (!data || !isOpen) return

    const leaderboardData = data?.data || data
    if (leaderboardData?.rankings?.length > 0) {
      setRankings(prev => page === 1 ? leaderboardData.rankings : [...prev, ...leaderboardData.rankings])
      setHasMore(leaderboardData.pagination?.totalPages > page)
    } else if (page === 1) {
      setRankings([])
      setHasMore(false)
    }
  }, [data, page, isOpen])

  useEffect(() => {
    if (!isOpen || !loaderRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetching) {
          setPage(prev => prev + 1)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, isFetching, isOpen])

  if (!isOpen) return null
  if (isLoading && page === 1) return <LoadingRows />

  const labels = {
    averageScore: t('leaderboard.averageScore'),
    completed: t('leaderboard.completed'),
    displayedUsers: count => t('leaderboard.displayedUsers', { count }),
    emptyForHeritage: t('leaderboard.emptyForHeritage', { heritageName }),
    explorer: t('leaderboard.explorer'),
    highestScore: t('leaderboard.highestScore'),
    loadError: t('leaderboard.loadError'),
    loadingMore: t('leaderboard.loadingMore'),
    noCompletedDate: t('leaderboard.noCompletedDate'),
    participants: t('leaderboard.participants'),
    player: t('leaderboard.player'),
    points: t('leaderboard.points'),
    rank: t('leaderboard.rank'),
    retry: t('leaderboard.retry'),
    score: t('leaderboard.score'),
    tryAgainLater: t('leaderboard.tryAgainLater'),
  }

  if (error) {
    return (
      <div className='px-5 py-12 text-center sm:px-7'>
        <p className='font-medium text-museum-gold-light'>{labels.loadError}</p>
        <p className='mx-auto mt-2 max-w-md text-sm text-museum-muted'>{error?.data?.message || labels.tryAgainLater}</p>
        <Button
          onClick={() => {
            resetLeaderboard()
            refetch()
          }}
          className='mt-5 rounded-lg bg-museum-gold text-museum-black hover:bg-museum-gold-light'
        >
          <RefreshCw className='h-4 w-4' />
          {labels.retry}
        </Button>
      </div>
    )
  }

  if (rankings.length === 0) {
    return (
      <div className='px-5 py-14 text-center sm:px-7'>
        <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-museum-gold/25 bg-museum-gold/10'>
          <Trophy className='h-7 w-7 text-museum-gold-light' />
        </div>
        <p className='mx-auto mt-4 max-w-md text-sm leading-6 text-museum-muted'>
          {labels.emptyForHeritage}
        </p>
      </div>
    )
  }

  const leaderboardData = data?.data || data || {}
  const stats = leaderboardData?.stats || {}
  const totalParticipants = stats.totalParticipants ?? leaderboardData?.pagination?.totalItems ?? rankings.length
  const highestScore = stats.highestScore ?? rankings[0]?.score ?? 0
  const averageScore = stats.averageScore ?? 0
  const topRankings = rankings.slice(0, 3)

  return (
    <div className='flex h-[66vh] min-h-[360px] max-h-[640px] flex-col'>
      <div className='shrink-0 space-y-4 p-5 sm:p-7'>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <StatBlock label={labels.participants} value={totalParticipants}>
            <Users className='h-4 w-4 text-museum-gold-light' />
          </StatBlock>
          <StatBlock label={labels.highestScore} value={formatScore(highestScore)}>
            <Star className='h-4 w-4 text-museum-gold-light' />
          </StatBlock>
          <StatBlock label={labels.averageScore} value={formatScore(averageScore)}>
            <Trophy className='h-4 w-4 text-museum-gold-light' />
          </StatBlock>
        </div>

        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          {topRankings.map(ranking => (
            <TopRankCard key={`top-${ranking.userId}`} labels={labels} ranking={ranking} />
          ))}
        </div>
      </div>

      <div className='min-h-0 flex-1 border-t border-museum-gold/15'>
        <div className='grid grid-cols-[64px_minmax(0,1fr)_86px] border-b border-museum-gold/15 bg-museum-charcoal px-4 py-3 text-xs font-semibold uppercase text-museum-muted sm:grid-cols-[84px_minmax(0,1fr)_130px] sm:px-6'>
          <div className='text-center'>{labels.rank}</div>
          <div>{labels.player}</div>
          <div className='text-right'>{labels.score}</div>
        </div>

        <div className='museum-scrollbar h-full overflow-y-auto px-3 py-3 sm:px-5'>
          <div className='space-y-2 pb-6'>
            {rankings.map(ranking => (
              <RankingRow key={ranking.userId} labels={labels} ranking={ranking} />
            ))}

            <div ref={loaderRef} className='h-4' />

            {isFetching && (
              <div className='flex items-center justify-center gap-2 py-3 text-sm text-museum-muted'>
                <Spinner /> {labels.loadingMore}
              </div>
            )}

            {!hasMore && (
              <div className='py-3 text-center text-sm text-museum-muted'>
                {labels.displayedUsers(rankings.length)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPanel
