import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Traffic from "./pages/Traffic";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

import "./App.css";

function Layout() {
  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">
          <span className="logo-icon">🛡️</span>
          <span>NetGuard AI</span>
        </div>

        <nav>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span>⌂</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/traffic"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span>⌁</span>
            Network Traffic
          </NavLink>

          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span>⚠</span>
            Security Alerts
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span>◈</span>
            Analytics
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span>⚙</span>
            Settings
          </NavLink>

        </nav>

        <div className="system-status">
          <div className="status-dot"></div>

          <div>
            <strong>System Active</strong>
            <small>Monitoring network</small>
          </div>
        </div>

      </aside>


      {/* Main Area */}
      <main className="main">

        <header className="topbar">

          <div className="topbar-title">
            <span className="topbar-label">
              NETWORK SECURITY CENTER
            </span>
          </div>

          <div className="live-status">
            <span></span>
            LIVE MONITORING
          </div>

        </header>


        {/* Pages */}
        <Routes>

          <Route path="/" element={<Dashboard />} />

          <Route
            path="/traffic"
            element={<Traffic />}
          />

          <Route
            path="/alerts"
            element={<Alerts />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Routes>

      </main>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;