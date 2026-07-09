import { describe, it, expect } from 'vitest';
import { buildRecommendPayload, addDaysToDate } from './mapUtils';

const TRIP_INPUT_FIELDS = [
  'raw_text',
  'destination_area',
  'destination_provinces',
  'start_date',
  'end_date',
  'duration_days',
  'number_of_people',
  'interests',
  'pace',
  'travel_mode',
  'budget_level',
  'constraints',
  'must_visit_site_ids',
  'start_lat',
  'start_lng',
  'end_lat',
  'end_lng',
];

const HANOI = { lat: 21.0285, lng: 105.8542, label: 'Hà Nội' };

describe('buildRecommendPayload — field contract with backend TripInput', () => {
  it('produces exactly the TripInput field names (no extras, none missing)', () => {
    const payload = buildRecommendPayload({}, {});
    expect(Object.keys(payload).sort()).toEqual([...TRIP_INPUT_FIELDS].sort());
  });

  it('emits correct types for each field', () => {
    const payload = buildRecommendPayload(
      { days: 2, people: 3, mode: 'driving', pace: 'relaxed', tripDate: '2026-07-10' },
      { selectedProvinces: ['Hà Nội'], startPoint: HANOI, endPoint: null }
    );
    expect(typeof payload.raw_text).toBe('string');
    expect(typeof payload.destination_area).toBe('string');
    expect(Array.isArray(payload.destination_provinces)).toBe(true);
    expect(typeof payload.start_date).toBe('string');
    expect(typeof payload.end_date).toBe('string');
    expect(typeof payload.duration_days).toBe('number');
    expect(typeof payload.number_of_people).toBe('number');
    expect(Array.isArray(payload.interests)).toBe(true);
    expect(typeof payload.pace).toBe('string');
    expect(typeof payload.travel_mode).toBe('string');
    expect(typeof payload.budget_level).toBe('string');
    expect(Array.isArray(payload.constraints)).toBe(true);
    expect(Array.isArray(payload.must_visit_site_ids)).toBe(true);
    expect(typeof payload.start_lat).toBe('number');
    expect(typeof payload.start_lng).toBe('number');
    expect(typeof payload.end_lat).toBe('number');
    expect(typeof payload.end_lng).toBe('number');
  });
});

describe('buildRecommendPayload — input cases', () => {
  it('CASE minimal/empty: falls back to safe defaults', () => {
    const payload = buildRecommendPayload({}, {});
    expect(payload.destination_area).toBe('Hà Nội');
    expect(payload.destination_provinces).toEqual([]);
    expect(payload.duration_days).toBe(1);
    expect(payload.number_of_people).toBe(1);
    expect(payload.interests).toEqual(['history', 'local_food']);
    expect(payload.pace).toBe('moderate');
    expect(payload.travel_mode).toBe('mixed');
    expect(payload.budget_level).toBe('medium');
    expect(payload.constraints).toEqual([]);
    expect(payload.must_visit_site_ids).toEqual([]);
    expect(payload.start_lat).toBe(HANOI.lat);
    expect(payload.end_lat).toBe(HANOI.lat);
  });

  it('CASE fully structured: honors duration/pace and derives interests+constraints, no raw_text', () => {
    const planner = {
      days: 3,
      people: 4,
      mode: 'motorbike',
      pace: 'packed',
      tripDate: '2026-08-01',
      tripGoal: 'Tìm hiểu lịch sử chiều sâu',
      travelGroup: 'Có trẻ em',
      environmentPreference: 'Hạn chế di chuyển xa',
      selectedInterests: ['Đền chùa & Tâm linh', 'Kiến trúc & Nghệ thuật'],
    };
    const payload = buildRecommendPayload(planner, {
      selectedProvinces: ['Ninh Bình', 'Hà Nội'],
      startPoint: { lat: 20.25, lng: 105.97 },
      endPoint: { lat: 21.0, lng: 105.8 },
    });
    expect(payload.duration_days).toBe(3);
    expect(payload.pace).toBe('packed');
    expect(payload.travel_mode).toBe('motorbike');
    expect(payload.number_of_people).toBe(4);
    expect(payload.destination_area).toBe('Ninh Bình');
    expect(payload.destination_provinces).toEqual(['Ninh Bình', 'Hà Nội']);
    expect(payload.interests).toEqual(expect.arrayContaining(['spiritual', 'architecture', 'history']));
    expect(payload.constraints).toEqual(expect.arrayContaining(['child_friendly', 'avoid_long_walking']));
    expect(payload.raw_text).toBe('');
    expect(payload.start_date).toBe('2026-08-01');
    expect(payload.end_date).toBe('2026-08-03');
    expect(payload.end_lat).toBe(21.0);
  });

  it('CASE raw_text fallback: no structured signal keeps a descriptive raw_text', () => {
    const payload = buildRecommendPayload(
      { tripGoal: 'Gia đình nhẹ nhàng' },
      { selectedProvinces: ['Huế'] }
    );
    expect(payload.interests).toEqual(['history', 'local_food']);
    expect(payload.constraints).toEqual([]);
    expect(payload.raw_text).toContain('Gia đình nhẹ nhàng');
  });

  it('CASE raw_text fallback with only provinces', () => {
    const payload = buildRecommendPayload({}, { selectedProvinces: ['Đà Nẵng', 'Quảng Nam'] });
    expect(payload.raw_text).toBe('Khám phá di sản tại Đà Nẵng, Quảng Nam');
  });

  it('CASE must-visit sites: maps site objects and strings to ids, de-duped', () => {
    const payload = buildRecommendPayload({}, {
      selectedSites: [{ id: 'site_a' }, { id: 'site_b' }, 'site_c', { id: 'site_a' }],
    });
    expect(payload.must_visit_site_ids).toEqual(['site_a', 'site_b', 'site_c']);
  });

  it.each(['driving', 'motorbike', 'walking', 'transit', 'mixed'])(
    'CASE travel_mode=%s passes through unchanged',
    mode => {
      const payload = buildRecommendPayload({ mode }, {});
      expect(payload.travel_mode).toBe(mode);
    }
  );

  it('CASE end point omitted: end coords fall back to start (round trip)', () => {
    const start = { lat: 16.05, lng: 108.2 };
    const payload = buildRecommendPayload({}, { startPoint: start, endPoint: null });
    expect(payload.end_lat).toBe(start.lat);
    expect(payload.end_lng).toBe(start.lng);
  });

  it('CASE elderly group derives elderly_friendly + avoid_long_walking', () => {
    const payload = buildRecommendPayload(
      { travelGroup: 'Có người lớn tuổi', selectedInterests: ['Thích hợp người lớn tuổi'] },
      {}
    );
    expect(payload.constraints).toEqual(expect.arrayContaining(['elderly_friendly', 'avoid_long_walking']));
    expect(new Set(payload.constraints).size).toBe(payload.constraints.length);
  });

  it('CASE string numbers for days/people are coerced', () => {
    const payload = buildRecommendPayload({ days: '5', people: '2' }, {});
    expect(payload.duration_days).toBe(5);
    expect(payload.number_of_people).toBe(2);
  });
});

describe('addDaysToDate', () => {
  it('adds duration-1 days to the start date', () => {
    expect(addDaysToDate('2026-07-10', 1)).toBe('2026-07-10');
    expect(addDaysToDate('2026-07-10', 3)).toBe('2026-07-12');
  });
  it('handles empty/invalid input', () => {
    expect(addDaysToDate('', 3)).toBe('');
    expect(addDaysToDate('not-a-date', 2)).toBe('');
  });
});
