import { Award, MapPin, Play, Star, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '~/lib/utils';

const features = [
  {
    value: 'knowledge-test',
    icon: Star,
    labelKey: 'heritageFeatures.knowledgeTest',
    label: 'Trắc nghiệm',
  },
  {
    value: 'leaderboard',
    icon: Award,
    labelKey: 'heritageFeatures.leaderboard',
    label: 'Bảng xếp hạng',
  },
  {
    value: 'chatroom',
    icon: MapPin,
    labelKey: 'heritageFeatures.chatroom',
    label: 'Trò chuyện',
  },
  {
    value: 'roleplay',
    icon: Play,
    labelKey: 'heritageFeatures.roleplay',
    label: 'Sắp ra mắt',
    disabled: true,
  },
];

const HeritageFeatures = ({ handleFeatureClick, isAuthenticated }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* ── xl+: Fixed floating sidebar ── */}
      <div className='pointer-events-none fixed inset-y-0 left-8 z-30 hidden items-center xl:flex'>
        <div className='pointer-events-auto rounded-full border border-museum-gold/20 bg-museum-black/65 px-3 py-5 shadow-museum-card backdrop-blur-xl'>
          <nav className='flex flex-col items-center space-y-8' aria-label='Tính năng tương tác'>
            {features.map((feature) => {
              const Icon = feature.icon;
              const needsAuth = !feature.disabled && !isAuthenticated;

              return (
                <button
                  key={feature.value}
                  type='button'
                  disabled={feature.disabled}
                  onClick={() => handleFeatureClick(feature.value)}
                  className={cn(
                    'group relative inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                    feature.disabled
                      ? 'cursor-not-allowed text-museum-muted/50'
                      : needsAuth
                        ? 'text-museum-muted hover:bg-museum-ivory/10 hover:text-museum-gold-light'
                        : 'text-museum-muted hover:bg-museum-ivory/10 hover:text-museum-gold-light'
                  )}
                  aria-label={t(feature.labelKey)}
                >
                  {needsAuth && (
                    <Lock
                      size={10}
                      className='absolute -right-0.5 -top-0.5 rounded-full bg-museum-seal p-0.5 text-museum-ivory'
                    />
                  )}
                  <Icon className='h-5 w-5' aria-hidden='true' />
                  <span className='pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-full bg-museum-black/90 px-3 py-1 text-xs text-museum-ivory opacity-0 shadow-lg transition-opacity group-hover:opacity-100'>
                    {t(feature.labelKey)}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── < xl: Inline compact pill strip ── */}
      <div className='-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 museum-scrollbar xl:hidden'>
        {features.map((feature) => {
          const Icon = feature.icon;
          const needsAuth = !feature.disabled && !isAuthenticated;

          return (
            <button
              key={feature.value}
              type='button'
              disabled={feature.disabled}
              onClick={() => handleFeatureClick(feature.value)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                feature.disabled
                  ? 'cursor-not-allowed border border-museum-gold/10 bg-museum-ivory/3 text-museum-muted/60'
                  : 'border border-museum-gold/20 bg-museum-ivory/7 text-museum-ivory hover:border-museum-gold/40 hover:bg-museum-gold/12 hover:text-museum-gold-light hover:shadow-museum-gold'
              )}
              aria-label={t(feature.labelKey)}
            >
              <Icon className='h-4 w-4' />
              <span>{t(feature.labelKey)}</span>
              {needsAuth && <Lock size={12} className='text-museum-seal' />}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default HeritageFeatures;