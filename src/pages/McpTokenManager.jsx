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

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTokenName.trim()) {
      toast.error(t('profile.mcp.inputEmptyError'))
      return
    }

    try {
      const res = await createToken({ name: newTokenName.trim() }).unwrap()
      setGeneratedToken(res.data?.token || res.token || res.data)
      setNewTokenName('')
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
    <div className='space-y-8 text-museum-ivory'>
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
            <form onSubmit={handleCreate} className='flex flex-col sm:flex-row gap-3'>
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
                    <div className='space-y-1'>
                      <div className='font-medium text-sm text-museum-ivory'>{token.name}</div>
                      <div className='flex items-center gap-2 text-xs text-museum-muted'>
                        <span className='font-mono bg-museum-black/35 px-1.5 py-0.5 rounded border border-museum-gold/10'>
                          {token.tokenPreview}
                        </span>
                        <span>· {t('profile.mcp.tokenCreatedAt')} {new Date(token.createdAt).toLocaleDateString()}</span>
                        {token.lastUsedAt && (
                          <span>· {t('profile.mcp.tokenLastUsedAt')} {new Date(token.lastUsedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevoke(token.id)}
                      disabled={isRevoking}
                      className='p-2 hover:bg-red-500/10 text-museum-muted hover:text-red-400 rounded-lg transition-colors'
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
    </div>
  )
}

export default McpTokenManager
