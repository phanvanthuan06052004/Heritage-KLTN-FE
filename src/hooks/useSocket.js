import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import socketService, { SOCKET_EVENTS } from '~/api/socket'

/**
 * Hook để quản lý kết nối và tương tác với socket
 * @param {Object} userData - Thông tin người dùng hiện tại (userId, username)
 * @param {string} heritageId - ID của di tích (_id)
 * @returns {Object} - Các phương thức và trạng thái liên quan đến socket
 */
const useSocket = (userData, heritageId) => {
    const [isConnected, setIsConnected] = useState(false)
    const [messages, setMessages] = useState([])
    const [privateMessages, setPrivateMessages] = useState({})
    const [usersInRoom, setUsersInRoom] = useState([])
    const [roomId, setRoomId] = useState(null)
    const [dmRoomIds, setDmRoomIds] = useState({})
    const [socketError, setSocketError] = useState(null)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [hasMoreMessages, setHasMoreMessages] = useState(true)
    const hasJoinedRef = useRef(false)
    const hasFetchedMessagesRef = useRef(false)
    const fetchedDmMessagesRef = useRef(new Map())
    const currentRecipientIdRef = useRef(null)
    const navigate = useNavigate()
    const limit = 50

    // Kết nối socket
    useEffect(() => {
        if (!userData || !userData.userId) {
            return
        }

        socketService.connect(userData)

        const handleConnect = () => {
            setIsConnected(true)
        }

        const handleDisconnect = () => {
            setIsConnected(false)
            setUsersInRoom([])
            setRoomId(null)
            setDmRoomIds({})
            setSocketError(null)
            setMessages([])
            setPrivateMessages({})
            setHasMoreMessages(true)
            hasJoinedRef.current = false
            hasFetchedMessagesRef.current = false
            fetchedDmMessagesRef.current.clear()
            currentRecipientIdRef.current = null
        }

        const handleError = (data) => {
            setSocketError(data.message)
            if (data.code === 'ROOM_NOT_FOUND') {
                setTimeout(() => {
                    navigate(`/heritage/${heritageId}`)
                }, 3000)
            }
        }

        socketService.on(SOCKET_EVENTS.CONNECT, handleConnect)
        socketService.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect)
        socketService.on('error', handleError)

        return () => {
            socketService.off(SOCKET_EVENTS.CONNECT, handleConnect)
            socketService.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect)
            socketService.off('error', handleError)
            if (heritageId) {
                socketService.leaveRoom({ heritageId, userId: userData.userId })
            }
            socketService.disconnect()
        }
    }, [userData, heritageId, navigate])

    // Đăng ký sự kiện socket
    useEffect(() => {
        const handleRoomJoined = (data) => {
            setRoomId(data.roomId)
            setSocketError(null)
            const content = data.message || 'Bạn đã tham gia phòng chat.'
            const systemMessage = {
                id: `system-${Date.now()}`,
                content,
                sender: { id: 'system', name: 'System' },
                timestamp: new Date().toISOString(),
                isSystemMessage: true,
            }
            setMessages((prev) => {
                if (prev.some(msg => msg.isSystemMessage && msg.content === content)) {
                    return prev
                }
                return [...prev, systemMessage]
            })
        }

        const handleUserJoined = (data) => {
            const systemMessage = {
                id: `system-${Date.now()}`,
                content: `${data.username} đã tham gia phòng.`,
                sender: { id: 'system', name: 'System' },
                timestamp: new Date().toISOString(),
                isSystemMessage: true,
            }
            setMessages((prev) => {
                if (prev.some(msg => msg.isSystemMessage && msg.content === systemMessage.content)) {
                    return prev
                }
                return [...prev, systemMessage]
            })
            setUsersInRoom((prev) => {
                const newUser = { id: data.userId, name: data.username }
                if (!prev.some((user) => user.id === data.userId)) {
                    return [...prev, newUser]
                }
                return prev
            })
        }

        const handleUserLeft = (data) => {
            const leftName = data.username || usersInRoom.find(user => user.id === data.userId)?.name || 'Ẩn danh'
            const systemMessage = {
                id: `system-${Date.now()}`,
                content: `${leftName} đã rời phòng.`,
                sender: { id: 'system', name: 'System' },
                timestamp: new Date().toISOString(),
                isSystemMessage: true,
            }
            setMessages((prev) => {
                if (prev.some(msg => msg.isSystemMessage && msg.content === systemMessage.content)) {
                    return prev
                }
                return [...prev, systemMessage]
            })
            setUsersInRoom((prev) => prev.filter((user) => user.id !== data.userId))
        }

        const handleRoomUsers = (data) => {
            setUsersInRoom(data.users.map((user) => ({
                id: user.userId,
                name: user.username,
            })))
        }

        const handleNewMessage = (data) => {
            const sender = {
                id: data.userId,
                name: data.username || usersInRoom.find(user => user.id === data.userId)?.name || 'Ẩn danh',
                avatar: data.avatarUrl || usersInRoom.find(user => user.id === data.userId)?.avatar || null,
            }
            const newMessage = {
                id: data.id || data._id,
                content: data.content,
                sender: sender,
                timestamp: data.createdAt || data.createAt || new Date().toISOString(),
                isCurrentUser: data.userId === userData.userId,
                type: data.type,
                imageUrl: data.imageUrl || null,
                status: data.status,
            }
            setMessages((prev) => {
                if (prev.some(msg => msg.id === newMessage.id)) {
                    return prev
                }
                return [...prev, newMessage]
            })
        }

        const handleRoomMessages = (data) => {
            const newMessages = data.messages.map((msg) => {
                const sender = {
                    id: msg.userId,
                    name: msg.username || usersInRoom.find(user => user.id === msg.userId)?.name || 'Ẩn danh',
                    avatar: msg.avatarUrl || usersInRoom.find(user => user.id === msg.userId)?.avatar || null,
                }
                return {
                    id: msg.id || msg._id,
                    content: msg.content,
                    sender: sender,
                    timestamp: msg.createdAt || msg.createAt,
                    isCurrentUser: msg.userId === userData.userId,
                    type: msg.type,
                    imageUrl: msg.imageUrl || null,
                    status: msg.status,
                }
            })
            setMessages((prev) => {
                const uniqueMessages = newMessages.filter(
                    (msg) => !prev.some((existing) => existing.id === msg.id)
                )
                setHasMoreMessages(uniqueMessages.length === limit)
                setIsLoadingMessages(false)
                return [...uniqueMessages, ...prev]
            })
        }

        const handleJoinDm = (data) => {
            const { dmRoomId } = data
            // Ưu tiên otherUserId server trả về (chống lệch khi bấm nhanh nhiều người)
            const recipientId = data.otherUserId || currentRecipientIdRef.current

            if (!recipientId) {
                return
            }

            setDmRoomIds((prev) => ({
                ...prev,
                [recipientId]: dmRoomId,
            }))

            if (fetchedDmMessagesRef.current.has(recipientId)) {
                return
            }
            fetchedDmMessagesRef.current.set(recipientId, dmRoomId)

            socketService.getDirectMessages(userData.userId, recipientId, 1, limit)
        }

        const handleNewDm = (data) => {
            const sender = {
                id: data.userId,
                name: data.username || usersInRoom.find(user => user.id === data.userId)?.name || 'Ẩn danh',
                avatar: data.avatarUrl || usersInRoom.find(user => user.id === data.userId)?.avatar || null,
            }
            const newMessage = {
                id: data.id || data._id,
                content: data.content,
                sender: sender,
                timestamp: data.createdAt || data.createAt || new Date().toISOString(),
                isCurrentUser: data.userId === userData.userId,
                type: data.type,
                imageUrl: data.imageUrl || null,
            }
            // Khoá hội thoại = người còn lại trong members (khác mình)
            const recipientId = Array.isArray(data.members)
                ? data.members.find((id) => id !== userData.userId)
                : (data.userId === userData.userId ? data.recipientId : data.userId)

            setPrivateMessages((prev) => {
                const currentMessages = prev[recipientId] || []
                // Kiểm tra xem tin nhắn đã tồn tại chưa
                if (currentMessages.some(msg => msg.id === newMessage.id)) {
                    return prev
                }

                // Kiểm tra xem có tin nhắn tạm (temp-id) với cùng nội dung không
                const tempMessageIndex = currentMessages.findIndex(
                    msg => msg.id.startsWith('temp-') && msg.content === newMessage.content && msg.sender.id === newMessage.sender.id
                )
                if (tempMessageIndex !== -1) {
                    // Thay thế tin nhắn tạm bằng tin nhắn thực
                    const updatedMessages = [...currentMessages]
                    updatedMessages[tempMessageIndex] = newMessage
                    return {
                        ...prev,
                        [recipientId]: updatedMessages,
                    }
                }

                // Nếu không có tin nhắn tạm, thêm tin nhắn mới
                return {
                    ...prev,
                    [recipientId]: [...currentMessages, newMessage],
                }
            })
        }

        const handleDmMessages = (data) => {
            const { messages = [] } = data
            // Khoá hội thoại = người còn lại trong members (khác mình)
            const recipientId = Array.isArray(data.members)
                ? data.members.find((id) => id !== userData.userId)
                : Object.keys(dmRoomIds).find((key) => dmRoomIds[key] === data.dmRoomId)
            if (recipientId) {
                const formattedMessages = messages.map((msg) => ({
                    id: msg.id || msg._id,
                    content: msg.content,
                    sender: {
                        id: msg.userId,
                        name: msg.username || usersInRoom.find(user => user.id === msg.userId)?.name || 'Ẩn danh',
                        avatar: msg.avatarUrl || usersInRoom.find(user => user.id === msg.userId)?.avatar || null,
                    },
                    timestamp: msg.createdAt || msg.createAt || new Date().toISOString(),
                    isCurrentUser: msg.userId === userData.userId,
                    type: msg.type,
                    imageUrl: msg.imageUrl || null,
                }))
                setPrivateMessages((prev) => ({
                    ...prev,
                    [recipientId]: formattedMessages,
                }))
            } else {
                console.log(`No recipientId found for dmRoomId ${dmRoomId}`)
            }
        }

        const handleMessageRecalled = (data) => {
            const recalledId = data.messageId
            if (!recalledId) return
            const patch = (msg) =>
                msg.id === recalledId
                    ? { ...msg, recalled: true, content: data.content || 'Tin nhắn đã được thu hồi', type: 'TEXT', imageUrl: null }
                    : msg
            setMessages((prev) => prev.map(patch))
            setPrivateMessages((prev) => {
                const next = {}
                for (const key of Object.keys(prev)) next[key] = prev[key].map(patch)
                return next
            })
        }

        socketService.on(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined)
        socketService.on(SOCKET_EVENTS.MESSAGE_RECALLED, handleMessageRecalled)
        socketService.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined)
        socketService.on(SOCKET_EVENTS.USER_LEFT, handleUserLeft)
        socketService.on(SOCKET_EVENTS.ROOM_USERS, handleRoomUsers)
        socketService.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage)
        socketService.on(SOCKET_EVENTS.ROOM_MESSAGES, handleRoomMessages)
        socketService.on(SOCKET_EVENTS.JOIN_DM_SUCCESS, handleJoinDm)
        socketService.on(SOCKET_EVENTS.NEW_DM, handleNewDm)
        socketService.on(SOCKET_EVENTS.DM_MESSAGES, handleDmMessages)

        return () => {
            socketService.off(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined)
            socketService.off(SOCKET_EVENTS.MESSAGE_RECALLED, handleMessageRecalled)
            socketService.off(SOCKET_EVENTS.USER_JOINED, handleUserJoined)
            socketService.off(SOCKET_EVENTS.USER_LEFT, handleUserLeft)
            socketService.off(SOCKET_EVENTS.ROOM_USERS, handleRoomUsers)
            socketService.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage)
            socketService.off(SOCKET_EVENTS.ROOM_MESSAGES, handleRoomMessages)
            socketService.off(SOCKET_EVENTS.JOIN_DM_SUCCESS, handleJoinDm)
            socketService.off(SOCKET_EVENTS.NEW_DM, handleNewDm)
            socketService.off(SOCKET_EVENTS.DM_MESSAGES, handleDmMessages)
        }
    }, [userData, usersInRoom, dmRoomIds])

    // Tham gia phòng cộng đồng
    useEffect(() => {
        if (!isConnected || !heritageId || !userData || hasJoinedRef.current) {
            return
        }

        socketService.joinRoom(heritageId, userData)
        hasJoinedRef.current = true
    }, [isConnected, heritageId, userData])

    // Lấy tin nhắn lần đầu khi có roomId (cho cộng đồng)
    useEffect(() => {
        if (roomId && !hasFetchedMessagesRef.current) {
            setIsLoadingMessages(true)
            socketService.getMessages(roomId, limit)
            hasFetchedMessagesRef.current = true
        }
    }, [roomId])

    // Tải thêm tin nhắn khi kéo lên (cho cộng đồng)
    const loadMoreMessages = useCallback(() => {
        if (!roomId || isLoadingMessages || !hasMoreMessages) {
            return
        }
        const lastMessageTimestamp = messages.length > 0 ? messages[0].timestamp : null
        setIsLoadingMessages(true)
        socketService.getMessages(roomId, limit, lastMessageTimestamp)
    }, [roomId, messages, isLoadingMessages, hasMoreMessages])

    // Gửi tin nhắn cộng đồng (hỗ trợ ảnh: truyền { type:'IMAGE', imageUrl })
    const sendMessage = useCallback((content, options = {}) => {
        if (!isConnected || !roomId) {
            return
        }

        const messageData = {
            content,
            type: options.type || 'TEXT',
            imageUrl: options.imageUrl || undefined,
            userId: userData.userId,
            username: userData.username,
            avatarUrl: userData.avatar || undefined,
        }

        socketService.sendMessage(roomId, messageData)
    }, [isConnected, roomId, userData])

    // Tham gia phòng chat riêng
    const joinDirectRoom = useCallback((recipientId) => {
        if (!isConnected || !userData) {
            return
        }

        currentRecipientIdRef.current = recipientId
        socketService.joinDirectRoom(userData.userId, recipientId, userData)

        setDmRoomIds((prev) => ({
            ...prev,
            [recipientId]: prev[recipientId] || null,
        }))
    }, [isConnected, userData])

    // Gửi tin nhắn riêng (hỗ trợ ảnh: truyền { type:'IMAGE', imageUrl })
    const sendDirectMessage = useCallback((recipientId, content, options = {}) => {
        if (!isConnected) {
            return
        }

        const messageData = {
            content,
            type: options.type || 'TEXT',
            imageUrl: options.imageUrl || undefined,
            username: userData.username,
            avatarUrl: userData.avatar || undefined,
        }

        // Server tự tìm/khởi tạo phòng DM từ 2 userId -> không cần dmRoomId
        socketService.sendDirectMessage(userData.userId, recipientId, messageData)

        // Thêm tin nhắn vào state ngay lập tức
        const newMessage = {
            id: `temp-${Date.now()}`,
            content,
            sender: { id: userData.userId, name: userData.username, avatar: userData.avatar || null },
            timestamp: new Date().toISOString(),
            isCurrentUser: true,
            type: options.type || 'TEXT',
            imageUrl: options.imageUrl || null,
        }
        setPrivateMessages((prev) => {
            const currentMessages = prev[recipientId] || []
            // Kiểm tra xem có tin nhắn tương tự (cùng nội dung, cùng sender) chưa
            if (currentMessages.some(msg => msg.content === newMessage.content && msg.sender.id === newMessage.sender.id && msg.timestamp === newMessage.timestamp)) {
                return prev
            }
            return {
                ...prev,
                [recipientId]: [...currentMessages, newMessage],
            }
        })
    }, [isConnected, userData, dmRoomIds])

    // Thu hồi tin nhắn (mọi người thấy "đã thu hồi") - chỉ người gửi
    const recallMessage = useCallback((messageId) => {
        if (!isConnected || !messageId) return
        socketService.recallMessage(messageId)
    }, [isConnected])

    // Xoá tin nhắn ở phía mình (chỉ ẩn local, không ảnh hưởng người khác)
    const deleteMessageLocal = useCallback((messageId) => {
        if (!messageId) return
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
        setPrivateMessages((prev) => {
            const next = {}
            for (const key of Object.keys(prev)) next[key] = prev[key].filter((m) => m.id !== messageId)
            return next
        })
    }, [])

    return {
        isConnected,
        messages,
        privateMessages,
        usersInRoom,
        sendMessage,
        joinDirectRoom,
        sendDirectMessage,
        recallMessage,
        deleteMessageLocal,
        roomId,
        socketError,
        isLoadingMessages,
        hasMoreMessages,
        loadMoreMessages,
        typingUsers: [],
        handleTyping: () => { },
    }
}

export default useSocket