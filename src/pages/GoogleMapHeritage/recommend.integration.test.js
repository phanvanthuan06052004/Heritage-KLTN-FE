import { describe, it, expect, beforeAll } from 'vitest';
import { buildRecommendPayload } from './mapUtils';

const BASE = process.env.RECOMMEND_API_URL || 'http://localhost:8000/api/v1/trips/recommend';
const HEALTH = BASE.replace(/\/trips\/recommend$/, '/health');

const HANOI = { lat: 21.0285, lng: 105.8542, label: 'Hà Nội' };

async function reachable() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(HEALTH, { signal: ctrl.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

function assertItinerary(data) {
  expect(data).toBeTypeOf('object');
  expect(data).toHaveProperty('itinerary_id');
  expect(data).toHaveProperty('summary');
  expect(data).toHaveProperty('total_score');
  expect(data).toHaveProperty('total_distance_km');
  expect(Array.isArray(data.days)).toBe(true);
  expect(Array.isArray(data.route_geometries)).toBe(true);
}

async function post(body) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { res, data };
}

const cases = {
  minimal: buildRecommendPayload({}, {}),
  hanoiHistory: buildRecommendPayload(
    {
      days: 2,
      people: 2,
      mode: 'driving',
      pace: 'moderate',
      tripDate: '2026-07-10',
      tripGoal: 'Tìm hiểu lịch sử chiều sâu',
      selectedInterests: ['Lịch sử & Khảo cổ', 'Trải nghiệm văn hóa địa phương'],
    },
    { selectedProvinces: ['Hà Nội'], startPoint: HANOI, endPoint: null }
  ),
  familyChildFriendly: buildRecommendPayload(
    {
      days: 3,
      people: 4,
      mode: 'motorbike',
      pace: 'relaxed',
      tripDate: '2026-08-01',
      travelGroup: 'Có trẻ em',
      environmentPreference: 'Ưu tiên điểm trong nhà nếu mưa hoặc chất lượng không khí kém',
      selectedInterests: ['Đền chùa & Tâm linh', 'Thích hợp cho trẻ em'],
    },
    { selectedProvinces: ['Ninh Bình'], startPoint: { lat: 20.25, lng: 105.97 }, endPoint: null }
  ),
  rawTextFallback: buildRecommendPayload(
    { tripGoal: 'Gia đình nhẹ nhàng' },
    { selectedProvinces: ['Thừa Thiên Huế'] }
  ),
  packedWalking: buildRecommendPayload(
    { days: 1, people: 1, mode: 'walking', pace: 'packed', tripDate: '2026-09-15' },
    { selectedProvinces: ['Đà Nẵng'], startPoint: { lat: 16.05, lng: 108.2 }, endPoint: null }
  ),
};

let up = false;
beforeAll(async () => {
  up = await reachable();
  if (!up) {
    console.warn(`[recommend integration] gateway not reachable at ${BASE} — integration cases skipped.`);
  }
});

describe('POST /v1/trips/recommend — live integration (all input cases)', () => {
  for (const [name, body] of Object.entries(cases)) {
    it(`CASE ${name}: gateway accepts payload and returns an itinerary`, async () => {
      if (!up) return;
      const { res, data } = await post(body);
      expect(res.ok, `HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`).toBe(true);
      assertItinerary(data);
    }, 120000);
  }

  it('CASE empty object {}: minimal valid request still returns 200', async () => {
    if (!up) return;
    const { res, data } = await post({});
    expect(res.ok).toBe(true);
    assertItinerary(data);
  }, 120000);
});
