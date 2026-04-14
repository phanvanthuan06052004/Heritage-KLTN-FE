import { Facebook, Linkedin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { teamMembers } from './data/teamMembersData'

const TeamMembers = () => {
  const { t } = useTranslation()

  const translatedMembers = [
    { ...teamMembers[0], role: t('about.teamRoles.founderLeader'), bio: t('about.teamBios.bio1') },
    { ...teamMembers[1], role: t('about.teamRoles.backendDev'), bio: t('about.teamBios.bio2') },
    { ...teamMembers[2], role: t('about.teamRoles.frontendDev'), bio: t('about.teamBios.bio3') },
    { ...teamMembers[3], role: t('about.teamRoles.frontendDev'), bio: t('about.teamBios.bio3') }
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16'>
      {translatedMembers.map((member, index) => (
        <div key={index} className='group text-center'>
          <div className='relative mb-6 overflow-hidden rounded-xl aspect-square text-left'>
            <img
              src={member.img || 'https://placehold.co/600x400'}
              alt={member.name}
              className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
              loading='lazy'
              width='300'
              height='300'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6'>
              <div className='text-white'>
                <p className='font-medium'>{member.bio}</p>
                <div className='flex space-x-3 mt-4'>
                  <Link
                    to={member.social.facebook}
                    className='text-white hover:text-heritage-light transition-colors'
                    aria-label={`Facebook ${member.name}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Facebook size={20} />
                  </Link>
                  <Link
                    to={member.social.linkedin}
                    className='text-white hover:text-heritage-light transition-colors'
                    aria-label={`LinkedIn ${member.name}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Linkedin size={20} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <h3 className='text-xl font-bold text-heritage-dark'>{member.name}</h3>
          <p className='text-primary'>{member.role}</p>
        </div>
      ))}
    </div>
  )
}

export default TeamMembers
