import { BookOpen, Headset, Heart, House, Map, Network, Stamp, UserPlus } from 'lucide-react'

export const navLinks = [
  { 
    nameKey: 'nav.home',
    to: '/', 
    icon: () => <House className='h-5 w-5' /> 
  },
  { 
    nameKey: 'nav.heritageSites',
    to: '/heritages', 
    icon: () => <BookOpen className='h-5 w-5' /> 
  },
  {
    nameKey: 'nav.explore',
    to: '/explore',
    icon: () => <Map className='h-5 w-5' />
  },
  {
    nameKey: 'nav.historicalMap',
    to: '/historical-map',
    icon: () => <Network className='h-5 w-5' />
  },
  {
    nameKey: 'nav.passport',
    to: '/passport',
    icon: () => <Stamp className='h-5 w-5' />
  },
  {
    nameKey: 'nav.about',
    to: '/about', 
    icon: () => <Headset className='h-5 w-5' /> 
  },
]

export const userMenuLinks = [
  { 
    nameKey: 'nav.favorites',
    to: '/favorites', 
    icon: () => <Heart className='h-5 w-5' /> 
  },
  { 
    nameKey: 'nav.profile',
    to: '/profile', 
    icon: () => <UserPlus className='h-5 w-5' /> 
  },
] 