// FXEC campus center (from official records): 8.72518 N, 77.68452 E, ~15.87 acres.
// The offsets below are placeholders spread across a typical campus footprint.
// IMPORTANT: Open Google Maps satellite view of your campus, right-click each
// building -> "What's here" to get its real lat/long, then replace the values
// below. This is a 15-minute one-time task and it's the single most important
// calibration step for the whole attendance system.

export const CAMPUS_CENTER = { lat: 8.72518, lng: 77.68452 };

// Fill in the real lat/lng you captured for each block (Google Maps ->
// satellite -> right-click the building -> "What's here?").
export const ZONES = [
  {
    id: 'fx_main',
    name: 'FX Main Block',
    lat: 8.72540,
    lng: 77.68430,
    radiusMeters: 90,
  },
  {
    id: 'apj',
    name: 'APJ Block',
    lat: 8.732225072623931,
    lng: 77.72370090733568,
    radiusMeters: 90,
  },
  {
    id: 'mechanical',
    name: 'Mechanical Block',
    lat: 8.72495,
    lng: 77.68440,
    radiusMeters: 90,
  },
  {
    id: 'library',
    name: 'Library',
    lat: 8.72530,
    lng: 77.68475,
    radiusMeters: 60,
  },
  // Fallback: broad campus boundary. If a student is inside this but no
  // specific zone above, they're marked "On Campus" with zone "unclear"
  // rather than flagged absent outright.
  {
    id: 'campus',
    name: 'Campus (general)',
    lat: CAMPUS_CENTER.lat,
    lng: CAMPUS_CENTER.lng,
    radiusMeters: 220,
  },
];

// Zones that count as "academic" for activities like In Class / Lab.
export const ACADEMIC_ZONE_IDS = ['fx_main', 'apj', 'mechanical'];

// matchType controls how strictly GPS is checked against the claim:
//  'academic' -> must be inside one of ACADEMIC_ZONE_IDS
//  'campus'   -> must be inside ANY real zone (not just the broad fallback-only case with no zone)
//  'outside'  -> must NOT match any zone (student is genuinely off campus)
//  'review'   -> zone isn't checked, but always sent to admin for manual look
export const ACTIVITY_OPTIONS = [
  { id: 'in_class', label: 'In Class', matchType: 'academic' },
  { id: 'elite', label: 'Elite Club Work', matchType: 'campus' },
  { id: 'ps_portal', label: 'PS Portal', matchType: 'campus' },
  { id: 'lab', label: 'Lab', matchType: 'academic' },
  { id: 'others', label: 'Others', matchType: 'review' },
  { id: 'outside_campus', label: 'Outside Campus (competition/official)', matchType: 'outside' },
];

// College day: 9:00 - 4:20, split into 7 tracked slots (includes breaks/lunch).
export const SLOTS = [
  { id: 1, label: 'Slot 1', start: '09:00', end: '10:00' },
  { id: 2, label: 'Slot 2', start: '10:00', end: '11:00' },
  { id: 3, label: 'Slot 3', start: '11:00', end: '12:00' },
  { id: 4, label: 'Lunch',  start: '12:00', end: '13:00' },
  { id: 5, label: 'Slot 5', start: '13:00', end: '14:00' },
  { id: 6, label: 'Slot 6', start: '14:00', end: '15:00' },
  { id: 7, label: 'Slot 7', start: '15:00', end: '16:20' },
];
