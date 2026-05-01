import { useEffect, useState } from 'react';
import Analytics from './Analytics';
import AttendanceTab from './AttendanceTab';
import EventTab from './EventTab';
import Finances from './Finances';
import MemberForm from './MemberForm';
import Ministries from './Ministries';
import Prayers from './Prayers';

const Dashboard = ({ user, role: rawRole, onLogout }) => {
  const role = rawRole?.toLowerCase().includes('member') ? 'Member' : rawRole;
  
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState({
    memberCount: 0,
    attendanceCount: 0,
    monthlyContributions: 0,
    upcomingEventsCount: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [dailyVerse, setDailyVerse] = useState({ text: "Loading scripture...", reference: "" });

  const navigationConfig = [
    { id: 'dashboard', label: '📊 Dashboard', roles: ['Admin', 'Ministry Leader', 'Staff', 'Member'] },
    { id: 'members', label: '👥 Church Members', roles: ['Admin'] },
    { id: 'events', label: '📅 Events', roles: ['Admin', 'Ministry Leader', 'Staff', 'Member'] },
    { id: 'attendance', label: '📋 Attendance', roles: ['Admin', 'Member', 'Staff'] },
    { id: 'finances', label: '💰 Finances', roles: ['Admin', 'Member', 'Staff'] }, 
    { id: 'ministries', label: '❤️ Ministries', roles: ['Admin', 'Ministry Leader', 'Staff', 'Member'] },
    { id: 'prayers', label: '🙏 Prayers', roles: ['Admin', 'Ministry Leader', 'Staff', 'Member'] },
    { id: 'analytics', label: '📈 Analytics', roles: ['Admin', 'Ministry Leader'] },
  ];

  const visibleTabs = navigationConfig.filter(tab => tab.roles.includes(role));

  useEffect(() => {
    fetchDailyVerse();
    if (currentTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [currentTab]);

  const fetchDailyVerse = async () => {
    try {
      const bibleStructure = [
        { name: "Genesis", chapters: 50 }, { name: "Exodus", chapters: 40 },
        { name: "Psalms", chapters: 150 }, { name: "Proverbs", chapters: 31 },
        { name: "Matthew", chapters: 28 }, { name: "John", chapters: 21 },
        { name: "Romans", chapters: 16 }, { name: "Philippians", chapters: 4 }
      ];
      const randomBook = bibleStructure[Math.floor(Math.random() * bibleStructure.length)];
      const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
      const response = await fetch(`https://bible-api.com/${randomBook.name}+${randomChapter}`);
      const data = await response.json();
      if (data.verses?.length > 0) {
        const selectedVerse = data.verses[Math.floor(Math.random() * data.verses.length)];
        setDailyVerse({ text: selectedVerse.text, reference: `${selectedVerse.book_name} ${selectedVerse.chapter}:${selectedVerse.verse}` });
      }
    } catch (err) {
      setDailyVerse({ text: "For God so loved the world, that he gave his only begotten Son.", reference: "John 3:16" });
    }
  };

  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const [membersRes, financeRes, eventsRes, attendanceRes] = await Promise.all([
        fetch('http://localhost:5000/api/members'),
        fetch('http://localhost:5000/api/finances'),
        fetch('http://localhost:5000/api/events'),
        fetch('http://localhost:5000/api/attendance')
      ]);
      const [members, finance, events, attendance] = await Promise.all([membersRes.json(), financeRes.json(), eventsRes.json(), attendanceRes.json()]);
      setStats({
        memberCount: Array.isArray(members) ? members.length : 0,
        monthlyContributions: finance.stats?.totalIncome || 0,
        upcomingEventsCount: Array.isArray(events) ? events.length : 0,
        attendanceCount: Array.isArray(attendance) ? attendance.length : 0
      });
    } catch (err) { console.error("Stats Sync Error:", err); }
    setLoadingStats(false);
  };

  if (!user) return <div>Authenticating Session...</div>;

  return (
    <div className="dashboard-wrapper">
      <nav className="top-nav" style={navStyle}>
        <div>
           <h4>Free Believers in Christ Fellowship Inc.</h4>
           <small>{role} Portal • Taguig City</small>
        </div>
        <div>
          <strong>{user.firstName} {user.lastName}</strong>
          <button onClick={onLogout} style={{ marginLeft: '15px' }}>Logout</button>
        </div>
      </nav>

      <div className="menu-bar" style={menuBarStyle}>
        {visibleTabs.map(tab => (
          <button key={tab.id} onClick={() => setCurrentTab(tab.id)} style={tabStyle(currentTab === tab.id)}>
            {tab.id === 'finances' && role === 'Member' ? '💰 Donations' : tab.label}
          </button>
        ))}
      </div>

      <div className="view-container" style={{ padding: '20px' }}>
        {currentTab === 'dashboard' && (
          <>
            <div style={bannerStyle}><strong>Welcome, {user.firstName}</strong><p>System live and synchronized.</p></div>
            <div style={gridStyle}>
              {(role === 'Admin' || role === 'Ministry Leader') && <StatCard label="Total Members" value={stats.memberCount} icon="👥" color="blue" />}
              <StatCard label="Live Attendance" value={stats.attendanceCount} icon="📋" color="green" />
              <StatCard label={role === 'Member' ? "My Donations" : "Total Giving"} value={`₱${stats.monthlyContributions.toLocaleString()}`} icon="₱" color="purple" />
              <StatCard label="Events" value={stats.upcomingEventsCount} icon="📅" color="orange" />
            </div>
            <div style={quoteStyle}>
              <p>"{dailyVerse.text}"</p>
              <cite>— {dailyVerse.reference}</cite>
            </div>
          </>
        )}
        {currentTab === 'members' && <MemberForm />}
        {currentTab === 'events' && <EventTab role={role} userId={user._id} />}
        {currentTab === 'attendance' && <AttendanceTab role={role} userId={user._id} user={user} />}
        {currentTab === 'finances' && <Finances role={role} userId={user._id} />}
        {currentTab === 'ministries' && <Ministries role={role} />}
        {currentTab === 'prayers' && <Prayers role={role} user={user} />}
        {currentTab === 'analytics' && <Analytics />}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div style={cardStyle}>
    <div><small>{label}</small><h2>{value}</h2></div>
    <div style={{ fontSize: '24px' }}>{icon}</div>
  </div>
);

const navStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 30px', background: '#fff', borderBottom: '1px solid #eee' };
const menuBarStyle = { display: 'flex', gap: '10px', padding: '10px 20px', background: '#f8fafc' };
const tabStyle = (active) => ({ padding: '10px 15px', border: 'none', background: active ? '#2563eb' : 'transparent', color: active ? 'white' : '#64748b', borderRadius: '8px', cursor: 'pointer' });
const bannerStyle = { background: '#e0f2fe', padding: '20px', borderRadius: '12px', marginBottom: '20px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' };
const cardStyle = { background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const quoteStyle = { marginTop: '30px', padding: '30px', textAlign: 'center', background: '#f1f5f9', borderRadius: '12px' };

export default Dashboard;