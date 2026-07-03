export const API = window.location.origin;
export const DEFAULT_START = { lat: 21.0285, lng: 105.8542, label: 'Hà Nội' };
export const FEATURED_PER_PROVINCE = 3;

export const PROV_COORDS = {
  'Hà Nội': [21.0285, 105.8542],
  'TP. Hồ Chí Minh': [10.8231, 106.6297],
  'Thừa Thiên Huế': [16.4637, 107.5909],
  'Đà Nẵng': [16.0544, 108.2022],
  'Quảng Nam': [15.8801, 108.338],
  'Quảng Ninh': [20.9101, 107.1839],
  'Ninh Bình': [20.2506, 105.9745],
  'Lào Cai': [22.3356, 103.8436],
  'Hà Giang': [23.2785, 105.359],
  'Cần Thơ': [10.0328, 105.7705],
};

export const CAT_STYLE = {
  history: ['#9f1d19', '✦'],
  spiritual: ['#d7a84f', '卍'],
  museum: ['#6f3f20', '鼎'],
  architecture: ['#8a4b2a', '門'],
  craft_village: ['#2f6f5e', '✺'],
  unesco: ['#c47a1f', '★'],
  nature: ['#3f7a4c', '山'],
  entertainment: ['#a33f2d', '◆'],
  default: ['#7a5b35', '•'],
};

export const CAT_LABELS = {
  history: 'Lịch sử',
  spiritual: 'Tâm linh',
  museum: 'Bảo tàng',
  architecture: 'Kiến trúc',
  craft_village: 'Làng nghề',
  unesco: 'UNESCO',
  nature: 'Thiên nhiên',
  entertainment: 'Giải trí',
  default: 'Khác',
};

export function formatPrice(value) {
  return value ? `${Number(value).toLocaleString('vi-VN')}₫` : 'Miễn phí';
}

export function scorePercent(value) {
  return `${Math.round((value || 0.5) * 100)}%`;
}

export function siteRank(site) {
  return (site.popularity_score || 0.5) + (site.historical_importance_score || 0.5);
}

export function stars(value) {
  const rating = Math.max(0, Math.min(5, Math.round(value || 4)));
  return `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
}

export function categoryLabel(category) {
  return CAT_LABELS[category] || category;
}

export function reviewUrl(review, site) {
  if (review.url || review.link) return review.url || review.link;
  const source = review.source && review.source !== 'local' ? review.source : 'review';
  return `https://www.google.com/search?q=${encodeURIComponent(`${site.name} ${site.province} ${source}`)}`;
}

export function formatDescriptionBlocks(text) {
  const normalized = String(text || '')
    .replace(/\r/g, '')
    .replace(/={2,}\s*([^=]+?)\s*={2,}/g, '\n\n## $1\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!normalized) return [{ type: 'paragraph', text: 'Đang cập nhật thông tin.' }];
  return normalized.split(/\n\s*\n/).flatMap(part => {
    const value = part.trim();
    if (!value) return [];
    if (value.startsWith('## ')) return [{ type: 'heading', text: value.slice(3).trim() }];
    return [{ type: 'paragraph', text: value.replace(/\s+/g, ' ') }];
  });
}

export function normalizeText(value) {
  return String(value || '').trim().toLowerCase().normalize('NFC');
}

export function hasNormalized(values, value) {
  const target = normalizeText(value);
  return [...values].some(item => normalizeText(item) === target);
}

export function markerElement(site, selected) {
  const [color, icon] = CAT_STYLE[(site.categories || [])[0]] || CAT_STYLE.default;
  const el = document.createElement('button');
  el.className = `map-marker ${selected ? 'selected' : ''}`;
  el.style.setProperty('--marker-color', color);
  el.textContent = icon;
  el.title = site.name;
  return el;
}

export function parseOpeningHours(value) {
  const matches = String(value || '').match(/\d{1,2}:\d{2}/g) || [];
  return { open_time: matches[0] || '08:00', close_time: matches[1] || '17:00' };
}

export function toPlannerSite(site) {
  const hours = parseOpeningHours(site.opening_hours);
  return {
    id: site.id,
    name: site.name,
    lat: site.lat,
    lng: site.lng,
    open_time: hours.open_time,
    close_time: hours.close_time,
    visit_duration_min: site.estimated_visit_minutes || 60,
    categories: site.categories || [],
    popularity_score: site.popularity_score || 0.5,
    historical_importance_score: site.historical_importance_score || 0.5,
  };
}

export function optionalNumber(value) {
  if (value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatApiError(data) {
  if (Array.isArray(data?.detail))
    return data.detail.map(item => `${item.loc?.join('.')}: ${item.msg}`).join('; ');
  return data?.warnings?.join('; ') || data?.detail || 'Không thể tạo tuyến.';
}

export function detailedAddress(data) {
  const address = data?.address;
  if (!address) return '';
  const street = [address.house_number, address.road || address.pedestrian || address.footway]
    .filter(Boolean)
    .join(' ');
  return [
    data.name && data.name !== street ? data.name : '',
    street,
    address.neighbourhood || address.suburb || address.quarter,
    address.ward || address.village || address.town,
    address.city_district || address.district || address.county,
    address.city || address.state,
  ]
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .join(', ');
}

export function useProvinceCenter(selectedProvinces, setStartPoint, setEndPoint, setPlanner, PROV_COORDS_REF) {
  const province = [...selectedProvinces][0];
  const coords = (PROV_COORDS_REF || PROV_COORDS)[province];
  if (!coords) return;
  const point = { lat: coords[0], lng: coords[1], label: province };
  setStartPoint(point);
  setEndPoint(point);
  setPlanner(value => ({
    ...value,
    startText: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`,
    endText: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`,
  }));
}

export function decodePolyline(str, precision = 5) {
  let index = 0, lat = 0, lng = 0;
  const coords = [];
  const factor = 10 ** precision;
  while (index < str.length) {
    let result = 0, shift = 0, byte;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0;
    shift = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lng / factor, lat / factor]);
  }
  return coords;
}
