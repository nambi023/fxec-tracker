import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { currentSlot } from '../lib/geofence';

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const slot = currentSlot();

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // refresh every 30s for a "live" feel
    return () => clearInterval(interval);
  }, []);

  async function load() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('checkins')
      .select('*, profiles(full_name, roll_number)')
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false });

    setRows(data || []);
    setLoading(false);
  }

  const flagged = rows.filter((r) => r.status === 'mismatch' || r.status === 'review');
  const verifiedCount = rows.filter((r) => r.status === 'verified').length;

  return (
    <div className="content">
      <div className="section-head">
        <h2>Admin - live view</h2>
        <span className="date">{slot ? slot.label : 'No active slot'}</span>
      </div>

      <div className="stat-row">
        <div className="stat accent">
          <div className="num">{verifiedCount}</div>
          <div className="label">Verified check-ins today</div>
        </div>
        <div className="stat">
          <div className="num">{flagged.length}</div>
          <div className="label">Flagged for review</div>
        </div>
        <div className="stat">
          <div className="num">{rows.length}</div>
          <div className="label">Total check-ins today</div>
        </div>
      </div>

      <div className="section-head">
        <h2 style={{ fontSize: 15 }}>Flagged (needs your review)</h2>
      </div>

      {loading && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Loading...</div>}

      {!loading && flagged.length === 0 && (
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
          No mismatches so far today.
        </div>
      )}

      {flagged.length > 0 && (
        <table className="admin-table" style={{ marginBottom: 30 }}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Slot</th>
              <th>Claimed</th>
              <th>Task plan</th>
              <th>Detected zone</th>
            </tr>
          </thead>
          <tbody>
            {flagged.map((r) => (
              <tr key={r.id}>
                <td>{r.profiles?.full_name || r.student_id.slice(0, 8)}</td>
                <td>{r.slot_number}</td>
                <td>{r.activity_claimed}</td>
                <td style={{ maxWidth: 220 }}>{r.task_plan || '-'}</td>
                <td><span className="badge-flagged">{r.zone_matched || 'outside campus'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="section-head">
        <h2 style={{ fontSize: 15 }}>All check-ins today</h2>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Slot</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.profiles?.full_name || r.student_id.slice(0, 8)}</td>
              <td>{r.slot_number}</td>
              <td><span className={`status ${r.status}`}>{r.status}</span></td>
              <td className="mono" style={{ fontSize: 12 }}>
                {new Date(r.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
