// FXEC campus center (from official records): 8.72518 N, 77.68452 E, ~15.87 acres.
// The offsets below are placeholders spread across a typical campus footprint.
// IMPORTANT: Open Google Maps satellite view of your campus, right-click each
// building -> "What's here" to get its real lat/long, then replace the values
// below. This is a 15-minute one-time task and it's the single most important
// calibration step for the whole attendance system.

export const CAMPUS_CENTER = { lat: 8.72518, lng: 77.68452 };

export const ZONES = [
  {
    id: 'apj block',
    name: 'APJ Block',
    lat:8.732225072623931,
    lng:77.72370090733568,
    radiusMeters: 90,
  },
  {
    id: 'library',
    name: 'Library',
    lat: 8.72505,
    lng: 77.68470,
    radiusMeters: 60,
  },
  {
    id: 'auditorium',
    name: 'Auditorium',
    lat: 8.72495,
    lng: 77.68440,
    radiusMeters: 70,
  },
  {
    id: 'ground',
    name: 'Ground / Canteen',
    lat: 8.72530,
    lng: 77.68475,
    radiusMeters: 100,
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

export const ACTIVITY_OPTIONS = [
  { id: 'class', label: 'In Class', expectedZone: 'apj block' },
  { id: 'library', label: 'Library - Studying', expectedZone: 'library' },
  { id: 'lab', label: 'Lab Work', expectedZone: 'academic' },
  { id: 'club', label: 'Club Activity', expectedZone: null },
  { id: 'auditorium', label: 'Seminar / Auditorium', expectedZone: 'auditorium' },
  { id: 'break', label: 'Break', expectedZone: null },
];

// College day: 9:00 - 4:20, split into 7 tracked slots (includes breaks/lunch).
export const SLOTS = [
  { id: 1, label: 'Slot 1', start: '09:00', end: '10:00' },
  { id: 2, label: 'Slot 2', start: '10:00', end: '11:00' },
  { id: 3, label: 'Slot 3', start: '11:00', end: '12:00' },
  { id: 4, label: 'Slot 4',  start: '12:00', end: '13:00' },
  { id: 5, label: 'Slot 5', start: '13:00', end: '14:00' },
  { id: 6, label: 'Slot 6', start: '14:00', end: '15:00' },
  { id: 7, label: 'Slot 7', start: '15:00', end: '16:20' },
];
