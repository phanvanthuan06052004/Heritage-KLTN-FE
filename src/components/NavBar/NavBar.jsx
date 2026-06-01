import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { cn } from '~/lib/utils'
import AuthButton from './AuthButton'
import UserMenu from './UserMenu'
import NavLinks from './NavLinks'
import LanguageSwitcher from './LanguageSwitcher'
import MobileMenu from './MobileMenu'
import { Button } from '~/components/common/ui/Button'
import SearchBar from './SearchBar'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/store/slices/authSlice'
import { navLinks, userMenuLinks } from './navData'

const NavBar = () => {
  
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const location = useLocation()

  const userInfo = useSelector(selectCurrentUser)
  const isAuthenticated = !!userInfo

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Off menu
    setShowMobileMenu(false)
  }, [location.pathname])

  const navbarClasses = cn(
    'fixed top-0 inset-x-0 z-50 h-[76px] transition-all duration-300',
    {
      'border-b border-museum-gold/15 bg-museum-black/82 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl': isScrolled,
      'bg-museum-black/24 backdrop-blur-md': !isScrolled
    }
  )

  // Handle off scroll
  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? 'hidden' : 'auto'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showMobileMenu])

  return (
    <>
      <header className={navbarClasses}>
        <div className='mx-auto flex h-full max-w-[1600px] items-center justify-between gap-4 px-3 sm:px-4 lg:px-5 2xl:px-6'>
          {/* Logo */}
          <Link to='/' className='flex min-w-[190px] items-center gap-2.5 text-museum-ivory'>
            <img
              src='/images/logo-mark.png'
              alt='Heritage'
              className='h-12 w-10 object-contain'
            />
            <span className='flex flex-col leading-none'>
              <span className='font-display text-[1.35rem] font-semibold tracking-[0.18em] text-museum-ivory'>
                HERITAGE
              </span>
              <span className='mt-1 hidden text-[0.58rem] font-medium tracking-[0.12em] text-museum-gold sm:block'>
                Explore the past
              </span>
            </span>
          </Link>
          {/* Navigation*/}
          <NavLinks navLinks={navLinks} />
          {/* Search AuthButton */}
          <div className='flex items-center justify-end gap-3'>
            {/* Search Bar */}
            <SearchBar className='hidden md:flex' />
            {/* Sub Right Side */}
            <div className='hidden lg:flex gap-3'>
              {
                !isAuthenticated ? (
                  <AuthButton />
                ) : (
                  <UserMenu userMenuLinks={userMenuLinks} />
                )
              }
            </div>
            <Button 
              onClick={() => setShowMobileMenu(!showMobileMenu)} 
              className='rounded-full border border-museum-gold/20 bg-museum-ivory/8 text-museum-ivory hover:bg-museum-gold/10 lg:hidden'
              aria-label='Toggle-Menu'
              size='icon'
              variant='ghost'
            >
              {
                showMobileMenu ? (<X className='w-5 h-5' />) : 
                  <Menu className='w-5 h-5' />
              }
            </Button>
             {/* Language Switcher */}
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      {/* Mobile Menu */}
      {showMobileMenu && (
        <MobileMenu
          isOpen
          navLinks={navLinks}
          userMenuLinks={userMenuLinks}
          onClose={() => setShowMobileMenu(false)}
        />
      )}
    </>
  )
}

export default NavBar
