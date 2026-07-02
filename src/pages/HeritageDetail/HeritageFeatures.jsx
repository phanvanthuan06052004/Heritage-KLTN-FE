import { Award, MapPin, Play, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HeritageFeatures = ({ handleFeatureClick }) => {
  const { t } = useTranslation();

  const features = [
    {
      value: 'leaderboard',
      icon: <Award className='mx-auto mb-3 h-8 w-8 text-museum-gold-light' />,
      label: t('heritageFeatures.leaderboard')
    },
    {
      value: 'knowledge-test',
      icon: <Star className='mx-auto mb-3 h-8 w-8 text-museum-gold-light' />,
      label: t('heritageFeatures.knowledgeTest')
    },
    {
      value: 'roleplay',
      icon: <Play className='mx-auto mb-3 h-8 w-8 text-museum-gold-light' />,
      label: t('heritageFeatures.roleplay')
    },
    {
      value: 'chatroom',
      icon: <MapPin className='mx-auto mb-3 h-8 w-8 text-museum-gold-light' />,
      label: t('heritageFeatures.chatroom')
    },
  ];

  return (
    <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
      {features.map(feature => (
        <div
          key={feature.value}
          className='cursor-pointer rounded-[1.5rem] border border-museum-gold/20 bg-museum-ivory/6 p-5 text-center text-museum-ivory transition duration-200 hover:-translate-y-0.5 hover:border-museum-gold/45 hover:bg-museum-gold/12 hover:shadow-museum-gold'
          onClick={() => handleFeatureClick(feature.value)}
        >
          {feature.icon}
          <p className='text-sm font-medium'>{feature.label}</p>
        </div>
      ))}
    </div>
  );
};

export default HeritageFeatures;
