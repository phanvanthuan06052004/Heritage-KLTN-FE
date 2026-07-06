import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const STORAGE_KEY = 'heritage-explore-onboarding-done';

const steps = [
  {
    element: '.map-wrap',
    popover: {
      title: 'Bản đồ di sản Việt Nam',
      description: 'Khám phá hơn 1300 di sản trên khắp 63 tỉnh thành. Click vào marker để xem thông tin chi tiết.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '.create-trip-btn',
    popover: {
      title: 'Tạo lịch trình',
      description: 'Ấn "Tạo lịch trình" để chọn vùng đất, sở thích và để AI thiết kế lộ trình tham quan tối ưu cho bạn.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '.category-filter',
    popover: {
      title: 'Lọc theo loại di sản',
      description: 'Lọc di sản theo danh mục: lịch sử, tâm linh, kiến trúc, thiên nhiên, bảo tàng, làng nghề...',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '.map-search-center',
    popover: {
      title: 'Tìm kiếm nhanh',
      description: 'Gõ tên di sản hoặc tỉnh thành để tìm nhanh. Chọn kết quả để bay đến vị trí đó trên bản đồ.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '.province-grid',
    popover: {
      title: 'Chọn vùng đất',
      description: 'Trong modal tạo lịch trình, chọn tỉnh bạn muốn khám phá. Sau đó bạn có thể đóng modal để chọn điểm trực tiếp trên bản đồ.',
      side: 'top',
      align: 'center',
    },
    onPopoverRender: (popover) => {
      // The province grid is inside the planner modal, need to activate step 1 first
      const modalBtn = document.querySelector('.create-trip-btn');
      if (modalBtn && document.querySelector('.planner-modal')) return;
      if (modalBtn) {
        setTimeout(() => modalBtn.click(), 100);
      }
      setTimeout(() => {
        // Navigate to Step 1 if modal is open
        const step1Btn = document.querySelector('.wizard-tabs button');
        if (step1Btn) step1Btn.click();
      }, 300);
    },
  },
];

export default function ExploreOnboarding() {
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (done) return;

    // Wait a moment for the map and UI to render
    const timer = setTimeout(() => {
      const tour = driver({
        showProgress: true,
        steps: steps.map((s, i) => ({
          ...s,
          popover: {
            ...s.popover,
            progressText: `{{current}} of {{total}}`,
            nextBtnText: i < steps.length - 1 ? 'Tiếp' : 'Hoàn tất',
            prevBtnText: 'Quay lại',
          },
        })),
        onDestroyed: () => {
          localStorage.setItem(STORAGE_KEY, '1');
          // Close planner modal if it was opened by the tour
          const closeBtn = document.querySelector('.modal-close');
          if (closeBtn) closeBtn.click();
        },
      });

      tour.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
