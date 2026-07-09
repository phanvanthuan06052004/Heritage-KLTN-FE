import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const STORAGE_KEY = 'heritage-explore-onboarding-done';

export default function ExploreOnboarding() {
  const { t } = useTranslation();
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (done) return;

    const steps = [
      {
        element: '.map-wrap',
        popover: {
          title: t('explore.onboarding.step1Title'),
          description: t('explore.onboarding.step1Desc'),
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '.create-trip-btn',
        popover: {
          title: t('explore.onboarding.step2Title'),
          description: t('explore.onboarding.step2Desc'),
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '.category-filter',
        popover: {
          title: t('explore.onboarding.step3Title'),
          description: t('explore.onboarding.step3Desc'),
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '.map-search-center',
        popover: {
          title: t('explore.onboarding.step4Title'),
          description: t('explore.onboarding.step4Desc'),
          side: 'bottom',
          align: 'center',
        },
      },
    ];

    // Wait a moment for the map and UI to render
    const timer = setTimeout(() => {
      const tour = driver({
        showProgress: true,
        steps: steps.map((s, i) => ({
          ...s,
          popover: {
            ...s.popover,
            progressText: `{{current}} of {{total}}`,
            nextBtnText: i < steps.length - 1 ? t('explore.onboarding.next') : t('explore.onboarding.done'),
            prevBtnText: t('explore.onboarding.prev'),
          },
        })),
        onDestroyed: () => {
          localStorage.setItem(STORAGE_KEY, '1');
        },
      });

      tour.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, [t]);

  return null;
}
