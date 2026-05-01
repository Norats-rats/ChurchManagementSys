import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

const Analytics = () => {
  const [data, setData] = useState({ members: 0, ministries: 0, events: 0, distribution: [] });

  useEffect(() => {
    fetch('http://localhost:5000/api/ministries')
      .then(res => res.json())
      .then(mins => {
        const dist = mins.map(m => ({ name: m.name, value: m.members || 0 }));
        setData(prev => ({ ...prev, ministries: mins.length, distribution: dist }));
      });
  }, []);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.distribution);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ministries");
    XLSX.writeFile(wb, "Church_Report.xlsx");
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Church Analytics</h2>
        <button onClick={exportExcel} style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px' }}>Export Excel</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3>Ministry Share</h3>
          {data.distribution.map(item => (
            <div key={item.name} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{item.name}</span><span>{item.value} members</span></div>
              <div style={{ height: '8px', background: '#eee', borderRadius: '5px' }}>
                <div style={{ width: `${(item.value / 50) * 100}%`, height: '100%', background: '#3b82f6', borderRadius: '5px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;