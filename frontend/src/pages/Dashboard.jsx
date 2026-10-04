import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { fetchJson, formatTimestamp } from "../api";

const REFRESH_INTERVAL = 10000;

function Dashboard() {
  const [stats, setStats] = useState({ total_traffic: 0, total_alerts: 0, high_alerts: 0, medium_alerts: 0 });
  const [alerts, setAlerts] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [statsData, alertsData, trafficData] = await Promise.all([
        fetchJson("/dashboard/stats/"), fetchJson("/alerts/"), fetchJson("/traffic/"),
      ]);
      setStats(statsData || {});
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setTraffic(Array.isArray(trafficData) ? trafficData : []);
      setError(false);
      setLastUpdated(new Date());
    } catch (requestError) {
      console.error("Dashboard error:", requestError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(true);
    const intervalId = setInterval(() => loadDashboard(), REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [loadDashboard]);

  const severityCounts = useMemo(() => countValues(alerts, "severity"), [alerts]);
  const protocolCounts = useMemo(() => countValues(traffic, "protocol"), [traffic]);
  const activity = useMemo(() => groupTrafficByTime(traffic), [traffic]);

  return <>
    <div className="page-header"><div><h1>Security Dashboard</h1><p>AI-Assisted Network Intrusion Detection &amp; Threat Monitoring</p></div><div className="page-header-actions"><span className="last-updated">Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "-"}</span><button className="outline-button" type="button" onClick={() => loadDashboard(true)}>Refresh</button></div></div>
    {loading ? <div className="card state-message">Loading dashboard data...</div> : error ? <div className="card state-message error-state"><strong>Unable to connect to backend.</strong><span>Make sure Django is running on 127.0.0.1:8000.</span></div> : <>
      <section className="stats">
        <StatCard icon="📡" label="Total Packets" value={stats.total_traffic || 0} detail="Network traffic" />
        <StatCard icon="🚨" label="Total Alerts" value={stats.total_alerts || 0} detail="Security events" tone="alert" detailClass="red" />
        <StatCard icon="⚠️" label="High Severity" value={stats.high_alerts || 0} detail="Requires attention" tone="danger" detailClass="red" />
        <StatCard icon="✓" label="System Status" value="Secure" detail="Monitoring active" tone="safe" />
      </section>
      <section className="dashboard-grid">
        <div className="card chart-card large"><div className="card-header"><div><h3>Traffic Activity</h3><p>Records grouped by capture time</p></div><span className="badge cyan">LIVE</span></div><ActivityChart activity={activity} /></div>
        <div className="card chart-card"><div className="card-header"><div><h3>Threat Overview</h3><p>Actual alert severity distribution</p></div></div><DistributionList values={severityCounts} emptyLabel="No alerts recorded" /></div>
      </section>
      <section className="dashboard-grid dashboard-lower-grid">
        <div className="card analytics-card"><div className="card-header"><div><h3>Protocol Distribution</h3><p>Protocols in captured traffic</p></div></div><DistributionList values={protocolCounts} emptyLabel="No traffic recorded" /></div>
        <div className="card analytics-card"><div className="card-header"><div><h3>Monitoring Summary</h3><p>Current system totals</p></div></div><div className="summary-list compact-summary"><div><span>Traffic records</span><strong>{traffic.length}</strong></div><div><span>Security alerts</span><strong>{alerts.length}</strong></div><div><span>Medium alerts</span><strong className="yellow">{stats.medium_alerts || 0}</strong></div></div></div>
      </section>
      <RecentAlerts alerts={alerts} />
      <RecentTraffic traffic={traffic} />
    </>}
  </>;
}

function StatCard({ icon, label, value, detail, tone = "", detailClass = "green" }) {
  return <div className="card stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><p>{label}</p><h2>{value}</h2><small className={detailClass}>{detail}</small></div></div>;
}

function countValues(records, field) {
  return records.reduce((counts, record) => {
    const value = String(record[field] || "Unknown").trim() || "Unknown";
    const key = value.toUpperCase();
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function groupTrafficByTime(records) {
  const grouped = records.reduce((counts, record) => {
    const date = new Date(record.timestamp);
    const key = Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  return Object.entries(grouped).slice(-12).map(([label, value]) => ({ label, value }));
}

function DistributionList({ values, emptyLabel }) {
  const entries = Object.entries(values);
  const max = Math.max(...entries.map(([, value]) => value), 1);
  if (entries.length === 0) return <div className="state-message inline-state">{emptyLabel}</div>;
  return <div className="distribution-list">{entries.sort((first, second) => second[1] - first[1]).map(([label, value]) => <div className="distribution-row" key={label}><div className="distribution-label"><span>{label}</span><strong>{value}</strong></div><div className="bar-track"><div className="bar activity-bar" style={{ width: `${Math.max((value / max) * 100, 4)}%` }} /></div></div>)}</div>;
}

function ActivityChart({ activity }) {
  if (activity.length === 0) return <div className="state-message inline-state">No traffic activity recorded.</div>;
  const max = Math.max(...activity.map((item) => item.value), 1);
  return <div className="activity-chart"><div className="activity-bars">{activity.map((item) => <span key={item.label} title={`${item.label}: ${item.value} records`} style={{ height: `${Math.max((item.value / max) * 100, 6)}%` }} />)}</div><div className="activity-labels">{activity.map((item) => <span key={item.label}>{item.label}</span>)}</div></div>;
}

function RecentAlerts({ alerts }) {
  return <section className="card table-card"><div className="card-header"><div><h3>Recent Security Alerts</h3><p>Latest detected network threats</p></div><Link to="/alerts" className="outline-button">View All</Link></div><div className="table-container"><table><thead><tr><th>Alert</th><th>Source IP</th><th>Protocol</th><th>Severity</th><th>Detection</th></tr></thead><tbody>{alerts.slice(0, 5).map((alert) => <tr key={alert.id}><td>{alert.alert_type || "-"}</td><td>{alert.source_ip || "-"}</td><td>{alert.protocol || "-"}</td><td><span className={`severity ${String(alert.severity || "low").toLowerCase()}`}>{alert.severity || "LOW"}</span></td><td>{alert.detection_method || "-"}</td></tr>)}</tbody></table></div></section>;
}

function RecentTraffic({ traffic }) {
  return <section className="card table-card"><div className="card-header"><div><h3>Recent Network Traffic</h3><p>Latest captured packets</p></div><Link to="/traffic" className="outline-button">View Traffic</Link></div><div className="table-container"><table><thead><tr><th>Source IP</th><th>Destination IP</th><th>Protocol</th><th>Packet Size</th><th>Timestamp</th></tr></thead><tbody>{traffic.slice(0, 5).map((item) => <tr key={item.id}><td>{item.source_ip || "-"}</td><td>{item.destination_ip || "-"}</td><td><span className="protocol">{item.protocol || "-"}</span></td><td>{item.packet_size || "-"} B</td><td>{formatTimestamp(item.timestamp)}</td></tr>)}</tbody></table></div></section>;
}

export default Dashboard;
