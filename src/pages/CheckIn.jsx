import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { ACTIVITY_OPTIONS } from '../lib/zones';
import { matchZone, currentSlot, checkConsistency } from '../lib/geofence';

const STATUS_LABEL = {
  verified: 'Verified',
  mismatch: 'Flagged for review',
  review: 'Sent for admin review',
  missed: 'Missed',
};

const STATUS_DESC = {
  verified: 'Your location matched your plan. See you at the next check-in.',
  mismatch: 'Your location and plan didn\u2019t match. This has been sent to admin for review.',
  review: '"Others" is always checked by admin manually. Your task plan has been recorded.',
};

export default function CheckIn() {
  const { session } = useAuth();
  const slot = currentSlot();

  const [checking, setChecking] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(null);

  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);
  const [zone, setZone] = useState(undefined);
  const [activityId, setActivityId] = useState(null);
  const [taskPlan, setTaskPlan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slot) {
      setChecking(false);
      return;
    }
    checkExisting();
  }, [slot?.id]);

  async function checkExisting() {
    setChecking(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('checkins')
      .select('*')
      .eq('student_id', session.user.id)
      .eq('slot_number', slot.id)
      .gte('created_at', todayStart.toISOString())
      .limit(1)
      .maybeSingle();

    setAlreadyDone(data || null);
    setChecking(false);
  }

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
    if (!slot || !coords || !activityId || !taskPlan.trim()) return;
    setSubmitting(true);
    const activity = ACTIVITY_OPTIONS.find((a) => a.id === activityId);
    const status = checkConsistency(activity, zone?.id);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: existing } = await supabase
      .from('checkins')
      .select('id')
      .eq('student_id', session.user.id)
      .eq('slot_number', slot.id)
      .gte('created_at', todayStart.toISOString())
      .limit(1)
      .maybeSingle();

    if (existing) {
      setSubmitting(false);
      setAlreadyDone(existing);
      return;
    }

    const { error: dbError } = await supabase.from('checkins').insert({
      student_id: session.user.id,
      slot_number: slot.id,
      lat: coords.lat,
      lng: coords.lng,
      zone_matched: zone?.id || null,
      activity_claimed: activityId,
      task_plan: taskPlan.trim(),
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

  if (checking) {
    return <div className="content" style={{ color: 'var(--muted)', fontSize: 13 }}>Checking today's record...</div>;
  }

  const finalStatus = result || alreadyDone?.status;

  if (finalStatus) {
    return (
      <div className="content">
        <div className="section-head">
          <h2>{slot.label} recorded</h2>
        </div>
        <div className="zone-locate">
          <div className={`status ${finalStatus}`} style={{ margin: '0 auto 10px', width: 'fit-content' }}>
            {STATUS_LABEL[finalStatus]}
          </div>
          <div className="zone-status">
            {STATUS_DESC[finalStatus] || 'Already recorded for this slot.'}
          </div>
          {alreadyDone?.task_plan && (
            <div className="zone-status" style={{ marginTop: 10 }}>
              Your plan: &ldquo;{alreadyDone.task_plan}&rdquo;
            </div>
          )}
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
            <div className="zone-name">{zone ? zone.name : 'Outside campus'}</div>
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

          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
            Task plan - what exactly are you working on?
          </div>
          <textarea
            value={taskPlan}
            onChange={(e) => setTaskPlan(e.target.value)}
            placeholder="e.g. Finishing DBMS assignment 3, or: Elite club - designing the attendance portal UI"
            rows={3}
            style={{
              width: '100%',
              border: '1px solid var(--paper-line)',
              borderRadius: 'var(--radius)',
              padding: 10,
              fontSize: 13,
              fontFamily: 'inherit',
              marginBottom: 16,
              resize: 'vertical',
            }}
          />

          <button
            className="submit-btn"
            onClick={submit}
            disabled={!activityId || !taskPlan.trim() || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit check-in'}
          </button>
        </>
      )}

      {error && <div className="login-error" style={{ marginTop: 16 }}>{error}</div>}
    </div>
  );
}
