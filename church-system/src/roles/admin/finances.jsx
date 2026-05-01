import { useEffect, useState } from 'react';

const Finances = ({ role, userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalIncome: 0 });

  useEffect(() => {
    fetch('http://localhost:5000/api/finances')
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setStats(data.stats || { totalIncome: 0 });
      });
  }, []);

  const handleDonate = async (amount) => {
    alert(`Redirecting to Secure Payment for ₱${amount}...`);
    // PayMongo Checkout Logic would go here
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>{role === 'Member' ? 'My Giving' : 'Financial Ledger'}</h2>
      <div style={{ background: '#10b981', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <small>Total Contributions</small>
        <h1>₱{stats.totalIncome.toLocaleString()}</h1>
      </div>

      {role === 'Member' && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <button onClick={() => handleDonate(500)} style={donateBtn}>Donate ₱500 via GCash</button>
          <button onClick={() => handleDonate(1000)} style={donateBtn}>Donate ₱1,000 via Card</button>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr><th style={{ padding: '12px' }}>Date</th><th>Description</th><th style={{ textAlign: 'right', paddingRight: '12px' }}>Amount</th></tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{new Date(t.date).toLocaleDateString()}</td>
                <td>{t.description}</td>
                <td style={{ textAlign: 'right', paddingRight: '12px', fontWeight: 'bold' }}>₱{t.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const donateBtn = { padding: '15px', flex: 1, border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', background: 'white', fontWeight: 'bold' };

export default Finances;