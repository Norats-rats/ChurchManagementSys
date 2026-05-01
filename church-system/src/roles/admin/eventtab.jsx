import { useEffect, useState } from 'react';

const EventTab = ({ role, userId }) => {
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: 'Worship', date: '', time: '08:00 AM', room: 'Main Sanctuary', role: '' });

  const canManage = role === 'Admin' || role === 'Ministry Leader';

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    const res = await fetch('http://localhost:5000/api/events');
    const data = await res.json();
    setEvents(data);
  };

  const handleToggleAttendance = async (eventId) => {
    await fetch(`http://localhost:5000/api/events/${eventId}/attend`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    fetchEvents();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Church Events</h2>
      {canManage && (
        <form style={{ marginBottom: '30px' }}>
          <input placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          <button type="button" onClick={async () => {
             await fetch('http://localhost:5000/api/events', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(formData)});
             fetchEvents();
          }}>Create Event</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {events.map(event => {
          const isAttending = event.attendees?.includes(userId);
          return (
            <div key={event._id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #6366f1' }}>
              <h4>{event.title}</h4>
              <p>📅 {event.date} | 📍 {event.room}</p>
              <button 
                onClick={() => handleToggleAttendance(event._id)}
                style={{ background: isAttending ? '#ef4444' : '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', width: '100%' }}
              >
                {isAttending ? 'Cancel Attendance' : 'I will be Attending'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventTab;