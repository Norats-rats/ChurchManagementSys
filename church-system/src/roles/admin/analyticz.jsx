import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../../api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState("Generating system insights...");
  const [dbStats, setDbStats] = useState({
    totalMembers: 0,
    activeMinistries: 0,
    upcomingEvents: 0,
    ministryDistribution: []
  });

  useEffect(() => {
    fetchLiveAnalytics();
  }, []);

const generateAIAnalysis = async (stats) => {
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      console.log("DEBUG: API Key exists?", !!apiKey);
      if (!apiKey) {
    setAiInsight("Error: API Key is missing from environment.");
    return;
  }
      const prompt = `Analyze this church management data:
      - Total Members: ${stats.totalMembers}
      - Active Ministries: ${stats.activeMinistries}
      - Upcoming Events: ${stats.upcomingEvents}
      Provide a brief, professional 2-sentence summary of the current growth trend and a suggestion for improvement.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiInsight(response.text());
    } catch (err) {
      console.error("AI Insight Error:", err);
      setAiInsight("Unable to load AI insights at this time.");
    }
  };

  const fetchLiveAnalytics = async () => {
    try {
      const [membersRes, ministriesRes, eventsRes] = await Promise.all([
        api.getMembers(),
        api.getMinistries(),
        api.getEvents()
      ]);

      const members = membersRes.data || [];
      const ministries = ministriesRes.data || [];
      const events = eventsRes.data || [];

      const totalMinMembers = ministries.reduce((acc, m) => acc + (m.members || 0), 0);
      const distribution = ministries.slice(0, 4).map(m => ({
        name: m.name,
        value: totalMinMembers > 0 ? Math.round((m.members / totalMinMembers) * 100) : 0,
        color: m.color || "#3b82f6"
      }));

      const newStats = {
        totalMembers: members.length,
        activeMinistries: ministries.length,
        upcomingEvents: events.length,
        ministryDistribution: distribution
      };

      setDbStats(newStats);
      await generateAIAnalysis(newStats);
      
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
    aiCard: { background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', padding: '24px', borderRadius: '16px', border: '1px solid #bfdbfe' },
    chartContainer: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', marginTop: '40px', paddingBottom: '20px', borderBottom: '2px solid #f1f5f9' },
    barWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
    bar: (height, active) => ({
      width: '40px',
      height: `${(height / 10) * 100}%`,
      background: active ? 'linear-gradient(180deg, #3b82f6 0%, #93c5fd 100%)' : '#e2e8f0',
      borderRadius: '6px 6px 0 0',
      transition: 'height 0.5s ease',
      position: 'relative'
    }),
    tooltip: { position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', fontWeight: 'bold', color: '#1e293b' },
    progressRail: { width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '10px', marginTop: '8px' },
    progressBar: (width, color) => ({ width: `${width}%`, height: '100%', backgroundColor: color, borderRadius: '10px' })
  };

  if (loading) return <div style={{ padding: '40px' }}>Analyzing system data with AI...</div>;

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
            <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '14px' }}>Live Sync</span>
          </div>
          <div style={styles.chartContainer}>
            {[
              { month: "Prev", value: 6.5, label: "Calculated" },
              { month: "Current", value: dbStats.totalMembers, label: dbStats.totalMembers }, 
              { month: "Forecast", value: 8, label: "AI Projected" }
            ].map((item, i) => (
              <div key={i} style={styles.barWrapper}>
                <div style={styles.bar(item.value, item.month === "Current")}>
                  <span style={styles.tooltip}>{item.label}</span>
                </div>
                <span style={{ marginTop: '12px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.aiCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <span style={{ fontSize: '20px' }}>✨</span>
            <h3 style={{ margin: 0, color: '#1e40af' }}>AI Smart Insights</h3>
          </div>
          <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', fontStyle: 'italic' }}>
            "{aiInsight}"
          </p>
          <div style={{ marginTop: '20px', fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Powered by Gemini 1.5 Flash
          </div>
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