import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { SLOTS } from '../lib/zones';

export default function StudentDashboard() {
  const { session } = useAuth();
  const [todayRows, setTodayRows] = useState({});
  const [stats, setStats] = useState({ percent: 0, verifiedDays: 0, totalDays: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: today } = await supabase
      .from('checkins')
      .select('*')
      .eq('student_id', session.user.id)
      .gte('created_at', todayStart.toISOString());

    const bySlot = {};
    (today || []).forEach((row) => {
      bySlot[row.slot_number] = row;
    });
    setTodayRows(bySlot);

    // Last 30 days summary for the headline attendance %.
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const { data: history } = await supabase
      .from('checkins')
      .select('status, created_at')
      .eq('student_id', session.user.id)
      .gte('created_at', monthAgo.toISOString());

    const verified = (history || []).filter((r) => r.status === 'verified').length;
    const total = (history || []).length || 1;
    setStats({
      percent: Math.round((verified / total) * 100),
      verifiedDays: verified,
      totalDays: total,
    });
    setLoading(false);
  }

  return (
    <div className="content">
      <div className="section-head">
        <h2>My attendance</h2>
        <span className="date">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        </span>
      </div>

      <div className="stat-row">
        <div className="stat accent">
          <div className="num">{loading ? '-' : `${stats.percent}%`}</div>
          <div className="label">Verified rate (30d)</div>
        </div>
        <div className="stat">
          <div className="num">{Object.keys(todayRows).length}/{SLOTS.length}</div>
          <div className="label">Slots checked today</div>
        </div>
        <div className="stat">
          <div className="num">
            {Object.values(todayRows).filter((r) => r.status === 'mismatch').length}
          </div>
          <div className="label">Flags today</div>
        </div>
      </div>

      <div className="ledger">
        <div className="ledger-row head">
          <div className="ledger-cell">Slot</div>
          <div className="ledger-cell">Time</div>
          <div className="ledger-cell">Status</div>
        </div>
        {SLOTS.map((slot) => {
          const row = todayRows[slot.id];
          const status = row ? row.status : 'pending';
          return (
            <div className="ledger-row" key={slot.id}>
              <div className="ledger-cell">{slot.label}</div>
              <div className="ledger-cell mono" style={{ fontSize: 12 }}>
                {slot.start}-{slot.end}
              </div>
              <div className="ledger-cell">
                <span className={`status ${status}`}>
                  {status === 'verified' && 'Verified'}
                  {status === 'mismatch' && 'Mismatch'}
                  {status === 'missed' && 'Missed'}
                  {status === 'pending' && 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
