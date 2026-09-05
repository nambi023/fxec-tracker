import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { ACTIVITY_OPTIONS, ZONES } from '../lib/zones';
import { matchZone, currentSlot, checkConsistency } from '../lib/geofence';

export default function CheckIn() {
  const { session } = useAuth();
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);
  const [zone, setZone] = useState(undefined); // undefined = not checked yet
  const [activityId, setActivityId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const slot = currentSlot();

  function locate() {
    setLocating(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('This browser cannot access location. Try Chrome on your phone.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setZone(matchZone(latitude, longitude));
        setLocating(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? 'Location permission denied. Enable location access and try again.'
            : 'Could not get your location. Move to an open area and retry.'
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function submit() {
    if (!slot || !coords || !activityId) return;
    setSubmitting(true);
    const activity = ACTIVITY_OPTIONS.find((a) => a.id === activityId);
    const status = checkConsistency(activity, zone?.id);

    const { error: dbError } = await supabase.from('checkins').insert({
      student_id: session.user.id,
      slot_number: slot.id,
      lat: coords.lat,
      lng: coords.lng,
      zone_matched: zone?.id || null,
      activity_claimed: activityId,
      status,
    });

    setSubmitting(false);
    if (dbError) {
      setError('Could not save check-in. Check your connection and try again.');
      return;
    }
    setResult(status);
  }

  if (!slot) {
    return (
      <div className="content">
        <div className="section-head">
          <h2>Check-in</h2>
        </div>
        <div className="zone-locate">
          <div className="zone-name">No active slot right now</div>
          <div className="zone-status">
            Check-ins open during college hours (9:00 - 4:20). Come back during
            your next slot window.
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="content">
        <div className="section-head">
          <h2>{slot.label} recorded</h2>
        </div>
        <div className="zone-locate">
          <div className={`status ${result}`} style={{ margin: '0 auto 10px', width: 'fit-content' }}>
            {result === 'verified' ? 'Verified' : result === 'mismatch' ? 'Flagged for review' : 'Missed'}
          </div>
          <div className="zone-status">
            {result === 'verified'
              ? 'Your location matched your plan. See you at the next check-in.'
              : 'Your location and plan didn\u2019t match. This has been sent to admin for review.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="checkin-banner">
        <div>
          <strong>{slot.label}</strong>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {slot.start} - {slot.end}
          </div>
        </div>
      </div>

      {zone === undefined && (
        <div className="zone-locate">
          <div className="zone-name">Where are you?</div>
          <div className="zone-status" style={{ marginBottom: 16 }}>
            Tap below to share your location for this slot.
          </div>
          <button className="locate-btn" onClick={locate} disabled={locating}>
            {locating ? 'Locating...' : 'Share my location'}
          </button>
        </div>
      )}

      {zone !== undefined && (
        <>
          <div className="zone-locate">
            <div className="zone-status">Detected zone</div>
            <div className="zone-name">{zone ? zone.name : 'Outside campus zones'}</div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
            What are you doing here?
          </div>
          <div className="activity-grid">
            {ACTIVITY_OPTIONS.map((a) => (
              <button
                key={a.id}
                className={`activity-opt ${activityId === a.id ? 'selected' : ''}`}
                onClick={() => setActivityId(a.id)}
              >
                {a.label}
              </button>
            ))}
          </div>

          <button
            className="submit-btn"
            onClick={submit}
            disabled={!activityId || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit check-in'}
          </button>
        </>
      )}

      {error && <div className="login-error" style={{ marginTop: 16 }}>{error}</div>}
    </div>
  );
}
