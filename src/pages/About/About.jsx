import { Map, MessageSquare, Rocket, Telescope, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/common/ui/Button'
import MotionReveal from '~/components/common/MotionReveal'
import MuseumSectionHeader from '~/components/common/MuseumSectionHeader'
import SectionContainer from './SectionContainer'
import SideNavigation from './SideNavigation'
import VisionItem from './components/VisionItem'
import SectionHeader from './components/SectionHeader'

const TeamMembers = lazy(() => import('./TeamMembers'))
const ContactInfo = lazy(() => import('./ContactInfo'))
const CoreValues = lazy(() => import('./CoreValues'))
const Timeline = lazy(() => import('./Timeline'))

const About = () => {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('vision')

  // Handle scroll-based section activation
  const handleScroll = useCallback(() => {
    const sections = ['vision', 'story', 'values', 'team', 'contact']
    
    // Find the section currently in view
    const current = sections.find(section => {
      const element = document.getElementById(section)
      if (!element) return false
      
      const rect = element.getBoundingClientRect()
      return rect.top <= 150 && rect.bottom >= 150
    })
    
    if (current) {
      setActiveSection(current)
    }
  }, [])
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <section className='museum-shell overflow-hidden pt-navbar-mobile sm:pt-navbar'>
      <SideNavigation activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className='relative w-full'>
        {/* Vision & Mission */}
        <SectionContainer id='vision' className='relative py-20 sm:py-28'>
          <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/30 to-transparent' />
          <div className='grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center'>
            <MotionReveal className='order-2 lg:order-1'>
            <div className='relative z-10 aspect-[4/3] overflow-hidden rounded-[2rem] border border-museum-gold/20 shadow-museum-card'>
              <img
                src='/images/vision-banner.png'
                alt='Vision and Mission'
                className='h-full w-full object-cover brightness-75 sepia-[0.2]'
                loading='lazy'
                width='600'
                height='600'
              />
              <div className='absolute inset-0 bg-gradient-to-tr from-museum-black/40 via-transparent to-museum-gold/20' />
            </div>
            </MotionReveal>
            <MotionReveal className='order-1 max-w-3xl lg:order-2'>
              <MuseumSectionHeader
                eyebrow={t('about.visionMission')}
                title={t('about.connectingPast')}
                description={null}
                className='mb-6'
              />
              <p className='mb-8 text-base leading-8 text-museum-parchment/88 sm:text-lg'>
                {t('about.missionText')}
              </p>
              <div className='space-y-6'>
                <VisionItem
                  icon={<Telescope className='text-museum-gold-light' />}
                  title={t('about.vision')}
                  description={t('about.visionText')}
                />
                <VisionItem
                  icon={<Rocket className='text-museum-gold-light' />}
                  title={t('about.mission')}
                  description={t('about.missionDetailText')}
                />
              </div>
            </MotionReveal>
          </div>
        </SectionContainer>

        {/* Our Story - Timeline */}
        <SectionContainer id='story' className='py-20 sm:py-28 bg-museum-black/35'>
          <SectionHeader
            eyebrow={t('about.ourStory')}
            title={t('about.developmentJourney')}
            description={t('about.journeyDescription')}
          />  
          <Suspense fallback={<div className='flex h-96 items-center justify-center text-museum-muted'>{t('common.loading')}</div>}>
            <Timeline />
          </Suspense>
          
        </SectionContainer>

        {/* Core Values */}
        <SectionContainer id='values' className='py-20 sm:py-28'>
          <SectionHeader 
            eyebrow={t('about.coreValues')}
            title={t('about.valuesPursue')}
            description={t('about.valuesDescription')}
          />
          <Suspense fallback={<div className='flex h-96 items-center justify-center text-museum-muted'>{t('common.loading')}</div>}>
            <CoreValues />
          </Suspense>
        </SectionContainer>

        {/* Team */}
        <SectionContainer id='team' className='py-20 sm:py-28 bg-museum-black/35'>
          <SectionHeader 
            eyebrow={t('about.team')}
            title={t('about.talentedPeople')}
            description={t('about.teamDescription')}
          />
          <Suspense fallback={<div className='flex h-96 items-center justify-center text-museum-muted'>{t('common.loading')}</div>}>
            <TeamMembers />
          </Suspense>
        </SectionContainer>

        {/* Call to Action */}
        <section className='relative overflow-hidden py-20 text-museum-ivory sm:py-24'>
          <div className='absolute inset-0 bg-gradient-to-r from-museum-seal/35 via-museum-terracotta/24 to-museum-jade/24' />
          <div className='museum-pattern absolute inset-0 opacity-[0.08]' />
          <div className='lcn-container-x text-center'>
            <h2 className='relative mb-6 font-display text-4xl font-semibold sm:text-5xl'>{t('about.joinUs')}</h2>
            <p className='relative mx-auto mb-8 max-w-2xl text-lg leading-8 text-museum-parchment'>{t('about.joinDescription')}</p>
            <div className='flex flex-wrap justify-center gap-4'>
              <Link to='/register'>
                <Button
                  size='lg'
                  className='w-52 rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light'
                >
                  <UserPlus className='mr-2' size={20} />
                  {t('about.signUpNow')}
                </Button>
              </Link>
              <Link to='/explore'>
                <Button 
                  size='lg'
                  variant='outline'
                  className='w-60 rounded-full border-museum-gold/35 bg-museum-ivory/8 text-museum-ivory backdrop-blur-sm hover:bg-museum-ivory/15 hover:text-museum-ivory'
                >
                  <Map className='mr-2' size={20} />
                  {t('about.exploreMap')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact */}
        <SectionContainer id='contact' className='py-20 sm:py-28 bg-museum-black/35'>
          <SectionHeader 
            eyebrow={t('about.contact')}
            title={t('about.connectWithUs')}
            description={t('about.contactDescription')}
          />
          <Suspense fallback={<div className='flex h-96 items-center justify-center text-museum-muted'>{t('common.loading')}</div>}>
            <ContactInfo />
          </Suspense>
        </SectionContainer>
      </main>
    </section>
  )
}

export default About
