import { useState } from 'react'
import { CheckCheck, MoreVertical, Undo2, Trash2, Ban } from 'lucide-react'
import { cn } from '~/lib/utils'

/** Tin nhắn người dùng (theme museum). */
const ChatMessage = ({ message, showAvatar, showTimestamp, isCurrentUser, isLastInGroup, onRecall, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imgOpen, setImgOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `${date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  const timeString = formatMessageTime(message.timestamp)
  const avatarUrl = message.sender?.avatar
  const recalled = message.recalled || message.status === 'DELETED'
  const isImage = !recalled && message.type === 'IMAGE' && message.imageUrl

  const closeMenu = () => setMenuOpen(false)

  const MenuButton = () => (
    <div className="relative self-center">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full text-museum-muted transition-opacity hover:bg-museum-gold/15 hover:text-museum-gold-light',
          isHovered || menuOpen ? 'opacity-100' : 'opacity-0',
        )}
        aria-label="Tuỳ chọn tin nhắn"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {menuOpen && (
        <>
          <button type="button" className="fixed inset-0 z-30 cursor-default" aria-label="Đóng" onClick={closeMenu} />
          <div
            className={cn(
              'absolute z-40 mt-1 w-40 overflow-hidden rounded-xl border border-museum-gold/20 bg-museum-black shadow-museum-card animate-fade-in',
              isCurrentUser ? 'right-0' : 'left-0',
            )}
          >
            {isCurrentUser && !recalled && (
              <button
                type="button"
                onClick={() => { closeMenu(); onRecall?.(message.id) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-museum-parchment transition-colors hover:bg-museum-gold/12"
              >
                <Undo2 className="h-4 w-4 text-museum-gold-light" /> Thu hồi
              </button>
            )}
            <button
              type="button"
              onClick={() => { closeMenu(); onDelete?.(message.id) }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-museum-seal transition-colors hover:bg-museum-seal/12"
            >
              <Trash2 className="h-4 w-4" /> Xoá ở phía tôi
            </button>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div
      className={cn('flex mb-1 animate-fade-in', isCurrentUser ? 'justify-end' : 'justify-start', isLastInGroup && 'mb-3')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn('flex max-w-[80%] items-end gap-1.5', isCurrentUser ? 'flex-row-reverse' : 'flex-row')}>
        {showAvatar && !isCurrentUser && (
          avatarUrl ? (
            <img
              src={avatarUrl}
              alt={message.sender.name}
              className="h-8 w-8 flex-shrink-0 rounded-full object-cover ring-1 ring-museum-gold/30"
            />
          ) : (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-museum-gold/20 text-sm font-semibold text-museum-gold-light">
              {message.sender.name?.[0]?.toUpperCase() || '?'}
            </div>
          )
        )}
        {!showAvatar && !isCurrentUser && <div className="w-8 flex-shrink-0" />}

        <div className="flex flex-col">
          {showAvatar && !isCurrentUser && (
            <span className="mb-1 ml-1 text-xs text-museum-muted">{message.sender.name}</span>
          )}

          {recalled ? (
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-2xl border border-dashed px-3.5 py-2 text-sm italic',
                isCurrentUser
                  ? 'rounded-br-md border-museum-black/30 bg-museum-gold/30 text-museum-black/70'
                  : 'rounded-bl-md border-museum-gold/15 bg-museum-black/40 text-museum-muted',
              )}
            >
              <Ban className="h-3.5 w-3.5" /> Tin nhắn đã được thu hồi
            </div>
          ) : isImage ? (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setImgOpen(true)}
                className={cn(
                  'overflow-hidden rounded-2xl border shadow-sm transition-transform hover:scale-[1.01]',
                  isCurrentUser ? 'rounded-br-md border-museum-gold/40' : 'rounded-bl-md border-museum-gold/15',
                )}
              >
                <img src={message.imageUrl} alt="ảnh" className="max-h-64 w-full object-cover" />
              </button>
              {message.content && message.content !== '[Hình ảnh]' && (
                <div
                  className={cn(
                    'px-3.5 py-2 text-sm leading-relaxed',
                    isCurrentUser
                      ? 'rounded-2xl rounded-br-md bg-museum-gold text-museum-black'
                      : 'rounded-2xl rounded-bl-md border border-museum-gold/15 bg-museum-black/55 text-museum-parchment',
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              )}
            </div>
          ) : (
            <div
              className={cn(
                'group relative px-3.5 py-2 text-sm leading-relaxed shadow-sm',
                isCurrentUser
                  ? 'rounded-2xl rounded-br-md bg-museum-gold text-museum-black'
                  : 'rounded-2xl rounded-bl-md border border-museum-gold/15 bg-museum-black/55 text-museum-parchment',
              )}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>

              {isCurrentUser && isLastInGroup && (
                <div className="mt-1 flex h-4 items-center justify-end text-xs">
                  <span className={cn('mr-1 text-museum-black/60 transition-opacity duration-200', isHovered ? 'opacity-100' : 'opacity-0')}>
                    {timeString}
                  </span>
                  <CheckCheck className="h-3 w-3 text-museum-black/60" />
                </div>
              )}
            </div>
          )}

          {showTimestamp && !isCurrentUser && !recalled && (
            <span className="ml-1 mt-1 text-xs text-museum-muted">{timeString}</span>
          )}
        </div>

        {/* Menu 3 chấm: thu hồi / xoá */}
        {!recalled && <MenuButton />}
      </div>

      {/* Lightbox xem ảnh */}
      {imgOpen && isImage && (
        <button
          type="button"
          onClick={() => setImgOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 animate-fade-in"
          aria-label="Đóng ảnh"
        >
          <img src={message.imageUrl} alt="ảnh" className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
        </button>
      )}
    </div>
  )
}

export default ChatMessage
