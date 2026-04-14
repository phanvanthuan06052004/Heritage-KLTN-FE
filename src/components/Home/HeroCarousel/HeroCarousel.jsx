import { useEffect, useRef, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { heroSlides } from './heroSlides'
import Slide from './Slide'
import ArrowButton from './ArrowButton'

const HeroCarousel = () => {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timeoutRef = useRef(null)
  
  // Translate slides
  const translatedSlides = useMemo(() => heroSlides.map((slide, index) => ({
    ...slide,
    title: t(`home.hero.slide${index + 1}Title`),
    subTitle: t(`home.hero.slide${index + 1}Subtitle`)
  })), [t])
  
  const slidesLength = translatedSlides.length
  // Auto play Carousel
  useEffect(() => {
    if (isPaused) return
    const intervalId = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % translatedSlides.length)
    }, 4000)
    return () => clearInterval(intervalId)
  }, [isPaused, translatedSlides.length])

  const handleSlideChange = (newIndex) => {
    if (activeIndex === newIndex) return
    setActiveIndex(newIndex)
    setIsPaused(true)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    
    timeoutRef.current = setTimeout(() => { setIsPaused(false) }, 4000)
  }

  // Cleanup when component unmount
  useEffect(() => {
    return (() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    })
  }, [])

  if (!slidesLength) return (
    <div className='pt-navbar-mobile sm:pt-navbar'>
      <div className='h-[calc(100vh-theme(spacing.navbar-mobile))] sm:h-[calc(100vh-theme(spacing.navbar))] bg-muted flex items-center justify-center'>
        <h4 className='text-muted-foreground'>Chưa có slider nào</h4>
      </div>
    </div>
  )

  return (
    <section className='relative w-full pt-navbar-mobile sm:pt-navbar' aria-label='Carousel di sản văn hóa'>
      <div className='relative w-full h-[calc(100vh-theme(spacing.navbar-mobile))] sm:h-[calc(100vh-theme(spacing.navbar))] overflow-hidden'>
        {
          translatedSlides.map((slide, index) => (
            <Slide key={slide._id} slide={slide} index={index} activeIndex={activeIndex} />
          ))
        }
        <ArrowButton
          direction='left'
          onClick={() => handleSlideChange((activeIndex - 1 + slidesLength) % slidesLength)}
        />
        <ArrowButton
          direction='right'
          onClick={() => handleSlideChange((activeIndex + 1) % slidesLength)}
        />
        {/* Dot */}
        <div className='absolute bottom-8 z-30 left-0 right-0 flex justify-center gap-2'>
          {
            translatedSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`h-2 rounded-full transition-all duration-500 ${activeIndex === index ? 
                  'bg-primary-foreground w-10' : 'bg-primary-foreground/50 w-2 hover:bg-primary-foreground/80'}`} 
              />
            ))
          }
        </div>
      </div>
    </section>
  )
}

export default HeroCarousel
