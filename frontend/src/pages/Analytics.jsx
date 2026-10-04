import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchJson } from "../api";

const REFRESH_INTERVAL = 10000;

function Analytics() {
  const [stats, setStats] = useState({ total_traffic: 0, total_alerts: 0, high_alerts: 0, medium_alerts: 0 });
  const [traffic, setTraffic] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAnalytics = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [statsData, trafficData, alertsData] = await Promise.all([
        fetchJson("/dashboard/stats/"),
        fetchJson("/traffic/"),
        fetchJson("/alerts/"),
      ]);
      setStats(statsData || {});
      setTraffic(Array.isArray(trafficData) ? trafficData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setError(false);
      setLastUpdated(new Date());
    } catch (requestError) {
      console.error("Analytics error:", requestError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(true);
    const intervalId = setInterval(() => loadAnalytics(), REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [loadAnalytics]);

  const severity = useMemo(() => countValues(alerts, "severity"), [alerts]);
  const protocols = useMemo(() => countValues(traffic, "protocol"), [traffic]);
  const detectionMethods = useMemo(() => countValues(alerts, "detection_method"), [alerts]);
  const activity = useMemo(() => groupTrafficByTime(traffic), [traffic]);

  return <>
    <div className="page-header"><div><h1>Analytics</h1><p>Network security statistics and threat analysis.</p></div><div className="page-header-actions"><span className="last-updated">Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "-"}</span><button className="outline-button" type="button" onClick={() => loadAnalytics(true)}>Refresh</button></div></div>
    {loading ? <div className="card state-message">Loading analytics...</div> : error ? <div className="card state-message error-state"><strong>Unable to connect to backend.</strong><span>Make sure Django is running on 127.0.0.1:8000.</span></div> : <>
      <section className="stats"><StatCard label="Total Traffic" value={stats.total_traffic || traffic.length} icon="📡" /><StatCard label="Total Alerts" value={stats.total_alerts || alerts.length} icon="🚨" tone="alert" /><StatCard label="High Severity" value={stats.high_alerts || severity.HIGH || 0} icon="⚠️" tone="danger" /><StatCard label="Medium Severity" value={stats.medium_alerts || severity.MEDIUM || 0} icon="◉" tone="warning" /></section>
      <section className="analytics-grid"><BarCard title="Alert Severity" subtitle="Actual severity distribution" values={severity} emptyLabel="No security alerts found." /><BarCard title="Protocol Distribution" subtitle="Actual captured traffic protocols" values={protocols} emptyLabel="No traffic recorded." /><BarCard title="Detection Method" subtitle="Actual alert detection sources" values={detectionMethods} emptyLabel="No detection methods recorded." /><div className="card analytics-card"><h3>System Summary</h3><p>Current monitoring status</p><div className="summary-list"><div><span>Traffic records</span><strong>{traffic.length}</strong></div><div><span>Security alerts</span><strong>{alerts.length}</strong></div><div><span>Unique protocols</span><strong>{Object.keys(protocols).length}</strong></div><div><span>Detection methods</span><strong>{Object.keys(detectionMethods).length}</strong></div></div></div></section>
      <section className="card analytics-card traffic-activity-card"><div className="card-header"><div><h3>Traffic Activity</h3><p>Records grouped by their API timestamps</p></div><span className="badge cyan">LIVE DATA</span></div><LineChart activity={activity} /></section>
    </>}
  </>;
}

function StatCard({ label, value, icon, tone = "" }) {
  return <div className="card stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><p>{label}</p><h2>{value}</h2></div></div>;
}

function countValues(records, field) {
  return records.reduce((counts, record) => {
    const value = String(record[field] || "Unknown").trim() || "Unknown";
    const key = field === "severity" ? value.toUpperCase() : value;
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

function BarCard({ title, subtitle, values, emptyLabel }) {
  const entries = Object.entries(values);
  const max = Math.max(...entries.map(([, value]) => value), 1);
  return <div className="card analytics-card"><h3>{title}</h3><p>{subtitle}</p>{entries.length === 0 ? <div className="state-message inline-state">{emptyLabel}</div> : <div className="bar-chart">{entries.sort((first, second) => second[1] - first[1]).map(([label, value]) => <div className="bar-item" key={label}><span>{label}</span><div className="bar-track"><div className="bar dynamic-bar" style={{ width: `${Math.max((value / max) * 100, 4)}%` }} /></div><strong>{value}</strong></div>)}</div>}</div>;
}

function LineChart({ activity }) {
  if (activity.length === 0) return <div className="state-message inline-state">No traffic activity recorded.</div>;
  const width = 900;
  const height = 220;
  const max = Math.max(...activity.map((item) => item.value), 1);
  const points = activity.map((item, index) => `${(index / Math.max(activity.length - 1, 1)) * width},${height - (item.value / max) * 170 - 20}`).join(" ");
  return <div className="line-chart"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Traffic activity over time"><polyline points={points} fill="none" stroke="var(--sky)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />{activity.map((item, index) => { const x = (index / Math.max(activity.length - 1, 1)) * width; const y = height - (item.value / max) * 170 - 20; return <circle key={item.label} cx={x} cy={y} r="5" fill="var(--sky)" />; })}</svg><div className="line-labels">{activity.map((item) => <span key={item.label}>{item.label}</span>)}</div></div>;
}

export default Analytics;
