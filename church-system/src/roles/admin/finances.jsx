import { useEffect, useState } from 'react';

const Finances = ({ role, userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0
  });
  const [loading, setLoading] = useState(true);

  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchFinances();
  }, [role, userId]);

  const fetchFinances = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/finances');
      const data = await response.json();
      
      let filteredTransactions = data.transactions || [];
      
      if (role === 'Staff') {
        filteredTransactions = filteredTransactions.filter(t => t.addedBy === userId && t.type === 'Income');
      } else if (role === 'Member') {
        filteredTransactions = filteredTransactions.filter(t => t.userId === userId);
      }

      setTransactions(filteredTransactions);
      setStats(data.stats || { totalIncome: 0, totalExpenses: 0, netBalance: 0 });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching finances:", err);
      setLoading(false);
    }
  };

  const handlePayMongoCheckout = async (amount, description) => {
    setIsProcessing(true);
    try {
      const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('your_public_key_here')}` 
        },
        body: JSON.stringify({
          data: {
            attributes: {
              send_email_receipt: true,
              show_description: true,
              show_line_items: true,
              description: description,
              line_items: [
                {
                  currency: 'PHP',
                  amount: amount * 100,
                  description: description,
                  name: 'Church Donation',
                  quantity: 1
                }
              ],
              payment_method_types: ['gcash', 'paymaya', 'grab_pay', 'card'],
              success_url: window.location.href,
              cancel_url: window.location.href
            }
          }
        })
      });

      const session = await response.json();
      if (session.data?.attributes?.checkout_url) {
        window.location.href = session.data.attributes.checkout_url;
      }
    } catch (err) {
      alert("Payment gateway error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    const transactionData = {
      date: newDate,
      description: newDesc,
      type: 'Income',
      amount: parseFloat(newAmount),
      addedBy: userId
    };

    try {
      const res = await fetch('http://localhost:5000/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      if (res.ok) {
        setNewDesc("");
        setNewAmount("");
        fetchFinances();
      }
    } catch (err) {
      alert("Failed to record income");
    }
  };

  const styles = {
    container: { padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' },
    card: { background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' },
    label: { color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'block' },
    amount: { fontSize: '28px', fontWeight: '800', color: '#1e293b' },
    donationGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' },
    actionCard: { padding: '30px', borderRadius: '16px', background: 'white', border: '2px solid #e2e8f0', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' },
    tableWrapper: { background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#f1f5f9', padding: '15px', textAlign: 'left', fontSize: '12px', color: '#475569' },
    td: { padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '14px' }
  };

  return (
    <div style={styles.container}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>{role === 'Member' ? 'Donations & Giving' : 'Financial Records'}</h2>
        <p style={{ color: '#64748b' }}>{role === 'Member' ? 'Support the church mission' : 'Tracking church financial health'}</p>
      </header>

      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <span style={styles.label}>{role === 'Member' ? 'Your Lifetime Giving' : 'Total Church Income'}</span>
          <div style={{ ...styles.amount, color: '#059669' }}>₱{stats.totalIncome.toLocaleString()}</div>
        </div>
        {(role === 'Admin' || role === 'Ministry Leader') && (
          <div style={styles.card}>
            <span style={styles.label}>Net Balance</span>
            <div style={styles.amount}>₱{stats.netBalance.toLocaleString()}</div>
          </div>
        )}
      </div>

      {role === 'Member' && (
        <div style={styles.donationGrid}>
          <div 
            style={{ ...styles.actionCard, opacity: isProcessing ? 0.5 : 1 }} 
            onClick={() => !isProcessing && handlePayMongoCheckout(500, "Church Tithes")}
          >
            <div style={{ fontSize: '32px' }}>📱</div>
            <h3 style={{ margin: '15px 0 5px' }}>E-Wallet / GCash</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Secure payment via PayMongo</p>
          </div>
          <div style={styles.actionCard} onClick={() => alert("Bank: BPI\nAccount: CHANGE ME TO REAL I AM TEMPORARY\nName: Free Believers Fellowship")}>
            <div style={{ fontSize: '32px' }}>🏦</div>
            <h3 style={{ margin: '15px 0 5px' }}>Bank Transfer</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Direct deposit (No Account Required)</p>
          </div>
        </div>
      )}

      {(role === 'Admin' || role === 'Staff') && (
        <div style={{ ...styles.card, marginBottom: '30px' }}>
          <h4 style={{ marginTop: 0 }}>Record New Income</h4>
          <form onSubmit={handleAddIncome} style={{ display: 'flex', gap: '15px' }}>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input type="text" placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input type="number" placeholder="Amount" value={newAmount} onChange={e => setNewAmount(e.target.value)} style={{ width: '150px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Add Record</button>
          </form>
        </div>
      )}

      {(role !== 'Member' || transactions.length > 0) && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>DATE</th>
                <th style={styles.th}>DESCRIPTION</th>
                {role !== 'Member' && <th style={styles.th}>TYPE</th>}
                <th style={{ ...styles.th, textAlign: 'right' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td style={styles.td}>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={{ ...styles.td, fontWeight: '600' }}>{t.description}</td>
                  {role !== 'Member' && <td style={styles.td}>{t.type}</td>}
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold', color: t.type === 'Income' ? '#059669' : '#dc2626' }}>
                    ₱{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Finances;