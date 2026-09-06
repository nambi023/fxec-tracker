import { ZONES, SLOTS, ACADEMIC_ZONE_IDS } from './zones';

// Haversine distance in meters between two lat/long points.
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Returns the nearest matching zone (excluding the broad "campus" fallback
// unless nothing else matches), or null if outside all zones.
export function matchZone(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const zone of ZONES) {
    const d = distanceMeters(lat, lng, zone.lat, zone.lng);
    if (d <= zone.radiusMeters && d < bestDist) {
      best = zone;
      bestDist = d;
    }
  }
  return best;
}

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Which slot are we currently in / closest to, based on device time.
export function currentSlot(now = new Date()) {
  const mins = now.getHours() * 60 + now.getMinutes();
  for (const slot of SLOTS) {
    if (mins >= timeToMinutes(slot.start) && mins < timeToMinutes(slot.end)) {
      return slot;
    }
  }
  return null;
}

// Consistency check: does the claimed activity match where GPS actually
// places the student? "campus" here means matched a REAL zone (fx_main,
// apj, mechanical, library) - the broad "campus" fallback zone alone does
// NOT count as a specific-enough match for a claim, only for "on campus but
// unclear which building".
export function checkConsistency(activity, detectedZoneId) {
  if (!activity) return 'mismatch';

  switch (activity.matchType) {
    case 'review':
      // "Others" always goes to admin for a manual look, regardless of GPS.
      return 'review';

    case 'outside':
      // Claiming to be off-campus (competition etc). Verified only if GPS
      // genuinely shows no zone match at all.
      return !detectedZoneId ? 'verified' : 'mismatch';

    case 'academic':
      return detectedZoneId && ACADEMIC_ZONE_IDS.includes(detectedZoneId)
        ? 'verified'
        : 'mismatch';

    case 'campus':
      // Must be inside some real named zone - being nowhere, or only inside
      // the broad fallback "campus" zone with no specific building, is not
      // enough on its own.
      return detectedZoneId && detectedZoneId !== 'campus' ? 'verified' : 'mismatch';

    default:
      return 'mismatch';
  }
}
