import { ArrowLeft, Menu, ChevronDown, Users } from 'lucide-react'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { selectCurrentUser } from '~/store/slices/authSlice'
import { Button } from '~/components/common/ui/Button'
import { useIsMobile } from '~/hooks/useIsMobile'
import { useLanguage } from '~/hooks/useLanguage'
import { useGetHeritagesBySlugQuery } from '~/store/apis/heritageApi'
import { MessageInput } from './MessageInput'
import useSocket from '~/hooks/useSocket'
import SystemMessage from './SystemMessage'
import ChatMessage from './ChatMessage'
import { UserList } from './UserList'
import FriendModal from './FriendModal'
import { cn } from '~/lib/utils'
import { useGetFriendOverviewQuery } from '~/store/apis/friendApi'

/**
 * Trang chat cộng đồng & nhắn riêng theo từng di tích.
 */
const ChatHeritagePage = () => {
  const { data: friendData, isLoading } = useGetFriendOverviewQuery()
  const userInfo = useSelector(selectCurrentUser)
  const isMobile = useIsMobile()
  const chatContainerRef = useRef(null)
  const location = useLocation()
  const { nameSlug } = useParams()
  const { language } = useLanguage()

  // heritageId: ưu tiên state khi điều hướng; fallback tra theo slug (chống vỡ khi F5/vào trực tiếp).
  const { data: slugData } = useGetHeritagesBySlugQuery(
    { nameSlug, language },
    { skip: !nameSlug || !!location.state?.heritageId },
  )
  const heritageIdParam = location.state?.heritageId || slugData?._id
  const heritageName = location.state?.heritageName || slugData?.name

  const prevActiveChatRef = useRef(null)

  const currentUser = useMemo(
    () => ({
      userId: userInfo?._id,
      username: userInfo?.displayname,
      avatar: userInfo?.avatar,
    }),
    [userInfo?._id, userInfo?.displayname, userInfo?.avatar],
  )

  const socketData = useSocket(currentUser, heritageIdParam)

  const {
    messages: communityMessages,
    privateMessages,
    usersInRoom,
    sendMessage: sendCommunityMessage,
    joinDirectRoom,
    sendDirectMessage,
    recallMessage,
    deleteMessageLocal,
    handleTyping: handleCommunityTyping,
    socketError: error,
    isLoadingMessages,
    hasMoreMessages,
    loadMoreMessages,
  } = socketData

  // Danh bạ DM = danh sách bạn bè (đã chấp nhận)
  const friends = friendData?.friends || []
  const incomingCount = friendData?.incomingCount || 0

  const enhancedUsers = useMemo(() => {
    return friends.map((f) => {
      const socketUser = usersInRoom.find((u) => u.id === f.userId)
      return {
        id: f.userId,
        name: f.displayname || f.email?.split('@')[0] || 'Người dùng',
        status: socketUser ? 'online' : 'offline',
        avatar: f.avatar,
        unreadCount: 0,
      }
    })
  }, [friends, usersInRoom])

  const [activeChat, setActiveChat] = useState('community')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [friendModal, setFriendModal] = useState({ open: false, tab: 'add' })

  const handleSelectUser = (userId) => {
    setActiveChat(userId)
    if (isMobile) setSidebarOpen(false)
  }

  useEffect(() => {
    if (activeChat !== 'community' && activeChat !== prevActiveChatRef.current) {
      joinDirectRoom(activeChat)
    }
    prevActiveChatRef.current = activeChat
  }, [activeChat, joinDirectRoom])

  const messages = useMemo(() => {
    if (activeChat === 'community') return communityMessages
    return privateMessages[activeChat] || []
  }, [activeChat, communityMessages, privateMessages])

  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleScroll = () => {
    if (activeChat !== 'community' || !chatContainerRef.current) return
    const { scrollTop } = chatContainerRef.current
    if (scrollTop === 0 && hasMoreMessages && !isLoadingMessages) {
      loadMoreMessages()
    }
  }

  const handleSendMessage = (content) => {
    if (activeChat === 'community') sendCommunityMessage(content)
    else sendDirectMessage(activeChat, content)
  }

  const handleSendImage = (imageUrl, caption = '') => {
    const content = caption?.trim() || '[Hình ảnh]'
    const options = { type: 'IMAGE', imageUrl }
    if (activeChat === 'community') sendCommunityMessage(content, options)
    else sendDirectMessage(activeChat, content, options)
  }

  const handleInputChange = () => {
    if (activeChat === 'community') {
      handleCommunityTyping(true)
      clearTimeout(window.typingTimeout)
      window.typingTimeout = setTimeout(() => handleCommunityTyping(false), 2000)
    }
  }

  const getChatTitle = () => {
    if (activeChat === 'community')
      return heritageName ? `Chat cộng đồng · ${heritageName}` : 'Chat cộng đồng'
    const user = enhancedUsers.find((u) => u.id === activeChat)
    return user ? user.name : 'Trò chuyện'
  }

  const groupedMessages = messages.reduce((acc, message, index) => {
    const prev = messages[index - 1]
    if (message.isSystemMessage) {
      acc.push(message)
      return acc
    }
    const showAvatar =
      !prev ||
      prev.isSystemMessage ||
      prev.sender.id !== message.sender.id ||
      message.isCurrentUser !== prev.isCurrentUser
    const showTimestamp =
      !messages[index + 1] ||
      messages[index + 1].isSystemMessage ||
      messages[index + 1].sender.id !== message.sender.id ||
      new Date(messages[index + 1].timestamp).getTime() - new Date(message.timestamp).getTime() > 5 * 60 * 1000
    acc.push({ ...message, showAvatar, showTimestamp })
    return acc
  }, [])

  if (isLoading) {
    return (
      <div className="museum-shell flex h-screen items-center justify-center pt-navbar text-museum-muted">
        Đang tải…
      </div>
    )
  }
  return (
    <div className="museum-shell flex h-screen flex-col pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container-x flex flex-1 gap-4 overflow-hidden py-4">
        {/* Sidebar */}
        <div
          className={cn(
            'overflow-hidden rounded-[1.5rem] border border-museum-gold/15 bg-museum-black/55 transition-all duration-300 ease-in-out',
            sidebarOpen ? 'w-72 flex-shrink-0' : 'w-0 border-0',
            isMobile && sidebarOpen ? 'absolute z-20 h-[calc(100%-2rem)] shadow-museum-card' : '',
          )}
        >
          <UserList
            users={enhancedUsers}
            currentUser={currentUser}
            activeUserId={activeChat !== 'community' ? activeChat : null}
            onSelectUser={handleSelectUser}
            onSelectCommunity={() => {
              setActiveChat('community')
              if (isMobile) setSidebarOpen(false)
            }}
            isCommunityActive={activeChat === 'community'}
            onlineUsers={usersInRoom}
            isOpen={sidebarOpen}
            onOpenAddFriend={() => setFriendModal({ open: true, tab: 'add' })}
            onOpenRequests={() => setFriendModal({ open: true, tab: 'requests' })}
            incomingCount={incomingCount}
          />
        </div>

        {isMobile && sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng danh sách"
            className="fixed inset-0 z-10 bg-black/40 backdrop-blur-sm"
          />
        )}

        {/* Khu trò chuyện */}
        <div className="museum-card flex h-full flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-museum-gold/15 bg-museum-black/45">
          {/* Header */}
          <div className="border-b border-museum-gold/15 bg-gradient-to-b from-museum-gold/8 to-transparent p-3.5">
            <div className="flex items-center gap-2 sm:justify-between">
              {!sidebarOpen && (
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mr-1 text-museum-gold-light">
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              {sidebarOpen && isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="mr-1 text-museum-gold-light">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="min-w-0">
                <h1 className="truncate font-display text-lg font-semibold text-museum-ivory sm:text-xl">{getChatTitle()}</h1>
                <p className="truncate text-xs text-museum-muted sm:text-sm">
                  {activeChat === 'community' ? `${usersInRoom.length} người đang trò chuyện` : 'Tin nhắn riêng'}
                </p>
              </div>
              {activeChat === 'community' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto flex h-8 items-center gap-1 px-2 text-museum-gold-light"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">{usersInRoom.length}</span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', showInfo && 'rotate-180')} />
                </Button>
              )}
            </div>
          </div>

          {showInfo && activeChat === 'community' && (
            <div className="m-2 rounded-xl border border-museum-gold/15 bg-museum-black/50 p-2 animate-fade-in">
              <h3 className="mb-1 text-sm font-medium text-museum-gold-light">Đang trong phòng</h3>
              <div className="flex flex-wrap gap-1">
                {usersInRoom.length === 0 && <span className="text-xs text-museum-muted">Chưa có ai khác.</span>}
                {usersInRoom.map((user) => (
                  <div key={user.id} className="flex items-center gap-1 rounded-full bg-museum-black/60 px-2 py-0.5 text-xs text-museum-parchment">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {user.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-museum-seal/15 p-3 text-center text-sm text-museum-seal animate-fade-in">
              <p className="font-medium">{error}</p>
              <p className="text-xs">Đang thử kết nối lại…</p>
            </div>
          )}

          {/* Tin nhắn */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4" ref={chatContainerRef} onScroll={handleScroll}>
            {activeChat === 'community' && isLoadingMessages && (
              <div className="py-2 text-center text-museum-muted animate-pulse">
                <span className="inline-block rounded-lg bg-museum-black/50 px-4 py-2 text-sm">Đang tải tin nhắn…</span>
              </div>
            )}
            {activeChat === 'community' && !hasMoreMessages && messages.length > 0 && (
              <div className="py-2 text-center">
                <span className="inline-block rounded-lg bg-museum-black/40 px-4 py-2 text-sm text-museum-muted">Đã xem hết tin nhắn</span>
              </div>
            )}
            {messages.length === 0 && !isLoadingMessages && (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center text-museum-muted animate-fade-in">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-museum-gold/10">
                  <Users className="h-8 w-8 text-museum-gold-light/60" />
                </div>
                <h3 className="font-display text-lg font-medium text-museum-ivory">Chưa có tin nhắn</h3>
                <p className="mt-1 max-w-xs text-sm">
                  {activeChat === 'community' ? 'Hãy mở đầu cuộc trò chuyện với cộng đồng!' : 'Bắt đầu một cuộc trò chuyện riêng!'}
                </p>
              </div>
            )}
            {groupedMessages.map((msg, index) =>
              msg.isSystemMessage ? (
                <SystemMessage key={msg.id} message={msg} />
              ) : (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  showAvatar={msg.showAvatar}
                  showTimestamp={msg.showTimestamp}
                  isCurrentUser={msg.isCurrentUser}
                  onRecall={recallMessage}
                  onDelete={deleteMessageLocal}
                  isLastInGroup={
                    index === groupedMessages.length - 1 ||
                    groupedMessages[index + 1].sender?.id !== msg.sender?.id ||
                    groupedMessages[index + 1].isSystemMessage
                  }
                />
              ),
            )}
          </div>

          {/* Ô nhập */}
          <div className="border-t border-museum-gold/15 bg-museum-black/40 p-3">
            <MessageInput
              onSendMessage={handleSendMessage}
              onSendImage={handleSendImage}
              onInputChange={handleInputChange}
              placeholder="Nhập tin nhắn…"
              disabled={!!error}
            />
          </div>
        </div>
      </div>

      <FriendModal
        open={friendModal.open}
        initialTab={friendModal.tab}
        onClose={() => setFriendModal({ open: false, tab: 'add' })}
      />
    </div>
  )
}

export default ChatHeritagePage
