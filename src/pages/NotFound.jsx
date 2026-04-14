import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import { Button } from '~/components/common/ui/Button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error(
      '404 Error: User accessed non-existent path:',
      location.pathname
    )
  }, [location.pathname])

  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <div className='text-center animate-fade-in space-y-6'>
        <h1 className='text-8xl font-extrabold'>404</h1>
        <p className='text-xl font-medium text-muted-foreground'>Oops! The page you are looking for does not exist.</p>
        <Link to='/' className='inline-block'>
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
