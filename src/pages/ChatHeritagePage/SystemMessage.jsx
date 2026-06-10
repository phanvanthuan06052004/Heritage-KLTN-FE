/**
 * Component hiển thị tin nhắn hệ thống
 * @param {Object} props
 * @param {Object} props.message - Thông tin tin nhắn hệ thống
 */
const SystemMessage = ({ message }) => {
  return (
    <div className='my-3 flex justify-center animate-fade-in'>
      <div className='rounded-full border border-museum-gold/20 bg-museum-gold/10 px-4 py-1.5 text-xs text-museum-gold-light'>
        <p>{message.content}</p>
      </div>
    </div>
  )
}

export default SystemMessage
