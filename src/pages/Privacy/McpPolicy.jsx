import { useTranslation } from 'react-i18next'
import { Shield, Key, FileText, CheckCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const McpPolicy = () => {
  const { t } = useTranslation()

  return (
    <div className='min-h-screen bg-museum-black text-museum-ivory py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto space-y-8'>
        {/* Back button */}
        <div className='flex items-center gap-2'>
          <Link
            to='/profile'
            className='inline-flex items-center gap-2 text-sm text-museum-gold hover:text-museum-gold-light transition-colors group'
          >
            <ArrowLeft className='h-4 w-4 transform group-hover:-translate-x-1 transition-transform' />
            Quay lại trang cá nhân
          </Link>
        </div>

        {/* Header */}
        <div className='border-b border-museum-gold/20 pb-8 text-center sm:text-left space-y-4'>
          <div className='inline-flex p-3 rounded-full bg-museum-gold/10 border border-museum-gold/20 text-museum-gold mb-2'>
            <Shield className='h-8 w-8' />
          </div>
          <h1 className='font-display text-3xl sm:text-4xl font-semibold text-museum-gold-light'>
            Chính sách Bảo mật Kết nối AI (MCP)
          </h1>
          <p className='text-sm text-museum-muted'>
            Cập nhật lần cuối: Tháng 7, 2026 · Phiên bản 1.0 (Bản thử nghiệm bảo mật)
          </p>
        </div>

        {/* Introduction */}
        <section className='bg-museum-black/40 border border-museum-gold/10 rounded-2xl p-6 space-y-4 leading-relaxed'>
          <h2 className='text-xl font-semibold text-museum-gold-light flex items-center gap-2'>
            <FileText className='h-5 w-5 text-museum-gold' /> 1. Giao thức Model Context Protocol (MCP) là gì?
          </h2>
          <p className='text-sm text-museum-muted'>
            Model Context Protocol (MCP) là một tiêu chuẩn mở cho phép các mô hình ngôn ngữ lớn (LLM) bên thứ ba 
            (ví dụ như Claude Desktop, ChatGPT, cursor...) kết nối trực tiếp với các ứng dụng bên ngoài một cách an toàn. 
            Khi bạn tạo một MCP Token trên nền tảng của chúng tôi, bạn đang cấp quyền cho AI Client cá nhân của mình 
            truy vấn cơ sở dữ liệu di sản văn hóa Việt Nam và dữ liệu tài khoản của bạn để trả lời các câu hỏi ngữ cảnh một cách thông minh hơn.
          </p>
        </section>

        {/* Scopes Definition */}
        <section className='bg-museum-black/40 border border-museum-gold/10 rounded-2xl p-6 space-y-6'>
          <h2 className='text-xl font-semibold text-museum-gold-light flex items-center gap-2'>
            <Key className='h-5 w-5 text-museum-gold' /> 2. Chi tiết về các Quyền hạn & Phạm vi truy cập (Scopes)
          </h2>
          <p className='text-sm text-museum-muted leading-relaxed'>
            Để bảo vệ thông tin cá nhân của bạn, chúng tôi phân chia quyền truy cập thành các phân vùng (Scope) rõ ràng. 
            AI Client chỉ có thể gọi các công cụ (tools) nằm trong phạm vi các Scope mà bạn đã cấp quyền khi tạo token:
          </p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 pt-2'>
            {/* Scope 1 */}
            <div className='p-5 rounded-xl border border-museum-gold/10 bg-museum-black/60 space-y-3'>
              <div className='inline-flex px-2 py-0.5 rounded text-[10px] font-mono bg-museum-gold/15 text-museum-gold border border-museum-gold/20'>
                heritage:read
              </div>
              <h3 className='font-semibold text-sm text-museum-ivory'>Tri thức Di sản công khai</h3>
              <p className='text-xs text-museum-muted leading-relaxed'>
                Cho phép AI tìm kiếm tri thức, đọc các trang wiki di sản, tham khảo tài liệu nguồn (sách, PDF) được chia sẻ công khai trên hệ thống.
              </p>
            </div>

            {/* Scope 2 */}
            <div className='p-5 rounded-xl border border-museum-gold/10 bg-museum-black/60 space-y-3'>
              <div className='inline-flex px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/20'>
                user:read
              </div>
              <h3 className='font-semibold text-sm text-museum-ivory'>Dữ liệu cá nhân</h3>
              <p className='text-xs text-museum-muted leading-relaxed'>
                Cho phép AI đọc danh sách di tích bạn đã yêu thích, các hành trình khám phá di sản đã lưu và các huy hiệu, cấp độ trong Passport Di sản của bạn.
              </p>
            </div>

            {/* Scope 3 */}
            <div className='p-5 rounded-xl border border-museum-gold/10 bg-museum-black/60 space-y-3'>
              <div className='inline-flex px-2 py-0.5 rounded text-[10px] font-mono bg-green-500/15 text-green-400 border border-green-500/20'>
                wiki:write
              </div>
              <h3 className='font-semibold text-sm text-museum-ivory'>Đóng góp & Cộng tác</h3>
              <p className='text-xs text-museum-muted leading-relaxed'>
                Cho phép AI gửi đề xuất chỉnh sửa trang wiki di sản, tạo bản thảo bài viết hoặc thực hiện các hoạt động biên soạn nội dung dưới danh nghĩa của bạn.
              </p>
            </div>
          </div>
        </section>

        {/* Data Sharing Disclaimer */}
        <section className='bg-museum-black/40 border border-museum-gold/10 rounded-2xl p-6 space-y-4 leading-relaxed'>
          <h2 className='text-xl font-semibold text-museum-gold-light flex items-center gap-2'>
            <Shield className='h-5 w-5 text-museum-gold' /> 3. Chia sẻ dữ liệu với Bên thứ ba & Rủi ro bảo mật
          </h2>
          <div className='text-sm text-museum-muted space-y-3'>
            <p>
              Khi bạn nhập MCP Token vào các ứng dụng AI bên thứ ba (như Claude Desktop của Anthropic hoặc ChatGPT của OpenAI), 
              dữ liệu được AI truy xuất thông qua giao thức này sẽ được gửi tới máy chủ của nhà cung cấp AI đó để xử lý và hiển thị câu trả lời cho bạn.
            </p>
            <div className='p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 text-xs space-y-2'>
              <span className='font-bold block'>⚠️ Cảnh báo Bảo mật quan trọng:</span>
              <ul className='list-disc pl-4 space-y-1.5'>
                <li>Chúng tôi <strong>không kiểm soát</strong> và <strong>không chịu trách nhiệm</strong> về cách thức các nhà cung cấp AI bên thứ ba (Anthropic, OpenAI, cursor...) xử lý, lưu trữ hoặc sử dụng dữ liệu của bạn sau khi truyền đi.</li>
                <li><strong>Tuyệt đối không</strong> chia sẻ MCP Token của bạn cho bất kỳ ai. Bất kỳ ai sở hữu token này đều có thể thay mặt bạn gọi các API được phân quyền tương ứng.</li>
                <li>Vui lòng đọc kỹ Điều khoản dịch vụ và Chính sách quyền riêng tư của chính nhà cung cấp AI mà bạn đang sử dụng trước khi thực hiện kết nối.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Revocation */}
        <section className='bg-museum-black/40 border border-museum-gold/10 rounded-2xl p-6 space-y-4 leading-relaxed'>
          <h2 className='text-xl font-semibold text-museum-gold-light flex items-center gap-2'>
            <CheckCircle className='h-5 w-5 text-museum-gold' /> 4. Quyền thu hồi & Quản lý Token của bạn
          </h2>
          <p className='text-sm text-museum-muted'>
            Bạn giữ toàn quyền kiểm soát các kết nối của mình. Tại bất kỳ thời điểm nào, bạn có thể thực hiện thu hồi (Xóa) 
            bất kỳ token nào đã tạo trong mục quản lý trên trang Cá nhân. Khi bạn nhấn Xóa, token đó sẽ bị hủy kích hoạt ngay lập tức 
            trên hệ thống backend và mọi kết nối AI đang sử dụng token đó sẽ bị ngắt kết nối và báo lỗi xác thực ngay lập tức.
          </p>
        </section>
      </div>
    </div>
  )
}

export default McpPolicy
