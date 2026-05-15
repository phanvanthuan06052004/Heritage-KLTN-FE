import { useCallback } from 'react'
import { BookOpen, Gem, Telescope, Users } from 'lucide-react'
import { Button } from '~/components/common/ui/Button'

const navigationItems = [
  { id: 'vision', icon: Telescope, label: 'Vision' },
  { id: 'story', icon: BookOpen, label: 'Our Story' },
  { id: 'values', icon: Gem, label: 'Core Values' },
  { id: 'team', icon: Users, label: 'Team' },
];


const SideNavigation = ({ activeSection, setActiveSection }) => {

  const handleNavClick = useCallback((id) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }, [setActiveSection])

  return (
    <div className='hidden xl:block fixed left-8 top-1/2 transform -translate-y-1/2 z-30'>
      <div className='rounded-full border border-museum-gold/20 bg-museum-black/65 px-3 py-5 shadow-museum-card backdrop-blur-xl'>
        <nav className='flex flex-col items-center space-y-8' aria-label='Điều hướng chính'>
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
            <Button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              variant='ghost'
              size='icon'
              className={`group relative !rounded-full text-museum-muted hover:bg-museum-ivory/10 hover:text-museum-gold-light ${
                  activeSection === item.id ? 'bg-museum-gold/20 text-museum-gold-light' : ''
              }`}
              aria-label={item.label}
            >
              <Icon className='h-5 w-5' aria-hidden='true' />
              <span className='absolute left-full ml-4 rounded-full bg-museum-black/90 px-3 py-1 text-xs whitespace-nowrap text-museum-ivory opacity-0 shadow-lg transition-opacity group-hover:opacity-100'>
                {item.label}
              </span>
            </Button>
          )})}
        </nav>
      </div>
    </div>
  )
}

export default SideNavigation
