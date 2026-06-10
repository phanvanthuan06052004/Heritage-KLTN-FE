import { Users2, Search, X, UserPlus, Bell } from 'lucide-react'
import { useState, useMemo } from 'react'
import { UserStatus } from './UserStatus'
import { cn } from '~/lib/utils'

export function UserList({
  users,
  currentUser,
  activeUserId,
  onSelectUser,
  onSelectCommunity,
  isCommunityActive,
  onlineUsers = [],
  isOpen = true,
  onOpenAddFriend,
  onOpenRequests,
  incomingCount = 0,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const enhancedUsers = useMemo(() => {
    return users.map((user) => {
      const isOnlineInRoom = onlineUsers.some((o) => o.id === user.id)
      return isOnlineInRoom ? { ...user, status: 'online' } : user
    })
  }, [users, onlineUsers])

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return enhancedUsers
    return enhancedUsers.filter((u) => (u.name || '').toLowerCase().includes(q))
  }, [enhancedUsers, searchQuery])

  const onlineCount = onlineUsers.length

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const order = { online: 0, away: 1, offline: 2 }
      return order[a.status] - order[b.status] || (b.unreadCount || 0) - (a.unreadCount || 0)
    })
  }, [filteredUsers])

  if (!isOpen || !onSelectUser) return null

  return (
    <div className="flex h-full flex-col text-museum-ivory">
      <div className="border-b border-museum-gold/12 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-museum-gold-light">
            <Users2 className="h-5 w-5" /> Cộng đồng Di sản
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenRequests}
              title="Lời mời kết bạn"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-museum-gold-light/80 transition-colors hover:bg-museum-gold/12 hover:text-museum-gold-light"
            >
              <Bell className="h-[18px] w-[18px]" />
              {incomingCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-museum-seal px-1 text-[10px] font-semibold text-white">
                  {incomingCount > 9 ? '9+' : incomingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onOpenAddFriend}
              title="Thêm bạn"
              className="flex h-8 w-8 items-center justify-center rounded-full text-museum-gold-light/80 transition-colors hover:bg-museum-gold/12 hover:text-museum-gold-light"
            >
              <UserPlus className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
        <div
          className={cn(
            'flex items-center rounded-xl border border-museum-gold/20 bg-museum-black/45 px-3 py-2 transition-all',
            searchFocused ? 'ring-2 ring-museum-gold/30' : '',
          )}
        >
          <Search className="h-4 w-4 text-museum-gold-light/60" />
          <input
            type="text"
            placeholder="Tìm bạn bè…"
            className="flex-1 bg-transparent px-3 text-sm text-museum-ivory placeholder:text-museum-muted focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery && (
            <button className="text-museum-muted hover:text-museum-parchment" onClick={() => setSearchQuery('')}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-3">
          <button
            type="button"
            className={cn(
              'mb-2 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left font-medium transition-colors',
              isCommunityActive ? 'bg-museum-gold/15 text-museum-gold-light' : 'text-museum-parchment hover:bg-museum-gold/10',
            )}
            onClick={onSelectCommunity}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-museum-gold/20 text-museum-gold-light">
              <Users2 className="h-4 w-4" />
            </span>
            <span className="flex-1">Phòng cộng đồng</span>
            {onlineCount > 0 && (
              <span className="rounded-full bg-museum-gold/20 px-2 py-0.5 text-xs font-normal text-museum-gold-light">
                {onlineCount} online
              </span>
            )}
          </button>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between px-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-museum-muted">Bạn bè</span>
              <span className="text-xs text-museum-muted">{users.length}</span>
            </div>
            <div className="space-y-1">
              {sortedUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2 rounded-xl p-2 text-left transition-colors',
                    activeUserId === user.id ? 'bg-museum-gold/15' : 'hover:bg-museum-gold/10',
                  )}
                  onClick={() => onSelectUser(user.id)}
                >
                  <UserStatus name={user.name} status={user.status} avatar={user.avatar} size="sm" />
                  {!!user.unreadCount && (
                    <span className="ml-auto min-w-[20px] rounded-full bg-museum-gold px-2 py-0.5 text-center text-xs text-museum-black">
                      {user.unreadCount}
                    </span>
                  )}
                </button>
              ))}
              {users.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-museum-muted">
                  <span>Chưa có bạn bè nào.</span>
                  <button
                    type="button"
                    onClick={onOpenAddFriend}
                    className="inline-flex items-center gap-1.5 rounded-full bg-museum-gold/15 px-3 py-1.5 text-xs font-medium text-museum-gold-light transition-colors hover:bg-museum-gold/25"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Tìm & thêm bạn
                  </button>
                </div>
              )}
              {users.length > 0 && filteredUsers.length === 0 && (
                <div className="py-4 text-center text-sm text-museum-muted">Không tìm thấy bạn bè</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-museum-gold/12 bg-museum-black/55 p-4">
        <UserStatus avatar={currentUser?.avatar} name={currentUser?.username || 'Bạn'} status="online" size="md" />
      </div>
    </div>
  )
}
