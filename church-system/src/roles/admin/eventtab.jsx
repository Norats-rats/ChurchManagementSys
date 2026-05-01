import { useEffect, useState } from 'react';

const EventTab = ({ role, userId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', category: 'Worship', date: '', time: '08:00 AM', 
    room: 'Main Sanctuary', expected: 0, type: 'Once', role: ''
  });

  const canManage = role === 'Admin' || role === 'Ministry Leader';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      const data = await response.json();
      if (Array.isArray(data)) setEvents(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setLoading(false);
    }
  };

  const handleToggleAttendance = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/attend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        fetchEvents();
      }
    } catch (err) {
      console.error("Attendance toggle failed", err);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const url = editingId 
      ? `http://localhost:5000/api/events/${editingId}` 
      : 'http://localhost:5000/api/events';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setEditingId(null);
        setFormData({ title: '', category: 'Worship', date: '', time: '08:00 AM', room: 'Main Sanctuary', expected: 0, type: 'Once', role: '' });
        fetchEvents();
      }
    } catch (err) {
      alert("Error saving event");
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (err) {
      alert("Error deleting event");
    }
  };

  const styles = {
    container: { padding: '20px', backgroundColor: '#f7fafc', minHeight: '100vh' },
    formCard: { background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
    card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '5px solid #6366f1' },
    badge: (cat) => ({
      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginRight: '10px',
      backgroundColor: cat === 'Worship' ? '#e0e7ff' : '#fef3c7',
      color: cat === 'Worship' ? '#4338ca' : '#92400e'
    }),
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px', fontSize: '13px', color: '#4a5568' },
    footer: { marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #edf2f7', display: 'flex', gap: '10px' },
    actionBtn: { border: 'none', background: 'none', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', padding: '5px' },
    submitBtn: { width: '100%', padding: '12px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' },
    attendBtn: (isAttending) => ({ 
      width: '100%', 
      padding: '10px', 
      backgroundColor: isAttending ? '#ef4444' : '#10b981', 
      color: 'white', 
      border: 'none', 
      borderRadius: '8px', 
      fontWeight: 'bold', 
      cursor: 'pointer' 
    })
  };

  return (
    <div style={styles.container}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#2d3748' }}>Church Events</h2>
        <p style={{ color: '#718096', margin: '5px 0 0 0' }}>{canManage ? "Manage and schedule church activities" : "View and join upcoming activities"}</p>
      </div>

      {canManage && (
        <div style={styles.formCard}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Event" : "Schedule New Event"}</h3>
          <form onSubmit={handleCreateOrUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              <select style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="Worship">Worship Service</option>
                <option value="Ministry">Ministry Meeting</option>
                <option value="Youth">Youth Activity</option>
                <option value="Other">Special Event</option>
              </select>
              <input type="date" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              <input type="time" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
              <input style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} placeholder="Venue/Room" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} />
              <input style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} placeholder="Lead Person" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
            </div>
            <button type="submit" style={styles.submitBtn}>{editingId ? "Update Event" : "Create Event"}</button>
            {editingId && <button type="button" onClick={() => setEditingId(null)} style={{ ...styles.submitBtn, backgroundColor: '#cbd5e0', color: '#4a5568' }}>Cancel Edit</button>}
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {loading ? <p>Loading events...</p> : events.map((event) => {
          const isAttending = event.attendees?.includes(userId);
          return (
            <div key={event._id} style={styles.card}>
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={styles.badge(event.category)}>{event.category}</span>
                </div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#1a202c' }}>{event.title}</h4>
                <p style={{ fontSize: '13px', color: '#718096', margin: 0 }}>Leader: <strong>{event.role}</strong></p>

                <div style={styles.infoGrid}>
                  <span>📅 {event.date}</span>
                  <span>🕒 {event.time}</span>
                  <span>📍 {event.room}</span>
                  <span style={{ fontWeight: 'bold', color: '#6366f1' }}>👥 Attending: {event.expected || 0}</span>
                </div>
              </div>

              <div style={styles.footer}>
                {canManage ? (
                  <>
                    <button style={{ ...styles.actionBtn, color: '#6366f1' }} onClick={() => { setEditingId(event._id); setFormData(event); }}>Edit Event</button>
                    <button style={{ ...styles.actionBtn, color: '#e53e3e' }} onClick={() => deleteEvent(event._id)}>Delete</button>
                  </>
                ) : (
                  <button 
                    style={styles.attendBtn(isAttending)} 
                    onClick={() => handleToggleAttendance(event._id)}
                  >
                    {isAttending ? '✕ Cancel Attendance' : '✓ I will be Attending'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventTab;