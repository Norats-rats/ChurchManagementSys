import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dbStats, setDbStats] = useState({
    totalMembers: 0,
    activeMinistries: 0,
    upcomingEvents: 0,
    ministryDistribution: []
  });

  useEffect(() => {
    fetchLiveAnalytics();
  }, []);

  const fetchLiveAnalytics = async () => {
    try {
      const [membersRes, ministriesRes, eventsRes] = await Promise.all([
        fetch('http://localhost:5000/api/members'),
        fetch('http://localhost:5000/api/ministries'),
        fetch('http://localhost:5000/api/events')
      ]);

      const members = await membersRes.json();
      const ministries = await ministriesRes.json();
      const events = await eventsRes.json();

      const totalMinMembers = ministries.reduce((acc, m) => acc + (m.members || 0), 0);
      const distribution = ministries.slice(0, 4).map(m => ({
        name: m.name,
        value: totalMinMembers > 0 ? Math.round((m.members / totalMinMembers) * 100) : 0,
        color: m.color || "#3b82f6"
      }));

      setDbStats({
        totalMembers: members.length,
        activeMinistries: ministries.length,
        upcomingEvents: events.length,
        ministryDistribution: distribution
      });
      setLoading(false);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Metric: "Total Congregation", Value: dbStats.totalMembers },
      { Metric: "Active Ministries", Value: dbStats.activeMinistries },
      { Metric: "Upcoming Events", Value: dbStats.upcomingEvents },
      ...dbStats.ministryDistribution.map(d => ({ Metric: `${d.name} Share`, Value: `${d.value}%` }))
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Church_Analytics");
    XLSX.writeFile(wb, "Live_Church_Analytics.xlsx");
  };

  const styles = {
    container: { padding: '30px', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' },
    card: { background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    chartContainer: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', marginTop: '40px', paddingBottom: '20px', borderBottom: '2px solid #f1f5f9' },
    barWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
    bar: (height, active) => ({
      width: '40px',
      height: `${height}%`,
      background: active ? 'linear-gradient(180deg, #3b82f6 0%, #93c5fd 100%)' : '#e2e8f0',
      borderRadius: '6px 6px 0 0',
      transition: 'height 0.5s ease',
      position: 'relative'
    }),
    tooltip: { position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', fontWeight: 'bold', color: '#1e293b' },
    progressRail: { width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '10px', marginTop: '8px' },
    progressBar: (width, color) => ({ width: `${width}%`, height: '100%', backgroundColor: color, borderRadius: '10px' })
  };

  if (loading) return <div style={{ padding: '40px' }}>Analyzing system data...</div>;

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h2>System Analytics</h2>
        <button 
          onClick={exportExcel}
          style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Export Live Data to Excel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>Attendance Overview</h3>
            <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '14px' }}>Real-time</span>
          </div>
          <div style={styles.chartContainer}>
            {[
              { month: "Feb", value: 65, label: "Prev" },
              { month: "Mar", value: 95, label: dbStats.totalMembers }, 
              { month: "Apr", value: 75, label: "Next" }
            ].map((item, i) => (
              <div key={i} style={styles.barWrapper}>
                <div style={styles.bar(item.value, item.month === "Mar")}>
                  <span style={styles.tooltip}>{item.label}</span>
                </div>
                <span style={{ marginTop: '12px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Ministry Member Share</h3>
          {dbStats.ministryDistribution.length > 0 ? dbStats.ministryDistribution.map((item, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ fontWeight: '600', color: '#475569' }}>{item.name}</span>
                <span style={{ fontWeight: 'bold', color: item.color }}>{item.value}%</span>
              </div>
              <div style={styles.progressRail}>
                <div style={styles.progressBar(item.value, item.color)} />
              </div>
            </div>
          )) : <p style={{color: '#64748b'}}>No ministries tracked yet.</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginTop: '25px' }}>
        <div style={styles.card}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>TOTAL MEMBERS</div>
          <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>{dbStats.totalMembers.toLocaleString()}</div>
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>ACTIVE MINISTRIES</div>
          <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>{dbStats.activeMinistries}</div>
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>UPCOMING EVENTS</div>
          <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '5px' }}>{dbStats.upcomingEvents}</div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;