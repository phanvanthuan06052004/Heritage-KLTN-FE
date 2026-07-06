const SocialIcon = ({ name, url, iconPath }) => (
  <a
    href={url}
    target='_blank'
    rel='noopener noreferrer'
    aria-label={`Follow us on ${name}`}
    className='group focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-museum-gold-light rounded-full'
  >
    <svg
      role='img'
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='currentColor'
      className='opacity-75 transition-all duration-200 group-hover:scale-110 group-hover:text-museum-gold-light group-hover:opacity-100 group-focus:opacity-100'
    >
      <title>{name}</title>
      <path d={iconPath} />
    </svg>
  </a>
)

export default SocialIcon
