import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchJson, formatTimestamp } from "../api";

const PAGE_SIZE = 20;
const REFRESH_INTERVAL = 10000;

function Traffic() {
  const [traffic, setTraffic] = useState([]);
  const [search, setSearch] = useState("");
  const [protocol, setProtocol] = useState("ALL");
  const [tcpFlags, setTcpFlags] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadTraffic = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const data = await fetchJson("/traffic/");
      setTraffic(Array.isArray(data) ? data : []);
      setError(false);
      setLastUpdated(new Date());
    } catch (requestError) {
      console.error("Traffic error:", requestError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTraffic(true);
    const intervalId = setInterval(() => loadTraffic(), REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [loadTraffic]);

  const protocols = useMemo(() => {
    const values = traffic
      .map((item) => String(item.protocol || "").toUpperCase())
      .filter(Boolean);
    return ["ALL", ...Array.from(new Set(values)).sort()];
  }, [traffic]);

  const filteredTraffic = useMemo(() => {
    const query = search.trim().toLowerCase();
    const flagQuery = tcpFlags.trim().toLowerCase();

    return traffic.filter((item) => {
      const searchableText = [item.source_ip, item.destination_ip, item.protocol]
        .join(" ")
        .toLowerCase();
      const itemProtocol = String(item.protocol || "").toUpperCase();
      const itemFlags = String(item.tcp_flags || "").toLowerCase();

      return (
        (!query || searchableText.includes(query)) &&
        (protocol === "ALL" || itemProtocol === protocol) &&
        (!flagQuery || itemFlags.includes(flagQuery))
      );
    });
  }, [traffic, search, protocol, tcpFlags]);

  useEffect(() => {
    setPage(1);
  }, [search, protocol, tcpFlags]);

  const pageCount = Math.max(1, Math.ceil(filteredTraffic.length / PAGE_SIZE));
  const visibleTraffic = filteredTraffic.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSearch("");
    setProtocol("ALL");
    setTcpFlags("");
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Network Traffic</h1>
          <p>Monitor captured packets and network communication.</p>
        </div>
        <div className="page-header-actions">
          <span className="last-updated">Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "-"}</span>
          <button className="outline-button" type="button" onClick={() => loadTraffic(true)}>Refresh</button>
        </div>
      </div>

      <div className="card table-card full-page-table">
        <div className="card-header">
          <div>
            <h3>Captured Network Traffic</h3>
            <p>{filteredTraffic.length} matching records</p>
          </div>
          <span className="badge cyan">LIVE DATA</span>
        </div>

        <div className="filter-bar">
          <input type="search" placeholder="Search source, destination, or protocol" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select value={protocol} onChange={(event) => setProtocol(event.target.value)}>
            {protocols.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input type="search" placeholder="TCP flags" value={tcpFlags} onChange={(event) => setTcpFlags(event.target.value)} />
          <button className="outline-button" type="button" onClick={clearFilters}>Clear Filters</button>
        </div>

        {loading ? (
          <div className="state-message">Loading network traffic...</div>
        ) : error ? (
          <div className="state-message error-state"><strong>Unable to connect to backend.</strong><span>Make sure Django is running on 127.0.0.1:8000.</span></div>
        ) : filteredTraffic.length === 0 ? (
          <div className="state-message">No traffic matches your filters.</div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead><tr><th>ID</th><th>Source IP</th><th>Destination IP</th><th>Protocol</th><th>Source Port</th><th>Destination Port</th><th>Packet Size</th><th>TCP Flags</th><th>Timestamp</th></tr></thead>
                <tbody>
                  {visibleTraffic.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td><td>{item.source_ip || "-"}</td><td>{item.destination_ip || "-"}</td>
                      <td><span className="protocol">{item.protocol || "-"}</span></td>
                      <td>{item.source_port || "-"}</td><td>{item.destination_port || "-"}</td>
                      <td>{item.packet_size || "-"} B</td><td>{item.tcp_flags || "-"}</td><td>{formatTimestamp(item.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageCount={pageCount} onPageChange={setPage} label="Traffic" />
          </>
        )}
      </div>
    </>
  );
}

function Pagination({ page, pageCount, onPageChange, label }) {
  return (
    <div className="pagination" aria-label={`${label} pagination`}>
      <button className="outline-button" type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Previous</button>
      <div className="page-numbers">
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
          <button className={pageNumber === page ? "page-number active" : "page-number"} type="button" key={pageNumber} onClick={() => onPageChange(pageNumber)}>{pageNumber}</button>
        ))}
      </div>
      <button className="outline-button" type="button" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>Next</button>
    </div>
  );
}

export default Traffic;
