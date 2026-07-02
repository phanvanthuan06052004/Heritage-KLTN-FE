import { useEffect, useState } from 'react'
import { X, Search, UserPlus, Check, Clock, UserCheck, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { cn } from '~/lib/utils'
import { UserStatus } from './UserStatus'
import {
  useLazySearchUsersToAddQuery,
  useGetFriendRequestsQuery,
  useSendFriendRequestMutation,
  useRespondFriendRequestMutation,
} from '~/store/apis/friendApi'

const STATUS_LABEL = {
  NONE: { text: 'Kết bạn', icon: UserPlus, disabled: false, variant: 'gold' },
  REQUEST_SENT: { text: 'Đã gửi', icon: Clock, disabled: true, variant: 'muted' },
  REQUEST_RECEIVED: { text: 'Chấp nhận', icon: Check, disabled: false, variant: 'accept' },
  FRIENDS: { text: 'Bạn bè', icon: UserCheck, disabled: true, variant: 'muted' },
}

/** Modal kết bạn: tab Thêm bạn (search) + tab Lời mời (incoming). */
export default function FriendModal({ open, initialTab = 'add', onClose }) {
  const [tab, setTab] = useState(initialTab)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const [triggerSearch, { isFetching }] = useLazySearchUsersToAddQuery()
  const { data: requests = [], isLoading: loadingReq } = useGetFriendRequestsQuery(undefined, {
    skip: !open,
  })
  const [sendRequest, { isLoading: sending }] = useSendFriendRequestMutation()
  const [respond, { isLoading: responding }] = useRespondFriendRequestMutation()

  useEffect(() => {
    if (open) setTab(initialTab)
  }, [open, initialTab])

  // Debounce search
  useEffect(() => {
    if (!open || tab !== 'add') return
    const t = setTimeout(async () => {
      try {
        const data = await triggerSearch(query).unwrap()
        setResults(Array.isArray(data) ? data : [])
      } catch {
        setResults([])
      }
    }, 350)
    return () => clearTimeout(t)
  }, [query, open, tab, triggerSearch])

  const patchResultStatus = (userId, status) =>
    setResults((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)))

  const handleAdd = async (u) => {
    try {
      const res = await sendRequest(u.id).unwrap()
      const auto = res?.data?.autoAccepted ?? res?.autoAccepted
      patchResultStatus(u.id, auto ? 'FRIENDS' : 'REQUEST_SENT')
      toast.success(auto ? `Đã là bạn với ${u.displayname || 'người dùng'}` : 'Đã gửi lời mời kết bạn')
    } catch (e) {
      toast.error(e?.data?.message || 'Không gửi được lời mời')
    }
  }

  const handleRespond = async (friendshipId, accept, fromSearchUserId) => {
    try {
      await respond({ friendshipId, accept }).unwrap()
      if (fromSearchUserId) patchResultStatus(fromSearchUserId, accept ? 'FRIENDS' : 'NONE')
      toast.success(accept ? 'Đã chấp nhận lời mời' : 'Đã từ chối lời mời')
    } catch (e) {
      toast.error(e?.data?.message || 'Thao tác thất bại')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <button type="button" aria-label="Đóng" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-museum-gold/20 bg-museum-black shadow-museum-card">
        {/* Header + tabs */}
        <div className="flex items-center justify-between border-b border-museum-gold/15 p-4">
          <h3 className="font-display text-lg font-semibold text-museum-ivory">Bạn bè</h3>
          <button onClick={onClose} className="text-museum-muted hover:text-museum-parchment">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-1 border-b border-museum-gold/12 px-3 pt-2">
          {[
            { key: 'add', label: 'Thêm bạn' },
            { key: 'requests', label: `Lời mời${requests.length ? ` (${requests.length})` : ''}` },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'rounded-t-lg px-4 py-2 text-sm font-medium transition-colors',
                tab === t.key
                  ? 'border-b-2 border-museum-gold text-museum-gold-light'
                  : 'text-museum-muted hover:text-museum-parchment',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {tab === 'add' ? (
            <>
              <div className="mb-3 flex items-center rounded-xl border border-museum-gold/20 bg-museum-black/45 px-3 py-2">
                <Search className="h-4 w-4 text-museum-gold-light/60" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Tìm theo tên hoặc email…"
                  className="flex-1 bg-transparent px-3 text-sm text-museum-ivory placeholder:text-museum-muted focus:outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {isFetching && <Loader2 className="h-4 w-4 animate-spin text-museum-gold-light/60" />}
              </div>

              <div className="space-y-1.5">
                {results.map((u) => {
                  const meta = STATUS_LABEL[u.status] || STATUS_LABEL.NONE
                  const Icon = meta.icon
                  const onClick = () => {
                    if (u.status === 'REQUEST_RECEIVED') handleRespond(u.friendshipId, true, u.id)
                    else if (u.status === 'NONE') handleAdd(u)
                  }
                  return (
                    <div key={u.id} className="flex items-center gap-2 rounded-xl p-2 hover:bg-museum-gold/8">
                      <UserStatus name={u.displayname || u.email?.split('@')[0] || 'Người dùng'} avatar={u.avatar} size="sm" showStatus={false} />
                      <button
                        type="button"
                        disabled={meta.disabled || sending || responding}
                        onClick={onClick}
                        className={cn(
                          'ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                          meta.variant === 'gold' && 'bg-museum-gold text-museum-black hover:bg-museum-gold-light',
                          meta.variant === 'accept' && 'bg-emerald-500/90 text-white hover:bg-emerald-500',
                          meta.variant === 'muted' && 'cursor-default bg-museum-black/60 text-museum-muted',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" /> {meta.text}
                      </button>
                    </div>
                  )
                })}
                {!isFetching && query && results.length === 0 && (
                  <div className="py-6 text-center text-sm text-museum-muted">Không tìm thấy người dùng</div>
                )}
                {!query && (
                  <div className="py-6 text-center text-sm text-museum-muted">Nhập tên hoặc email để tìm bạn bè</div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              {loadingReq && <div className="py-6 text-center text-sm text-museum-muted">Đang tải…</div>}
              {!loadingReq && requests.length === 0 && (
                <div className="py-6 text-center text-sm text-museum-muted">Không có lời mời nào</div>
              )}
              {requests.map((r) => (
                <div key={r.friendshipId} className="flex items-center gap-2 rounded-xl p-2 hover:bg-museum-gold/8">
                  <UserStatus name={r.displayname || r.email?.split('@')[0] || 'Người dùng'} avatar={r.avatar} size="sm" showStatus={false} />
                  <div className="ml-auto flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={responding}
                      onClick={() => handleRespond(r.friendshipId, true)}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500"
                    >
                      <Check className="h-3.5 w-3.5" /> Chấp nhận
                    </button>
                    <button
                      type="button"
                      disabled={responding}
                      onClick={() => handleRespond(r.friendshipId, false)}
                      className="inline-flex items-center gap-1 rounded-full bg-museum-black/60 px-3 py-1.5 text-xs font-medium text-museum-muted transition-colors hover:text-museum-parchment"
                    >
                      <X className="h-3.5 w-3.5" /> Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
