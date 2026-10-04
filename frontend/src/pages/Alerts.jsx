import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchJson, formatTimestamp } from "../api";

const PAGE_SIZE = 20;
const REFRESH_INTERVAL = 10000;

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [detectionMethod, setDetectionMethod] = useState("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAlerts = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const data = await fetchJson("/alerts/");
      setAlerts(Array.isArray(data) ? data : []);
      setError(false);
      setLastUpdated(new Date());
    } catch (requestError) {
      console.error("Alerts error:", requestError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts(true);
    const intervalId = setInterval(() => loadAlerts(), REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [loadAlerts]);

  const detectionMethods = useMemo(() => {
    const values = alerts.map((alert) => String(alert.detection_method || "").trim()).filter(Boolean);
    return ["ALL", ...Array.from(new Set(values)).sort()];
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return alerts.filter((alert) => {
      const searchableText = [alert.source_ip, alert.alert_type].join(" ").toLowerCase();
      const itemSeverity = String(alert.severity || "").toUpperCase();
      const itemMethod = String(alert.detection_method || "");
      return (!query || searchableText.includes(query)) &&
        (severity === "ALL" || itemSeverity === severity) &&
        (detectionMethod === "ALL" || itemMethod === detectionMethod);
    });
  }, [alerts, search, severity, detectionMethod]);

  useEffect(() => {
    setPage(1);
  }, [search, severity, detectionMethod]);

  const pageCount = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE));
  const visibleAlerts = filteredAlerts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSearch("");
    setSeverity("ALL");
    setDetectionMethod("ALL");
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Security Alerts</h1><p>Detected threats and suspicious network activity.</p></div>
        <div className="page-header-actions">
          <span className="last-updated">Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "-"}</span>
          <button className="outline-button" type="button" onClick={() => loadAlerts(true)}>Refresh</button>
        </div>
      </div>

      <div className="card table-card full-page-table">
        <div className="card-header">
          <div><h3>Security Event Log</h3><p>{filteredAlerts.length} matching alerts</p></div>
          <span className="badge danger-badge">THREATS</span>
        </div>

        <div className="filter-bar">
          <input type="search" placeholder="Search source IP or alert type" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={detectionMethod} onChange={(event) => setDetectionMethod(event.target.value)}>
            {detectionMethods.map((item) => <option key={item} value={item}>{item === "ALL" ? "ALL METHODS" : item}</option>)}
          </select>
          <button className="outline-button" type="button" onClick={clearFilters}>Clear Filters</button>
        </div>

        {loading ? (
          <div className="state-message">Loading security alerts...</div>
        ) : error ? (
          <div className="state-message error-state"><strong>Unable to connect to backend.</strong><span>Make sure Django is running on 127.0.0.1:8000.</span></div>
        ) : filteredAlerts.length === 0 ? (
          <div className="state-message">No security alerts found.</div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead><tr><th>ID</th><th>Alert Type</th><th>Source IP</th><th>Protocol</th><th>Severity</th><th>Detection Method</th><th>Timestamp</th></tr></thead>
                <tbody>
                  {visibleAlerts.map((alert) => {
                    const alertSeverity = String(alert.severity || "LOW").toLowerCase();
                    return <tr key={alert.id}>
                      <td>{alert.id}</td><td>{alert.alert_type || "-"}</td><td>{alert.source_ip || "-"}</td><td>{alert.protocol || "-"}</td>
                      <td><span className={`severity ${alertSeverity}`}>{alert.severity || "LOW"}</span></td>
                      <td>{alert.detection_method || "-"}</td><td>{formatTimestamp(alert.timestamp)}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}

function Pagination({ page, pageCount, onPageChange }) {
  return <div className="pagination" aria-label="Alert pagination">
    <button className="outline-button" type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Previous</button>
    <div className="page-numbers">
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button className={pageNumber === page ? "page-number active" : "page-number"} type="button" key={pageNumber} onClick={() => onPageChange(pageNumber)}>{pageNumber}</button>)}
    </div>
    <button className="outline-button" type="button" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>Next</button>
  </div>;
}

export default Alerts;
