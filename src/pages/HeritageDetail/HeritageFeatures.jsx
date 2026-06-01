import { Award, Lock, MapPin, Play, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '~/lib/utils'

const features = [
  {
    value: 'knowledge-test',
    icon: Star,
    labelKey: 'heritageFeatures.knowledgeTest',
    description: 'Kiểm tra kiến thức sau khi đọc tư liệu.',
  },
  {
    value: 'leaderboard',
    icon: Award,
    labelKey: 'heritageFeatures.leaderboard',
    description: 'Xem thứ hạng của người học trong cộng đồng.',
  },
  {
    value: 'chatroom',
    icon: MapPin,
    labelKey: 'heritageFeatures.chatroom',
    description: 'Đặt câu hỏi và trò chuyện về di sản này.',
  },
  {
    value: 'roleplay',
    icon: Play,
    labelKey: 'heritageFeatures.roleplay',
    description: 'Trải nghiệm nhập vai đang được phát triển.',
    disabled: true,
  },
]

const HeritageFeatures = ({ handleFeatureClick, isAuthenticated }) => {
  const { t } = useTranslation()

  return (
    <section className='rounded-3xl border border-museum-gold/14 bg-museum-ivory/[0.04] p-5 text-museum-ivory sm:p-6'>
      <div className='mb-5 max-w-2xl'>
        <h2 className='font-display text-2xl font-semibold text-museum-ivory sm:text-3xl'>
          Khám phá tương tác
        </h2>
        <p className='mt-2 text-sm leading-6 text-museum-muted'>
          Các hoạt động này nối phần đọc tư liệu với kiểm tra, thảo luận và học tập theo ngữ cảnh.
        </p>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {features.map((feature) => {
          const Icon = feature.icon
          const needsAuth = !feature.disabled && !isAuthenticated

          return (
            <button
              key={feature.value}
              type='button'
              disabled={feature.disabled}
              onClick={() => handleFeatureClick(feature.value)}
              className={cn(
                'group flex min-h-[150px] flex-col items-start rounded-2xl border p-4 text-left transition-colors duration-200',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light',
                feature.disabled
                  ? 'cursor-not-allowed border-museum-gold/10 bg-museum-black/20 text-museum-muted/60'
                  : 'border-museum-gold/16 bg-museum-black/24 text-museum-ivory hover:border-museum-gold/35 hover:bg-museum-gold/10',
              )}
              aria-label={t(feature.labelKey)}
            >
              <span className='flex h-11 w-11 items-center justify-center rounded-full bg-museum-gold/12 text-museum-gold-light'>
                <Icon className='h-5 w-5' aria-hidden='true' />
              </span>
              <span className='mt-4 flex items-center gap-2 font-semibold'>
                {t(feature.labelKey)}
                {needsAuth && <Lock size={13} className='text-museum-seal' />}
              </span>
              <span className='mt-2 text-sm leading-6 text-museum-muted'>{feature.description}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default HeritageFeatures
