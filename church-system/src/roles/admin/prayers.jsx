import { useEffect, useState } from 'react';

const PrayerRequests = ({ user, role }) => {
  const [showModal, setShowModal] = useState(false);
  const [newRequestText, setNewRequestText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ["Health", "Career", "Financial", "Family", "Testimony", "Ministry", "Relationships", "Travel"];

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    const res = await fetch('http://localhost:5000/api/prayers');
    const data = await res.json();
    setRequests(data.map(item => ({ ...item, praying: item.prayingCount || 0 })));
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEntry = {
      name: `${user.firstName} ${user.lastName}`, 
      initial: `${user.firstName[0]}${user.lastName[0]}`,
      text: newRequestText,
      userId: user._id, 
      tags: selectedCategories, 
      status: "Active",
      date: new Date().toISOString()
    };
    await fetch('http://localhost:5000/api/prayers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    });
    setShowModal(false);
    fetchRequests();
  };

  const handlePraying = async (id) => {
    await fetch(`http://localhost:5000/api/prayers/${id}/pray`, { method: 'PATCH' });
    setRequests(requests.map(r => r._id === id ? { ...r, praying: r.praying + 1 } : r));
  };

  return (
    <div style={{ padding: '30px' }}>
      <button onClick={() => setShowModal(true)}>+ Submit Prayer Request</button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {requests.map(r => (
          <div key={r._id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
            <strong>{r.name}</strong>
            <p>{r.text}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{r.praying} praying</span>
              {r.status === "Active" && <button onClick={() => handlePraying(r._id)}>I'm Praying</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerRequests;