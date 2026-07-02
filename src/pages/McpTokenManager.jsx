import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useListMcpTokensQuery,
  useCreateMcpTokenMutation,
  useRevokeMcpTokenMutation,
} from '~/store/apis/mcpTokenSlice'
import { Button } from '~/components/common/ui/Button'
import {
  Key,
  Copy,
  Trash2,
  Plus,
  BookOpen,
  Terminal,
  Check,
  Loader2,
  HelpCircle,
  AlertCircle,
  Shield,
} from 'lucide-react'
import { toast } from 'react-toastify'

const fieldBaseClass =
  'w-full rounded-xl border border-museum-gold/20 bg-museum-black/45 px-4 py-3 text-sm text-museum-ivory transition-colors placeholder:text-museum-muted/70 focus:border-museum-gold-light focus:outline-none focus:ring-2 focus:ring-museum-gold/25'

const McpTokenManager = () => {
  const { t } = useTranslation()
  const { data: tokens = [], isLoading, refetch } = useListMcpTokensQuery()
  const [createToken, { isLoading: isCreating }] = useCreateMcpTokenMutation()
  const [revokeToken, { isLoading: isRevoking }] = useRevokeMcpTokenMutation()

  const [newTokenName, setNewTokenName] = useState('')
  const [generatedToken, setGeneratedToken] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Scope & Consent modal state
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false)
  const [selectedScopes, setSelectedScopes] = useState(['heritage:read'])
  const [hasAcceptedConsent, setHasAcceptedConsent] = useState(false)

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    if (!newTokenName.trim()) {
      toast.error(t('profile.mcp.inputEmptyError'))
      return
    }
    // Open the security confirmation modal
    setIsConsentModalOpen(true)
  }

  const handleConfirmCreate = async () => {
    if (!hasAcceptedConsent) {
      toast.error('Bạn phải đồng ý với điều khoản bảo mật trước khi tiếp tục.')
      return
    }

    try {
      const res = await createToken({
        name: newTokenName.trim(),
        scopes: selectedScopes,
      }).unwrap()
      
      setGeneratedToken(res.data?.token || res.token || res.data)
      setNewTokenName('')
      setIsConsentModalOpen(false)
      setHasAcceptedConsent(false)
      setSelectedScopes(['heritage:read'])
      toast.success(t('profile.mcp.createSuccess'))
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || t('profile.mcp.createFailed'))
    }
  }

  const handleRevoke = async (id) => {
    if (!window.confirm(t('profile.mcp.deleteConfirm'))) {
      return
    }

    try {
      await revokeToken(id).unwrap()
      toast.success(t('profile.mcp.deleteSuccess'))
      if (generatedToken) setGeneratedToken(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || t('profile.mcp.deleteFailed'))
    }
  }

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(t('profile.mcp.copied'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  // MCP base URL structure for Streamable HTTP / SSE
  const mcpUrl = `${window.location.protocol}//${window.location.host.replace(':5173', ':5055')}/mcp`

  const claudeConfigExample = JSON.stringify(
    {
      mcpServers: {
        'heritage-ai': {
          command: 'npx',
          args: [
            '-y',
            'mcp-remote',
            mcpUrl,
            '--header',
            `Authorization: Bearer ${generatedToken || 'YOUR_TOKEN_HERE'}`
          ]
        }
      }
    },
    null,
    2
  )

  return (
    <div className='space-y-8 text-museum-ivory relative'>
      {/* Intro section */}
      <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-museum-gold/15 pb-6'>
        <div className='space-y-2'>
          <h3 className='font-display text-2xl font-semibold text-museum-gold-light flex items-center gap-2'>
            <Key className='h-6 w-6' /> {t('profile.mcp.title')}
          </h3>
          <p className='text-sm text-museum-muted leading-relaxed max-w-2xl'>
            {t('profile.mcp.subtitle')}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left column: token manager & list */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Create Token form */}
          <div className='rounded-2xl border border-museum-gold/15 bg-museum-black/25 p-5 space-y-4'>
            <h4 className='font-semibold text-museum-gold-light text-base'>{t('profile.mcp.createSection')}</h4>
            <form onSubmit={handleCreateSubmit} className='flex flex-col sm:flex-row gap-3'>
              <input
                type='text'
                placeholder={t('profile.mcp.placeholderName')}
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                disabled={isCreating}
                className={fieldBaseClass}
              />
              <Button
                type='submit'
                disabled={isCreating}
                className='rounded-xl bg-museum-gold text-museum-black hover:bg-museum-gold-light font-medium py-3 px-6 shrink-0 flex items-center justify-center gap-2'
              >
                {isCreating ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Plus className='h-4 w-4' />
                )}
                <span>{t('profile.mcp.createButton')}</span>
              </Button>
            </form>

            {/* Generated token alert display */}
            {generatedToken && (
              <div className='mt-4 p-4 rounded-xl border border-museum-gold/30 bg-museum-gold/5 space-y-3 animate-fade-in'>
                <div className='flex items-start gap-2 text-museum-gold-light text-sm font-medium'>
                  <AlertCircle className='h-5 w-5 shrink-0 mt-0.5' />
                  <div>
                    <span className='font-bold block'>{t('profile.mcp.securityWarningTitle')}</span>
                    <span>{t('profile.mcp.securityWarningText')}</span>
                  </div>
                </div>
                <div className='flex items-center gap-2 bg-museum-black/50 border border-museum-gold/25 rounded-lg p-3 overflow-x-auto'>
                  <code className='text-museum-gold-light text-xs font-mono select-all flex-1 break-all pr-2'>
                    {generatedToken}
                  </code>
                  <button
                    onClick={() => handleCopy(generatedToken, 'new-token')}
                    className='p-2 hover:bg-museum-gold/15 text-museum-gold-light hover:text-museum-gold-light rounded transition-colors shrink-0'
                    title='Copy'
                  >
                    {copiedId === 'new-token' ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tokens List */}
          <div className='rounded-2xl border border-museum-gold/15 bg-museum-black/25 p-5 space-y-4'>
            <h4 className='font-semibold text-museum-gold-light text-base'>{t('profile.mcp.activeTokensSection')}</h4>
            {isLoading ? (
              <div className='flex justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin text-museum-gold-light' />
              </div>
            ) : tokens.length === 0 ? (
              <p className='text-sm text-museum-muted py-6 text-center italic'>
                {t('profile.mcp.noTokensText')}
              </p>
            ) : (
              <div className='divide-y divide-museum-gold/10 max-h-[400px] overflow-y-auto pr-1'>
                {tokens.map((token) => (
                  <div key={token.id} className='py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0'>
                    <div className='space-y-1.5 flex-1 min-w-0'>
                      <div className='font-medium text-sm text-museum-ivory'>{token.name}</div>
                      <div className='flex flex-wrap items-center gap-2 text-xs text-museum-muted'>
                        <span className='font-mono bg-museum-black/35 px-1.5 py-0.5 rounded border border-museum-gold/10 shrink-0'>
                          {token.tokenPreview}
                        </span>
                        
                        {/* Scope Badges */}
                        {token.scopes && token.scopes.length > 0 ? (
                          <div className='flex flex-wrap gap-1'>
                            {token.scopes.map((scope) => {
                              let scopeColor = 'bg-museum-gold/10 text-museum-gold border-museum-gold/20'
                              if (scope === 'user:read') scopeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              if (scope === 'wiki:write') scopeColor = 'bg-green-500/10 text-green-400 border-green-500/20'
                              
                              return (
                                <span
                                  key={scope}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${scopeColor}`}
                                >
                                  {scope}
                                </span>
                              )
                            })}
                          </div>
                        ) : (
                          <span className='px-1.5 py-0.5 rounded text-[10px] font-mono bg-museum-gold/10 text-museum-gold border border-museum-gold/20'>
                            heritage:read
                          </span>
                        )}

                        <span className='shrink-0'>· {t('profile.mcp.tokenCreatedAt')} {new Date(token.createdAt).toLocaleDateString()}</span>
                        {token.lastUsedAt && (
                          <span className='shrink-0'>· {t('profile.mcp.tokenLastUsedAt')} {new Date(token.lastUsedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevoke(token.id)}
                      disabled={isRevoking}
                      className='p-2 hover:bg-red-500/10 text-museum-muted hover:text-red-400 rounded-lg transition-colors shrink-0'
                      title='Revoke'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: connection guides */}
        <div className='space-y-6'>
          <div className='rounded-2xl border border-museum-gold/15 bg-museum-black/35 p-5 space-y-5'>
            <h4 className='font-semibold text-museum-gold-light text-base flex items-center gap-2'>
              <BookOpen className='h-5 w-5' /> {t('profile.mcp.guideSection')}
            </h4>

            {/* Connection params card */}
            <div className='space-y-3 bg-museum-black/20 border border-museum-gold/10 p-4 rounded-xl text-xs'>
              <span className='font-semibold text-museum-gold-light uppercase tracking-wider block mb-1'>{t('profile.mcp.paramsTitle')}</span>
              <div className='space-y-1.5'>
                <span className='text-museum-muted block'>{t('profile.mcp.serverSseLabel')}</span>
                <code className='block bg-museum-black/60 px-2 py-1 rounded font-mono break-all text-museum-gold-light border border-museum-gold/10 select-all'>
                  {mcpUrl}
                </code>
              </div>
              <div className='space-y-1.5 pt-2 border-t border-museum-gold/10'>
                <span className='text-museum-muted block'>{t('profile.mcp.authLabel')}</span>
                <code className='block bg-museum-black/60 px-2 py-1 rounded font-mono break-all text-museum-gold-light border border-museum-gold/10 select-all'>
                  Bearer YOUR_TOKEN_HERE
                </code>
              </div>
            </div>

            {/* Guides by client */}
            <div className='space-y-4'>
              {/* Claude Desktop */}
              <div className='space-y-2 border-t border-museum-gold/10 pt-4'>
                <span className='font-medium text-sm text-museum-ivory flex items-center gap-1.5'>
                  <Terminal className='h-4 w-4 text-museum-gold' /> {t('profile.mcp.claudeTitle')}
                </span>
                <p className='text-xs text-museum-muted leading-relaxed'>
                  {t('profile.mcp.claudeText')}
                </p>
                <div className='relative'>
                  <pre className='bg-museum-black/60 p-3 rounded-lg border border-museum-gold/10 text-[10px] font-mono overflow-x-auto text-museum-muted max-h-[220px]'>
                    {claudeConfigExample}
                  </pre>
                  <button
                    onClick={() => handleCopy(claudeConfigExample, 'claude-json')}
                    className='absolute top-2 right-2 p-1.5 bg-museum-black/80 hover:bg-museum-gold/15 text-museum-gold hover:text-museum-gold-light rounded transition-colors'
                    title='Copy config'
                  >
                    {copiedId === 'claude-json' ? <Check className='h-3.5 w-3.5' /> : <Copy className='h-3.5 w-3.5' />}
                  </button>
                </div>
              </div>

              {/* ChatGPT Web & others */}
              <div className='space-y-2 border-t border-museum-gold/10 pt-4'>
                <span className='font-medium text-sm text-museum-ivory flex items-center gap-1.5'>
                  <HelpCircle className='h-4 w-4 text-museum-gold' /> {t('profile.mcp.chatgptTitle')}
                </span>
                <p className='text-xs text-museum-muted leading-relaxed'>
                  {t('profile.mcp.chatgptText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Privacy Consent Modal */}
      {isConsentModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-museum-black/80 backdrop-blur-sm p-4 animate-fade-in'>
          <div className='w-full max-w-2xl rounded-2xl border border-museum-gold/30 bg-museum-black/95 p-6 md:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] text-museum-ivory'>
            {/* Header */}
            <div className='flex items-start justify-between border-b border-museum-gold/15 pb-4'>
              <div className='space-y-1'>
                <h4 className='font-display text-xl font-bold text-museum-gold-light flex items-center gap-2'>
                  <Shield className='h-5 w-5 text-museum-gold animate-pulse' />
                  Xác thực & Cấp quyền Kết nối AI (MCP)
                </h4>
                <p className='text-xs text-museum-muted'>
                  Thiết lập bảo mật và giới hạn phạm vi truy cập dữ liệu của bên thứ ba.
                </p>
              </div>
            </div>

            {/* Warning Section */}
            <div className='rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2 text-xs leading-relaxed text-red-200'>
              <span className='font-bold flex items-center gap-1.5 text-red-400'>
                <AlertCircle className='h-4 w-4 shrink-0' />
                Cảnh báo bảo mật quyền riêng tư
              </span>
              <p>
                Bằng việc kết nối với các ứng dụng AI Client bên thứ ba (như Claude Desktop, ChatGPT, cursor...), các thông tin tri thức di sản và dữ liệu tài khoản cá nhân của bạn sẽ được truyền đi để phục vụ xử lý truy vấn. Heritage không quản lý và chịu trách nhiệm đối với cách thức xử lý dữ liệu của các bên này.
              </p>
              <a
                href='/privacy/mcp-policy'
                target='_blank'
                rel='noopener noreferrer'
                className='text-museum-gold hover:text-museum-gold-light font-medium underline inline-block mt-1'
              >
                Đọc kỹ Chính sách Bảo mật Kết nối AI tại đây
              </a>
            </div>

            {/* Scope Selection */}
            <div className='space-y-4'>
              <span className='text-sm font-semibold text-museum-gold-light block'>
                Chọn các quyền truy cập (Scopes) cấp cho Token:
              </span>
              <div className='space-y-3'>
                {/* Scope 1: Heritage Read */}
                <div className='flex items-start gap-3 p-4 rounded-xl border border-museum-gold/30 bg-museum-gold/5 transition-colors select-none'>
                  <input
                    type='checkbox'
                    checked={true}
                    disabled={true}
                    className='mt-1 h-4 w-4 rounded border-museum-gold/30 bg-museum-black text-museum-gold focus:ring-museum-gold focus:ring-offset-museum-black'
                  />
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-sm text-museum-ivory'>Tri thức Di sản & Tài liệu công khai</span>
                      <span className='px-1.5 py-0.5 rounded text-[9px] font-mono bg-museum-gold/15 text-museum-gold border border-museum-gold/25 shrink-0'>
                        heritage:read
                      </span>
                    </div>
                    <p className='text-xs text-museum-muted leading-relaxed'>
                      Cho phép AI tìm kiếm tri thức, đọc các trang wiki di sản, tham khảo mục lục và trang tài liệu PDF/sách (VD: search_wiki, read_wiki_page, list_sources). Quyền này là bắt buộc để AI hoạt động.
                    </p>
                  </div>
                </div>

                {/* Scope 2: User Read */}
                <label className='flex items-start gap-3 p-4 rounded-xl border border-museum-gold/15 bg-museum-black/40 hover:border-museum-gold/30 transition-colors cursor-pointer select-none'>
                  <input
                    type='checkbox'
                    checked={selectedScopes.includes('user:read')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedScopes([...selectedScopes, 'user:read'])
                      } else {
                        setSelectedScopes(selectedScopes.filter((s) => s !== 'user:read'))
                      }
                    }}
                    className='mt-1 h-4 w-4 rounded border-museum-gold/30 bg-museum-black text-museum-gold focus:ring-museum-gold focus:ring-offset-museum-black'
                  />
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-sm text-museum-ivory'>Dữ liệu cá nhân (Yêu thích, Hành trình, Passport)</span>
                      <span className='px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/25 shrink-0'>
                        user:read
                      </span>
                    </div>
                    <p className='text-xs text-museum-muted leading-relaxed'>
                      Cho phép AI truy cập thông tin các di tích bạn yêu thích, danh sách hành trình du hành đã ghi, thống kê điểm số cấp độ Passport của bạn (VD: get_my_trips, get_my_favorites, get_my_passport_stats).
                    </p>
                  </div>
                </label>

                {/* Scope 3: Wiki Write */}
                <label className='flex items-start gap-3 p-4 rounded-xl border border-museum-gold/15 bg-museum-black/40 hover:border-museum-gold/30 transition-colors cursor-pointer select-none'>
                  <input
                    type='checkbox'
                    checked={selectedScopes.includes('wiki:write')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedScopes([...selectedScopes, 'wiki:write'])
                      } else {
                        setSelectedScopes(selectedScopes.filter((s) => s !== 'wiki:write'))
                      }
                    }}
                    className='mt-1 h-4 w-4 rounded border-museum-gold/30 bg-museum-black text-museum-gold focus:ring-museum-gold focus:ring-offset-museum-black'
                  />
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-sm text-museum-ivory'>Cộng tác đóng góp nội dung (Wiki Edit)</span>
                      <span className='px-1.5 py-0.5 rounded text-[9px] font-mono bg-green-500/15 text-green-400 border border-green-500/25 shrink-0'>
                        wiki:write
                      </span>
                    </div>
                    <p className='text-xs text-museum-muted leading-relaxed'>
                      Cho phép AI gửi yêu cầu chỉnh sửa wiki thay bạn, biên dịch tài liệu, đóng góp bài thảo luận, hoặc phê duyệt bản thảo (VD: propose_wiki_edit, edit_wiki_page, review_draft).
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Acceptance Checkbox */}
            <label className='flex items-start gap-3 p-3 rounded-lg bg-museum-black/35 border border-museum-gold/10 cursor-pointer select-none'>
              <input
                type='checkbox'
                checked={hasAcceptedConsent}
                onChange={(e) => setHasAcceptedConsent(e.target.checked)}
                className='mt-0.5 h-4 w-4 rounded border-museum-gold/30 bg-museum-black text-museum-gold focus:ring-museum-gold focus:ring-offset-museum-black shrink-0'
              />
              <span className='text-xs text-museum-ivory leading-relaxed'>
                Tôi hiểu rõ các nguy cơ bảo mật, đồng ý cấp các quyền hạn đã chọn cho AI Client và tự chịu trách nhiệm về các rủi ro bảo mật liên quan.
              </span>
            </label>

            {/* Action buttons */}
            <div className='flex items-center justify-end gap-3 pt-4 border-t border-museum-gold/15'>
              <Button
                onClick={() => {
                  setIsConsentModalOpen(false)
                  setHasAcceptedConsent(false)
                  setSelectedScopes(['heritage:read'])
                }}
                className='rounded-xl border border-museum-gold/25 text-museum-gold hover:bg-museum-gold/10 font-medium py-2.5 px-5'
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleConfirmCreate}
                disabled={!hasAcceptedConsent}
                className='rounded-xl bg-museum-gold text-museum-black hover:bg-museum-gold-light disabled:opacity-40 disabled:hover:bg-museum-gold font-semibold py-2.5 px-6 flex items-center gap-2'
              >
                Xác nhận & Tạo Token
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default McpTokenManager
