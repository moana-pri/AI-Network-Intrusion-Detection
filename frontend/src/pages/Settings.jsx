function Settings() {

  return (
    <>

      <div className="page-header">

        <div>

          <h1>Settings</h1>

          <p>
            Configure and monitor your security system.
          </p>

        </div>

      </div>


      <section className="settings-grid">

        <div className="card settings-card">

          <h3>Monitoring System</h3>

          <p>
            Current detector configuration
          </p>


          <div className="setting-row">

            <div>
              <strong>Network Monitoring</strong>
              <small>
                Monitor captured network packets
              </small>
            </div>

            <span className="toggle active">
              ON
            </span>

          </div>


          <div className="setting-row">

            <div>
              <strong>Rule-Based Detection</strong>
              <small>
                Detect known suspicious patterns
              </small>
            </div>

            <span className="toggle active">
              ON
            </span>

          </div>


          <div className="setting-row">

            <div>
              <strong>ML Detection</strong>
              <small>
                Machine learning anomaly detection
              </small>
            </div>

            <span className="toggle">
              PAUSED
            </span>

          </div>

          <div className="setting-row">

            <div>
              <strong>Auto Refresh</strong>
              <small>Refresh dashboard data automatically</small>
            </div>

            <span className="toggle active">
              ON
            </span>

          </div>

          <div className="setting-row">

            <div>
              <strong>Refresh Interval</strong>
              <small>Time between live data updates</small>
            </div>

            <strong className="setting-value">10 seconds</strong>

          </div>

        </div>


        <div className="card settings-card">

          <h3>System Information</h3>

          <p>
            NetGuard AI project information
          </p>


          <div className="info-row">
            <span>System</span>
            <strong>NetGuard AI</strong>
          </div>

          <div className="info-row">
            <span>Backend</span>
            <strong>Django REST API</strong>
          </div>

          <div className="info-row">
            <span>Frontend</span>
            <strong>React + Vite</strong>
          </div>

          <div className="info-row">
            <span>Detection</span>
            <strong>Scapy + Rules</strong>
          </div>

        </div>

      </section>

    </>
  );
}

export default Settings;