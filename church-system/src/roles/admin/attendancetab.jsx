import { useEffect, useState } from 'react';

const AttendanceTab = ({ role, userId, user }) => {
  const [checkIns, setCheckIns] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  const canSeeLogs = role === 'Admin' || role === 'Ministry Leader';

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [attRes, eventRes] = await Promise.all([
        fetch('http://localhost:5000/api/attendance'),
        fetch('http://localhost:5000/api/events')
      ]);
      const attData = await attRes.json();
      const eventsData = await eventRes.json();
      
      setCheckIns(attData);
      setUpcomingEvents(eventsData);
      
      const today = new Date().toISOString().split('T')[0];
      setHasCheckedInToday(attData.some(r => r.userId === String(userId) && r.date === today));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const event = upcomingEvents.find(e => e.date === todayStr);
    if (!event) return alert("No service scheduled for today.");

    const payload = {
      userId: String(userId),
      name: `${user.firstName} ${user.lastName}`,
      service: event.title,
      date: todayStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'Present'
    };

    const res = await fetch('http://localhost:5000/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) fetchData();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ background: '#4c1d95', color: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center' }}>
        <h2>Sunday Service Check-In</h2>
        <button 
          onClick={handleCheckIn} 
          disabled={hasCheckedInToday}
          style={{ padding: '15px 30px', background: hasCheckedInToday ? '#64748b' : '#10b981', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}
        >
          {hasCheckedInToday ? "✓ Checked In" : "I am Present Today"}
        </button>
      </div>

      {canSeeLogs && (
        <div style={{ marginTop: '30px' }}>
          <h3>Attendance Logs</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '10px' }}>Member</th>
                <th>Service</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {checkIns.map(log => (
                <tr key={log._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{log.name}</td>
                  <td>{log.service}</td>
                  <td>{log.date}</td>
                  <td><span style={{ color: '#16a34a' }}>{log.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;