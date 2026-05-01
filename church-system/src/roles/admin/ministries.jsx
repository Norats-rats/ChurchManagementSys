import { useEffect, useState } from 'react';

const Ministries = ({ role }) => {
  const [ministryList, setMinistryList] = useState([]);
  const [leaderOptions, setLeaderOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', schedule: '', status: '' });
  const [formData, setFormData] = useState({ name: '', leader: '', members: 0, schedule: '', color: '#2563eb' });

  const canManage = role === 'Admin' || role === 'Ministry Leader';

  useEffect(() => {
    fetchInitialData();
  }, [role]);

  const fetchInitialData = async () => {
    try {
      const minRes = await fetch('http://localhost:5000/api/ministries');
      const minData = await minRes.json();
      setMinistryList(minData);
      const userRes = await fetch('http://localhost:5000/api/members');
      const userData = await userRes.json();
      setLeaderOptions(userData.filter(u => u.role === 'Ministry Leader' || u.role === 'Ministry'));
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/ministries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowCreateForm(false);
    fetchInitialData();
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
        <h2>{canManage ? "Ministry Management" : "Available Ministries"}</h2>
        {canManage && <button onClick={() => setShowCreateForm(!showCreateForm)}>{showCreateForm ? 'Close' : '+ Create Ministry'}</button>}
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <input placeholder="Ministry Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <select value={formData.leader} onChange={e => setFormData({...formData, leader: e.target.value})} required>
            <option value="">Select a Leader</option>
            {leaderOptions.map(l => <option key={l._id} value={`${l.firstName} ${l.lastName}`}>{l.firstName} {l.lastName}</option>)}
          </select>
          <button type="submit">Save Ministry</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {ministryList.map((m) => (
          <div key={m._id} style={{ borderTop: `6px solid ${m.color}`, background: 'white', padding: '20px', borderRadius: '12px' }}>
            <h3>{m.name}</h3>
            <p>Led by {m.leader}</p>
            <p>Schedule: {m.schedule}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ministries;